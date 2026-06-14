package com.example.airesume.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.airesume.ai.AiCallLogRepository;
import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiProperties;
import com.example.airesume.ai.JsonResponseParser;
import com.example.airesume.ai.PromptType;
import com.example.airesume.analysis.AnalysisReportEntity;
import com.example.airesume.analysis.AnalysisReportRepository;
import com.example.airesume.analysis.JdAnalysisPromptBuilder;
import com.example.airesume.analysis.dto.AnalysisSuggestion;
import com.example.airesume.analysis.dto.JdAnalysisResult;
import com.example.airesume.coverletter.CoverLetterEntity;
import com.example.airesume.coverletter.CoverLetterPromptBuilder;
import com.example.airesume.coverletter.CoverLetterRepository;
import com.example.airesume.interview.InterviewFeedbackRepository;
import com.example.airesume.interview.InterviewPromptBuilder;
import com.example.airesume.interview.InterviewQuestionRepository;
import com.example.airesume.interview.InterviewSessionRepository;
import com.example.airesume.job.JobEntity;
import com.example.airesume.job.JobService;
import com.example.airesume.optimization.OptimizationProposalRepository;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TaskWorkerTest {

    private AiTaskRepository taskRepository;
    private ResumeService resumeService;
    private JobService jobService;
    private AiClient aiClient;
    private JsonResponseParser jsonParser;
    private JdAnalysisPromptBuilder jdAnalysisPromptBuilder;
    private InterviewPromptBuilder interviewPromptBuilder;
    private CoverLetterPromptBuilder coverLetterPromptBuilder;
    private AnalysisReportRepository analysisReportRepository;
    private OptimizationProposalRepository optimizationProposalRepository;
    private InterviewSessionRepository interviewSessionRepository;
    private InterviewQuestionRepository interviewQuestionRepository;
    private InterviewFeedbackRepository interviewFeedbackRepository;
    private CoverLetterRepository coverLetterRepository;
    private AiCallLogRepository aiCallLogRepository;
    private AiProperties aiProperties;
    private ProgressTracker progressTracker;
    private ObjectMapper objectMapper;
    private TaskWorker worker;

    @BeforeEach
    void setUp() {
        taskRepository = mock(AiTaskRepository.class);
        resumeService = mock(ResumeService.class);
        jobService = mock(JobService.class);
        aiClient = mock(AiClient.class);
        jsonParser = mock(JsonResponseParser.class);
        jdAnalysisPromptBuilder = mock(JdAnalysisPromptBuilder.class);
        interviewPromptBuilder = mock(InterviewPromptBuilder.class);
        coverLetterPromptBuilder = mock(CoverLetterPromptBuilder.class);
        analysisReportRepository = mock(AnalysisReportRepository.class);
        optimizationProposalRepository = mock(OptimizationProposalRepository.class);
        interviewSessionRepository = mock(InterviewSessionRepository.class);
        interviewQuestionRepository = mock(InterviewQuestionRepository.class);
        interviewFeedbackRepository = mock(InterviewFeedbackRepository.class);
        coverLetterRepository = mock(CoverLetterRepository.class);
        aiCallLogRepository = mock(AiCallLogRepository.class);
        aiProperties = new AiProperties();
        progressTracker = mock(ProgressTracker.class);
        objectMapper = new ObjectMapper();

        worker = new TaskWorker(
            taskRepository, resumeService, jobService, aiClient, jsonParser,
            jdAnalysisPromptBuilder, interviewPromptBuilder, coverLetterPromptBuilder,
            analysisReportRepository, optimizationProposalRepository,
            interviewSessionRepository, interviewQuestionRepository,
            interviewFeedbackRepository, coverLetterRepository,
            aiCallLogRepository, aiProperties,
            progressTracker, objectMapper
        );
    }

    @Test
    void handle_jdAnalysis_whenTaskNotFound_doesNothing() {
        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        worker.handle(new TaskMessage(1L, TaskType.JD_ANALYSIS, 10L, 20L));

        verify(aiClient, never()).completeJson(any(), any(), any());
    }

    @Test
    void handle_jdAnalysis_success() {
        AiTaskEntity task = new AiTaskEntity(TaskType.JD_ANALYSIS.name(), 10L, 20L);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResumeEntity resume = mock(ResumeEntity.class);
        when(resume.getResumeData()).thenReturn("{\"name\":\"test\"}");
        when(resumeService.get(10L)).thenReturn(resume);

        JobEntity job = mock(JobEntity.class);
        when(job.getDescription()).thenReturn("Java开发");
        when(jobService.get(20L)).thenReturn(job);

        when(jdAnalysisPromptBuilder.systemPrompt()).thenReturn("system");
        when(jdAnalysisPromptBuilder.userPrompt(any(), any())).thenReturn("user");
        when(aiClient.completeJson(any(), any(), any())).thenReturn("{}");

        JdAnalysisResult analysisResult = new JdAnalysisResult(85, 90, List.of("Java"), List.of("K8s"), List.of(new AnalysisSuggestion("技能", "Java", "Kotlin")), "总结");
        when(jsonParser.parse("{}", JdAnalysisResult.class)).thenReturn(analysisResult);
        when(analysisReportRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        worker.handle(new TaskMessage(1L, TaskType.JD_ANALYSIS, 10L, 20L));

        verify(analysisReportRepository).save(any(AnalysisReportEntity.class));
    }

    @Test
    void handle_jdAnalysis_failure_marksTaskFailed() {
        AiTaskEntity task = new AiTaskEntity(TaskType.JD_ANALYSIS.name(), 10L, 20L);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(resumeService.get(10L)).thenThrow(new RuntimeException("resume not found"));

        worker.handle(new TaskMessage(1L, TaskType.JD_ANALYSIS, 10L, 20L));

        assertThat(task.getStatus()).isEqualTo("FAILED");
        assertThat(task.getErrorMessage()).contains("resume not found");
    }

    @Test
    void handle_coverLetter_success() {
        AiTaskEntity task = new AiTaskEntity(TaskType.COVER_LETTER.name(), 10L, 20L);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResumeEntity resume = mock(ResumeEntity.class);
        when(resume.getResumeData()).thenReturn("{\"name\":\"张三\"}");
        when(resumeService.get(10L)).thenReturn(resume);

        JobEntity job = mock(JobEntity.class);
        when(job.getDescription()).thenReturn("前端开发");
        when(jobService.get(20L)).thenReturn(job);

        when(coverLetterPromptBuilder.systemPrompt("formal")).thenReturn("system");
        when(coverLetterPromptBuilder.userPrompt(any(), any())).thenReturn("user");
        when(aiClient.completeText(any(), any(), any())).thenReturn("尊敬的HR您好...");

        CoverLetterEntity saved = new CoverLetterEntity(10L, 20L, "formal", "尊敬的HR您好...");
        when(coverLetterRepository.save(any())).thenReturn(saved);

        worker.handle(new TaskMessage(1L, TaskType.COVER_LETTER, 10L, 20L));

        verify(coverLetterRepository).save(any(CoverLetterEntity.class));
    }

    @Test
    void handle_coverLetter_whenTaskNotFound_doesNothing() {
        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        worker.handle(new TaskMessage(1L, TaskType.COVER_LETTER, 10L, 20L));

        verify(coverLetterRepository, never()).save(any());
    }
}
