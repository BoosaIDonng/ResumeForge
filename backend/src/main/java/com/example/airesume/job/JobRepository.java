package com.example.airesume.job;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<JobEntity, Long> {
    List<JobEntity> findByResumeId(Long resumeId);

    @Query("SELECT j FROM JobEntity j WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<JobEntity> searchByTitleOrCompany(@Param("query") String query);
}
