package com.example.airesume.ai.grammar;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrammarCheckHistoryRepository extends JpaRepository<GrammarCheckHistoryEntity, Long> {
    List<GrammarCheckHistoryEntity> findByResumeIdOrderByCreatedAtDesc(Long resumeId);
}
