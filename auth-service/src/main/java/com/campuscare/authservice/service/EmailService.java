package com.campuscare.authservice.service;

public interface EmailService {
    void sendOtpEmail(String recipientEmail, String recipientName, String otp, String purpose);
}
