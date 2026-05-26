package com.campuscare.authservice.service;

public interface LogService {
    void logActivity(String action, String userId, String details);
}
