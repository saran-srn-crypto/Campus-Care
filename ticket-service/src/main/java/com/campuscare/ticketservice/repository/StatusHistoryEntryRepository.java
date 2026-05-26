package com.campuscare.ticketservice.repository;

import com.campuscare.ticketservice.model.StatusHistoryEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StatusHistoryEntryRepository extends MongoRepository<StatusHistoryEntry, String> {
    List<StatusHistoryEntry> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
