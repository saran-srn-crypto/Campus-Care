package com.campuscare.authservice.dto;

public class ResetPasswordRequest {
    private String emailOrUserId;
    private String otp;
    private String newPassword;

    public ResetPasswordRequest() {
    }

    public ResetPasswordRequest(String emailOrUserId, String otp, String newPassword) {
        this.emailOrUserId = emailOrUserId;
        this.otp = otp;
        this.newPassword = newPassword;
    }

    public String getEmailOrUserId() {
        return emailOrUserId;
    }

    public void setEmailOrUserId(String emailOrUserId) {
        this.emailOrUserId = emailOrUserId;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
