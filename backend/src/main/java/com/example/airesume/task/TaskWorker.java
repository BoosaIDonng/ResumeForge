package com.example.airesume.task;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.JsonResponseParser;
import com.example.airesume.ai.PromptType;
import com.example.airesume.analysis.AnalysisReportEntity;
import com.example.airesume.analysis.AnalysisReportRepository;
import com.example.airesume.analysis.JdAnalysisPromptBuilder;
import com.example.airesume.analysis.dto.JdAnalysisResult;
import com.example.airesume.coverletter.CoverLetterEntity;
import com.example.airesume.coverletter.CoverLetterPromptBuilder;
import com.example.airesume.coverletter.CoverLetterRepository;
import com.example.airesume.interview.InterviewFeedbackEntity;
import com.example.airesume.interview.InterviewFeedbackRepository;
import com.example.airesume.interview.InterviewPromptBuilder;
import com.example.airesume.interview.InterviewQuestionEntity;
import com.example.airesume.interview.InterviewQuestionRepository;
import com.example.airesume.interview.InterviewSessionEntity;
import com.example.airesume.interview.InterviewSessionRepository;
import com.example.airesume.interview.dto.InterviewFeedbackResult;
import com.example.airesume.job.JobEntity;
import com.example.airesume.job.JobService;
import com.example.airesume.optimization.OptimizationProposalEntity;
import com.example.airesume.optimization.OptimizationProposalRepository;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class TaskWorker {
    private static final Logger log = LoggerFactory.getLogger(TaskWorker.class);

    private final AiTaskRepository taskRepository;
    private final ResumeService resumeService;
    private final JobService jobService;
    private final AiClient aiClient;
    private final JsonResponseParser jsonParser;
    private final JdAnalysisPromptBuilder jdAnalysisPromptBuilder;
    private final InterviewPromptBuilder interviewPromptBuilder;
    private final CoverLetterPromptBuilder coverLetterPromptBuilder;
    private final AnalysisReportRepository analysisReportRepository;
    private final OptimizationProposalRepository optimizationProposalRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final CoverLetterRepository coverLetterRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public TaskWorker(
        AiTaskRepository taskRepository,
        ResumeService resumeService,
        JobService jobService,
        AiClient aiClient,
        JsonResponseParser jsonParser,
        JdAnalysisPromptBuilder jdAnalysisPromptBuilder,
        InterviewPromptBuilder interviewPromptBuilder,
        CoverLetterPromptBuilder coverLetterPromptBuilder,
        AnalysisReportRepository analysisReportRepository,
        OptimizationProposalRepository optimizationProposalRepository,
        InterviewSessionRepository interviewSessionRepository,
        InterviewQuestionRepository interviewQuestionRepository,
        InterviewFeedbackRepository interviewFeedbackRepository,
        CoverLetterRepository coverLetterRepository,
        StringRedisTemplate redisTemplate,
        ObjectMapper objectMapper
    ) {
        this.taskRepository = taskRepository;
        this.resumeService = resumeService;
        this.jobService = jobService;
        this.aiClient = aiClient;
        this.jsonParser = jsonParser;
        this.jdAnalysisPromptBuilder = jdAnalysisPromptBuilder;
        this.interviewPromptBuilder = interviewPromptBuilder;
        this.coverLetterPromptBuilder = coverLetterPromptBuilder;
        this.analysisReportRepository = analysisReportRepository;
        this.optimizationProposalRepository = optimizationProposalRepository;
        this.interviewSessionRepository = interviewSessionRepository;
        this.interviewQuestionRepository = interviewQuestionRepository;
        this.interviewFeedbackRepository = interviewFeedbackRepository;
        this.coverLetterRepository = coverLetterRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitConfig.TASK_QUEUE)
    public void handle(TaskMessage message) {
        switch (message.taskType()) {
            case JD_ANALYSIS -> handleJdAnalysis(message);
            case OPTIMIZATION_PROPOSAL -> handleOptimizationProposal(message);
            case INTERVIEW_QUESTION_GENERATION -> handleInterviewQuestionGeneration(message);
            case INTERVIEW_FEEDBACK -> handleInterviewFeedback(message);
            case COVER_LETTER -> handleCoverLetter(message);
        }
    }

    private void handleJdAnalysis(TaskMessage message) {
        AiTaskEntity task = taskRepository.findById(message.taskId()).orElse(null);
        if (task == null) return;

        try {
            task.updateProgress("RUNNING", 10);
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "10");

            ResumeEntity resume = resumeService.get(message.resumeId());
            JobEntity job = jobService.get(message.jobId());

            String systemPrompt = jdAnalysisPromptBuilder.systemPrompt();
            String userPrompt = jdAnalysisPromptBuilder.userPrompt(resume.getResumeData(), job.getDescription());

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "40");

            String aiResponse = aiClient.completeJson(PromptType.JD_ANALYSIS, systemPrompt, userPrompt);

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "70");

            JdAnalysisResult result = jsonParser.parse(aiResponse, JdAnalysisResult.class);

            String keywordMatchesJson = objectMapper.writeValueAsString(result.keywordMatches());
            String missingKeywordsJson = objectMapper.writeValueAsString(result.missingKeywords());
            String suggestionsJson = objectMapper.writeValueAsString(result.suggestions());

            AnalysisReportEntity report = analysisReportRepository.save(new AnalysisReportEntity(
                message.resumeId(),
                message.jobId(),
                result.overallScore(),
                result.atsScore(),
                keywordMatchesJson,
                missingKeywordsJson,
                suggestionsJson,
                result.summary()
            ));

            task.complete("ANALYSIS_REPORT", report.getId());
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "100");

        } catch (Exception ex) {
            log.error("JD analysis failed for task {}", message.taskId(), ex);
            task.fail(ex.getMessage());
            taskRepository.save(task);
        }
    }

    private void handleOptimizationProposal(TaskMessage message) {
        AiTaskEntity task = taskRepository.findById(message.taskId()).orElse(null);
        if (task == null) return;

        try {
            task.updateProgress("RUNNING", 10);
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "10");

            ResumeEntity resume = resumeService.get(message.resumeId());
            JobEntity job = jobService.get(message.jobId());

            String systemPrompt = """
                You are a resume optimization expert. Given a resume and job description, \
                suggest safe modifications as a JSON array of change objects. Each object must have: \
                path (string, dot-notation), action (REPLACE|APPEND|ADD_SKILL), \
                original (string, current text for REPLACE), value (string, new text), \
                reason (string, why this change helps). \
                Only suggest changes that are factually supported by the resume. \
                Do not invent companies, schools, degrees, or skills not present. \
                Output raw JSON array only.""";

            String userPrompt = """
                Resume Data:
                %s

                Job Description:
                %s""".formatted(resume.getResumeData(), job.getDescription());

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "40");

            String aiResponse = aiClient.completeJson(PromptType.OPTIMIZATION_DIFF, systemPrompt, userPrompt);

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "70");

            // Find the analysis report for this resume+job pair
            AnalysisReportEntity report = analysisReportRepository.findAll().stream()
                .filter(r -> r.getResumeId().equals(message.resumeId()) && r.getJobId().equals(message.jobId()))
                .findFirst()
                .orElse(null);
            Long reportId = report != null ? report.getId() : 0L;

            OptimizationProposalEntity proposal = new OptimizationProposalEntity(reportId, aiResponse, resume.getResumeData());
            proposal.markGenerated(aiResponse, resume.getResumeData());
            proposal = optimizationProposalRepository.save(proposal);

            task.complete("OPTIMIZATION_PROPOSAL", proposal.getId());
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "100");

        } catch (Exception ex) {
            log.error("Optimization proposal failed for task {}", message.taskId(), ex);
            task.fail(ex.getMessage());
            taskRepository.save(task);
        }
    }

    private void handleInterviewQuestionGeneration(TaskMessage message) {
        AiTaskEntity task = taskRepository.findById(message.taskId()).orElse(null);
        if (task == null) return;

        try {
            task.updateProgress("RUNNING", 10);
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "10");

            // Find the session for this resume+job
            InterviewSessionEntity session = interviewSessionRepository.findAll().stream()
                .filter(s -> s.getResumeId().equals(message.resumeId())
                    && s.getJobId().equals(message.jobId())
                    && "PENDING".equals(s.getStatus()))
                .findFirst()
                .orElse(null);

            if (session == null) {
                task.fail("No pending interview session found");
                taskRepository.save(task);
                return;
            }

            String systemPrompt = interviewPromptBuilder.questionSystemPrompt();
            String userPrompt = interviewPromptBuilder.questionPrompt(
                session.getRole(), session.getLevel(), session.getType(), "General", 5
            );

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "40");

            String aiResponse = aiClient.completeJson(PromptType.INTERVIEW_QUESTION, systemPrompt, userPrompt);

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "70");

            List<String> questions = objectMapper.readValue(aiResponse, new TypeReference<List<String>>() {});

            for (int i = 0; i < questions.size(); i++) {
                interviewQuestionRepository.save(new InterviewQuestionEntity(session.getId(), i + 1, questions.get(i)));
            }

            session.updateStatus("IN_PROGRESS");
            interviewSessionRepository.save(session);

            task.complete("INTERVIEW_SESSION", session.getId());
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "100");

        } catch (Exception ex) {
            log.error("Interview question generation failed for task {}", message.taskId(), ex);
            task.fail(ex.getMessage());
            taskRepository.save(task);
        }
    }

    private void handleInterviewFeedback(TaskMessage message) {
        AiTaskEntity task = taskRepository.findById(message.taskId()).orElse(null);
        if (task == null) return;

        try {
            task.updateProgress("RUNNING", 10);
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "10");

            InterviewSessionEntity session = interviewSessionRepository.findAll().stream()
                .filter(s -> s.getResumeId().equals(message.resumeId())
                    && s.getJobId().equals(message.jobId())
                    && "IN_PROGRESS".equals(s.getStatus()))
                .findFirst()
                .orElse(null);

            if (session == null) {
                task.fail("No in-progress interview session found");
                taskRepository.save(task);
                return;
            }

            List<InterviewQuestionEntity> questions = interviewQuestionRepository.findBySessionIdOrderBySortOrder(session.getId());
            StringBuilder transcript = new StringBuilder();
            for (InterviewQuestionEntity q : questions) {
                transcript.append("Q: ").append(q.getQuestion()).append("\n");
                transcript.append("A: ").append(q.getAnswer() != null ? q.getAnswer() : "(no answer)").append("\n\n");
            }

            String systemPrompt = interviewPromptBuilder.feedbackSystemPrompt();
            String userPrompt = interviewPromptBuilder.feedbackPrompt(
                session.getRole(), session.getLevel(), session.getType(), transcript.toString()
            );

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "40");

            String aiResponse = aiClient.completeJson(PromptType.INTERVIEW_FEEDBACK, systemPrompt, userPrompt);

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "70");

            InterviewFeedbackResult result = jsonParser.parse(aiResponse, InterviewFeedbackResult.class);

            String categoryScoresJson = objectMapper.writeValueAsString(result.categoryScores());
            String strengthsJson = objectMapper.writeValueAsString(result.strengths());
            String areasJson = objectMapper.writeValueAsString(result.areasForImprovement());

            InterviewFeedbackEntity feedback = interviewFeedbackRepository.save(new InterviewFeedbackEntity(
                session.getId(),
                result.totalScore(),
                categoryScoresJson,
                strengthsJson,
                areasJson,
                result.finalAssessment()
            ));

            session.updateStatus("COMPLETED");
            interviewSessionRepository.save(session);

            task.complete("INTERVIEW_FEEDBACK", feedback.getId());
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "100");

        } catch (Exception ex) {
            log.error("Interview feedback failed for task {}", message.taskId(), ex);
            task.fail(ex.getMessage());
            taskRepository.save(task);
        }
    }

    private void handleCoverLetter(TaskMessage message) {
        AiTaskEntity task = taskRepository.findById(message.taskId()).orElse(null);
        if (task == null) return;

        try {
            task.updateProgress("RUNNING", 10);
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "10");

            ResumeEntity resume = resumeService.get(message.resumeId());
            JobEntity job = jobService.get(message.jobId());

            String tone = "formal";
            String systemPrompt = coverLetterPromptBuilder.systemPrompt(tone);
            String userPrompt = coverLetterPromptBuilder.userPrompt(resume.getResumeData(), job.getDescription());

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "40");

            String aiResponse = aiClient.completeText(PromptType.COVER_LETTER, systemPrompt, userPrompt);

            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "70");

            CoverLetterEntity coverLetter = coverLetterRepository.save(
                new CoverLetterEntity(message.resumeId(), message.jobId(), tone, aiResponse)
            );

            task.complete("COVER_LETTER", coverLetter.getId());
            taskRepository.save(task);
            redisTemplate.opsForValue().set(TaskService.progressKey(task.getId()), "100");

        } catch (Exception ex) {
            log.error("Cover letter generation failed for task {}", message.taskId(), ex);
            task.fail(ex.getMessage());
            taskRepository.save(task);
        }
    }
}
