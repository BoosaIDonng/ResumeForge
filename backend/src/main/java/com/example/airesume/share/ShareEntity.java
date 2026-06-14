package com.example.airesume.share;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "shares")
public class ShareEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resumeId;

    @Column(unique = true, nullable = false, length = 64)
    private String token;

    private String password;

    @Column(nullable = false)
    private int viewCount;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    private LocalDateTime createdAt;

    protected ShareEntity() {
    }

    public ShareEntity(Long resumeId, String token, String password) {
        this.resumeId = resumeId;
        this.token = token;
        this.password = password;
        this.viewCount = 0;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public String getToken() {
        return token;
    }

    public String getPassword() {
        return password;
    }

    public int getViewCount() {
        return viewCount;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void deactivate() {
        this.active = false;
    }

    public void activate() {
        this.active = true;
    }

    public void updatePassword(String hashedPassword) {
        this.password = hashedPassword;
    }
}
