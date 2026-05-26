package com.campuscare.ticketservice.repository;

import com.campuscare.ticketservice.model.SystemLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemLogRepository extends MongoRepository<SystemLog, String> {
    List<SystemLog> findAllByOrderByTimestampDesc();
}
