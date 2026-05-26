package com.campuscare.ticketservice.service.impl;

import com.campuscare.ticketservice.model.SystemLog;
import com.campuscare.ticketservice.repository.SystemLogRepository;
import com.campuscare.ticketservice.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class LogServiceImpl implements LogService {

    @Autowired
    private SystemLogRepository systemLogRepository;

    @Override
    public void logActivity(String action, String userId, String details) {
        SystemLog log = SystemLog.builder()
                .action(action)
                .userId(userId)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        systemLogRepository.save(log);
    }
}
