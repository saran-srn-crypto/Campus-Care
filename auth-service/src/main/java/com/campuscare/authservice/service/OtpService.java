package com.campuscare.authservice.service;

public interface OtpService {
    void sendRegistrationOtp(String email, String userId);
    void sendForgotPasswordOtp(String emailOrUserId);
    boolean verifyOtp(String email, String otpCode, String purpose);
    void deleteOtp(String email, String purpose);
}
