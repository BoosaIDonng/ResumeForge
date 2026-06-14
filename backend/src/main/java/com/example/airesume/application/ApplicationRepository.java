package com.example.airesume.application;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ApplicationRepository extends JpaRepository<ApplicationEntity, Long> {
    List<ApplicationEntity> findByResumeId(Long resumeId);

    List<ApplicationEntity> findByStatus(ApplicationStatus status);

    @Query("SELECT a.status, COUNT(a) FROM ApplicationEntity a GROUP BY a.status")
    List<Object[]> countByStatus();
}
