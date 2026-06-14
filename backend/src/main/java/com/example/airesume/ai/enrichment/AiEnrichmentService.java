package com.example.airesume.ai.enrichment;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiClientFactory;
import com.example.airesume.ai.PromptType;
import com.example.airesume.common.ApiException;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * AI-powered resume enrichment service.
 * Based on Resume-Matcher's enrichment module.
 *
 * Flow: Analyze weak descriptions → Generate clarifying questions → User answers → Generate new bullets
 */
@Service
public class AiEnrichmentService {
    private static final Logger log = LoggerFactory.getLogger(AiEnrichmentService.class);
    private final AiClientFactory clientFactory;
    private final ResumeService resumeService;
    private final ObjectMapper objectMapper;

    public AiEnrichmentService(AiClientFactory clientFactory, ResumeService resumeService, ObjectMapper objectMapper) {
        this.clientFactory = clientFactory;
        this.resumeService = resumeService;
        this.objectMapper = objectMapper;
    }

    /**
     * Analyze a resume to find weak descriptions and generate clarifying questions.
     */
    public EnrichmentAnalysis analyze(Long resumeId, String provider, String apiKey, String baseUrl, String model) {
        ResumeEntity resume = resumeService.get(resumeId);
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        String systemPrompt = """
            You are a professional resume analyst. Analyze this resume to identify items in Experience and Projects sections that have weak, vague, or incomplete descriptions.

            IMPORTANT: Generate ALL output text (questions, placeholders, summaries, weakness reasons) in the same language as the resume. Chinese resume = Chinese output.

            WEAK DESCRIPTION INDICATORS:
            1. Generic phrases: "负责...", "参与了...", "协助...", "responsible for", "worked on", "helped with"
            2. Missing metrics/impact: No numbers, percentages, dollar amounts, or measurable outcomes
            3. Unclear scope: Vague about team size, project scale, user count, or responsibilities
            4. No technologies/tools: Missing specific tech stack, tools, or methodologies used
            5. Passive voice without ownership: Not clear what the candidate personally accomplished
            6. Too brief: Single short bullet that doesn't explain the work

            GOOD DESCRIPTION EXAMPLES:
            - "Led migration of 15 microservices to Kubernetes, reducing deployment time by 60%%"
            - "Built real-time analytics dashboard using React and D3.js, serving 10K daily users"
            - "Architected payment processing system handling $2M monthly transactions"

            TASK:
            1. Review each Experience and Project item's description bullets
            2. Identify items that would benefit from more detail
            3. Generate a MAXIMUM of 6 questions total across ALL items (not per item)
            4. Prioritize the most impactful questions that will yield the best improvements
            5. If multiple items need enhancement, distribute questions wisely (e.g., 2-3 per item)
            6. Questions should help extract: metrics, technologies, scope, impact, and specific contributions

            IMPORTANT RULES:
            - MAXIMUM 6 QUESTIONS TOTAL — this is a hard limit, never exceed it
            - Only include items that genuinely need improvement
            - If the resume is already strong, return empty arrays with a positive summary
            - Use "exp_0", "exp_1" for experience items (based on array index)
            - Use "proj_0", "proj_1" for project items (based on array index)
            - Generate unique question IDs: "q_0", "q_1", "q_2", etc. (max q_5)
            - Questions should be specific to the role/project context
            - Keep questions conversational but professional
            - Placeholder text should give concrete examples
            - Prioritize quality over quantity — ask the most impactful questions first

            Resume Data:
            %s

            Return ONLY valid JSON with these exact fields:
            {
              "items_to_enrich": [
                {
                  "item_id": "exp_0",
                  "item_type": "experience",
                  "title": "Job Title",
                  "subtitle": "Company Name",
                  "current_description": ["bullet 1", "bullet 2"],
                  "weakness_reason": "Missing quantifiable impact"
                }
              ],
              "questions": [
                {
                  "question_id": "q_0",
                  "item_id": "exp_0",
                  "question": "What specific metrics improved?",
                  "placeholder": "e.g., Reduced API response time by 40%%"
                }
              ],
              "analysis_summary": "Brief summary"
            }

            CRITICAL: Return ONLY valid JSON. No markdown, no code fences.
            """.formatted(resume.getResumeData());

        try {
            String raw = client.completeJson(PromptType.RESUME_GENERATE,
                "You are a professional resume analyst. Return ONLY valid JSON with no markdown, no code fences.", systemPrompt);
            return parseAnalysis(raw);
        } catch (Exception e) {
            log.error("Enrichment analysis failed for resume {}", resumeId, e);
            throw new ApiException("ENRICHMENT_FAILED", "简历分析失败: " + e.getMessage());
        }
    }

    /**
     * Generate enhanced bullets from user answers.
     */
    public EnrichmentResult enhance(Long resumeId, List<EnrichmentRequest.AnswerItem> answers,
                                     String provider, String apiKey, String baseUrl, String model) {
        ResumeEntity resume = resumeService.get(resumeId);
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        // Group answers by item_id
        Map<String, List<EnrichmentRequest.AnswerItem>> answersByItem = answers.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                a -> a.itemId() != null ? a.itemId() : "unknown"));

        List<EnrichmentResult.EnhancedItem> enhancements = new ArrayList<>();

        for (var entry : answersByItem.entrySet()) {
            String itemId = entry.getKey();
            List<EnrichmentRequest.AnswerItem> itemAnswers = entry.getValue();

            // Extract item info from resume data
            Map<String, Object> itemInfo = extractItemFromResume(resume.getResumeData(), itemId);
            if (itemInfo.isEmpty()) continue;

            // Build Q&A text
            StringBuilder qaText = new StringBuilder();
            for (var answer : itemAnswers) {
                if (answer.question() != null && !answer.question().isBlank()) {
                    qaText.append("问：").append(answer.question()).append("\n");
                }
                qaText.append("答：").append(answer.answer()).append("\n\n");
            }

            String currentDesc = formatDescription(itemInfo.get("description"));
            String itemType = (String) itemInfo.getOrDefault("item_type", "experience");
            String title = (String) itemInfo.getOrDefault("title", "");
            String subtitle = (String) itemInfo.getOrDefault("subtitle", "");

            String prompt = """
                You are a professional resume writer. Your goal is to ADD new bullet points to this resume item using the additional context provided by the candidate. DO NOT rewrite or replace existing bullets — only add new ones.

                IMPORTANT: Generate ALL output text in the same language as the resume.

                ORIGINAL ITEM:
                Type: %s
                Title: %s
                Subtitle: %s
                Current Description (KEEP ALL OF THESE):
                %s

                CANDIDATE'S ADDITIONAL CONTEXT:
                %s

                TASK:
                Generate NEW bullet points to ADD to the existing description. The original bullets will be kept as-is.
                New bullets should be:
                1. Action-oriented: Start with strong verbs (Led, Built, Implemented, Optimized)
                2. Quantified: Include metrics, numbers, percentages where the candidate provided them
                3. Technically specific: Mention technologies, tools, and methodologies
                4. Impact-focused: Clearly state the business or technical outcome
                5. Ownership-clear: Show what the candidate personally did vs. the team

                RULES:
                - Generate 2-4 NEW bullet points to ADD (not replace)
                - DO NOT repeat or rephrase existing bullets — only add new information
                - Preserve factual accuracy — only use information provided by the candidate
                - Don't invent metrics or details not given by the candidate
                - If candidate's answers are brief, still add what you can
                - Keep bullets concise (1-2 lines each)
                - Use past tense for past roles, present tense for current roles
                - Avoid buzzwords and fluff — be specific and concrete

                Return ONLY valid JSON: {"additional_bullets": ["bullet 1", "bullet 2"]}
                CRITICAL: No markdown, no code fences.
                """.formatted(itemType, title, subtitle, currentDesc, qaText.toString().trim());

            try {
                String raw = client.completeText(PromptType.RESUME_GENERATE,
                    "You are a professional resume writer. Return ONLY valid JSON with no markdown, no code fences.", prompt);
                Map<String, Object> result = objectMapper.readValue(raw, new TypeReference<>() {});
                @SuppressWarnings("unchecked")
                List<String> bullets = (List<String>) result.getOrDefault("additional_bullets", List.of());

                enhancements.add(new EnrichmentResult.EnhancedItem(
                    itemId, itemType, title, subtitle,
                    getList(itemInfo, "description"),
                    bullets
                ));
            } catch (Exception e) {
                log.warn("Failed to enhance item {}: {}", itemId, e.getMessage());
            }
        }

        return new EnrichmentResult(enhancements);
    }

    /**
     * Apply enhancements to the resume — append new bullets to existing descriptions.
     */
    public void apply(Long resumeId, List<EnrichmentResult.EnhancedItem> enhancements) {
        ResumeEntity resume = resumeService.get(resumeId);
        String resumeData = resume.getResumeData();

        try {
            JsonNode root = objectMapper.readTree(resumeData);

            for (var item : enhancements) {
                String itemId = item.itemId();
                String itemType = item.itemType();
                List<String> newBullets = item.enhancedDescription();

                if ("experience".equals(itemType)) {
                    appendToSection(root, "experience", "items", itemId, newBullets);
                } else if ("project".equals(itemType)) {
                    appendToSection(root, "projects", "items", itemId, newBullets);
                }
            }

            String updated = objectMapper.writeValueAsString(root);
            resumeService.update(resume.getId(), resume.getTitle(), updated);
        } catch (Exception e) {
            log.error("Failed to apply enhancements to resume {}", resumeId, e);
            throw new ApiException("APPLY_FAILED", "应用增强失败: " + e.getMessage());
        }
    }

    private void appendToSection(JsonNode root, String sectionKey, String itemsKey,
                                  String itemId, List<String> newBullets) {
        JsonNode section = root.path("sections").path(sectionKey);
        if (section.isMissingNode()) return;
        JsonNode items = section.path(itemsKey);
        if (!items.isArray()) return;

        // Parse index from item_id like "exp_0"
        try {
            String[] parts = itemId.split("_");
            int index = Integer.parseInt(parts[1]);
            if (index >= 0 && index < items.size()) {
                JsonNode item = items.get(index);
                if (item.has("description") && item.get("description").isArray()) {
                    // We need to add new bullets — this requires creating a new array
                    // Since JsonNode is immutable, we'll use a different approach
                    // Actually, we need to work with the parent
                    var parentArray = (com.fasterxml.jackson.databind.node.ArrayNode) item.get("description");
                    for (String bullet : newBullets) {
                        parentArray.add(bullet);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to append to item {}: {}", itemId, e.getMessage());
        }
    }

    /**
     * Regenerate a single item's description based on user feedback.
     * Inspired by Resume-Matcher's REGENERATE_ITEM_PROMPT.
     */
    public EnrichmentResult regenerateItem(Long resumeId, String itemType, String itemId,
                                            String userInstruction, String provider, String apiKey,
                                            String baseUrl, String model) {
        ResumeEntity resume = resumeService.get(resumeId);
        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        // Extract the current item from resume data
        String currentDescription = extractItemDescription(resume.getResumeData(), itemType, itemId);

        String prompt = """
            You are a professional resume writer. REWRITE the description of this resume item based on the user's feedback.

            IMPORTANT: Generate ALL output text in the same language as the resume.

            ITEM INFORMATION:
            Type: %s
            ID: %s

            CURRENT DESCRIPTION (the user is NOT satisfied with this):
            %s

            USER'S FEEDBACK/INSTRUCTION:
            %s

            TASK:
            Based on the user's feedback, completely REWRITE the description bullets. The new description should:
            1. Address the user's specific concerns/requests
            2. Be action-oriented with strong verbs
            3. Highlight quantifiable impact ONLY when it already exists (never invent numbers)
            4. Be technically specific with tools/technologies
            5. Show clear impact and ownership

            RULES:
            - Generate 2-5 NEW bullets (replacements, not additions)
            - Directly address the user's instruction
            - Do NOT add any new facts, metrics, dates, companies, titles not in the original or user feedback
            - If user asks for metrics but none exist, rewrite qualitatively instead
            - Keep bullets concise (1-2 lines each)
            - Use past tense for past roles, present tense for current

            Return ONLY valid JSON: {"new_bullets": ["bullet 1", "bullet 2"], "change_summary": "what changed"}
            CRITICAL: No markdown, no code fences.
            """.formatted(itemType, itemId, currentDescription, userInstruction);

        try {
            String raw = client.completeText(PromptType.RESUME_GENERATE,
                "You are a professional resume writer. Return ONLY valid JSON with no markdown, no code fences.", prompt);
            Map<String, Object> result = objectMapper.readValue(raw, new TypeReference<>() {});
            @SuppressWarnings("unchecked")
            List<String> newBullets = (List<String>) result.getOrDefault("new_bullets", List.of());

            // Extract item info for the result
            Map<String, Object> itemInfo = extractItemFromResume(resume.getResumeData(), itemId);
            String title = (String) itemInfo.getOrDefault("title", "");
            String subtitle = (String) itemInfo.getOrDefault("subtitle", "");
            String resolvedItemType = (String) itemInfo.getOrDefault("item_type", itemType);

            List<EnrichmentResult.EnhancedItem> enhancements = List.of(
                new EnrichmentResult.EnhancedItem(
                    itemId, resolvedItemType, title, subtitle,
                    getList(itemInfo, "description"),
                    newBullets
                )
            );
            return new EnrichmentResult(enhancements);
        } catch (Exception e) {
            log.error("Failed to regenerate item {} for resume {}", itemId, resumeId, e);
            throw new ApiException("REGENERATE_FAILED", "重新生成失败: " + e.getMessage());
        }
    }

    /**
     * Extract the current description of a specific item from resume JSON data.
     */
    private String extractItemDescription(String resumeJson, String itemType, String itemId) {
        try {
            JsonNode root = objectMapper.readTree(resumeJson);
            String[] parts = itemId.split("_");
            String prefix = parts[0];
            int index = Integer.parseInt(parts[1]);

            JsonNode items;
            if ("exp".equals(prefix)) {
                items = root.path("sections").path("experience").path("items");
            } else if ("proj".equals(prefix)) {
                items = root.path("sections").path("projects").path("items");
            } else {
                return "(no description found)";
            }

            if (items.isArray() && index >= 0 && index < items.size()) {
                JsonNode item = items.get(index);
                JsonNode desc = item.path("description");
                if (desc.isArray()) {
                    List<String> bullets = new ArrayList<>();
                    for (JsonNode node : desc) {
                        bullets.add("- " + node.asText());
                    }
                    return String.join("\n", bullets);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to extract description for item {}: {}", itemId, e.getMessage());
        }
        return "(no description found)";
    }

    private EnrichmentAnalysis parseAnalysis(String raw) {
        try {
            String cleaned = stripMarkdownCodeFences(raw);
            Map<String, Object> map = objectMapper.readValue(cleaned, new TypeReference<>() {});

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsRaw = (List<Map<String, Object>>) map.getOrDefault("items_to_enrich", List.of());
            List<EnrichmentAnalysis.Item> items = itemsRaw.stream()
                .map(m -> new EnrichmentAnalysis.Item(
                    (String) m.getOrDefault("item_id", ""),
                    (String) m.getOrDefault("item_type", "experience"),
                    (String) m.getOrDefault("title", ""),
                    (String) m.get("subtitle"),
                    getList(m, "current_description"),
                    (String) m.getOrDefault("weakness_reason", "")
                ))
                .toList();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> questionsRaw = (List<Map<String, Object>>) map.getOrDefault("questions", List.of());
            List<EnrichmentAnalysis.Question> questions = questionsRaw.stream()
                .map(q -> new EnrichmentAnalysis.Question(
                    (String) q.getOrDefault("question_id", ""),
                    (String) q.getOrDefault("item_id", ""),
                    (String) q.getOrDefault("question", ""),
                    (String) q.getOrDefault("placeholder", "")
                ))
                .toList();

            return new EnrichmentAnalysis(items, questions, (String) map.get("analysis_summary"));
        } catch (Exception e) {
            log.warn("Failed to parse enrichment analysis: {} - raw={}", e.getMessage(),
                raw.length() > 500 ? raw.substring(0, 500) : raw);
            return new EnrichmentAnalysis(List.of(), List.of(), "分析结果解析失败");
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> getList(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    /**
     * Strip markdown code fences (```json ... ```) from AI response.
     */
    private String stripMarkdownCodeFences(String raw) {
        String s = raw.strip();
        if (s.startsWith("```")) {
            int firstNewline = s.indexOf('\n');
            if (firstNewline > 0) {
                s = s.substring(firstNewline + 1);
            }
        }
        if (s.endsWith("```")) {
            s = s.substring(0, s.length() - 3);
        }
        return s.strip();
    }

    @SuppressWarnings("unchecked")
    private List<String> getListFromJson(Map<String, Object> itemInfo, String key) {
        Object val = itemInfo.get(key);
        if (val instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    private Map<String, Object> extractItemFromResume(String resumeData, String itemId) {
        try {
            JsonNode root = objectMapper.readTree(resumeData);
            String[] parts = itemId.split("_");
            String prefix = parts[0];
            int index = Integer.parseInt(parts[1]);

            if ("exp".equals(prefix)) {
                JsonNode items = root.path("sections").path("experience").path("items");
                if (items.isArray() && index < items.size()) {
                    JsonNode item = items.get(index);
                    return Map.of(
                        "item_id", itemId,
                        "item_type", "experience",
                        "title", item.path("position").asText(""),
                        "subtitle", item.path("company").asText(""),
                        "description", objectMapper.convertValue(item.path("description"), new TypeReference<List<String>>() {})
                    );
                }
            } else if ("proj".equals(prefix)) {
                JsonNode items = root.path("sections").path("projects").path("items");
                if (items.isArray() && index < items.size()) {
                    JsonNode item = items.get(index);
                    return Map.of(
                        "item_id", itemId,
                        "item_type", "project",
                        "title", item.path("name").asText(""),
                        "subtitle", item.path("role").asText(""),
                        "description", objectMapper.convertValue(item.path("description"), new TypeReference<List<String>>() {})
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to extract item {} from resume: {}", itemId, e.getMessage());
        }
        return Map.of();
    }

    private String formatDescription(Object desc) {
        if (desc instanceof List<?> list) {
            return String.join("\n", list.stream().map(d -> "- " + d).toList());
        }
        return desc != null ? desc.toString() : "(无描述)";
    }

    // Result records
    public record EnrichmentAnalysis(
        List<Item> itemsToEnrich,
        List<Question> questions,
        String analysisSummary
    ) {
        public record Item(String itemId, String itemType, String title, String subtitle,
                          List<String> currentDescription, String weaknessReason) {}
        public record Question(String questionId, String itemId, String question, String placeholder) {}
    }

    public record EnrichmentResult(List<EnhancedItem> enhancements) {
        public record EnhancedItem(String itemId, String itemType, String title, String subtitle,
                                   List<String> originalDescription, List<String> enhancedDescription) {}
    }
}
