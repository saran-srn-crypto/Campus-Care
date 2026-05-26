package com.campuscare.notificationservice.service.impl;

import com.campuscare.notificationservice.model.Notification;
import com.campuscare.notificationservice.repository.NotificationRepository;
import com.campuscare.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public List<Notification> getNotificationsForUser(String userId, String role) {
        // Target list can include user ID, specific role (e.g. staff, student), or 'all' broadcast tags
        List<String> targetList = Arrays.asList(userId, role.toLowerCase(), "all");
        return notificationRepository.findByRecipientInOrderByCreatedAtDesc(targetList);
    }

    @Override
    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setUnread(false);
            notificationRepository.save(n);
        });
    }

    @Override
    public void markAllAsRead(String userId, String role) {
        List<String> targetList = Arrays.asList(userId, role.toLowerCase(), "all");
        List<Notification> list = notificationRepository.findByRecipientInOrderByCreatedAtDesc(targetList);
        for (Notification n : list) {
            if (n.isUnread()) {
                n.setUnread(false);
            }
        }
        notificationRepository.saveAll(list);
    }

    @Override
    public long getUnreadCount(String userId, String role) {
        List<String> targetList = Arrays.asList(userId, role.toLowerCase(), "all");
        return notificationRepository.countByRecipientInAndUnreadTrue(targetList);
    }

    @Override
    public Notification createNotification(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        notification.setUnread(true);
        return notificationRepository.save(notification);
    }
}
