package com.campuscare.ticketservice.controller;

import com.campuscare.ticketservice.dto.ComplaintPageResponse;
import com.campuscare.ticketservice.dto.TicketDto;
import com.campuscare.ticketservice.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/complaints")
@Tag(name = "Student Complaint History", description = "Student-facing complaint history, filtering, search, and detail APIs")
public class StudentComplaintController {

    @Autowired
    private TicketService ticketService;

    @GetMapping
    @Operation(summary = "Get paginated student complaints")
    public ResponseEntity<ComplaintPageResponse> getComplaints(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "All") String status,
            @RequestParam(defaultValue = "All") String priority,
            @RequestParam(defaultValue = "All") String category,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "Latest") String sort) {
        return ResponseEntity.ok(ticketService.getStudentComplaints(authentication.getName(), page, size, search, status, priority, category, dateFrom, dateTo, sort));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get student complaints by status")
    public ResponseEntity<ComplaintPageResponse> getByStatus(
            @PathVariable String status,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "Latest") String sort) {
        return ResponseEntity.ok(ticketService.getStudentComplaintsByStatus(status, authentication.getName(), page, size, sort));
    }

    @GetMapping("/priority/{priority}")
    @Operation(summary = "Get student complaints by priority")
    public ResponseEntity<ComplaintPageResponse> getByPriority(
            @PathVariable String priority,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "Latest") String sort) {
        return ResponseEntity.ok(ticketService.getStudentComplaintsByPriority(priority, authentication.getName(), page, size, sort));
    }

    @GetMapping("/search")
    @Operation(summary = "Search student complaints by ticket ID, title, or location")
    public ResponseEntity<ComplaintPageResponse> search(
            @RequestParam(defaultValue = "") String query,
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "Latest") String sort) {
        return ResponseEntity.ok(ticketService.searchStudentComplaints(query, authentication.getName(), page, size, sort));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student complaint details")
    public ResponseEntity<TicketDto> getDetails(@PathVariable String id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getStudentComplaintDetails(id, authentication.getName()));
    }
}
