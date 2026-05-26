package com.campuscare.authservice.dto;

public class ProfileUpdateRequest {
    private String name;
    private String email;
    private String department;
    private String phone;

    public ProfileUpdateRequest() {
    }

    public ProfileUpdateRequest(String name, String email, String department, String phone) {
        this.name = name;
        this.email = email;
        this.department = department;
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
}
