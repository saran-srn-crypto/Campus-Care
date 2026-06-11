package com.campuscare.ticketservice.service.impl;

import com.campuscare.ticketservice.dto.TicketDto;
import com.campuscare.ticketservice.exception.ResourceNotFoundException;
import com.campuscare.ticketservice.model.Ticket;
import com.campuscare.ticketservice.model.TicketStatus;
import com.campuscare.ticketservice.model.User;
import com.campuscare.ticketservice.repository.CommentRepository;
import com.campuscare.ticketservice.repository.NotificationRepository;
import com.campuscare.ticketservice.repository.StatusHistoryEntryRepository;
import com.campuscare.ticketservice.repository.TicketActivityLogRepository;
import com.campuscare.ticketservice.repository.TicketRepository;
import com.campuscare.ticketservice.repository.TimelineEntryRepository;
import com.campuscare.ticketservice.repository.UserRepository;
import com.campuscare.ticketservice.service.LogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private UserRepository userRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private TimelineEntryRepository timelineEntryRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private TicketActivityLogRepository ticketActivityLogRepository;
    @Mock private StatusHistoryEntryRepository statusHistoryEntryRepository;
    @Mock private LogService logService;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private User staffA;
    private User staffB;
    private User warden;
    private User student;

    @BeforeEach
    void setUp() {
        staffA = user("staff-a@kce.ac.in", "STAFF-A", "Staff A", "staff");
        staffB = user("staff-b@kce.ac.in", "STAFF-B", "Staff B", "staff");
        warden = user("warden@kce.ac.in", "WARDEN-1", "Warden", "warden");
        student = user("student@kce.ac.in", "STU-1", "Student", "student");

        when(commentRepository.findByTicketIdOrderByCreatedAtAsc(any())).thenReturn(Collections.emptyList());
        when(timelineEntryRepository.findByTicketIdOrderByCreatedAtAsc(any())).thenReturn(Collections.emptyList());
        when(ticketActivityLogRepository.findByTicketIdOrderByCreatedAtAsc(any())).thenReturn(Collections.emptyList());
        when(statusHistoryEntryRepository.findByTicketIdOrderByCreatedAtAsc(any())).thenReturn(Collections.emptyList());
    }

    @Test
    void unassignedTicketsAreInvisibleToStaff() {
        when(userRepository.findByEmail(staffA.getEmail())).thenReturn(Optional.of(staffA));
        when(ticketRepository.findByAssignedStaffIdOrderByCreatedDesc(staffA.getUserId())).thenReturn(Collections.emptyList());

        List<TicketDto> tickets = ticketService.getTicketsByRole(staffA.getEmail());

        assertThat(tickets).isEmpty();
        verify(ticketRepository).findByAssignedStaffIdOrderByCreatedDesc(staffA.getUserId());
        verify(ticketRepository, never()).findAllByOrderByCreatedDesc();
    }

    @Test
    void staffCannotAccessAnotherStaffTicket() {
        Ticket assignedToB = ticket("CC-200", TicketStatus.ASSIGNED, student.getUserId());
        assignedToB.setAssignedStaffId(staffB.getUserId());

        when(userRepository.findByEmail(staffA.getEmail())).thenReturn(Optional.of(staffA));
        when(ticketRepository.findById("CC-200")).thenReturn(Optional.of(assignedToB));

        assertThatThrownBy(() -> ticketService.getTicketDetails("CC-200", staffA.getEmail()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void wardenCanAssignTicketToStaff() {
        Ticket pending = ticket("CC-201", TicketStatus.PENDING_ASSIGNMENT, student.getUserId());

        when(ticketRepository.findById("CC-201")).thenReturn(Optional.of(pending));
        when(userRepository.findByEmail(warden.getEmail())).thenReturn(Optional.of(warden));
        when(userRepository.findByUserId(staffA.getUserId())).thenReturn(Optional.of(staffA));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketDto assigned = ticketService.assignTicket("CC-201", staffA.getUserId(), warden.getEmail());

        assertThat(assigned.getStatus()).isEqualTo(TicketStatus.ASSIGNED.name());
        assertThat(assigned.getAssignedStaffId()).isEqualTo(staffA.getUserId());
        assertThat(assigned.getAssignedByWardenId()).isEqualTo(warden.getUserId());
    }

    @Test
    void assignedStaffCanAccessAssignedTicket() {
        Ticket assigned = ticket("CC-202", TicketStatus.ASSIGNED, student.getUserId());
        assigned.setAssignedStaffId(staffA.getUserId());

        when(userRepository.findByEmail(staffA.getEmail())).thenReturn(Optional.of(staffA));
        when(ticketRepository.findById("CC-202")).thenReturn(Optional.of(assigned));

        TicketDto details = ticketService.getTicketDetails("CC-202", staffA.getEmail());

        assertThat(details.getId()).isEqualTo("CC-202");
        assertThat(details.getAssignedStaffId()).isEqualTo(staffA.getUserId());
    }

    @Test
    void assigningMissingStaffFails() {
        Ticket pending = ticket("CC-203", TicketStatus.PENDING_ASSIGNMENT, student.getUserId());

        when(ticketRepository.findById("CC-203")).thenReturn(Optional.of(pending));
        when(userRepository.findByEmail(warden.getEmail())).thenReturn(Optional.of(warden));
        when(userRepository.findByUserId("UNKNOWN")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("UNKNOWN")).thenReturn(Optional.empty());
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> ticketService.assignTicket("CC-203", "UNKNOWN", warden.getEmail()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private User user(String email, String userId, String name, String role) {
        return User.builder()
                .email(email)
                .userId(userId)
                .name(name)
                .role(role)
                .status("Active")
                .build();
    }

    private Ticket ticket(String id, TicketStatus status, String ownerId) {
        return Ticket.builder()
                .id(id)
                .title("Water issue")
                .category("Hostel")
                .priority("Medium")
                .status(status.name())
                .owner(ownerId)
                .createdBy(ownerId)
                .location("Block A")
                .department("Hostel")
                .created(LocalDate.now())
                .due(LocalDate.now().plusDays(7))
                .description("No water")
                .attachments("")
                .build();
    }
}
