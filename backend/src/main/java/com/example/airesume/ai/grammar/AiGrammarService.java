package com.example.airesume.ai.grammar;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiClientFactory;
import com.example.airesume.ai.JsonResponseParser;
import com.example.airesume.ai.PromptType;
import org.springframework.stereotype.Service;

@Service
public class AiGrammarService {
    private final AiClientFactory clientFactory;
    private final JsonResponseParser jsonParser;

    public AiGrammarService(AiClientFactory clientFactory, JsonResponseParser jsonParser) {
        this.clientFactory = clientFactory;
        this.jsonParser = jsonParser;
    }

    public GrammarCheckResponse check(String provider, String apiKey, String baseUrl, String model, String resumeText) {
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        String systemPrompt = """
            You are an expert resume reviewer, writing coach, and quality assessor. Perform a comprehensive diagnosis of the provided resume.

            IMPORTANT: Detect the primary language of the resume content. You MUST respond entirely in the same language as the resume. If the resume is written in Chinese, all your output must be in Chinese. If in English, respond in English. Match the resume's language exactly.

            ## Part 1: Issue Detection
            Detect and report these types of issues:
            - grammar: Grammatical errors, incorrect tense, subject-verb disagreement, article misuse
            - spelling: Misspelled words or typos
            - weak_verb: Weak or passive verbs that should be replaced with strong action verbs
            - vague: Vague or generic descriptions that lack specificity
            - quantify: Descriptions that could be improved with quantifiable metrics

            For each issue, provide the exact original text and a concrete suggestion.
            Set severity: "high" for grammar/spelling errors, "medium" for weak verbs and vague descriptions, "low" for quantify suggestions.

            ## Part 2: Section-Level Scoring
            Evaluate each section on these dimensions:
            - 内容完整性: Does it contain all key information?
            - 写作质量: Is the wording professional and clear?
            - 成果量化: Are achievements quantified with metrics?
            - 关键词丰富度: Does it include industry keywords?

            For each section, provide a score (0-100) and brief feedback.

            ## Part 3: Improvement Suggestions
            Provide high-priority actionable suggestions with concrete examples of better wording.

            ## Output Format
            You MUST return a JSON object with exactly these fields:
            - issues: array of { sectionId, sectionTitle, type, original, suggestion, severity }
            - sectionScores: array of { sectionType, sectionName, score, feedback }
            - suggestions: array of { priority, section, message, example }
            - summary: string with overall assessment
            - score: number from 0 to 100 (overall score)

            CRITICAL: You are a JSON API. Your entire response must be a single valid JSON object starting with { and ending with }. Do NOT use markdown syntax. Do NOT wrap in code fences. Do NOT add any text before or after the JSON.""";

        String userPrompt = """
            简历内容:
            %s""".formatted(resumeText);

        String response = client.completeJson(PromptType.GRAMMAR_CHECK, systemPrompt, userPrompt);
        return jsonParser.parse(response, GrammarCheckResponse.class);
    }
}
