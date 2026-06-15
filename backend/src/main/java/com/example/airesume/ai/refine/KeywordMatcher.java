package com.example.airesume.ai.refine;

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

}
