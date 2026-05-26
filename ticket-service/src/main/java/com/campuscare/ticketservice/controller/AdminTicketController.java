package com.campuscare.ticketservice.controller;

import com.campuscare.ticketservice.exception.BadRequestException;
import com.campuscare.ticketservice.model.Category;
import com.campuscare.ticketservice.model.SystemLog;
import com.campuscare.ticketservice.repository.CategoryRepository;
import com.campuscare.ticketservice.repository.SystemLogRepository;
import com.campuscare.ticketservice.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Ticket Operations Service", description = "Administrative operations for categories, logs, and PDF reporting")
public class AdminTicketController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SystemLogRepository systemLogRepository;

    @Autowired
    private ReportService reportService;

    @GetMapping("/categories")
    @Operation(summary = "Get list of all ticket categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a new ticket category")
    public ResponseEntity<Category> addCategory(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Category name is required.");
        }
        if (categoryRepository.existsByName(name)) {
            throw new BadRequestException("Category already exists.");
        }
        String dept = payload.getOrDefault("department", "General");
        String desc = payload.getOrDefault("description", name + " issues");
        Category cat = Category.builder()
                .name(name)
                .department(dept)
                .description(desc)
                .build();
        return ResponseEntity.ok(categoryRepository.save(cat));
    }

    @GetMapping("/logs")
    @Operation(summary = "View all system logs stored in MongoDB")
    public ResponseEntity<List<SystemLog>> getLogs() {
        return ResponseEntity.ok(systemLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping(value = "/reports/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Export a comprehensive PDF report of all complaints")
    public ResponseEntity<InputStreamResource> exportPdfReport() {
        ByteArrayInputStream bis = reportService.generateTicketReportPdf();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=campus_care_report.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
