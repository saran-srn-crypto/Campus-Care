package com.campuscare.ticketservice.dto;

import java.util.List;

public class TicketCreateRequest {
    private String title;
    private String category;
    private String priority;
    private String description;
    private String location;
    private List<String> attachments;

    public TicketCreateRequest() {
    }

    public TicketCreateRequest(String title, String category, String priority, String description, String location, List<String> attachments) {
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.description = description;
        this.location = location;
        this.attachments = attachments;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }
}
