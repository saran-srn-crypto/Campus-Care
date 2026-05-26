package com.campuscare.ticketservice.repository;

import com.campuscare.ticketservice.model.TimelineEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimelineEntryRepository extends MongoRepository<TimelineEntry, String> {
    List<TimelineEntry> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
