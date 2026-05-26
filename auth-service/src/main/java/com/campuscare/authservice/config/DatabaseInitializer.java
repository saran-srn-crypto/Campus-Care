package com.campuscare.authservice.config;

import com.campuscare.authservice.model.User;
import com.campuscare.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // If the old admin profile ADM-001 exists, wipe existing users to allow fresh seeding
        if (userRepository.existsByUserId("ADM-001")) {
            userRepository.deleteAll();
        }

        if (userRepository.count() == 0) {
            String defaultPassword = passwordEncoder.encode("password");
            String adminPassword = passwordEncoder.encode("admin");

            User student = User.builder()
                    .userId("STU-001")
                    .name("Student User")
                    .email("student@example.com")
                    .password(defaultPassword)
                    .role("student")
                    .department("Computer Science")
                    .phone("9876543210")
                    .status("Active")
                    .build();

            User staff = User.builder()
                    .userId("EMP-204")
                    .name("Meera Nair")
                    .email("staff@example.com")
                    .password(defaultPassword)
                    .role("staff")
                    .department("IT Services")
                    .phone("9876543211")
                    .status("Active")
                    .build();

            User warden = User.builder()
                    .userId("WRD-102")
                    .name("Ravi Iyer")
                    .email("warden@example.com")
                    .password(defaultPassword)
                    .role("warden")
                    .department("Hostel Block C")
                    .phone("9876543212")
                    .status("Active")
                    .build();

            User admin = User.builder()
                    .userId("717823s146")
                    .name("Saran")
                    .email("admin@example.com")
                    .password(adminPassword)
                    .role("admin")
                    .department("Administration")
                    .phone("9876543213")
                    .status("Active")
                    .build();

            User staff2 = User.builder()
                    .userId("EMP-205")
                    .name("Karthik Rao")
                    .email("karthik@example.com")
                    .password(defaultPassword)
                    .role("staff")
                    .department("Hostel Maintenance")
                    .phone("9876543214")
                    .status("Active")
                    .build();

            userRepository.saveAll(Arrays.asList(student, staff, warden, admin, staff2));
        }
    }
}
