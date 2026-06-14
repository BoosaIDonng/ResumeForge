package com.example.airesume.ai.grammar;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "grammar_check_history")
public class GrammarCheckHistoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resumeId;

    @Lob
    private String result;

    private int score;
    private int issueCount;
    private LocalDateTime createdAt;

    protected GrammarCheckHistoryEntity() {
    }

    public GrammarCheckHistoryEntity(Long resumeId, String result, int score, int issueCount) {
        this.resumeId = resumeId;
        this.result = result;
        this.score = score;
        this.issueCount = issueCount;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getResumeId() { return resumeId; }
    public String getResult() { return result; }
    public int getScore() { return score; }
    public int getIssueCount() { return issueCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
