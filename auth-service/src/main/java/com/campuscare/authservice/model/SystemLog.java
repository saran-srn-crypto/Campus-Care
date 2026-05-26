package com.campuscare.authservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "system_activity_logs")
public class SystemLog {

    @Id
    private String id;
    private LocalDateTime timestamp;
    private String action;
    private String userId;
    private String details;

    public SystemLog() {
    }

    public SystemLog(String id, LocalDateTime timestamp, String action, String userId, String details) {
        this.id = id;
        this.timestamp = timestamp;
        this.action = action;
        this.userId = userId;
        this.details = details;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private LocalDateTime timestamp;
        private String action;
        private String userId;
        private String details;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder action(String action) {
            this.action = action;
            return this;
        }

        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public Builder details(String details) {
            this.details = details;
            return this;
        }

        public SystemLog build() {
            return new SystemLog(id, timestamp, action, userId, details);
        }
    }
}
