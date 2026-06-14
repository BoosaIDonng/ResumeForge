package com.example.airesume.ai.grammar;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiClientFactory;
import com.example.airesume.ai.JsonResponseParser;
import com.example.airesume.ai.PromptType;
import com.example.airesume.common.ApiException;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeRepository;
import com.example.airesume.resume.ResumeService;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskService;
import com.example.airesume.task.TaskType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AiGrammarService {
    private final AiClientFactory clientFactory;
    private final JsonResponseParser jsonParser;
    private final ResumeRepository resumeRepository;
    private final ResumeService resumeService;
    private final GrammarCheckHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;
    private final TaskService taskService;

    public AiGrammarService(AiClientFactory clientFactory, JsonResponseParser jsonParser,
                            ResumeRepository resumeRepository, ResumeService resumeService,
                            GrammarCheckHistoryRepository historyRepository, ObjectMapper objectMapper,
                            TaskService taskService) {
        this.clientFactory = clientFactory;
        this.jsonParser = jsonParser;
        this.resumeRepository = resumeRepository;
        this.resumeService = resumeService;
        this.historyRepository = historyRepository;
        this.objectMapper = objectMapper;
        this.taskService = taskService;
    }

    public GrammarCheckResponse check(String provider, String apiKey, String baseUrl, String model, Long resumeId) {
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        ResumeEntity resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new ApiException("RESUME_NOT_FOUND", "简历不存在"));

        String systemPrompt = """
            You are an expert resume reviewer and writing coach. Analyze the provided resume for writing quality issues.

            IMPORTANT: Detect the primary language of the resume content. You MUST respond entirely in the same language as the resume. If the resume is written in Chinese, all your output (summary, suggestions, sectionTitle) must be in Chinese. If in English, respond in English. Match the resume's language exactly.

            You must detect and report these types of issues:
            - grammar: Grammatical errors, incorrect tense, subject-verb disagreement, article misuse
            - spelling: Misspelled words or typos
            - weak_verb: Weak or passive verbs that should be replaced with strong action verbs
            - vague: Vague or generic descriptions that lack specificity
            - quantify: Descriptions that could be improved with quantifiable metrics

            Analysis guidelines:
            - Check every text field in every section: titles, descriptions, highlights, summary text
            - For each issue, provide the exact original text and a concrete suggestion
            - Set severity: "high" for grammar/spelling errors, "medium" for weak verbs and vague descriptions, "low" for quantify suggestions
            - Be thorough but practical — only flag genuinely improvable items
            - Provide a brief overall summary of the writing quality
            - Assign a score from 0-100 (100 = perfect, no issues found)

            You MUST return a JSON object with exactly these fields:
            - issues: array of { sectionId, sectionTitle, type, original, suggestion, severity }
            - summary: string with overall assessment
            - score: number from 0 to 100

            CRITICAL: You are a JSON API. Your entire response must be a single valid JSON object starting with { and ending with }. Do NOT use markdown syntax. Do NOT wrap in code fences. Do NOT add any text before or after the JSON.""";

        String userPrompt = """
            简历内容:
            %s""".formatted(resume.getResumeData());

        String response = client.completeJson(PromptType.GRAMMAR_CHECK, systemPrompt, userPrompt);
        GrammarCheckResponse result = jsonParser.parse(response, GrammarCheckResponse.class);

        try {
            String resultJson = objectMapper.writeValueAsString(result);
            int issueCount = result.issues() != null ? result.issues().size() : 0;
            historyRepository.save(new GrammarCheckHistoryEntity(resumeId, resultJson, result.score(), issueCount));
        } catch (JsonProcessingException e) {
            // silently skip saving history if serialization fails
        }

        return result;
    }

    public AiTaskEntity submitAsync(Long resumeId) {
        return taskService.create(TaskType.GRAMMAR_CHECK, resumeId, null);
    }

    public List<GrammarCheckHistoryEntity> getHistory(Long resumeId) {
        return historyRepository.findByResumeIdOrderByCreatedAtDesc(resumeId);
    }

    public void deleteHistory(Long historyId) {
        historyRepository.deleteById(historyId);
    }

    public GrammarApplyResponse applyFixes(Long resumeId, List<GrammarApplyRequest.GrammarFix> fixes) {
        ResumeEntity resume = resumeService.get(resumeId);
        String resumeJson = resume.getResumeData();

        int appliedCount = 0;
        List<String> failedOriginals = new ArrayList<>();

        for (GrammarApplyRequest.GrammarFix fix : fixes) {
            if (fix.original() != null && fix.suggestion() != null && resumeJson.contains(fix.original())) {
                resumeJson = resumeJson.replace(fix.original(), fix.suggestion());
                appliedCount++;
            } else {
                failedOriginals.add(fix.original());
            }
        }

        if (appliedCount > 0) {
            resumeService.update(resume.getId(), resume.getTitle(), resumeJson);
        }

        return new GrammarApplyResponse(appliedCount, failedOriginals.size(), failedOriginals);
    }
}
