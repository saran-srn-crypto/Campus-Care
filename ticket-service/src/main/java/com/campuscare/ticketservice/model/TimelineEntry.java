package com.campuscare.ticketservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "timeline_entries")
public class TimelineEntry {

    @Id
    private String id;
    private String ticketId;
    private String title;
    private String date;
    private String note;
    private LocalDateTime createdAt;

    public TimelineEntry() {
    }

    public TimelineEntry(String id, String ticketId, String title, String date, String note, LocalDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.title = title;
        this.date = date;
        this.note = note;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String ticketId;
        private String title;
        private String date;
        private String note;
        private LocalDateTime createdAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder ticketId(String ticketId) {
            this.ticketId = ticketId;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder date(String date) {
            this.date = date;
            return this;
        }

        public Builder note(String note) {
            this.note = note;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public TimelineEntry build() {
            return new TimelineEntry(id, ticketId, title, date, note, createdAt);
        }
    }
}
