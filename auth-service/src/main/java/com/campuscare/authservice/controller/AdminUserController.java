package com.campuscare.authservice.controller;

import com.campuscare.authservice.dto.SignupRequest;
import com.campuscare.authservice.exception.BadRequestException;
import com.campuscare.authservice.exception.ResourceNotFoundException;
import com.campuscare.authservice.model.User;
import com.campuscare.authservice.repository.UserRepository;
import com.campuscare.authservice.service.LogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin User Management Service", description = "Administrative operations for users and permissions")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LogService logService;

    @GetMapping
    @Operation(summary = "Get list of all users registered in the system")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Admin registrations for staff, wardens, or other administrators")
    public ResponseEntity<User> createUser(@RequestBody SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }
        if (userRepository.existsByUserId(request.getUserId())) {
            throw new BadRequestException("User ID is already in use.");
        }

        User user = User.builder()
                .userId(request.getUserId())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole().toLowerCase())
                .name(request.getName())
                .department(request.getDepartment())
                .phone(request.getPhone())
                .status("Active")
                .build();

        User saved = userRepository.save(user);
        logService.logActivity("ADMIN_CREATE_USER", saved.getUserId(), "Administrator created user account with role: " + saved.getRole());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{userId}/toggle")
    @Operation(summary = "Toggle user status between Active and Inactive")
    public ResponseEntity<User> toggleUserStatus(@PathVariable String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (userId.equalsIgnoreCase("717823s146") || user.getEmail().equalsIgnoreCase("717823s146@kce.ac.in")) {
            throw new BadRequestException("The primary admin account status cannot be deactivated.");
        }

        if (user.getStatus().equalsIgnoreCase("Active")) {
            user.setStatus("Inactive");
        } else {
            user.setStatus("Active");
        }
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        logService.logActivity("ADMIN_TOGGLE_USER_STATUS", saved.getUserId(), "Administrator toggled status of user to: " + saved.getStatus());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete a user permanently")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (userId.equalsIgnoreCase("717823s146") || user.getEmail().equalsIgnoreCase("717823s146@kce.ac.in")) {
            throw new BadRequestException("The primary admin account cannot be deleted.");
        }

        userRepository.delete(user);
        logService.logActivity("ADMIN_DELETE_USER", userId, "Administrator deleted user account.");
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "User deleted successfully"));
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update user details and credentials by Admin")
    public ResponseEntity<User> updateUser(@PathVariable String userId, @RequestBody SignupRequest request) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (userId.equalsIgnoreCase("717823s146") || user.getEmail().equalsIgnoreCase("717823s146@kce.ac.in")) {
            if (request.getRole() != null && !request.getRole().equalsIgnoreCase("admin")) {
                throw new BadRequestException("The primary admin account role cannot be changed.");
            }
            if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase("717823s146@kce.ac.in")) {
                throw new BadRequestException("The primary admin email cannot be changed.");
            }
            if (request.getUserId() != null && !request.getUserId().equalsIgnoreCase("717823s146")) {
                throw new BadRequestException("The primary admin User ID cannot be changed.");
            }
        }

        // Check if email is already used by another user
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already registered.");
            }
            user.setEmail(request.getEmail());
        }

        // Check if new userId is already used by another user
        if (request.getUserId() != null && !request.getUserId().equalsIgnoreCase(user.getUserId())) {
            if (userRepository.existsByUserId(request.getUserId())) {
                throw new BadRequestException("User ID is already in use.");
            }
            user.setUserId(request.getUserId());
        }

        if (request.getName() != null) user.setName(request.getName());
        if (request.getRole() != null) user.setRole(request.getRole().toLowerCase());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        
        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        logService.logActivity("ADMIN_UPDATE_USER", saved.getUserId(), "Administrator updated user details and credentials.");
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/upload")
    @Operation(summary = "Batch create users by uploading an Excel sheet")
    public ResponseEntity<?> uploadUsersExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Please select a valid Excel file to upload.");
        }

        int importedCount = 0;
        int skippedCount = 0;
        List<String> skippedUserIds = new ArrayList<>();
        List<User> usersToSave = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new BadRequestException("The uploaded Excel file has no rows.");
            }

            int userIdCol = -1;
            int nameCol = -1;
            int emailCol = -1;
            int passwordCol = -1;
            int roleCol = -1;
            int deptCol = -1;
            int phoneCol = -1;

            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                if (cell == null) continue;
                String header = getCellValueAsString(cell).toLowerCase().replaceAll("[^a-z0-9]", "");
                if (header.contains("userid") || header.equals("id") || header.contains("login") || header.contains("reg")) {
                    userIdCol = i;
                } else if (header.contains("name") || header.equals("fullname")) {
                    nameCol = i;
                } else if (header.contains("email")) {
                    emailCol = i;
                } else if (header.contains("password") || header.contains("pass")) {
                    passwordCol = i;
                } else if (header.contains("role")) {
                    roleCol = i;
                } else if (header.contains("department") || header.contains("dept") || header.contains("block")) {
                    deptCol = i;
                } else if (header.contains("phone") || header.contains("mobile") || header.contains("contact")) {
                    phoneCol = i;
                }
            }

            // Fallback to default indices if headers aren't detected
            if (userIdCol == -1) userIdCol = 0;
            if (nameCol == -1) nameCol = 1;
            if (emailCol == -1) emailCol = 2;
            if (passwordCol == -1) passwordCol = 3;
            if (roleCol == -1) roleCol = 4;
            if (deptCol == -1) deptCol = 5;
            if (phoneCol == -1) phoneCol = 6;

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                // Check if the row is entirely empty
                boolean isEmptyRow = true;
                for (int c = 0; c < row.getLastCellNum(); c++) {
                    Cell cell = row.getCell(c);
                    if (cell != null && cell.getCellType() != CellType.BLANK) {
                        isEmptyRow = false;
                        break;
                    }
                }
                if (isEmptyRow) continue;

                String userId = getCellValueAsString(row.getCell(userIdCol)).trim();
                String name = getCellValueAsString(row.getCell(nameCol)).trim();
                String email = getCellValueAsString(row.getCell(emailCol)).trim();
                String password = getCellValueAsString(row.getCell(passwordCol)).trim();
                String roleStr = getCellValueAsString(row.getCell(roleCol)).trim();
                String department = getCellValueAsString(row.getCell(deptCol)).trim();
                String phone = getCellValueAsString(row.getCell(phoneCol)).trim();

                if (userId.isEmpty() || name.isEmpty() || email.isEmpty()) {
                    skippedCount++;
                    skippedUserIds.add(userId.isEmpty() ? "Row " + (r + 1) : userId + " (Missing required fields)");
                    continue;
                }

                // Check if userId or email already exists
                if (userRepository.existsByUserId(userId) || userRepository.existsByEmail(email)) {
                    skippedCount++;
                    skippedUserIds.add(userId);
                    continue;
                }

                // Parse and map role (highly robust matching)
                String role = "student";
                String roleLower = roleStr.toLowerCase().trim();
                if (roleLower.contains("staff") || roleLower.contains("tech") || roleLower.contains("emp") || roleLower.contains("employee")) {
                    role = "staff";
                } else if (roleLower.contains("warden") || roleLower.contains("wrd")) {
                    role = "warden";
                } else if (roleLower.contains("admin") || roleLower.contains("mgr") || roleLower.contains("manager")) {
                    role = "admin";
                } else if (roleLower.contains("stu") || roleLower.contains("student")) {
                    role = "student";
                }

                // Default password to "123456" if empty
                if (password.isEmpty()) {
                    password = "123456";
                }

                User user = User.builder()
                        .userId(userId)
                        .name(name)
                        .email(email)
                        .password(passwordEncoder.encode(password))
                        .role(role)
                        .department(department.isEmpty() ? null : department)
                        .phone(phone.isEmpty() ? null : phone)
                        .status("Active")
                        .build();

                usersToSave.add(user);
                importedCount++;
            }

            // Batch save users for high performance database insertion
            if (!usersToSave.isEmpty()) {
                userRepository.saveAll(usersToSave);
                
                String adminId = "admin";
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getName() != null) {
                    adminId = auth.getName();
                }
                logService.logActivity("ADMIN_EXCEL_IMPORT", adminId, "Administrator imported " + importedCount + " users successfully via Excel sheet.");
            }

        } catch (Exception e) {
            throw new BadRequestException("Failed to process Excel file: " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Excel import completed successfully.");
        response.put("importedCount", importedCount);
        response.put("skippedCount", skippedCount);
        response.put("skippedUserIds", skippedUserIds);
        return ResponseEntity.ok(response);
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double numericVal = cell.getNumericCellValue();
                if (numericVal == (long) numericVal) {
                    return String.valueOf((long) numericVal);
                }
                return String.valueOf(numericVal);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }
}
