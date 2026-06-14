package com.example.airesume.interview;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
public class InterviewQuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sessionId;
    private int sortOrder;

    @Lob
    @Column(columnDefinition = "longtext", nullable = false)
    private String question;

    @Lob
    @Column(columnDefinition = "longtext")
    private String answer;

    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;

    protected InterviewQuestionEntity() {
    }

    public InterviewQuestionEntity(Long sessionId, int sortOrder, String question) {
        this.sessionId = sessionId;
        this.sortOrder = sortOrder;
        this.question = question;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public String getQuestion() {
        return question;
    }

    public String getAnswer() {
        return answer;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void answer(String answer) {
        this.answer = answer;
        this.answeredAt = LocalDateTime.now();
    }
}
