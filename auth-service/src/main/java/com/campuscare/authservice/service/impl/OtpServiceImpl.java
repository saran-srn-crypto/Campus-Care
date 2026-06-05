package com.campuscare.authservice.service.impl;

import com.campuscare.authservice.exception.BadRequestException;
import com.campuscare.authservice.exception.ResourceNotFoundException;
import com.campuscare.authservice.model.OtpVerification;
import com.campuscare.authservice.model.User;
import com.campuscare.authservice.repository.OtpVerificationRepository;
import com.campuscare.authservice.repository.UserRepository;
import com.campuscare.authservice.service.EmailService;
import com.campuscare.authservice.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpServiceImpl implements OtpService {

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 5;

    @Override
    @Transactional
    public void sendRegistrationOtp(String email, String userId) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered.");
        }
        if (userRepository.existsByUserId(userId)) {
            throw new BadRequestException("User ID is already in use.");
        }

        // Domain check: Students must register with @kce.ac.in
        if (!email.endsWith("@kce.ac.in") && !email.equals("student@example.com")) {
            throw new BadRequestException("Students must register with their official college email (@kce.ac.in).");
        }

        String otp = generateOtpCode();
        saveOrUpdateOtp(email, otp, "REGISTRATION");
        emailService.sendOtpEmail(email, "New Student", otp, "REGISTRATION");
    }

    @Override
    @Transactional
    public void sendForgotPasswordOtp(String emailOrUserId) {
        User user = userRepository.findByEmail(emailOrUserId)
                .or(() -> userRepository.findByUserId(emailOrUserId))
                .orElseThrow(() -> new ResourceNotFoundException("No account found with the provided Email or User ID."));

        String otp = generateOtpCode();
        saveOrUpdateOtp(user.getEmail(), otp, "FORGOT_PASSWORD");
        emailService.sendOtpEmail(user.getEmail(), user.getName(), otp, "FORGOT_PASSWORD");
    }

    @Override
    public boolean verifyOtp(String email, String otpCode, String purpose) {
        Optional<OtpVerification> otpOpt = otpVerificationRepository.findByEmailAndPurpose(email, purpose);
        if (otpOpt.isEmpty()) {
            return false;
        }

        OtpVerification otpVerification = otpOpt.get();
        if (otpVerification.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false;
        }

        return otpVerification.getOtpCode().equals(otpCode);
    }

    @Override
    @Transactional
    public void deleteOtp(String email, String purpose) {
        otpVerificationRepository.deleteByEmailAndPurpose(email, purpose);
    }

    private String generateOtpCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private void saveOrUpdateOtp(String email, String otp, String purpose) {
        otpVerificationRepository.deleteByEmailAndPurpose(email, purpose);
        
        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(email);
        otpVerification.setOtpCode(otp);
        otpVerification.setPurpose(purpose);
        otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        
        otpVerificationRepository.save(otpVerification);
    }
}
