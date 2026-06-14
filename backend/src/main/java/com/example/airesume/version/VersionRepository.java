package com.example.airesume.version;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VersionRepository extends JpaRepository<VersionEntity, Long> {
    List<VersionEntity> findByResumeIdOrderByVersionNumberDesc(Long resumeId);
    Optional<VersionEntity> findFirstByResumeIdOrderByVersionNumberDesc(Long resumeId);
    long countByResumeId(Long resumeId);
    void deleteByResumeId(Long resumeId);
}
