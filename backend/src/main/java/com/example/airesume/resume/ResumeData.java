package com.example.airesume.resume;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ResumeData(
    Basics basics,
    Summary summary,
    Map<String, Section> sections,
    List<Map<String, Object>> customSections,
    Metadata metadata
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Basics(
        String name,
        String headline,
        String email,
        String phone,
        String location,
        String website,
        String age,
        String gender,
        String politicalStatus,
        String ethnicity,
        String hometown,
        String maritalStatus,
        String yearsOfExperience,
        String educationLevel,
        String wechat,
        String avatar,
        List<Map<String, Object>> customFields
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Summary(
        String title,
        String content,
        Boolean hidden
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Section(
        String title,
        Boolean hidden,
        List<Map<String, Object>> items
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Metadata(
        String template,
        String language,
        Map<String, Object> design,
        Map<String, Object> typography,
        Map<String, Object> page
    ) {}
}
