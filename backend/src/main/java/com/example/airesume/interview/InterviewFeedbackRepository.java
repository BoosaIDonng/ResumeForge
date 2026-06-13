package com.example.airesume.interview;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedbackEntity, Long> {
}
