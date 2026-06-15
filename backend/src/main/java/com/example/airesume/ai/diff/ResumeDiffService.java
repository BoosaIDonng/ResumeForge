package com.example.airesume.ai.diff;

import com.example.airesume.common.ApiException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ResumeDiffService {
    private static final Logger log = LoggerFactory.getLogger(ResumeDiffService.class);

    private final ObjectMapper objectMapper;

    // Path whitelist — only these paths may be modified
    private static final List<Pattern> ALLOWED_PATHS = List.of(
        Pattern.compile("^summary$"),
        Pattern.compile("^workExperience\\[\\d+\\]\\.description(\\[\\d+\\])?$"),
        Pattern.compile("^education\\[\\d+\\]\\.description$"),
        Pattern.compile("^personalProjects\\[\\d+\\]\\.description(\\[\\d+\\])?$"),
        Pattern.compile("^additional\\.technicalSkills$"),
        Pattern.compile("^additional\\.languages$"),
        Pattern.compile("^additional\\.certificationsTraining$"),
        Pattern.compile("^additional\\.awards$"),
        Pattern.compile("^basics\\.summary$"),
        Pattern.compile("^sections\\.[a-zA-Z]+\\.items\\[\\d+\\]\\.[a-zA-Z]+$")
    );

    // Path blacklist — these prefixes or leaf fields are never modifiable
    private static final List<String> BLOCKED_PREFIXES = List.of(
        "personalInfo", "metadata"
    );

    private static final Set<String> BLOCKED_LEAVES = Set.of(
        "years", "company", "institution", "title", "degree", "name", "role", "id"
    );

    public ResumeDiffService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Apply a list of resume changes to the given resume JSON.
     * Each change goes through 4 gates before being applied.
     */
    public DiffApplyResult applyChanges(String resumeJson, List<ResumeChange> changes) {
        try {
            JsonNode root = objectMapper.readTree(resumeJson);

            List<ResumeChange> applied = new ArrayList<>();
            List<ResumeChange> rejected = new ArrayList<>();
            List<String> warnings = new ArrayList<>();

            for (ResumeChange change : changes) {
                String rejectionReason = validateChange(root, change);
                if (rejectionReason != null) {
                    rejected.add(change);
                    warnings.add("Rejected [" + change.path() + "]: " + rejectionReason);
                    continue;
                }

                try {
                    applySingleChange(root, change);
                    applied.add(change);
                } catch (Exception e) {
                    rejected.add(change);
                    warnings.add("Failed [" + change.path() + "]: " + e.getMessage());
                }
            }

            String updatedJson = objectMapper.writeValueAsString(root);
            return new DiffApplyResult(updatedJson, applied, rejected, warnings);
        } catch (Exception e) {
            throw new ApiException("DIFF_APPLY_FAILED", "应用变更失败: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------------
    // Validation gates
    // ---------------------------------------------------------------

    private String validateChange(JsonNode root, ResumeChange change) {
        // Gate 1: Path must be on the whitelist
        if (!isPathAllowed(change.path())) {
            return "路径不在白名单: " + change.path();
        }

        // Gate 2: Path must not be on the blacklist
        if (isPathBlocked(change.path())) {
            return "禁改字段: " + change.path();
        }

        // Gate 3: Path must resolve to an actual value in the data
        Object actual = resolvePath(root, change.path());
        if (actual == null) {
            return "路径未找到: " + change.path();
        }

        // Gate 4: For "replace", original text must match the actual value
        if ("replace".equalsIgnoreCase(change.action())) {
            if (change.original() != null && !verifyOriginal(actual, change.original())) {
                return "原文不匹配";
            }
        }

        return null; // all gates passed
    }

    /**
     * Check whether the path is on the whitelist.
     */
    public boolean isPathAllowed(String path) {
        return ALLOWED_PATHS.stream().anyMatch(p -> p.matcher(path).matches());
    }

    /**
     * Check whether the path is on the blacklist.
     */
    public boolean isPathBlocked(String path) {
        // Check blocked prefixes
        for (String prefix : BLOCKED_PREFIXES) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }

        // Check blocked leaf field names
        String leaf = extractLeaf(path);
        return BLOCKED_LEAVES.contains(leaf);
    }

    // ---------------------------------------------------------------
    // Path navigation
    // ---------------------------------------------------------------

    /**
     * Navigate a dot+bracket path such as "workExperience[0].description[1]"
     * and return the value at that location, or null if not found.
     */
    public Object resolvePath(Object data, String path) {
        List<String> segments = parsePath(path);
        Object current = data;

        for (String segment : segments) {
            if (current == null) {
                return null;
            }

            if (segment.startsWith("[")) {
                // Array index access
                int index = Integer.parseInt(segment.substring(1, segment.length() - 1));
                if (current instanceof JsonNode node) {
                    if (node.isArray() && index < node.size()) {
                        current = node.get(index);
                    } else {
                        return null;
                    }
                } else if (current instanceof List<?> list) {
                    if (index < list.size()) {
                        current = list.get(index);
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } else {
                // Object field access
                if (current instanceof ObjectNode obj) {
                    if (obj.has(segment)) {
                        current = obj.get(segment);
                    } else {
                        return null;
                    }
                } else if (current instanceof Map<?, ?> map) {
                    current = map.get(segment);
                } else {
                    return null;
                }
            }
        }

        return current;
    }

    /**
     * Set a value at the given dot+bracket path inside a JsonNode tree.
     * Creates intermediate nodes as needed.
     */
    public void setAtPath(JsonNode root, String path, Object value) {
        List<String> segments = parsePath(path);
        if (segments.isEmpty()) {
            return;
        }

        JsonNode current = root;

        // Navigate to the parent of the target
        for (int i = 0; i < segments.size() - 1; i++) {
            String segment = segments.get(i);
            String nextSegment = segments.get(i + 1);

            if (segment.startsWith("[")) {
                int index = Integer.parseInt(segment.substring(1, segment.length() - 1));
                if (current.isArray() && index < ((ArrayNode) current).size()) {
                    current = current.get(index);
                } else {
                    throw new IllegalStateException("Cannot navigate to " + segment + " in path " + path);
                }
            } else {
                if (!current.isObject()) {
                    throw new IllegalStateException("Expected object at segment " + segment + " in path " + path);
                }
                ObjectNode obj = (ObjectNode) current;
                if (!obj.has(segment)) {
                    // Create the missing intermediate node
                    if (nextSegment.startsWith("[")) {
                        obj.set(segment, objectMapper.createArrayNode());
                    } else {
                        obj.set(segment, objectMapper.createObjectNode());
                    }
                }
                current = obj.get(segment);
            }
        }

        // Set the value at the leaf
        String leafSegment = segments.get(segments.size() - 1);
        JsonNode valueNode = objectMapper.valueToTree(value);

        if (leafSegment.startsWith("[")) {
            int index = Integer.parseInt(leafSegment.substring(1, leafSegment.length() - 1));
            if (current.isArray()) {
                ArrayNode arr = (ArrayNode) current;
                while (arr.size() <= index) {
                    arr.addNull();
                }
                arr.set(index, valueNode);
            }
        } else if (current.isObject()) {
            ((ObjectNode) current).set(leafSegment, valueNode);
        }
    }

    // ---------------------------------------------------------------
    // Applying a single change
    // ---------------------------------------------------------------

    private void applySingleChange(JsonNode root, ResumeChange change) {
        String action = change.action() == null ? "replace" : change.action().toLowerCase();

        switch (action) {
            case "replace" -> {
                Object value = change.value();
                if (value instanceof String s) {
                    setAtPath(root, change.path(), s);
                } else {
                    setAtPath(root, change.path(), value);
                }
            }
            case "append" -> {
                Object existing = resolvePath(root, change.path());
                if (existing instanceof JsonNode node && node.isArray()) {
                    // Append to array
                    JsonNode newValue = objectMapper.valueToTree(change.value());
                    if (newValue.isArray()) {
                        for (JsonNode item : newValue) {
                            ((ArrayNode) node).add(item);
                        }
                    } else {
                        ((ArrayNode) node).add(newValue);
                    }
                } else if (existing instanceof JsonNode node && node.isTextual()) {
                    // Append text
                    String combined = node.asText() + change.value();
                    setAtPath(root, change.path(), combined);
                }
            }
            case "reorder" -> {
                Object existing = resolvePath(root, change.path());
                if (existing instanceof ArrayNode arr && change.value() instanceof List<?> order) {
                    // Reorder: value is a list of new indices
                    List<Integer> indices = order.stream()
                        .map(o -> Integer.parseInt(o.toString()))
                        .collect(Collectors.toList());
                    ArrayNode reordered = objectMapper.createArrayNode();
                    for (int idx : indices) {
                        if (idx >= 0 && idx < arr.size()) {
                            reordered.add(arr.get(idx));
                        }
                    }
                    // Replace the array contents in-place
                    arr.removeAll();
                    for (JsonNode item : reordered) {
                        arr.add(item);
                    }
                }
            }
            case "add_skill" -> {
                Object existing = resolvePath(root, change.path());
                if (existing instanceof ArrayNode arr) {
                    JsonNode newValue = objectMapper.valueToTree(change.value());
                    if (newValue.isArray()) {
                        for (JsonNode item : newValue) {
                            arr.add(item);
                        }
                    } else {
                        arr.add(newValue);
                    }
                } else {
                    // Path may not exist yet — create array with the skill
                    setAtPath(root, change.path(), List.of(change.value()));
                }
            }
            default -> throw new IllegalArgumentException("未知的操作类型: " + action);
        }
    }

    // ---------------------------------------------------------------
    // Original text verification
    // ---------------------------------------------------------------

    /**
     * Verify that the expected original text matches the actual value at the path.
     * Supports matching against string nodes or array element strings.
     */
    public boolean verifyOriginal(Object actual, String expected) {
        if (expected == null || expected.isBlank()) {
            return true; // no original to verify
        }

        if (actual instanceof JsonNode node) {
            if (node.isTextual()) {
                return expected.equals(node.asText());
            }
            // For non-textual nodes, stringify and compare
            return expected.equals(node.toString());
        }

        if (actual instanceof String s) {
            return expected.equals(s);
        }

        return false;
    }

    // ---------------------------------------------------------------
    // Path helpers
    // ---------------------------------------------------------------

    /**
     * Parse a dot+bracket path into segments.
     * "workExperience[0].description[1]" -> ["workExperience", "[0]", "description", "[1]"]
     */
    static List<String> parsePath(String path) {
        List<String> segments = new ArrayList<>();
        if (path == null || path.isEmpty()) {
            return segments;
        }

        // Split on dots, but keep bracket notation attached to the field name
        String[] parts = path.split("\\.");
        for (String part : parts) {
            // Separate field name from bracket indices
            int bracketStart = part.indexOf('[');
            if (bracketStart >= 0) {
                // Add the field name (before brackets)
                String fieldName = part.substring(0, bracketStart);
                if (!fieldName.isEmpty()) {
                    segments.add(fieldName);
                }
                // Extract all bracket indices: e.g. "[0][1]"
                String rest = part.substring(bracketStart);
                while (rest.startsWith("[")) {
                    int closeBracket = rest.indexOf(']');
                    if (closeBracket > 0) {
                        segments.add(rest.substring(0, closeBracket + 1));
                        rest = rest.substring(closeBracket + 1);
                    } else {
                        break;
                    }
                }
            } else {
                segments.add(part);
            }
        }

        return segments;
    }

    /**
     * Extract the leaf (last meaningful) field name from a path.
     * "workExperience[0].description[1]" -> "description"
     * "summary" -> "summary"
     */
    private static String extractLeaf(String path) {
        if (path == null || path.isEmpty()) {
            return "";
        }
        // Remove trailing bracket notation
        String clean = path.replaceAll("\\[\\d+\\]$", "");
        int lastDot = clean.lastIndexOf('.');
        if (lastDot >= 0) {
            return clean.substring(lastDot + 1);
        }
        return clean;
    }
}
