package com.campuscare.authservice.dto;

public class SignupRequest {
    private String email;
    private String password;
    private String role;
    private String name;
    private String userId;
    private String department;
    private String phone;
    private String label;

    public SignupRequest() {
    }

    public SignupRequest(String email, String password, String role, String name, String userId, String department, String phone, String label) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.name = name;
        this.userId = userId;
        this.department = department;
        this.phone = phone;
        this.label = label;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    private String otp;

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
