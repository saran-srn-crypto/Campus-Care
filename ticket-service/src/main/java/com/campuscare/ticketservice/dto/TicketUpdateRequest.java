package com.campuscare.ticketservice.dto;

public class TicketUpdateRequest {
    private String title;
    private String priority;
    private String description;
    private String location;
    private String status;
    private String resolutionNotes;
    private Double rating;

    public TicketUpdateRequest() {
    }

    public TicketUpdateRequest(String title, String priority, String description, String location, String status, String resolutionNotes, Double rating) {
        this.title = title;
        this.priority = priority;
        this.description = description;
        this.location = location;
        this.status = status;
        this.resolutionNotes = resolutionNotes;
        this.rating = rating;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
}
