package com.campuscare.ticketservice.controller;

import com.campuscare.ticketservice.dto.TicketDto;
import com.campuscare.ticketservice.dto.WardenAssignTicketRequest;
import com.campuscare.ticketservice.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warden")
@Tag(name = "Warden Ticket Assignment", description = "Warden-facing ticket assignment APIs")
public class WardenTicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping("/assign-ticket")
    @Operation(summary = "Assign a pending ticket to a staff member")
    public ResponseEntity<TicketDto> assignTicket(
            @RequestBody WardenAssignTicketRequest request,
            Authentication authentication) {
        TicketDto updated = ticketService.assignTicket(request.getTicketId(), request.getStaffId(), authentication.getName());
        return ResponseEntity.ok(updated);
    }
}
