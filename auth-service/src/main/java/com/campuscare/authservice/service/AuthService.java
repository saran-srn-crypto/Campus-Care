package com.campuscare.authservice.service;

import com.campuscare.authservice.dto.*;
import com.campuscare.authservice.model.User;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest);
    User signup(SignupRequest signupRequest);
    User getProfile(String email);
    User updateProfile(String email, ProfileUpdateRequest request);
    void sendRegistrationOtp(String email, String userId);
    void sendForgotPasswordOtp(String emailOrUserId);
    void resetPassword(ResetPasswordRequest request);
}
