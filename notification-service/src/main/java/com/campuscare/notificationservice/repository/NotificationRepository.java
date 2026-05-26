package com.campuscare.notificationservice.repository;

import com.campuscare.notificationservice.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientInOrderByCreatedAtDesc(List<String> recipients);
    long countByRecipientInAndUnreadTrue(List<String> recipients);
}
