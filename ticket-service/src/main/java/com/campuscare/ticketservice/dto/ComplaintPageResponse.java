package com.campuscare.ticketservice.dto;

import java.util.List;
import java.util.Map;

public class ComplaintPageResponse {
    private List<TicketDto> content;
    private int page;
    private int size;
    private int totalPages;
    private long totalElements;
    private boolean last;
    private Map<String, Long> statusCounts;

    public ComplaintPageResponse() {
    }

    public ComplaintPageResponse(List<TicketDto> content, int page, int size, int totalPages, long totalElements, boolean last, Map<String, Long> statusCounts) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.last = last;
        this.statusCounts = statusCounts;
    }

    public List<TicketDto> getContent() { return content; }
    public void setContent(List<TicketDto> content) { this.content = content; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    public boolean isLast() { return last; }
    public void setLast(boolean last) { this.last = last; }
    public Map<String, Long> getStatusCounts() { return statusCounts; }
    public void setStatusCounts(Map<String, Long> statusCounts) { this.statusCounts = statusCounts; }
}
