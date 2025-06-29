📬 AI Email Assistant – Smart Email Reply Extension

An intelligent browser extension that enhances your Gmail experience by automatically generating context-aware email replies. Built with a robust Spring Boot backend integrated with Google’s Gemini API, this project streamlines email communication with the power of AI.
🗂️ Project Overview

This repository contains two core components:

email-extension-project/
├── email-response/      # Backend – Spring Boot application using Gemini API
├── Extension/           # Frontend – Firefox extension (Manifest V3)

✨ Key Features

    🧠 AI-Powered Responses: Leverages Gemini API to generate relevant and context-aware replies.

    🎨 Customizable Tone: Choose between Professional, Casual, or Friendly tones.

    📎 Seamless Gmail Integration: Injects directly into Gmail’s UI with a non-intrusive “AI Reply” button.

    🔄 Real-Time Generation: Replies are generated on the fly via a local backend service.

🧰 Tech Stack
Layer	Technology
Extension	JavaScript, HTML, CSS
Backend	Java 17+, Spring Boot
AI Service	Google Gemini API
Browser	Firefox (Manifest V3)
🚀 Getting Started
### 1. Clone the Repository

git clone https://github.com/Shibezz/we_chat.git
cd we_chat

### 2. Start the Backend Server

Ensure Java 17+ and Maven are installed. Then:

cd email-response
./mvnw spring-boot:run

The server runs by default on http://localhost:8080.
### 3. Configure Gemini API Access

Add your Gemini API key in application.properties:

gemini.api.key=YOUR_API_KEY

Alternatively, export it as an environment variable:

export GEMINI_API_KEY=your_key

### 4. Load the Firefox Extension

    Open Firefox and navigate to about:debugging.

    Click “This Firefox” → “Load Temporary Add-on”.

    Select the manifest.json file inside the Extension/ directory.

🔁 How It Works

    When composing a reply in Gmail, the extension detects the compose window.

    An “AI Reply” button and tone dropdown are injected into the toolbar.

    Upon clicking, the selected tone and email content are sent to:

    POST http://localhost:8080/api/email/generate

    The Spring Boot backend processes the request, calls Gemini API, and returns a generated reply.

    The extension automatically inserts the response into Gmail's reply box.

🧪 API Reference

Endpoint:

POST /api/email/generate

Request Body:

{
  "emailContent": "Thanks for reaching out. I’ll look into it.",
  "tone": "Friendly"
}

Response:
Plain text response containing the generated reply.
