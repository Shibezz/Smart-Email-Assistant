package com.email.write.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiAPiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        // Build the prompt here
        String prompt = buildPrompt(emailRequest);

        // Create a request
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", prompt)
                        })
                });

        // Send request get response
        String response = webClient.post()
                .uri(geminiApiUrl + geminiAPiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Extract the response and then return
        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            return "Error processing requests: " + e.getMessage();

        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();

        String inputText = emailRequest.getInputText();
        boolean hasCustomInput = inputText != null && !inputText.trim().isEmpty();

        if (hasCustomInput) {
            prompt.append("Create a reply email with the following content. Also don't generate a subject line. ");
        } else {
            prompt.append(
                    "Generate a professional email reply for the following email content. Also don't generate a subject line. ");
        }

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone. ");
        }

        if (hasCustomInput) {
            prompt.append("\nCustom content: \n").append(inputText.trim());
        } else {
            prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        }

        prompt.append("\nDon't offer variations, just one reply that fits the tone.");
        prompt.append(
                "\nJust write the mail. Don't write anything additional like 'okay', 'understood', etc., and stick to the tone please.");

        return prompt.toString();
    }

}
