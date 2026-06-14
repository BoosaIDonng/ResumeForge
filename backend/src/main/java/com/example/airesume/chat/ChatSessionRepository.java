package com.example.airesume.chat;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatSessionRepository extends JpaRepository<ChatSessionEntity, Long> {
    List<ChatSessionEntity> findByResumeIdOrderByUpdatedAtDesc(Long resumeId);
}
