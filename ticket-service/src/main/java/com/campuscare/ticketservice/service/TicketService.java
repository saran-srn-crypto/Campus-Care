package com.campuscare.ticketservice.service;

import com.campuscare.ticketservice.dto.*;
import java.util.List;

public interface TicketService {
    TicketDto createTicket(TicketCreateRequest request, String ownerEmail);
    List<TicketDto> getTicketsByRole(String email);
    TicketDto getTicketDetails(String id);
    TicketDto updateTicket(String id, TicketUpdateRequest request, String email);
    TicketDto assignTicket(String id, String assigneeNameOrId, String email);
    TicketDto addComment(String id, String text, String email);
    TicketDto updateStatus(String id, String status, String notes, String proofImage, String resolutionNotes, String email);
    TicketDto escalateTicket(String id, String reason, String email);
    ComplaintPageResponse getStudentComplaints(String email, int page, int size, String search, String status, String priority, String category, String dateFrom, String dateTo, String sort);
    TicketDto getStudentComplaintDetails(String id, String email);
    ComplaintPageResponse getStudentComplaintsByStatus(String status, String email, int page, int size, String sort);
    ComplaintPageResponse getStudentComplaintsByPriority(String priority, String email, int page, int size, String sort);
    ComplaintPageResponse searchStudentComplaints(String query, String email, int page, int size, String sort);
}
