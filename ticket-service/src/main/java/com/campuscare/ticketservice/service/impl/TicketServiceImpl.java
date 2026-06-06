package com.campuscare.ticketservice.service.impl;

import com.campuscare.ticketservice.dto.*;
import com.campuscare.ticketservice.exception.BadRequestException;
import com.campuscare.ticketservice.exception.ResourceNotFoundException;
import com.campuscare.ticketservice.model.*;
import com.campuscare.ticketservice.repository.*;
import com.campuscare.ticketservice.service.LogService;
import com.campuscare.ticketservice.service.TicketService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TimelineEntryRepository timelineEntryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TicketActivityLogRepository ticketActivityLogRepository;

    @Autowired
    private StatusHistoryEntryRepository statusHistoryEntryRepository;

    @Autowired
    private LogService logService;

    @Override
    public TicketDto createTicket(TicketCreateRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner profile not found."));

        String ticketId = "CC-" + (1000 + new Random().nextInt(9000));

        Ticket ticket = Ticket.builder()
                .id(ticketId)
                .title(request.getTitle())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status("Open")
                .owner(owner.getUserId())
                .location(request.getLocation())
                .assignee("")
                .assignedStaff("")
                .department(request.getCategory())
                .created(LocalDate.now())
                .due(LocalDate.now().plusDays(7))
                .description(request.getDescription())
                .attachments(request.getAttachments() != null ? String.join("|||", request.getAttachments()) : "")
                .resolutionNotes("")
                .updatedAt(LocalDateTime.now())
                .build();

        Ticket saved = ticketRepository.save(ticket);

        logService.logActivity("TICKET_CREATED", owner.getUserId(), "Ticket created: " + ticketId);
        createTimelineEntry(ticketId, "Ticket opened", "Student submitted the complaint.");
        createTicketActivityLog(ticketId, "Ticket Opened", owner.getUserId(), "Student submitted the complaint.");
        createStatusHistoryEntry(ticketId, "Open", owner.getUserId(), "Ticket opened.");

        createNotification("New Ticket Created: " + ticketId, "A new complaint in category " + request.getCategory() + " has been submitted.", "admin");
        createNotification("New Ticket Created: " + ticketId, "A new complaint in category " + request.getCategory() + " has been submitted.", "warden");

        return mapToDto(saved);
    }

    @Override
    public List<TicketDto> getTicketsByRole(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));

        List<Ticket> tickets;
        String role = user.getRole().toLowerCase();

        if (role.equals("student")) {
            tickets = ticketRepository.findByOwnerOrderByCreatedDesc(user.getUserId());
        } else {
            // Staff, Warden, and Admin all see ALL tickets so student complaints are visible
            tickets = ticketRepository.findAllByOrderByCreatedDesc();
        }

        return tickets.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public TicketDto getTicketDetails(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));
        return mapToDto(ticket);
    }

    @Override
    public TicketDto updateTicket(String id, TicketUpdateRequest request, String email) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));

        if (request.getStatus() != null && request.getStatus().equalsIgnoreCase("Closed")) {
            if (!ticket.getOwner().equalsIgnoreCase(user.getUserId()) && !user.getRole().equalsIgnoreCase("admin")) {
                throw new BadRequestException("Only the complaint owner can close this ticket.");
            }
            ticket.setStatus("Closed");
            if (request.getRating() != null) {
                ticket.setRating(request.getRating());
            }
            if (request.getResolutionNotes() != null) {
                ticket.setResolutionNotes(request.getResolutionNotes());
            }
            createTimelineEntry(id, "Ticket closed", "Ticket was finalized and closed by the student with rating: " + request.getRating());
            createTicketActivityLog(id, "Ticket Closed", user.getUserId(), "Ticket was closed by " + user.getName());
            createStatusHistoryEntry(id, "Closed", user.getUserId(), "Ticket closed.");
            logService.logActivity("TICKET_CLOSED", user.getUserId(), "Ticket Closed: " + id);
            createNotification("Ticket Closed: " + id, "Complaint has been closed and marked resolved.", ticket.getOwner());
            if (ticket.getAssignee() != null && !ticket.getAssignee().trim().isEmpty()) {
                createNotification("Ticket Closed: " + id, "Complaint has been closed and marked resolved.", ticket.getAssignee());
            }
        } else {
            if (request.getTitle() != null) ticket.setTitle(request.getTitle());
            if (request.getPriority() != null) ticket.setPriority(request.getPriority());
            if (request.getDescription() != null) ticket.setDescription(request.getDescription());
            if (request.getLocation() != null) ticket.setLocation(request.getLocation());
            if (request.getResolutionNotes() != null) ticket.setResolutionNotes(request.getResolutionNotes());
            createTicketActivityLog(id, "Ticket Updated", user.getUserId(), "Ticket information updated.");
            logService.logActivity("TICKET_UPDATED", user.getUserId(), "Ticket info updated: " + id);
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        return mapToDto(ticketRepository.save(ticket));
    }

    @Override
    public TicketDto assignTicket(String id, String assigneeNameOrId, String email) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));

        if (!user.getRole().equalsIgnoreCase("admin") && !user.getRole().equalsIgnoreCase("warden")) {
            throw new BadRequestException("Unauthorized role. Only admins and wardens can assign tickets.");
        }

        ticket.setAssignee(assigneeNameOrId);
        ticket.setAssignedStaff(assigneeNameOrId);
        ticket.setStatus("Assigned");
        ticket.setDue(LocalDate.now().plusDays(3));
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        logService.logActivity("TICKET_ASSIGNED", user.getUserId(), "Ticket " + id + " assigned to: " + assigneeNameOrId);
        createTimelineEntry(id, "Ticket assigned", "Assigned to staff technician: " + assigneeNameOrId);
        createTicketActivityLog(id, "Ticket Assigned", user.getUserId(), "Assigned to staff: " + assigneeNameOrId);
        createStatusHistoryEntry(id, "Assigned", user.getUserId(), "Assigned to " + assigneeNameOrId);

        createNotification("Ticket Assigned: " + id, "Your complaint has been assigned to technician: " + assigneeNameOrId, ticket.getOwner());
        createNotification("New Assignment: " + id, "You have been assigned a new complaint: " + ticket.getTitle(), assigneeNameOrId);

        return mapToDto(saved);
    }

    @Override
    public TicketDto addComment(String id, String text, String email) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));

        Comment comment = Comment.builder()
                .ticketId(id)
                .by(user.getName())
                .role(user.getRole())
                .text(text)
                .createdAt(LocalDateTime.now())
                .build();
        commentRepository.save(comment);

        createTicketActivityLog(id, "Comment Added", user.getUserId(), text);
        logService.logActivity("TICKET_COMMENT_ADDED", user.getUserId(), "Added comment to ticket: " + id);

        if (user.getRole().equalsIgnoreCase("student")) {
            if (ticket.getAssignee() != null && !ticket.getAssignee().trim().isEmpty()) {
                createNotification("New comment on " + id, "Student added a comment: " + text, ticket.getAssignee());
            }
            createNotification("New comment on " + id, "Student added a comment: " + text, "admin");
        } else {
            createNotification("New comment on " + id, "Staff response: " + text, ticket.getOwner());
        }

        return mapToDto(ticket);
    }

    @Override
    public TicketDto updateStatus(String id, String status, String notes, String proofImage, String resolutionNotes, String email) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));

        ticket.setStatus(status);
        if (proofImage != null && !proofImage.trim().isEmpty()) {
            ticket.setProofImage(proofImage);
        }
        if (resolutionNotes != null && !resolutionNotes.trim().isEmpty()) {
            ticket.setResolutionNotes(resolutionNotes);
        } else if (notes != null && !notes.trim().isEmpty()) {
            ticket.setResolutionNotes(notes);
        }
        // If notes is provided but resolutionNotes is not, we can also use notes for resolutionNotes 
        // to maintain backwards compatibility, but the frontend explicitly sends resolutionNotes now.
        
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        logService.logActivity("TICKET_STATUS_CHANGED", user.getUserId(), "Ticket " + id + " status changed to: " + status);

        String timelineNote = (notes != null && !notes.trim().isEmpty()) ? notes : "Status changed by " + user.getName();
        createTimelineEntry(id, "Status updated: " + status, timelineNote);
        createTicketActivityLog(id, "Status Updated", user.getUserId(), timelineNote);
        createStatusHistoryEntry(id, status, user.getUserId(), timelineNote);

        createNotification("Ticket Status Updated: " + id, "Your complaint status is now: " + status, ticket.getOwner());

        return mapToDto(saved);
    }

    @Override
    public TicketDto escalateTicket(String id, String reason, String email) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));

        ticket.setPriority("Urgent");
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        logService.logActivity("TICKET_ESCALATED", user.getUserId(), "Ticket escalated: " + id + ". Reason: " + reason);
        createTimelineEntry(id, "Ticket escalated", "Escalated by " + user.getName() + ". Reason: " + reason);
        createTicketActivityLog(id, "Ticket Escalated", user.getUserId(), "Reason: " + reason);

        createNotification("Ticket Escalated: " + id, "Escalation requested. Reason: " + reason, "admin");
        createNotification("Ticket Escalated: " + id, "Escalation requested. Reason: " + reason, "warden");

        return mapToDto(saved);
    }

    @Override
    public ComplaintPageResponse getStudentComplaints(String email, int page, int size, String search, String status, String priority, String category, String dateFrom, String dateTo, String sort) {
        User user = resolveStudent(email);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 50)), resolveSort(sort));
        Page<Ticket> tickets = ticketRepository.findAll(buildStudentSpec(user.getUserId(), search, status, priority, category, parseDate(dateFrom), parseDate(dateTo)), pageable);
        return buildComplaintResponse(tickets, user.getUserId());
    }

    @Override
    public TicketDto getStudentComplaintDetails(String id, String email) {
        User user = resolveStudent(email);
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));
        if (!ticket.getOwner().equalsIgnoreCase(user.getUserId())) {
            throw new BadRequestException("You can only view your own complaints.");
        }
        return mapToDto(ticket);
    }

    @Override
    public ComplaintPageResponse getStudentComplaintsByStatus(String status, String email, int page, int size, String sort) {
        return getStudentComplaints(email, page, size, null, status, "All", "All", null, null, sort);
    }

    @Override
    public ComplaintPageResponse getStudentComplaintsByPriority(String priority, String email, int page, int size, String sort) {
        return getStudentComplaints(email, page, size, null, "All", priority, "All", null, null, sort);
    }

    @Override
    public ComplaintPageResponse searchStudentComplaints(String query, String email, int page, int size, String sort) {
        return getStudentComplaints(email, page, size, query, "All", "All", "All", null, null, sort);
    }

    private User resolveStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found."));
        if (!user.getRole().equalsIgnoreCase("student")) {
            throw new BadRequestException("Student complaint history is available only to student accounts.");
        }
        return user;
    }

    private Specification<Ticket> buildStudentSpec(String ownerId, String search, String status, String priority, String category, LocalDate dateFrom, LocalDate dateTo) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("owner"), ownerId));

            String cleanedSearch = clean(search);
            if (cleanedSearch != null) {
                String like = "%" + cleanedSearch.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("id")), like),
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("location")), like)
                ));
            }

            List<String> statuses = resolveStatuses(status);
            if (statuses != null && !statuses.isEmpty()) {
                predicates.add(root.get("status").in(statuses));
            }

            String cleanedPriority = clean(priority);
            if (cleanedPriority != null && !cleanedPriority.equalsIgnoreCase("All")) {
                predicates.add(cb.equal(root.get("priority"), cleanedPriority));
            }

            String cleanedCategory = clean(category);
            if (cleanedCategory != null && !cleanedCategory.equalsIgnoreCase("All")) {
                predicates.add(cb.equal(root.get("category"), cleanedCategory));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("created"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("created"), dateTo));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private List<String> resolveStatuses(String status) {
        String cleaned = clean(status);
        if (cleaned == null || cleaned.equalsIgnoreCase("All")) return null;
        if (cleaned.equalsIgnoreCase("Pending")) {
            return List.of("Open", "Assigned", "In Progress");
        }
        return List.of(cleaned);
    }

    private String clean(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private LocalDate parseDate(String value) {
        String cleaned = clean(value);
        if (cleaned == null) return null;
        try {
            return LocalDate.parse(cleaned);
        } catch (Exception ex) {
            throw new BadRequestException("Invalid date value: " + cleaned);
        }
    }

    private Sort resolveSort(String sort) {
        String cleaned = clean(sort);
        if (cleaned == null) cleaned = "Latest";
        if (cleaned.equalsIgnoreCase("Oldest")) {
            return Sort.by(Sort.Direction.ASC, "created");
        }
        if (cleaned.equalsIgnoreCase("Priority")) {
            return Sort.by(Sort.Direction.ASC, "priority").and(Sort.by(Sort.Direction.DESC, "created"));
        }
        if (cleaned.equalsIgnoreCase("Status")) {
            return Sort.by(Sort.Direction.ASC, "status").and(Sort.by(Sort.Direction.DESC, "created"));
        }
        return Sort.by(Sort.Direction.DESC, "created").and(Sort.by(Sort.Direction.DESC, "updatedAt"));
    }

    private ComplaintPageResponse buildComplaintResponse(Page<Ticket> ticketPage, String ownerId) {
        List<TicketDto> content = ticketPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return new ComplaintPageResponse(
                content,
                ticketPage.getNumber(),
                ticketPage.getSize(),
                ticketPage.getTotalPages(),
                ticketPage.getTotalElements(),
                ticketPage.isLast(),
                buildStatusCounts(ownerId)
        );
    }

    private Map<String, Long> buildStatusCounts(String ownerId) {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("All", 0L);
        counts.put("Open", 0L);
        counts.put("Assigned", 0L);
        counts.put("In Progress", 0L);
        counts.put("Resolved", 0L);
        counts.put("Closed", 0L);
        List<Ticket> tickets = ticketRepository.findByOwnerOrderByCreatedDesc(ownerId);
        counts.put("All", (long) tickets.size());
        for (Ticket ticket : tickets) {
            counts.computeIfPresent(ticket.getStatus(), (key, value) -> value + 1);
        }
        return counts;
    }

    private void createTimelineEntry(String ticketId, String title, String note) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        TimelineEntry entry = TimelineEntry.builder()
                .ticketId(ticketId)
                .title(title)
                .date(LocalDate.now().format(formatter))
                .note(note)
                .createdAt(LocalDateTime.now())
                .build();
        timelineEntryRepository.save(entry);
    }

    private void createTicketActivityLog(String ticketId, String action, String actor, String note) {
        TicketActivityLog log = TicketActivityLog.builder()
                .ticketId(ticketId)
                .action(action)
                .actor(actor)
                .note(note)
                .createdAt(LocalDateTime.now())
                .build();
        ticketActivityLogRepository.save(log);
    }

    private void createStatusHistoryEntry(String ticketId, String status, String actor, String note) {
        StatusHistoryEntry entry = StatusHistoryEntry.builder()
                .ticketId(ticketId)
                .status(status)
                .actor(actor)
                .note(note)
                .createdAt(LocalDateTime.now())
                .build();
        statusHistoryEntryRepository.save(entry);
    }

    private void createNotification(String title, String body, String recipient) {
        Notification notification = Notification.builder()
                .title(title)
                .body(body)
                .recipient(recipient)
                .unread(true)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    private TicketDto mapToDto(Ticket ticket) {
        List<Comment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
        List<TimelineEntry> timeline = timelineEntryRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
        List<TicketActivityLog> activityLogs = ticketActivityLogRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
        List<StatusHistoryEntry> statusHistory = statusHistoryEntryRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());

        List<String> files = new ArrayList<>();
        if (ticket.getAttachments() != null && !ticket.getAttachments().trim().isEmpty()) {
            files = List.of(ticket.getAttachments().split("\\|\\|\\|"));
        }

        String assignedStaff = ticket.getAssignedStaff();
        if (assignedStaff == null || assignedStaff.trim().isEmpty()) {
            assignedStaff = ticket.getAssignee();
        }

        return TicketDto.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .owner(ticket.getOwner())
                .location(ticket.getLocation())
                .assignee(ticket.getAssignee())
                .assignedStaff(assignedStaff)
                .department(ticket.getDepartment())
                .created(ticket.getCreated())
                .due(ticket.getDue())
                .description(ticket.getDescription())
                .attachments(files)
                .resolutionNotes(ticket.getResolutionNotes())
                .proofImage(ticket.getProofImage())
                .updatedAt(ticket.getUpdatedAt())
                .rating(ticket.getRating())
                .comments(comments)
                .timeline(timeline)
                .ticketActivityLogs(activityLogs)
                .statusHistory(statusHistory)
                .build();
    }
}
