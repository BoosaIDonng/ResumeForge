package com.example.airesume.ai;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_call_logs")
public class AiCallLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long taskId;
    private String provider;
    private String model;
    private String promptType;
    private Integer requestTokens;
    private Integer responseTokens;
    private String status;

    @Lob
    private String errorMessage;

    private LocalDateTime createdAt;

    protected AiCallLogEntity() {
    }

    public AiCallLogEntity(
        Long taskId,
        String provider,
        String model,
        String promptType,
        Integer requestTokens,
        Integer responseTokens,
        String status,
        String errorMessage
    ) {
        this.taskId = taskId;
        this.provider = provider;
        this.model = model;
        this.promptType = promptType;
        this.requestTokens = requestTokens;
        this.responseTokens = responseTokens;
        this.status = status;
        this.errorMessage = errorMessage;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public String getProvider() {
        return provider;
    }

    public String getModel() {
        return model;
    }

    public String getPromptType() {
        return promptType;
    }

    public Integer getRequestTokens() {
        return requestTokens;
    }

    public Integer getResponseTokens() {
        return responseTokens;
    }

    public String getStatus() {
        return status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
