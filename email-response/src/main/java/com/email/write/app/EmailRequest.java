package com.email.write.app;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone;
    private String inputText;  
}
