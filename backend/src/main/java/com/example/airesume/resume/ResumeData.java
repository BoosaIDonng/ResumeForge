package com.example.airesume.resume;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ResumeData(
    Basics basics,
    Map<String, Section> sections
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Basics(
        String name,
        String headline,
        String email,
        String phone,
        String location,
        String url,
        String summary
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Section(
        String name,
        List<Map<String, Object>> items
    ) {}
}
