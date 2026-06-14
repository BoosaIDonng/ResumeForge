package com.example.airesume.ai.refine;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Keyword matching algorithm based on Resume-Matcher's refiner.py.
 * Uses word-boundary matching to avoid false positives like "python" matching "pythonic".
 * Pure local logic — no LLM calls needed.
 */
@Component
public class KeywordMatcher {

    /**
     * Check if a keyword exists as a whole term in the text.
     * Uses word-boundary lookbehind/lookahead (?<!\w)...(?!\w).
     */
    public boolean keywordInText(String keyword, String text) {
        if (keyword == null || keyword.isBlank() || text == null) {
            return false;
        }
        String escaped = Pattern.quote(keyword.strip().toLowerCase());
        String pattern = "(?<!\\w)" + escaped + "(?!\\w)";
        return Pattern.compile(pattern, Pattern.CASE_INSENSITIVE)
                .matcher(text)
                .find();
    }

    /**
     * Calculate the percentage of JD keywords found in the resume.
     *
     * @param resumeText all extracted text from the resume
     * @param jdKeywords set of keywords from the job description
     * @return match percentage (0.0 - 100.0)
     */
    public double calculateMatchPercentage(String resumeText, Set<String> jdKeywords) {
        if (jdKeywords == null || jdKeywords.isEmpty()) {
            return 0.0;
        }
        String resumeLower = resumeText.toLowerCase();
        long matched = jdKeywords.stream()
                .filter(kw -> keywordInText(kw, resumeLower))
                .count();
        return (double) matched / jdKeywords.size() * 100.0;
    }

    /**
     * Analyze keyword gaps: which JD keywords are missing from the resume,
     * and which of those are present in the master resume (injectable).
     *
     * @param jdKeywords all keywords from JD
     * @param tailoredText text of the tailored/current resume
     * @param masterText text of the master resume
     * @return gap analysis result
     */
    public KeywordGapAnalysis analyzeGaps(Set<String> jdKeywords, String tailoredText, String masterText) {
        List<String> missing = new ArrayList<>();
        List<String> injectable = new ArrayList<>();
        List<String> nonInjectable = new ArrayList<>();

        for (String keyword : jdKeywords) {
            if (!keywordInText(keyword, tailoredText)) {
                missing.add(keyword);
                if (keywordInText(keyword, masterText)) {
                    injectable.add(keyword);
                } else {
                    nonInjectable.add(keyword);
                }
            }
        }

        int total = jdKeywords.size();
        double currentMatch = total > 0 ? (double) (total - missing.size()) / total * 100.0 : 0.0;
        double potentialMatch = total > 0 ? (double) (total - nonInjectable.size()) / total * 100.0 : 0.0;

        return new KeywordGapAnalysis(missing, injectable, nonInjectable, currentMatch, potentialMatch);
    }

    /**
     * Extract all text from resume data for keyword matching.
     * Handles summary, work experience, education, projects, skills, etc.
     */
    public String extractAllText(String resumeDataJson) {
        // Simple text extraction from JSON — find all string values
        // This is a simplified version; the Python version uses recursive extraction
        StringBuilder sb = new StringBuilder();
        String[] fields = {"summary", "content", "description", "name", "title",
                "company", "school", "institution", "degree", "area", "role",
                "headline", "location", "level"};
        String json = resumeDataJson.toLowerCase();

        // Extract quoted string values
        int i = 0;
        while (i < json.length()) {
            int start = json.indexOf('"', i);
            if (start == -1) break;
            int end = json.indexOf('"', start + 1);
            if (end == -1) break;
            String value = json.substring(start + 1, end);
            // Skip JSON keys (they're followed by :)
            int nextNonSpace = end + 1;
            while (nextNonSpace < json.length() && json.charAt(nextNonSpace) == ' ') nextNonSpace++;
            if (nextNonSpace < json.length() && json.charAt(nextNonSpace) == ':') {
                // This is a key, not a value
                i = end + 1;
                continue;
            }
            sb.append(value).append(" ");
            i = end + 1;
        }

        return sb.toString();
    }

    public record KeywordGapAnalysis(
            List<String> missingKeywords,
            List<String> injectableKeywords,
            List<String> nonInjectableKeywords,
            double currentMatchPercentage,
            double potentialMatchPercentage
    ) {}
}
