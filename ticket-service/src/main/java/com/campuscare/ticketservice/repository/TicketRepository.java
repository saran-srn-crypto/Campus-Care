package com.campuscare.ticketservice.repository;

import com.campuscare.ticketservice.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String>, JpaSpecificationExecutor<Ticket> {
    List<Ticket> findAllByOrderByCreatedDesc();
    List<Ticket> findByOwnerOrderByCreatedDesc(String ownerId);
    List<Ticket> findByAssigneeOrderByCreatedDesc(String assigneeId);
}
