package com.example.airesume.interview;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InterviewSessionRepository extends JpaRepository<InterviewSessionEntity, Long> {
    long countByStatus(String status);

    @Query("SELECT i FROM InterviewSessionEntity i WHERE LOWER(i.role) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<InterviewSessionEntity> searchByRole(@Param("query") String query);
}
