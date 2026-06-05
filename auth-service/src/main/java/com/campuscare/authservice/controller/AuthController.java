package com.campuscare.authservice.controller;

import com.campuscare.authservice.dto.*;
import com.campuscare.authservice.model.User;
import com.campuscare.authservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication Service", description = "Endpoints for user register, login, and profile operations")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.campuscare.authservice.repository.UserRepository userRepository;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials and return JWT token")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    @Operation(summary = "Register a new user (Student, Staff, Warden, Admin)")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        User user = authService.signup(signupRequest);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User registered successfully");
        response.put("userId", user.getUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    @Operation(summary = "Retrieve profile details of the currently authenticated user")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User profile = authService.getProfile(email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile details of the currently authenticated user")
    public ResponseEntity<User> updateProfile(Authentication authentication, @RequestBody ProfileUpdateRequest request) {
        String email = authentication.getName();
        User updated = authService.updateProfile(email, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/logout")
    @Operation(summary = "Invalidate user session")
    public ResponseEntity<?> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/staff")
    @Operation(summary = "Get list of all staff members (accessible without admin role)")
    public ResponseEntity<List<User>> getStaff() {
        return ResponseEntity.ok(userRepository.findByRole("staff"));
    }

    @PostMapping("/otp/send-registration")
    @Operation(summary = "Generate and send registration verification OTP")
    public ResponseEntity<?> sendRegistrationOtp(@RequestParam String email, @RequestParam String userId) {
        authService.sendRegistrationOtp(email, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Verification OTP sent successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/otp/send-forgot-password")
    @Operation(summary = "Generate and send forgot password verification OTP")
    public ResponseEntity<?> sendForgotPasswordOtp(@RequestParam String emailOrUserId) {
        authService.sendForgotPasswordOtp(emailOrUserId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Verification OTP sent successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/otp/reset-password")
    @Operation(summary = "Verify forgot password OTP and reset password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password reset successfully.");
        return ResponseEntity.ok(response);
    }
}
