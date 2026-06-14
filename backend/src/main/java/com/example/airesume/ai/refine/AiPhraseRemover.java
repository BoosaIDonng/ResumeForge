package com.example.airesume.ai.refine;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Removes AI-sounding phrases from resume text and replaces them with simpler alternatives.
 * Based on Resume-Matcher's refinement.py AI_PHRASE_BLACKLIST.
 * Pure local logic — no LLM calls needed.
 *
 * Phrases that appear in the job description are protected from removal.
 */
@Component
public class AiPhraseRemover {

    private static final Map<String, String> REPLACEMENTS = new HashMap<>();
    private static final Set<String> BLACKLIST = new HashSet<>();

    static {
        // Action verbs (overused in AI resume writing)
        add("spearheaded", "led");
        add("orchestrated", "coordinated");
        add("championed", "advocated for");
        add("synergized", "collaborated");
        add("leveraged", "used");
        add("revolutionized", "transformed");
        add("pioneered", "introduced");
        add("catalyzed", "initiated");
        add("operationalized", "implemented");
        add("architected", "designed");
        add("envisioned", "planned");
        add("effectuated", "completed");
        add("endeavored", "worked");
        add("facilitated", "helped");
        add("utilized", "used");

        // Corporate buzzwords
        add("synergy", "collaboration");
        add("synergies", "collaborations");
        add("paradigm", "approach");
        add("paradigm shift", "change");
        add("best-in-class", "top-performing");
        add("world-class", "high-quality");
        add("cutting-edge", "modern");
        add("bleeding-edge", "modern");
        add("game-changer", "innovation");
        add("game-changing", "innovative");
        add("disruptive", "innovative");
        add("holistic", "comprehensive");
        add("robust", "strong");
        add("scalable", "expandable");
        add("actionable", "practical");
        add("impactful", "effective");
        add("proactive", "active");
        add("proactively", "actively");
        add("stakeholder", "team member");
        add("deliverables", "outputs");
        add("bandwidth", "capacity");
        add("circle back", "follow up");
        add("deep dive", "analysis");
        add("move the needle", "make progress");
        add("low-hanging fruit", "quick wins");
        add("touch base", "connect");
        add("value-add", "benefit");

        // Filler phrases
        add("in order to", "to");
        add("for the purpose of", "to");
        add("with a view to", "to");
        add("at the end of the day", "");
        add("moving forward", "");
        add("going forward", "");
        add("on a daily basis", "daily");
        add("on a regular basis", "regularly");
        add("in a timely manner", "promptly");
        add("at this point in time", "now");
        add("due to the fact that", "because");
        add("in the event that", "if");
        add("in light of the fact that", "since");

        // Punctuation patterns
        add("—", ", ");  // Em-dash
        add("---", ", ");
        add("--", ", ");
    }

    private static void add(String phrase, String replacement) {
        BLACKLIST.add(phrase.toLowerCase());
        REPLACEMENTS.put(phrase.toLowerCase(), replacement);
    }

    /**
     * Remove AI phrases from resume data recursively.
     * Phrases found in jobDescription are protected from removal.
     *
     * @param resumeJson the resume data as a string (will be modified in place)
     * @param jobDescription optional JD text to protect matching phrases
     * @return the cleaned text and a list of removed phrases
     */
    public CleanResult clean(String resumeJson, String jobDescription) {
        Set<String> jdProtected = new HashSet<>();
        if (jobDescription != null && !jobDescription.isBlank()) {
            String jdLower = jobDescription.toLowerCase();
            for (String phrase : BLACKLIST) {
                if (jdLower.contains(phrase)) {
                    jdProtected.add(phrase);
                }
            }
        }

        Set<String> removed = new HashSet<>();
        String cleaned = cleanText(resumeJson, jdProtected, removed);

        return new CleanResult(cleaned, removed.stream().toList());
    }

    /**
     * Clean a single text string, replacing AI phrases.
     */
    private String cleanText(String text, Set<String> jdProtected, Set<String> removed) {
        String result = text;
        for (String phrase : BLACKLIST) {
            if (jdProtected.contains(phrase)) {
                continue;
            }
            if (result.toLowerCase().contains(phrase)) {
                removed.add(phrase);
                String replacement = REPLACEMENTS.getOrDefault(phrase, "");
                // Case-insensitive replacement
                Pattern pattern = Pattern.compile(Pattern.quote(phrase), Pattern.CASE_INSENSITIVE);
                result = pattern.matcher(result).replaceAll(Pattern.quote(replacement));
            }
        }
        return result;
    }

    public record CleanResult(String cleanedText, java.util.List<String> removedPhrases) {}
}
