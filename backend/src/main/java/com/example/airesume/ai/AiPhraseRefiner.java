package com.example.airesume.ai;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class AiPhraseRefiner {

    private static final Map<Pattern, String> REPLACEMENTS = new LinkedHashMap<>();

    static {
        // Overused action verbs
        replace("spearheaded", "led");
        replace("leveraged", "used");
        replace("orchestrated", "coordinated");
        replace("synergized", "collaborated");
        replace("revolutionized", "improved");
        replace("pioneered", "introduced");
        replace("streamlined", "simplified");
        replace("cultivated", "built");
        replace("championed", "promoted");
        replace("galvanized", "motivated");
        replace("catapulted", "increased");
        replace("supercharged", "boosted");
        replace("turbo-charged", "accelerated");
        replace("spearhead", "lead");
        replace("leverage", "use");

        // Corporate buzzwords
        replace("synergy", "collaboration");
        replace("paradigm shift", "major change");
        replace("thought leader", "expert");
        replace("best-in-class", "high-quality");
        replace("cutting-edge", "modern");
        replace("bleeding-edge", "latest");
        replace("game-changer", "significant improvement");
        replace("disruptive", "innovative");
        replace("holistic approach", "comprehensive approach");
        replace("value-add", "benefit");
        replace("deep dive", "detailed analysis");
        replace("low-hanging fruit", "easy win");
        replace("move the needle", "make progress");
        replace("circle back", "follow up");
        replace("ecosystem", "environment");
        replace("robust(?!\\w)", "strong");
        replace("seamless(?!\\w)", "smooth");
        replace("scalable(?!\\w)", "flexible");
        replace("impactful(?!\\w)", "effective");
        replace("actionable(?!\\w)", "practical");
        replace("innovative(?!\\w)", "creative");
        replace("synergistic", "cooperative");
        replace("transformative(?!\\w)", "significant");
        replace("unprecedented(?!\\w)", "remarkable");
        replace("unparalleled(?!\\w)", "exceptional");
        replace("world-class", "top-level");

        // Filler phrases (replace with empty or shorter)
        replace("in order to", "to");
        replace("due to the fact that", "because");
        replace("in the process of", "");
        replace("it is worth noting that", "");
        replace("it should be noted that", "");
        replace("needless to say", "");
        replace("at the end of the day", "ultimately");
        replace("in today's fast-paced", "in the current");
        replace("going forward", "next");
        replace("on a daily basis", "daily");
        replace("in a timely manner", "promptly");
        replace("with a view to", "to");
        replace("a wide range of", "various");

        // Em-dash patterns (common AI tell)
        replace("\\s*—\\s*", " - ");
        replace("\\s*–\\s*", " - ");
    }

    private static void replace(String pattern, String replacement) {
        REPLACEMENTS.put(
            Pattern.compile("(?i)\\b" + pattern + (pattern.endsWith("\\w)") || pattern.contains("\\s") ? "" : "\\b")),
            replacement
        );
    }

    /**
     * Refine text by replacing AI-sounding phrases with human alternatives.
     * Returns the refined text.
     */
    public String refine(String text) {
        if (text == null || text.isBlank()) return text;

        String result = text;
        for (Map.Entry<Pattern, String> entry : REPLACEMENTS.entrySet()) {
            result = entry.getKey().matcher(result).replaceAll(entry.getValue());
        }

        // Clean up double spaces
        result = result.replaceAll(" {2,}", " ").trim();
        return result;
    }

}
