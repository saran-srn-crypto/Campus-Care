package com.campuscare.authservice.service.impl;

import com.campuscare.authservice.dto.*;
import com.campuscare.authservice.exception.BadRequestException;
import com.campuscare.authservice.exception.ResourceNotFoundException;
import com.campuscare.authservice.model.User;
import com.campuscare.authservice.repository.UserRepository;
import com.campuscare.authservice.security.JwtTokenProvider;
import com.campuscare.authservice.security.UserDetailsImpl;
import com.campuscare.authservice.service.AuthService;
import com.campuscare.authservice.service.LogService;
import com.campuscare.authservice.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LogService logService;

    @Autowired
    private OtpService otpService;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        // Find user first to check if they are Active
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .or(() -> userRepository.findByUserId(loginRequest.getEmail()))
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!user.getStatus().equalsIgnoreCase("Active")) {
            throw new BadRequestException("Your account is deactivated. Please contact administration.");
        }

        // MASTER OVERRIDE FOR TESTING DEMO CREDENTIALS:
        // If login is with 717823s146 or 717823s146@kce.ac.in and password is 123456, we override the password and role dynamically!
        if ((loginRequest.getEmail().equalsIgnoreCase("717823s146") || loginRequest.getEmail().equalsIgnoreCase("717823s146@kce.ac.in")) 
                && loginRequest.getPassword().equals("123456")) {
            user.setPassword(passwordEncoder.encode("123456"));
            if (loginRequest.getRole() != null && !loginRequest.getRole().equalsIgnoreCase("user") && !loginRequest.getRole().isEmpty()) {
                user.setRole(loginRequest.getRole().toLowerCase());
            }
            userRepository.save(user);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Save activity log to MongoDB
        logService.logActivity("USER_LOGIN", user.getUserId(), "User successfully logged in with role: " + user.getRole());

        // Dynamic labels based on roles matching frontend expectations
        String label = switch (user.getRole().toLowerCase()) {
            case "student" -> "Student ID";
            case "staff" -> "Employee ID";
            case "warden" -> "Warden ID";
            default -> "Admin ID";
        };

        return LoginResponse.builder()
                .token(jwt)
                .userId(user.getUserId())
                .email(user.getEmail())
                .role(user.getRole())
                .name(user.getName())
                .label(label)
                .build();
    }

    @Override
    public User signup(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }
        if (userRepository.existsByUserId(signupRequest.getUserId())) {
            throw new BadRequestException("User ID is already in use.");
        }
        if (!signupRequest.getRole().equalsIgnoreCase("student")) {
            throw new BadRequestException("Only student registrations are permitted through this portal. Wardens and Staff must be created by an Administrator.");
        }

        // Domain check: Students must register with @kce.ac.in
        if (signupRequest.getRole().equalsIgnoreCase("student")) {
            if (!signupRequest.getEmail().endsWith("@kce.ac.in") && !signupRequest.getEmail().equals("student@example.com")) {
                throw new BadRequestException("Students must register with their official college email (@kce.ac.in).");
            }
        }

        if (signupRequest.getOtp() == null || signupRequest.getOtp().trim().isEmpty()) {
            throw new BadRequestException("Verification OTP is required.");
        }

        boolean isOtpValid = otpService.verifyOtp(signupRequest.getEmail(), signupRequest.getOtp(), "REGISTRATION");
        if (!isOtpValid) {
            throw new BadRequestException("Invalid or expired verification OTP.");
        }

        User user = User.builder()
                .userId(signupRequest.getUserId())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role(signupRequest.getRole().toLowerCase())
                .name(signupRequest.getName())
                .department(signupRequest.getDepartment())
                .phone(signupRequest.getPhone())
                .status("Active")
                .build();

        User savedUser = userRepository.save(user);
        otpService.deleteOtp(savedUser.getEmail(), "REGISTRATION");
        logService.logActivity("USER_REGISTRATION", savedUser.getUserId(), "User registered successfully with role: " + savedUser.getRole());
        return savedUser;
    }

    @Override
    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));
    }

    @Override
    public User updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));

        user.setName(request.getName());
        user.setDepartment(request.getDepartment());
        user.setPhone(request.getPhone());
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        logService.logActivity("PROFILE_UPDATE", updatedUser.getUserId(), "User updated profile details.");
        return updatedUser;
    }

    @Override
    public void sendRegistrationOtp(String email, String userId) {
        otpService.sendRegistrationOtp(email, userId);
    }

    @Override
    public void sendForgotPasswordOtp(String emailOrUserId) {
        otpService.sendForgotPasswordOtp(emailOrUserId);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmailOrUserId())
                .or(() -> userRepository.findByUserId(request.getEmailOrUserId()))
                .orElseThrow(() -> new ResourceNotFoundException("No account found with the provided Email or User ID."));

        boolean isOtpValid = otpService.verifyOtp(user.getEmail(), request.getOtp(), "FORGOT_PASSWORD");
        if (!isOtpValid) {
            throw new BadRequestException("Invalid or expired verification OTP.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpService.deleteOtp(user.getEmail(), "FORGOT_PASSWORD");
        logService.logActivity("PASSWORD_RESET", user.getUserId(), "User successfully reset their password via OTP.");
    }
}
