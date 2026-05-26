package com.campuscare.ticketservice.controller;

import com.campuscare.ticketservice.dto.*;
import com.campuscare.ticketservice.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@Tag(name = "Ticket Service", description = "Endpoints for ticket creation, retrieval, assignment, comments, and state updates")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    @Operation(summary = "Create a new complaint ticket")
    public ResponseEntity<TicketDto> createTicket(@RequestBody TicketCreateRequest request, Authentication authentication) {
        TicketDto ticketDto = ticketService.createTicket(request, authentication.getName());
        return ResponseEntity.ok(ticketDto);
    }

    @GetMapping
    @Operation(summary = "Fetch complaints based on current user role rules")
    public ResponseEntity<List<TicketDto>> getTickets(Authentication authentication) {
        List<TicketDto> list = ticketService.getTicketsByRole(authentication.getName());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed ticket info including MongoDB comments and history")
    public ResponseEntity<TicketDto> getTicketDetails(@PathVariable String id) {
        TicketDto ticketDto = ticketService.getTicketDetails(id);
        return ResponseEntity.ok(ticketDto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "General update for ticket details or rating")
    public ResponseEntity<TicketDto> updateTicket(
            @PathVariable String id,
            @RequestBody TicketUpdateRequest request,
            Authentication authentication) {
        TicketDto updated = ticketService.updateTicket(id, request, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/assign")
    @Operation(summary = "Assign a ticket to a staff member")
    public ResponseEntity<TicketDto> assignTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String assignee = payload.get("assignee");
        TicketDto updated = ticketService.assignTicket(id, assignee, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a feedback comment to a ticket")
    public ResponseEntity<TicketDto> addComment(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String text = payload.get("text");
        TicketDto updated = ticketService.addComment(id, text, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "Update ticket status (with optional resolution notes and proof image)")
    public ResponseEntity<TicketDto> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String status = payload.get("status");
        String notes = payload.get("notes");
        String proofImage = payload.get("proofImage");
        String resolutionNotes = payload.get("resolutionNotes");
        TicketDto updated = ticketService.updateStatus(id, status, notes, proofImage, resolutionNotes, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/escalate")
    @Operation(summary = "Escalate an issue to higher priority (urgent)")
    public ResponseEntity<TicketDto> escalateTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String reason = payload.get("reason");
        TicketDto updated = ticketService.escalateTicket(id, reason, authentication.getName());
        return ResponseEntity.ok(updated);
    }
}
