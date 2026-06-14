package com.example.airesume.share;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShareRepository extends JpaRepository<ShareEntity, Long> {
    Optional<ShareEntity> findByResumeId(Long resumeId);

    Optional<ShareEntity> findByToken(String token);

    void deleteByResumeId(Long resumeId);
}
