package com.example.airesume.optimization;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class OptimizationValidator {
    private static final List<String> ALLOWED_PREFIXES = List.of(
        "summary.content",
        "sections.experience.items",
        "sections.projects.items",
        "sections.skills.items",
        "sections.education.items"
    );

    private static final List<String> BLOCKED_PREFIXES = List.of(
        "basics", "picture", "metadata"
    );

    private static final Set<String> BLOCKED_LEAVES = Set.of(
        "name", "email", "phone", "company", "school", "degree",
        "position", "period", "location", "website", "id"
    );

    public ValidationResult validate(String resumeJson, List<ResumeChange> changes) {
        List<ResumeChange> applied = new ArrayList<>();
        List<RejectedChange> rejected = new ArrayList<>();

        for (ResumeChange change : changes) {
            String rejection = check(resumeJson, change);
            if (rejection != null) {
                rejected.add(new RejectedChange(change, rejection));
            } else {
                applied.add(change);
            }
        }

        return new ValidationResult(applied, rejected);
    }

    private String check(String resumeJson, ResumeChange change) {
        String path = change.path();

        for (String blocked : BLOCKED_PREFIXES) {
            if (path.startsWith(blocked)) {
                return "禁改字段: " + blocked;
            }
        }

        String leaf = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
        // Strip array index notation
        leaf = leaf.replaceAll("\\[\\d+\\]", "");
        if (BLOCKED_LEAVES.contains(leaf)) {
            return "禁改字段: " + leaf;
        }

        boolean allowed = ALLOWED_PREFIXES.stream().anyMatch(path::startsWith);
        if (!allowed) {
            return "路径不在白名单: " + path;
        }

        if (change.action() == ChangeAction.REPLACE && change.original() != null) {
            if (!resumeJson.contains(change.original())) {
                return "原文不匹配";
            }
        }

        return null;
    }
}
