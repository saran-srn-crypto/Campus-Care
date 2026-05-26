package com.campuscare.notificationservice.controller;

import com.campuscare.notificationservice.model.Notification;
import com.campuscare.notificationservice.model.User;
import com.campuscare.notificationservice.repository.UserRepository;
import com.campuscare.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Service", description = "Endpoints for retrieving, reading, and counting notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    @GetMapping
    @Operation(summary = "Get all notifications (personal, role-based, or broadcast) for currently authenticated user")
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        User user = getUser(authentication.getName());
        List<Notification> list = notificationService.getNotificationsForUser(user.getUserId(), user.getRole());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a specific notification as read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications for current user as read")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        User user = getUser(authentication.getName());
        notificationService.markAllAsRead(user.getUserId(), user.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications for current user")
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication authentication) {
        User user = getUser(authentication.getName());
        long count = notificationService.getUnreadCount(user.getUserId(), user.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create a new notification")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationService.createNotification(notification);
        return ResponseEntity.ok(saved);
    }
}
