package com.campuscare.authservice.service.impl;

import com.campuscare.authservice.model.SystemLog;
import com.campuscare.authservice.repository.SystemLogRepository;
import com.campuscare.authservice.service.LogService;
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
