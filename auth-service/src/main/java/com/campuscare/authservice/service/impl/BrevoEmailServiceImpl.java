package com.campuscare.authservice.service.impl;

import com.campuscare.authservice.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class BrevoEmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(BrevoEmailServiceImpl.class);

    @Value("${brevo.api-key}")
    private String apiKeyVal;

    @Value("${brevo.sender.email:noreply@campuscare.com}")
    private String senderEmail;

    @Value("${brevo.sender.name:Campus Care Support}")
    private String senderName;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtpEmail(String recipientEmail, String recipientName, String otp, String purpose) {
        // Log to console for development / local fallback
        System.out.println("\n**************************************************");
        System.out.println("[DEVELOPMENT OTP FALLBACK]");
        System.out.println("Email: " + recipientEmail);
        System.out.println("OTP Code: " + otp);
        System.out.println("Purpose: " + purpose);
        System.out.println("**************************************************\n");

        String subject = "Campus Care - OTP Verification";
        String htmlContent = "";

        if ("REGISTRATION".equalsIgnoreCase(purpose)) {
            subject = "Campus Care - Verify Your Email";
            htmlContent = "<html><body>" +
                    "<h2>Welcome to Campus Care!</h2>" +
                    "<p>Thank you for registering. Please use the following One-Time Password (OTP) to complete your verification:</p>" +
                    "<h3 style='font-size: 24px; color: #1F57C3; font-weight: bold;'>" + otp + "</h3>" +
                    "<p>This OTP is valid for 5 minutes. If you did not request this verification, please ignore this email.</p>" +
                    "<br><p>Best regards,<br>Campus Care Support Team</p>" +
                    "</body></html>";
        } else if ("FORGOT_PASSWORD".equalsIgnoreCase(purpose)) {
            subject = "Campus Care - Password Reset Request";
            htmlContent = "<html><body>" +
                    "<h2>Password Reset Request</h2>" +
                    "<p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>" +
                    "<h3 style='font-size: 24px; color: #1F57C3; font-weight: bold;'>" + otp + "</h3>" +
                    "<p>This OTP is valid for 5 minutes. If you did not request a password reset, please secure your account immediately.</p>" +
                    "<br><p>Best regards,<br>Campus Care Support Team</p>" +
                    "</body></html>";
        }

        // Prepare request body
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, String> sender = new HashMap<>();
        sender.put("name", senderName);
        sender.put("email", senderEmail);
        requestBody.put("sender", sender);

        Map<String, String> recipient = new HashMap<>();
        recipient.put("email", recipientEmail);
        recipient.put("name", recipientName != null ? recipientName : "Campus Care User");
        requestBody.put("to", Collections.singletonList(recipient));

        requestBody.put("subject", subject);
        requestBody.put("htmlContent", htmlContent);

        // Prepare headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKeyVal);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    requestEntity,
                    String.class
            );
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("OTP email sent successfully to {} for purpose {}", recipientEmail, purpose);
            } else {
                logger.warn("Brevo API returned status code: {}. Body: {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {} via Brevo REST API: {}", recipientEmail, e.getMessage());
            System.out.println("[WARNING] Brevo API send failed. Falling back to printed OTP in logs: " + e.getMessage());
        }
    }
}
