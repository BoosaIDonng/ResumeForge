package com.example.airesume.interview;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestionEntity, Long> {
    List<InterviewQuestionEntity> findBySessionIdOrderBySortOrder(Long sessionId);
}
