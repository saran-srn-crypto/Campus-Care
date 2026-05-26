package com.campuscare.notificationservice.service;

import com.campuscare.notificationservice.model.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getNotificationsForUser(String userId, String role);
    void markAsRead(String id);
    void markAllAsRead(String userId, String role);
    long getUnreadCount(String userId, String role);
    Notification createNotification(Notification notification);
}
