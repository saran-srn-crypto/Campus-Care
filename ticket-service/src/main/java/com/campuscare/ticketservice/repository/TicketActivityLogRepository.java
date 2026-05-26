package com.campuscare.ticketservice.repository;

import com.campuscare.ticketservice.model.TicketActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketActivityLogRepository extends MongoRepository<TicketActivityLog, String> {
    List<TicketActivityLog> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
