package com.campuscare.authservice.dto;

public class LoginResponse {
    private String token;
    private String userId;
    private String email;
    private String role;
    private String name;
    private String label;

    public LoginResponse() {
    }

    public LoginResponse(String token, String userId, String email, String role, String name, String label) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.name = name;
        this.label = label;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;
        private String userId;
        private String email;
        private String role;
        private String name;
        private String label;

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder label(String label) {
            this.label = label;
            return this;
        }

        public LoginResponse build() {
            return new LoginResponse(token, userId, email, role, name, label);
        }
    }
}
