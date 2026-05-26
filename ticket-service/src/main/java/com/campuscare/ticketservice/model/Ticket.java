package com.campuscare.ticketservice.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "CC_TICKETS")
public class Ticket {

    @Id
    @Column(name = "ticket_id", length = 50)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 20)
    private String priority;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "owner_id", nullable = false, length = 50)
    private String owner;

    @Column(length = 200)
    private String location;

    @Column(name = "assignee_id", length = 100)
    private String assignee;

    @Column(name = "assigned_staff", length = 150)
    private String assignedStaff;

    @Column(length = 100)
    private String department;

    @Column(name = "created_date", nullable = false)
    private LocalDate created;

    @Column(name = "due_date")
    private LocalDate due;

    @Column(nullable = false, length = 2000)
    private String description;

    @Lob
    @Column(name = "attachments")
    private String attachments;

    @Column(name = "resolution_notes", length = 2000)
    private String resolutionNotes;

    @Lob
    @Column(name = "proof_image")
    private String proofImage;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "rating")
    private Double rating;

    public Ticket() {
    }

    public Ticket(String id, String title, String category, String priority, String status, String owner, String location, String assignee, String assignedStaff, String department, LocalDate created, LocalDate due, String description, String attachments, String resolutionNotes, String proofImage, LocalDateTime updatedAt, Double rating) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.owner = owner;
        this.location = location;
        this.assignee = assignee;
        this.assignedStaff = assignedStaff;
        this.department = department;
        this.created = created;
        this.due = due;
        this.description = description;
        this.attachments = attachments;
        this.resolutionNotes = resolutionNotes;
        this.proofImage = proofImage;
        this.updatedAt = updatedAt;
        this.rating = rating;
    }

    @PrePersist
    @PreUpdate
    public void touchUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
    public String getAssignedStaff() { return assignedStaff; }
    public void setAssignedStaff(String assignedStaff) { this.assignedStaff = assignedStaff; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDate getCreated() { return created; }
    public void setCreated(LocalDate created) { this.created = created; }
    public LocalDate getDue() { return due; }
    public void setDue(LocalDate due) { this.due = due; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAttachments() { return attachments; }
    public void setAttachments(String attachments) { this.attachments = attachments; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public String getProofImage() { return proofImage; }
    public void setProofImage(String proofImage) { this.proofImage = proofImage; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String title;
        private String category;
        private String priority;
        private String status;
        private String owner;
        private String location;
        private String assignee;
        private String assignedStaff;
        private String department;
        private LocalDate created;
        private LocalDate due;
        private String description;
        private String attachments;
        private String resolutionNotes;
        private String proofImage;
        private LocalDateTime updatedAt;
        private Double rating;

        public Builder id(String id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder priority(String priority) { this.priority = priority; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder owner(String owner) { this.owner = owner; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder assignee(String assignee) { this.assignee = assignee; return this; }
        public Builder assignedStaff(String assignedStaff) { this.assignedStaff = assignedStaff; return this; }
        public Builder department(String department) { this.department = department; return this; }
        public Builder created(LocalDate created) { this.created = created; return this; }
        public Builder due(LocalDate due) { this.due = due; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder attachments(String attachments) { this.attachments = attachments; return this; }
        public Builder resolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; return this; }
        public Builder proofImage(String proofImage) { this.proofImage = proofImage; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }

        public Ticket build() {
            return new Ticket(id, title, category, priority, status, owner, location, assignee, assignedStaff, department, created, due, description, attachments, resolutionNotes, proofImage, updatedAt, rating);
        }
    }
}
