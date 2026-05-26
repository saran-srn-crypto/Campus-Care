package com.campuscare.ticketservice.service;

public interface LogService {
    void logActivity(String action, String userId, String details);
}
