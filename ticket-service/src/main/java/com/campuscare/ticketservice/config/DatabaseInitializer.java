package com.campuscare.ticketservice.config;

import com.campuscare.ticketservice.model.*;
import com.campuscare.ticketservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TimelineEntryRepository timelineEntryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void run(String... args) throws Exception {
        // Clean up predefined dummy mock data from MongoDB and Oracle Database on startup
        if (ticketRepository.existsById("CC-1048") || ticketRepository.existsById("CC-1047") || ticketRepository.existsById("CC-1045")) {
            ticketRepository.deleteAll();
            commentRepository.deleteAll();
            timelineEntryRepository.deleteAll();
            notificationRepository.deleteAll();
        }

        // Seed Categories in Oracle (Required for creating tickets)
        if (categoryRepository.count() == 0) {
            categoryRepository.save(Category.builder().name("Hostel").department("Hostel Maintenance").description("Hostel maintenance issues").build());
            categoryRepository.save(Category.builder().name("Infrastructure").department("Infrastructure").description("Campus infrastructure and building issues").build());
            categoryRepository.save(Category.builder().name("IT Services").department("IT Services").description("Internet, Wi-Fi and computing resources").build());
            categoryRepository.save(Category.builder().name("Academic").department("Administration").description("Academic infrastructure and services").build());
            categoryRepository.save(Category.builder().name("Administrative").department("Administration").description("Administrative processes and requests").build());
        }
    }
}
