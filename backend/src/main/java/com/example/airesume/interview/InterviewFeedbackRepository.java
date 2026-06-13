package com.example.airesume.interview;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedbackEntity, Long> {
    Optional<InterviewFeedbackEntity> findBySessionId(Long sessionId);
}
