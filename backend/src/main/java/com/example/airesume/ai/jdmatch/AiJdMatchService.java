package com.example.airesume.ai.jdmatch;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiClientFactory;
import com.example.airesume.ai.JsonResponseParser;
import com.example.airesume.ai.PromptType;
import com.example.airesume.ai.refine.AiPhraseRemover;
import com.example.airesume.ai.refine.KeywordMatcher;
import com.example.airesume.common.ApiException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * JD Match service combining local keyword analysis with AI-powered evaluation.
 *
 * Flow:
 * 1. Extract text from resume, run local KeywordMatcher for precise word-boundary matching
 * 2. Clean AI-sounding phrases with AiPhraseRemover
 * 3. Send cleaned resume + local keyword results to AI for semantic analysis
 * 4. Merge local keyword scores with AI results for a hybrid score
 */
@Service
public class AiJdMatchService {
    private static final Logger log = LoggerFactory.getLogger(AiJdMatchService.class);

    private final AiClientFactory clientFactory;
    private final JsonResponseParser jsonParser;
    private final ObjectMapper objectMapper;
    private final KeywordMatcher keywordMatcher;
    private final AiPhraseRemover phraseRemover;

    public AiJdMatchService(AiClientFactory clientFactory, JsonResponseParser jsonParser,
                            ObjectMapper objectMapper, KeywordMatcher keywordMatcher,
                            AiPhraseRemover phraseRemover) {
        this.clientFactory = clientFactory;
        this.jsonParser = jsonParser;
        this.objectMapper = objectMapper;
        this.keywordMatcher = keywordMatcher;
        this.phraseRemover = phraseRemover;
    }

    public JdMatchResponse match(String provider, String apiKey, String baseUrl, String model,
                                 String resumeText, String jobDescription) {
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        // Step 1: Local keyword extraction and matching
        Set<String> jdKeywords = extractJdKeywords(jobDescription);
        double localMatchPercent = keywordMatcher.calculateMatchPercentage(resumeText, jdKeywords);

        // Partition keywords into matched and missing using local word-boundary analysis
        List<String> localMatched = new ArrayList<>();
        List<String> localMissing = new ArrayList<>();
        for (String kw : jdKeywords) {
            if (keywordMatcher.keywordInText(kw, resumeText)) {
                localMatched.add(kw);
            } else {
                localMissing.add(kw);
            }
        }

        log.info("Local keyword match: {}/{} ({}%)",
                localMatched.size(), jdKeywords.size(), String.format("%.1f", localMatchPercent));

        // Step 2: Clean AI phrases before sending to AI
        AiPhraseRemover.CleanResult cleanResult = phraseRemover.clean(resumeText, jobDescription);
        if (!cleanResult.removedPhrases().isEmpty()) {
            log.info("Removed {} AI phrases: {}",
                    cleanResult.removedPhrases().size(), cleanResult.removedPhrases());
        }

        // Step 3: AI semantic analysis with cleaned resume + local keyword context
        String matchedStr = localMatched.isEmpty() ? "none" : String.join(", ", localMatched);
        String missingStr = localMissing.isEmpty() ? "none" : String.join(", ", localMissing);

        String systemPrompt = """
            You are an expert resume analyst specializing in ATS optimization and job-candidate matching.

            IMPORTANT: Detect the primary language of the resume. Respond entirely in the same language. Chinese resume = Chinese response.

            YOUR ANALYSIS MUST BE THOROUGH AND ACTIONABLE.

            STEP 1 — STRUCTURED KEYWORD EXTRACTION
            Extract from the job description:
            - company: hiring company name ("" if not stated)
            - role: exact job title from the posting
            - required_skills: must-have technical skills and tools
            - preferred_skills: nice-to-have skills
            - experience_requirements: years/seniority requirements
            - education_requirements: degree/certification requirements
            - key_responsibilities: main duties mentioned
            - keywords: other important terms for ATS matching
            - experience_years: numeric years required (null if not stated)
            - seniority_level: junior/mid/senior/lead/principal

            STEP 2 — GAP ANALYSIS
            For each required and preferred skill, determine:
            - Is it PRESENT in the resume? (exact or semantic match)
            - Is it MISSING from the resume?
            - If missing, is it INJECTABLE? (i.e., the candidate's experience supports it but it's not explicitly mentioned)

            STEP 3 — ACTIONABLE SUGGESTIONS
            Generate exactly 3-5 suggestions. Each suggestion must have:
            - section: which resume section to improve
            - current: the exact current text (copy from resume)
            - suggested: a concrete improved version that incorporates JD language
            - reason: WHY this change helps (reference specific JD requirements)

            Rules for suggestions:
            - Only suggest changes where the candidate's experience SUPPORTS the improvement
            - Do NOT fabricate skills, metrics, or experience
            - Use the job description's exact terminology where possible
            - Prioritize high-impact changes (required skills > preferred skills > general improvements)

            STEP 4 — SCORING
            - overallScore (0-100): Weight 40%% keyword match + 60%% semantic relevance
            - atsScore (0-100): How well the resume format works for ATS parsing
            - summary: One-sentence assessment (max 50 chars)

            A local keyword analysis has already been performed:
            - CONFIRMED present: %s
            - CONFIRMED missing: %s
            - Local keyword match rate: %s%%

            Use these confirmed results as ground truth for keyword matching.

            Return ONLY valid JSON with these exact fields:
            {
              "overallScore": 75,
              "keywordMatches": ["skill1", "skill2"],
              "missingKeywords": ["skill3"],
              "suggestions": [
                {"section": "workExperience[0].description[1]", "current": "exact text", "suggested": "improved text", "reason": "why"}
              ],
              "atsScore": 80,
              "summary": "brief assessment",
              "jdKeywords": {
                "company": "Acme Corp",
                "role": "Senior Engineer",
                "requiredSkills": ["Python", "AWS"],
                "preferredSkills": ["Kubernetes"],
                "experienceRequirements": ["5+ years"],
                "educationRequirements": ["Bachelor's in CS"],
                "keyResponsibilities": ["Lead team"],
                "keywords": ["microservices", "agile"],
                "experienceYears": 5,
                "seniorityLevel": "senior"
              }
            }

            CRITICAL: Return ONLY the JSON object. No markdown, no code fences, no extra text.
            """.formatted(matchedStr, missingStr, String.format("%.0f", localMatchPercent));

        String userPrompt = "简历内容:\n" + cleanResult.cleanedText() + "\n\n---\n\n职位描述:\n" + jobDescription;

        String response = client.completeJson(PromptType.JD_MATCH, systemPrompt, userPrompt);
        JdMatchResult aiResult = jsonParser.parse(response, JdMatchResult.class);

        // Step 4: Merge results — use local keywords as ground truth, AI for scores/suggestions
        List<String> finalKeywordMatches = localMatched;
        List<String> finalMissingKeywords = mergeMissingKeywords(localMissing, aiResult.missingKeywords());

        // Hybrid score: 40% local keyword match + 60% AI overall score
        int hybridScore = (int) Math.round(localMatchPercent * 0.4 + aiResult.overallScore() * 0.6);
        hybridScore = Math.max(0, Math.min(100, hybridScore));

        // Step 5: Compute structured skill gap analysis
        JdKeywordsResult jdKw = aiResult.jdKeywords();
        List<String> requiredSkillsMatched = new ArrayList<>();
        List<String> requiredSkillsMissing = new ArrayList<>();
        List<String> preferredSkillsMatched = new ArrayList<>();
        List<String> preferredSkillsMissing = new ArrayList<>();

        if (jdKw != null) {
            if (jdKw.requiredSkills() != null) {
                for (String skill : jdKw.requiredSkills()) {
                    if (skill == null || skill.isBlank()) continue;
                    if (keywordMatcher.keywordInText(skill, resumeText)) {
                        requiredSkillsMatched.add(skill);
                    } else {
                        requiredSkillsMissing.add(skill);
                    }
                }
            }
            if (jdKw.preferredSkills() != null) {
                for (String skill : jdKw.preferredSkills()) {
                    if (skill == null || skill.isBlank()) continue;
                    if (keywordMatcher.keywordInText(skill, resumeText)) {
                        preferredSkillsMatched.add(skill);
                    } else {
                        preferredSkillsMissing.add(skill);
                    }
                }
            }
        }

        // keywordMatchPercentage: ratio of matched required skills
        int totalRequired = requiredSkillsMatched.size() + requiredSkillsMissing.size();
        int keywordMatchPercentage = totalRequired > 0
                ? (int) Math.round(100.0 * requiredSkillsMatched.size() / totalRequired)
                : (int) Math.round(localMatchPercent);

        // potentialMatchPercentage: required matched + preferred matched out of all skills
        int totalAll = totalRequired + preferredSkillsMatched.size() + preferredSkillsMissing.size();
        int totalMatchedAll = requiredSkillsMatched.size() + preferredSkillsMatched.size();
        int potentialMatchPercentage = totalAll > 0
                ? (int) Math.round(100.0 * totalMatchedAll / totalAll)
                : keywordMatchPercentage;

        return new JdMatchResponse(
            hybridScore,
            finalKeywordMatches,
            finalMissingKeywords,
            aiResult.suggestions(),
            aiResult.atsScore(),
            aiResult.summary(),
            null,
            jdKw,
            requiredSkillsMatched,
            requiredSkillsMissing,
            preferredSkillsMatched,
            preferredSkillsMissing,
            keywordMatchPercentage,
            potentialMatchPercentage
        );
    }

    /**
     * Extract keywords from job description text.
     * Splits on common delimiters and filters short/common words.
     */
    private Set<String> extractJdKeywords(String jobDescription) {
        if (jobDescription == null || jobDescription.isBlank()) {
            return Set.of();
        }

        // Common stop words to exclude
        Set<String> stopWords = Set.of(
                "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
                "have", "has", "had", "do", "does", "did", "will", "would", "could",
                "should", "may", "might", "shall", "can", "need", "must",
                "and", "or", "but", "if", "while", "with", "at", "by", "for",
                "from", "to", "in", "on", "of", "as", "that", "this", "these",
                "those", "it", "its", "we", "our", "you", "your", "they", "their",
                "he", "she", "him", "her", "not", "no", "all", "any", "each",
                "every", "both", "few", "more", "most", "other", "some", "such",
                "than", "too", "very", "just", "also", "only", "own", "same",
                "so", "then", "there", "here", "when", "where", "why", "how",
                "what", "which", "who", "whom", "about", "above", "after",
                "before", "between", "into", "through", "during", "over", "under",
                "的", "了", "和", "是", "在", "有", "不", "与", "及", "等", "能",
                "或", "对", "中", "为", "以", "将", "使", "用", "年", "月",
                "日", "上", "下", "要", "能够", "通过", "进行", "具有", "相关"
        );

        // Extract meaningful terms (2+ chars for English, 2+ chars for Chinese)
        Set<String> keywords = new HashSet<>();

        // Split on whitespace, punctuation, and common delimiters
        String[] tokens = jobDescription.toLowerCase()
                .replaceAll("[,;，；、。！？：\n\r\t()（）\\[\\]{}\"']", " ")
                .split("\\s+");

        for (String token : tokens) {
            String trimmed = token.strip();
            if (trimmed.length() >= 2 && !stopWords.contains(trimmed)) {
                keywords.add(trimmed);
            }
        }

        // Also extract multi-word tech terms (e.g., "machine learning", "spring boot")
        String normalized = jobDescription.toLowerCase()
                .replaceAll("[,;，；、。！？：\n\r\t()（）\\[\\]{}\"']", " ")
                .replaceAll("\\s+", " ");

        // Common multi-word patterns in tech JDs
        String[] bigramPatterns = {
                "machine learning", "deep learning", "natural language", "data science",
                "spring boot", "spring cloud", "spring security",
                "react native", "vue.js", "node.js", "next.js",
                "ci/cd", "ci cd", "unit test", "unit testing",
                "project management", "product management",
                "full stack", "front end", "back end",
                "micro service", "microservice", "rest api", "restful api",
                "sql server", "no sql", "nosql",
                "cloud computing", "distributed system",
                "agile development", "software development",
                "version control", "code review"
        };

        for (String bigram : bigramPatterns) {
            if (normalized.contains(bigram)) {
                keywords.add(bigram);
            }
        }

        return keywords;
    }

    /**
     * Merge local missing keywords with AI-identified semantic gaps.
     * Local keywords take priority; AI can add additional semantic gaps.
     */
    private List<String> mergeMissingKeywords(List<String> localMissing, List<String> aiMissing) {
        Set<String> merged = new HashSet<>(localMissing);
        if (aiMissing != null) {
            for (String aiKw : aiMissing) {
                // Only add AI-identified keywords that are genuinely new
                if (aiKw != null && !aiKw.isBlank()) {
                    merged.add(aiKw.toLowerCase().strip());
                }
            }
        }
        return new ArrayList<>(merged);
    }

    private record JdMatchResult(
        int overallScore,
        List<String> keywordMatches,
        List<String> missingKeywords,
        List<Map<String, String>> suggestions,
        int atsScore,
        String summary,
        JdKeywordsResult jdKeywords
    ) {
    }
}
