package com.example.airesume.ai.verify;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class TruthfulnessVerifier {

    private static final Logger log = LoggerFactory.getLogger(TruthfulnessVerifier.class);

    private static final Pattern METRIC_PATTERN = Pattern.compile("\\d+%|\\d+x|\\$\\d+");

    private final ObjectMapper objectMapper;

    public TruthfulnessVerifier(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    // ----------------------------------------------------------------
    // Public API
    // ----------------------------------------------------------------

    /**
     * Compare a tailored resume JSON against the master resume JSON.
     * Detects fabricated skills, certifications, companies, and skill variants.
     */
    public AlignmentReport verifyAlignment(String tailoredJson, String masterJson) {
        List<AlignmentViolation> violations = new ArrayList<>();

        try {
            Map<String, Object> tailored = parseJson(tailoredJson);
            Map<String, Object> master = parseJson(masterJson);

            checkSkills(tailored, master, violations);
            checkCertifications(tailored, master, violations);
            checkWorkExperienceCompanies(tailored, master, violations);
        } catch (Exception e) {
            log.warn("Alignment verification failed", e);
            violations.add(new AlignmentViolation(
                "root", "parse_error", e.getMessage(), "critical"
            ));
        }

        boolean isAligned = violations.stream()
            .noneMatch(v -> "critical".equals(v.severity()));

        double confidenceScore = computeConfidence(violations);

        return new AlignmentReport(isAligned, violations, confidenceScore);
    }

    /**
     * Detect invented metrics (new percentages, multipliers, dollar amounts)
     * that appear in the modified text but not in the original.
     */
    public List<AlignmentViolation> verifyNoInventedMetrics(String original, String modified) {
        List<AlignmentViolation> violations = new ArrayList<>();

        Set<String> originalMetrics = extractMetrics(original);
        Set<String> modifiedMetrics = extractMetrics(modified);

        for (String metric : modifiedMetrics) {
            if (!originalMetrics.contains(metric)) {
                violations.add(new AlignmentViolation(
                    "content",
                    "invented_metric",
                    metric,
                    "warning"
                ));
            }
        }

        return violations;
    }

    /**
     * Remove fabricated items from the tailored resume JSON based on violations.
     */
    @SuppressWarnings("unchecked")
    public String fixViolations(String tailoredJson, List<AlignmentViolation> violations) {
        try {
            Map<String, Object> tailored = parseJson(tailoredJson);
            Map<String, Object> sections = (Map<String, Object>) tailored.get("sections");
            if (sections == null) {
                return tailoredJson;
            }

            for (AlignmentViolation violation : violations) {
                switch (violation.violationType()) {
                    case "fabricated_skill" -> removeItemFromSection(
                        sections, "skills", violation.value()
                    );
                    case "fabricated_cert" -> removeItemFromSection(
                        sections, "certifications", violation.value()
                    );
                    case "fabricated_company" -> removeWorkEntryByCompany(
                        sections, violation.value()
                    );
                    default -> {
                        // other violation types are not auto-fixed
                    }
                }
            }

            return objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(tailored);
        } catch (JsonProcessingException e) {
            log.warn("Failed to fix violations, returning original JSON", e);
            return tailoredJson;
        }
    }

    /**
     * Extract the list of skill names from a resume JSON string.
     */
    @SuppressWarnings("unchecked")
    public List<String> extractSkills(String resumeJson) {
        try {
            Map<String, Object> root = parseJson(resumeJson);
            Map<String, Object> sections = (Map<String, Object>) root.get("sections");
            if (sections == null) return List.of();

            Map<String, Object> skillsSection = (Map<String, Object>) sections.get("skills");
            if (skillsSection == null) return List.of();

            List<Map<String, Object>> items =
                (List<Map<String, Object>>) skillsSection.get("items");
            if (items == null) return List.of();

            return items.stream()
                .map(item -> (String) item.getOrDefault("name", ""))
                .filter(s -> !s.isBlank())
                .toList();
        } catch (Exception e) {
            log.warn("Failed to extract skills", e);
            return List.of();
        }
    }

    /**
     * Extract the list of company names from a resume JSON string.
     */
    @SuppressWarnings("unchecked")
    public List<String> extractCompanies(String resumeJson) {
        try {
            Map<String, Object> root = parseJson(resumeJson);
            Map<String, Object> sections = (Map<String, Object>) root.get("sections");
            if (sections == null) return List.of();

            Map<String, Object> expSection = (Map<String, Object>) sections.get("experience");
            if (expSection == null) return List.of();

            List<Map<String, Object>> items =
                (List<Map<String, Object>>) expSection.get("items");
            if (items == null) return List.of();

            return items.stream()
                .map(item -> (String) item.getOrDefault("company", ""))
                .filter(s -> !s.isBlank())
                .toList();
        } catch (Exception e) {
            log.warn("Failed to extract companies", e);
            return List.of();
        }
    }

    // ----------------------------------------------------------------
    // Internal helpers
    // ----------------------------------------------------------------

    private Map<String, Object> parseJson(String json) throws JsonProcessingException {
        return objectMapper.readValue(json, new TypeReference<>() {});
    }

    @SuppressWarnings("unchecked")
    private void checkSkills(Map<String, Object> tailored,
                             Map<String, Object> master,
                             List<AlignmentViolation> violations) {
        Map<String, Object> tSections = (Map<String, Object>) tailored.get("sections");
        Map<String, Object> mSections = (Map<String, Object>) master.get("sections");
        if (tSections == null || mSections == null) return;

        Map<String, Object> tSkills = (Map<String, Object>) tSections.get("skills");
        Map<String, Object> mSkills = (Map<String, Object>) mSections.get("skills");
        if (tSkills == null || mSkills == null) return;

        List<Map<String, Object>> tItems =
            (List<Map<String, Object>>) tSkills.get("items");
        List<Map<String, Object>> mItems =
            (List<Map<String, Object>>) mSkills.get("items");
        if (tItems == null || mItems == null) return;

        Set<String> masterSkillNames = mItems.stream()
            .map(item -> normalize((String) item.getOrDefault("name", "")))
            .filter(s -> !s.isBlank())
            .collect(Collectors.toSet());

        for (Map<String, Object> item : tItems) {
            String skillName = (String) item.getOrDefault("name", "");
            if (skillName.isBlank()) continue;

            String normalized = normalize(skillName);
            if (!masterSkillNames.contains(normalized)) {
                // Check if it could be a variant (e.g., "JS" vs "JavaScript")
                boolean isVariant = masterSkillNames.stream()
                    .anyMatch(masterSkill -> isSkillVariant(normalized, masterSkill));

                violations.add(new AlignmentViolation(
                    "sections.skills",
                    isVariant ? "skill_variant" : "fabricated_skill",
                    skillName,
                    isVariant ? "info" : "critical"
                ));
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void checkCertifications(Map<String, Object> tailored,
                                     Map<String, Object> master,
                                     List<AlignmentViolation> violations) {
        Map<String, Object> tSections = (Map<String, Object>) tailored.get("sections");
        Map<String, Object> mSections = (Map<String, Object>) master.get("sections");
        if (tSections == null || mSections == null) return;

        Map<String, Object> tCerts = (Map<String, Object>) tSections.get("certifications");
        Map<String, Object> mCerts = (Map<String, Object>) mSections.get("certifications");
        if (tCerts == null || mCerts == null) return;

        List<Map<String, Object>> tItems =
            (List<Map<String, Object>>) tCerts.get("items");
        List<Map<String, Object>> mItems =
            (List<Map<String, Object>>) mCerts.get("items");
        if (tItems == null || mItems == null) return;

        Set<String> masterCertNames = mItems.stream()
            .map(item -> normalize((String) item.getOrDefault("name", "")))
            .filter(s -> !s.isBlank())
            .collect(Collectors.toSet());

        for (Map<String, Object> item : tItems) {
            String certName = (String) item.getOrDefault("name", "");
            if (certName.isBlank()) continue;

            String normalized = normalize(certName);
            if (!masterCertNames.contains(normalized)) {
                violations.add(new AlignmentViolation(
                    "sections.certifications",
                    "fabricated_cert",
                    certName,
                    "critical"
                ));
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void checkWorkExperienceCompanies(Map<String, Object> tailored,
                                              Map<String, Object> master,
                                              List<AlignmentViolation> violations) {
        Map<String, Object> tSections = (Map<String, Object>) tailored.get("sections");
        Map<String, Object> mSections = (Map<String, Object>) master.get("sections");
        if (tSections == null || mSections == null) return;

        Map<String, Object> tExp = (Map<String, Object>) tSections.get("experience");
        Map<String, Object> mExp = (Map<String, Object>) mSections.get("experience");
        if (tExp == null || mExp == null) return;

        List<Map<String, Object>> tItems =
            (List<Map<String, Object>>) tExp.get("items");
        List<Map<String, Object>> mItems =
            (List<Map<String, Object>>) mExp.get("items");
        if (tItems == null || mItems == null) return;

        Set<String> masterCompanies = mItems.stream()
            .map(item -> normalize((String) item.getOrDefault("company", "")))
            .filter(s -> !s.isBlank())
            .collect(Collectors.toSet());

        for (Map<String, Object> item : tItems) {
            String company = (String) item.getOrDefault("company", "");
            if (company.isBlank()) continue;

            String normalized = normalize(company);
            if (!masterCompanies.contains(normalized)) {
                violations.add(new AlignmentViolation(
                    "sections.experience",
                    "fabricated_company",
                    company,
                    "critical"
                ));
            }
        }
    }

    private Set<String> extractMetrics(String text) {
        Set<String> metrics = new LinkedHashSet<>();
        if (text == null) return metrics;

        Matcher matcher = METRIC_PATTERN.matcher(text);
        while (matcher.find()) {
            metrics.add(matcher.group());
        }
        return metrics;
    }

    /**
     * Remove an item by its "name" field from a section.
     */
    @SuppressWarnings("unchecked")
    private void removeItemFromSection(Map<String, Object> sections,
                                       String sectionKey,
                                       String itemName) {
        Map<String, Object> section = (Map<String, Object>) sections.get(sectionKey);
        if (section == null) return;

        List<Map<String, Object>> items =
            (List<Map<String, Object>>) section.get("items");
        if (items == null) return;

        String normalized = normalize(itemName);
        items.removeIf(item -> {
            String name = (String) item.getOrDefault("name", "");
            return normalize(name).equals(normalized);
        });
    }

    /**
     * Remove work experience entries whose company matches the given name.
     */
    @SuppressWarnings("unchecked")
    private void removeWorkEntryByCompany(Map<String, Object> sections,
                                          String companyName) {
        Map<String, Object> expSection = (Map<String, Object>) sections.get("experience");
        if (expSection == null) return;

        List<Map<String, Object>> items =
            (List<Map<String, Object>>) expSection.get("items");
        if (items == null) return;

        String normalized = normalize(companyName);
        items.removeIf(item -> {
            String company = (String) item.getOrDefault("company", "");
            return normalize(company).equals(normalized);
        });
    }

    /**
     * Simple heuristic to detect common skill name variants.
     * e.g., "JS" / "JavaScript", "TS" / "TypeScript", "K8s" / "Kubernetes"
     */
    private boolean isSkillVariant(String tailored, String master) {
        if (tailored.equals(master)) return true;

        // Check containment: one contains the other (e.g., "react" in "reactjs")
        if (tailored.contains(master) || master.contains(tailored)) return true;

        // Common abbreviations
        Map<String, Set<String>> aliases = Map.of(
            "js", Set.of("javascript", "ecmascript"),
            "ts", Set.of("typescript"),
            "py", Set.of("python"),
            "k8s", Set.of("kubernetes"),
            "tf", Set.of("terraform"),
            "ml", Set.of("machinelearning", "machine learning"),
            "ai", Set.of("artificialintelligence", "artificial intelligence"),
            "db", Set.of("database"),
            "aws", Set.of("amazonwebservices", "amazon web services"),
            "gcp", Set.of("googlecloudplatform", "google cloud platform")
        );

        Set<String> matchedAliases = aliases.getOrDefault(tailored, Set.of());
        if (matchedAliases.contains(master)) return true;

        Set<String> reverseAliases = aliases.getOrDefault(master, Set.of());
        if (reverseAliases.contains(tailored)) return true;

        return false;
    }

    private String normalize(String value) {
        if (value == null) return "";
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private double computeConfidence(List<AlignmentViolation> violations) {
        if (violations.isEmpty()) return 1.0;

        long criticalCount = violations.stream()
            .filter(v -> "critical".equals(v.severity())).count();
        long warningCount = violations.stream()
            .filter(v -> "warning".equals(v.severity())).count();

        // Each critical violation reduces confidence by 0.25, warnings by 0.10
        double penalty = criticalCount * 0.25 + warningCount * 0.10;
        return Math.max(0.0, 1.0 - penalty);
    }
}
