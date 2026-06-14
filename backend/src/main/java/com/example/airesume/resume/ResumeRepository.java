package com.example.airesume.resume;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResumeRepository extends JpaRepository<ResumeEntity, Long> {
    @Query("SELECT r FROM ResumeEntity r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ResumeEntity> searchByTitle(@Param("query") String query);
}
