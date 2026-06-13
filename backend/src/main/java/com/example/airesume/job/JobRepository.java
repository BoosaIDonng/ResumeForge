package com.example.airesume.job;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<JobEntity, Long> {
    List<JobEntity> findByResumeId(Long resumeId);
}
