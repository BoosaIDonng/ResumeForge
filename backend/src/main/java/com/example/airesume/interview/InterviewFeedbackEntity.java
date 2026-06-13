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
@Table(name = "interview_feedback")
public class InterviewFeedbackEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sessionId;
    private int totalScore;

    @Lob
    @Column(nullable = false)
    private String categoryScores;

    @Lob
    @Column(nullable = false)
    private String strengths;

    @Lob
    @Column(nullable = false)
    private String areasForImprovement;

    @Lob
    @Column(nullable = false)
    private String finalAssessment;

    private LocalDateTime createdAt;

    protected InterviewFeedbackEntity() {
    }

    public InterviewFeedbackEntity(
        Long sessionId,
        int totalScore,
        String categoryScores,
        String strengths,
        String areasForImprovement,
        String finalAssessment
    ) {
        this.sessionId = sessionId;
        this.totalScore = totalScore;
        this.categoryScores = categoryScores;
        this.strengths = strengths;
        this.areasForImprovement = areasForImprovement;
        this.finalAssessment = finalAssessment;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public String getCategoryScores() {
        return categoryScores;
    }

    public String getStrengths() {
        return strengths;
    }

    public String getAreasForImprovement() {
        return areasForImprovement;
    }

    public String getFinalAssessment() {
        return finalAssessment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
