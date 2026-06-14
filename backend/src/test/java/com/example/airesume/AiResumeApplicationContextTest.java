package com.example.airesume;

import com.example.airesume.ai.AiCallLogRepository;
import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.grammar.GrammarCheckHistoryRepository;
import com.example.airesume.analysis.AnalysisReportRepository;
import com.example.airesume.application.ApplicationRepository;
import com.example.airesume.coverletter.CoverLetterPromptBuilder;
import com.example.airesume.coverletter.CoverLetterRepository;
import com.example.airesume.interview.InterviewFeedbackRepository;
import com.example.airesume.interview.InterviewMessageRepository;
import com.example.airesume.interview.InterviewQuestionRepository;
import com.example.airesume.interview.InterviewSessionRepository;
import com.example.airesume.job.JobRepository;
import com.example.airesume.optimization.OptimizationProposalRepository;
import com.example.airesume.resume.ResumeRepository;
import com.example.airesume.share.ShareRepository;
import com.example.airesume.task.AiTaskRepository;
import com.example.airesume.version.VersionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.NONE,
    properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration"
    }
)
class AiResumeApplicationContextTest {
    @MockBean
    private ResumeRepository resumeRepository;

    @MockBean
    private JobRepository jobRepository;

    @MockBean
    private AiTaskRepository aiTaskRepository;

    @MockBean
    private ApplicationRepository applicationRepository;

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @MockBean
    private StringRedisTemplate stringRedisTemplate;

    @MockBean
    private AnalysisReportRepository analysisReportRepository;

    @MockBean
    private AiCallLogRepository aiCallLogRepository;

    @MockBean
    private AiClient aiClient;

    @MockBean
    private GrammarCheckHistoryRepository grammarCheckHistoryRepository;

    @MockBean
    private OptimizationProposalRepository optimizationProposalRepository;

    @MockBean
    private InterviewSessionRepository interviewSessionRepository;

    @MockBean
    private InterviewQuestionRepository interviewQuestionRepository;

    @MockBean
    private InterviewFeedbackRepository interviewFeedbackRepository;

    @MockBean
    private InterviewMessageRepository interviewMessageRepository;

    @MockBean
    private CoverLetterRepository coverLetterRepository;

    @MockBean
    private CoverLetterPromptBuilder coverLetterPromptBuilder;

    @MockBean
    private ShareRepository shareRepository;

    @MockBean
    private VersionRepository versionRepository;

    @Test
    void contextLoads() {
    }
}
