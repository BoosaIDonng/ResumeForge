package com.example.airesume.optimization;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class OptimizationValidatorTest {
    private final OptimizationValidator validator = new OptimizationValidator();

    @Test
    void acceptsReplaceWhenPathAllowedAndOriginalMatches() {
        String resume = """
            {"summary":{"content":"熟悉 Java 后端开发"},"sections":{"skills":{"items":["Java","Redis"]}}}
            """;
        ResumeChange change = new ResumeChange(
            "summary.content",
            ChangeAction.REPLACE,
            "熟悉 Java 后端开发",
            "熟悉 Spring Boot、Redis 和 RabbitMQ 后端开发",
            "匹配 JD 中的后端技术栈"
        );

        ValidationResult result = validator.validate(resume, List.of(change));

        assertThat(result.applied()).hasSize(1);
        assertThat(result.rejected()).isEmpty();
    }

    @Test
    void rejectsPersonalInfoChange() {
        String resume = "{\"basics\":{\"email\":\"me@example.com\"}}";
        ResumeChange change = new ResumeChange(
            "basics.email",
            ChangeAction.REPLACE,
            "me@example.com",
            "other@example.com",
            "不允许修改联系方式"
        );

        ValidationResult result = validator.validate(resume, List.of(change));

        assertThat(result.applied()).isEmpty();
        assertThat(result.rejected()).hasSize(1);
        assertThat(result.rejected().get(0).reason()).contains("禁改字段");
    }

    @Test
    void rejectsWhenOriginalNotFound() {
        String resume = "{\"summary\":{\"content\":\"实际内容\"}}";
        ResumeChange change = new ResumeChange(
            "summary.content",
            ChangeAction.REPLACE,
            "不存在的原文",
            "新内容",
            "reason"
        );

        ValidationResult result = validator.validate(resume, List.of(change));

        assertThat(result.applied()).isEmpty();
        assertThat(result.rejected()).hasSize(1);
        assertThat(result.rejected().get(0).reason()).contains("原文不匹配");
    }

    @Test
    void rejectsPathNotInWhitelist() {
        String resume = "{\"other\":{\"field\":\"value\"}}";
        ResumeChange change = new ResumeChange(
            "other.field",
            ChangeAction.REPLACE,
            "value",
            "new",
            "reason"
        );

        ValidationResult result = validator.validate(resume, List.of(change));

        assertThat(result.applied()).isEmpty();
        assertThat(result.rejected()).hasSize(1);
        assertThat(result.rejected().get(0).reason()).contains("白名单");
    }
}
