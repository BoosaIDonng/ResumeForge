package com.example.airesume.ai.parse;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * 将 AI 返回的各种字段名变体映射到项目标准 schema。
 * 处理：字段名别名、日期格式标准化、技能格式统一。
 */
@Component
public class ResumeFieldMapper {
    private static final Logger log = LoggerFactory.getLogger(ResumeFieldMapper.class);
    private static final Pattern DATE_PATTERN = Pattern.compile(
        "^(\\d{4})[\\-/年.](0?[1-9]|1[0-2])[\\-/月.]?$");
    private static final Pattern DATE_RANGE_PATTERN = Pattern.compile(
        "^(.+?)[\\s]*[-–—~至到]+[\\s]*(.+)$");

    private final ObjectMapper objectMapper;

    public ResumeFieldMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * 对 AI 解析结果进行全面的字段映射和标准化。
     */
    public Map<String, Object> map(Map<String, Object> data) {
        if (data == null) return data;

        Map<String, Object> result = new LinkedHashMap<>(data);

        // 映射 basics
        if (result.containsKey("basics") && result.get("basics") instanceof Map) {
            result.put("basics", mapBasics((Map<String, Object>) result.get("basics")));
        }

        // 映射 summary
        if (result.containsKey("summary") && result.get("summary") instanceof Map) {
            result.put("summary", mapSummary((Map<String, Object>) result.get("summary")));
        }

        // 映射 sections
        if (result.containsKey("sections") && result.get("sections") instanceof Map) {
            result.put("sections", mapSections((Map<String, Object>) result.get("sections")));
        }

        // 兼容顶层 AI 别名（有些 AI 直接返回 experience[] 而非 sections.experience）
        mapTopLevelAliases(result);

        return result;
    }

    /**
     * 将 map 结果转换为 ResumeData 字符串。
     */
    public String mapToString(Map<String, Object> data) {
        try {
            return objectMapper.writeValueAsString(map(data));
        } catch (Exception e) {
            log.warn("Failed to serialize mapped resume data", e);
            return "{}";
        }
    }

    // ========== basics 映射 ==========

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapBasics(Map<String, Object> basics) {
        Map<String, Object> result = new LinkedHashMap<>();

        // name: fullName || name || 姓名 || contactName
        result.put("name", pick(basics, "name", "fullName", "姓名", "contactName", "candidateName"));

        // headline: jobTitle || title || position || 职位 || headline || objective
        result.put("headline", pick(basics, "headline", "jobTitle", "title", "position", "职位", "objective", "role"));

        // email
        result.put("email", pick(basics, "email", "邮箱", "emailAddress", "mail"));

        // phone: phone || telephone || mobile || 手机 || 电话
        result.put("phone", pick(basics, "phone", "telephone", "mobile", "手机", "电话", "cellPhone", "cell"));

        // location: location || address || city || 地址 || 所在地
        result.put("location", pick(basics, "location", "address", "city", "地址", "所在地", "region"));

        // website: website || url || personalWebsite || portfolio
        result.put("website", pick(basics, "website", "url", "personalWebsite", "portfolio", "linkedin"));

        // 新增字段
        result.put("age", pick(basics, "age", "年龄"));
        result.put("gender", pick(basics, "gender", "性别"));
        result.put("politicalStatus", pick(basics, "politicalStatus", "政治面貌"));
        result.put("ethnicity", pick(basics, "ethnicity", "民族"));
        result.put("hometown", pick(basics, "hometown", "籍贯", "家乡"));
        result.put("maritalStatus", pick(basics, "maritalStatus", "婚姻状况"));
        result.put("yearsOfExperience", pick(basics, "yearsOfExperience", "工作年限", "工作经验年限"));
        result.put("educationLevel", pick(basics, "educationLevel", "学历", "最高学历"));
        result.put("wechat", pick(basics, "wechat", "微信"));
        result.put("avatar", pick(basics, "avatar", "头像"));

        // customFields: 保持原样
        if (basics.containsKey("customFields")) {
            result.put("customFields", basics.get("customFields"));
        } else {
            result.put("customFields", new ArrayList<>());
        }

        return result;
    }

    // ========== summary 映射 ==========

    private Map<String, Object> mapSummary(Map<String, Object> summary) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("title", pick(summary, "title", "标题", "name"));
        result.put("content", pick(summary, "content", "text", "summary", "description", "内容", "概述"));
        result.put("hidden", summary.getOrDefault("hidden", false));
        return result;
    }

    // ========== sections 映射 ==========

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapSections(Map<String, Object> sections) {
        Map<String, Object> result = new LinkedHashMap<>();

        // 标准 section ID 别名映射
        Map<String, String> sectionAliases = buildSectionAliases();

        for (Map.Entry<String, Object> entry : sections.entrySet()) {
            String key = entry.getKey();
            String mappedKey = sectionAliases.getOrDefault(key, key);

            if (entry.getValue() instanceof Map section) {
                Map<String, Object> mapped = new LinkedHashMap<>(section);
                mapped.put("title", section.getOrDefault("title", mappedKey));
                mapped.put("hidden", section.getOrDefault("hidden", false));

                // 映射 items（兼容 skills/categories/items 别名）
                List<?> rawItems = null;
                if (section.get("items") instanceof List l) {
                    rawItems = l;
                } else if (section.get("skills") instanceof List l) {
                    rawItems = l;  // AI 返回 {skills: [...]} 而非 {items: [...]}
                } else if (section.get("categories") instanceof List l) {
                    rawItems = l;  // AI 返回 {categories: [...]}
                }
                if (rawItems != null) {
                    mapped.put("items", mapItems(mappedKey, rawItems));
                } else {
                    mapped.putIfAbsent("items", new ArrayList<>());
                }

                // 合并同名 section（如 work 和 experience 都存在）
                if (result.containsKey(mappedKey)) {
                    mergeSection(result.get(mappedKey), mapped);
                } else {
                    result.put(mappedKey, mapped);
                }
            }
        }

        return result;
    }

    // ========== items 映射 ==========

    private static Map<String, String> buildSectionAliases() {
        Map<String, String> m = new LinkedHashMap<>();
        // experience
        m.put("experience", "experience");
        m.put("work", "experience");
        m.put("workExperience", "experience");
        m.put("工作经历", "experience");
        m.put("工作经验", "experience");
        m.put("employment", "experience");
        // education
        m.put("education", "education");
        m.put("教育", "education");
        m.put("教育经历", "education");
        m.put("educationHistory", "education");
        // skills
        m.put("skills", "skills");
        m.put("技能", "skills");
        m.put("技术栈", "skills");
        m.put("technicalSkills", "skills");
        m.put("competencies", "skills");
        // projects
        m.put("projects", "projects");
        m.put("项目", "projects");
        m.put("项目经历", "projects");
        m.put("projectExperience", "projects");
        // languages
        m.put("languages", "languages");
        m.put("语言", "languages");
        m.put("语言能力", "languages");
        // certifications
        m.put("certifications", "certifications");
        m.put("证书", "certifications");
        m.put("认证", "certifications");
        // awards
        m.put("awards", "awards");
        m.put("荣誉", "awards");
        m.put("荣誉奖项", "awards");
        m.put("honors", "awards");
        // profiles
        m.put("profiles", "profiles");
        m.put("社交", "profiles");
        m.put("链接", "profiles");
        return m;
    }

    // ========== items 映射 ==========

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> mapItems(String sectionId, List<?> items) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : items) {
            if (item instanceof Map map) {
                result.add(mapItem(sectionId, map));
            } else if (item instanceof String s && !s.isBlank()) {
                // AI 返回扁平字符串数组（如 ["React","Vue"]），包装为标准 item
                result.add(mapItem(sectionId, wrapStringItem(sectionId, s)));
            }
        }
        return result;
    }

    /**
     * 将扁平字符串包装为标准 item Map。
     * skills → {name: s, keywords: [s]}
     * 其他 → {name: s}
     */
    private Map<String, Object> wrapStringItem(String sectionId, String value) {
        Map<String, Object> wrapped = new LinkedHashMap<>();
        wrapped.put("id", java.util.UUID.randomUUID().toString());
        if ("skills".equals(sectionId)) {
            wrapped.put("name", value);
            wrapped.put("keywords", List.of(value));
        } else {
            wrapped.put("name", value);
        }
        return wrapped;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapItem(String sectionId, Map<String, Object> item) {
        return switch (sectionId) {
            case "experience" -> mapExperienceItem(item);
            case "education" -> mapEducationItem(item);
            case "projects" -> mapProjectItem(item);
            case "skills" -> mapSkillItem(item);
            case "profiles" -> mapProfileItem(item);
            case "languages" -> mapLanguageItem(item);
            case "certifications" -> mapCertificationItem(item);
            case "awards" -> mapAwardItem(item);
            default -> item;
        };
    }

    private Map<String, Object> mapExperienceItem(Map<String, Object> item) {
        Map<String, Object> result = ensureId(item);
        result.put("company", pick(item, "company", "companyName", "employer", "公司", "organization", "org"));
        result.put("position", pick(item, "position", "title", "role", "职位", "jobTitle", "job"));
        result.put("startDate", normalizeDate(pick(item, "startDate", "start", "from", "开始日期", "开始时间")));
        // endDate: null = current job (至今), 空字符串 = 未知
        Object rawEnd = item.get("endDate");
        if (rawEnd == null) {
            result.put("endDate", null);
        } else {
            String endStr = rawEnd.toString().trim();
            result.put("endDate", normalizeDate(endStr.isEmpty() ? "" : endStr));
        }
        result.put("location", pick(item, "location", "地点", "工作地点", "city"));
        result.put("description", pick(item, "description", "summary", "描述", "职责", "responsibilities", "content", "details"));
        if (item.containsKey("highlights")) result.put("highlights", item.get("highlights"));
        if (item.containsKey("technologies")) result.put("technologies", item.get("technologies"));
        else if (item.containsKey("keywords")) result.put("technologies", item.get("keywords"));
        return result;
    }

    private Map<String, Object> mapEducationItem(Map<String, Object> item) {
        Map<String, Object> result = ensureId(item);
        result.put("school", pick(item, "school", "institution", "university", "college", "学校", "院校", "academy"));
        result.put("degree", pick(item, "degree", "studyType", "type", "学历", "学位", "qualification"));
        result.put("area", pick(item, "area", "major", "field", "专业", "fieldOfStudy", "studyField"));
        result.put("startDate", normalizeDate(pick(item, "startDate", "start", "from", "开始日期")));
        result.put("endDate", normalizeDate(pick(item, "endDate", "end", "to", "结束日期")));
        if (item.containsKey("gpa")) result.put("gpa", item.get("gpa"));
        if (item.containsKey("score")) result.put("score", item.get("score"));
        if (item.containsKey("highlights")) result.put("highlights", item.get("highlights"));
        return result;
    }

    private Map<String, Object> mapProjectItem(Map<String, Object> item) {
        Map<String, Object> result = ensureId(item);
        result.put("name", pick(item, "name", "title", "项目名称", "projectName", "项目"));
        if (item.containsKey("role")) result.put("role", item.get("role"));
        result.put("startDate", normalizeDate(pick(item, "startDate", "start", "from", "开始日期")));
        result.put("endDate", normalizeDate(pick(item, "endDate", "end", "to", "结束日期")));
        if (item.containsKey("description")) result.put("description", item.get("description"));
        if (item.containsKey("highlights")) result.put("highlights", item.get("highlights"));
        // technologies: 兼容 keywords/techStack/技术栈
        Object tech = item.get("technologies");
        if (tech == null) tech = item.get("keywords");
        if (tech == null) tech = item.get("techStack");
        if (tech == null) tech = item.get("技术栈");
        if (tech != null) result.put("technologies", tech);
        if (item.containsKey("url")) result.put("url", item.get("url"));
        return result;
    }

    private Map<String, Object> mapSkillItem(Map<String, Object> item) {
        Map<String, Object> result = ensureId(item);
        result.put("name", pick(item, "name", "category", "类别", "type", "group"));
        result.put("keywords", normalizeSkills(item));
        // 保留可选的 level 字段（前端技能熟练度 0-5）
        if (item.containsKey("level") && item.get("level") != null) {
            result.put("level", item.get("level"));
        }
        return result;
    }

    private Map<String, Object> mapProfileItem(Map<String, Object> item) {
        Map<String, Object> result = ensureId(item);
        result.put("network", pick(item, "network", "platform", "平台", "type"));
        result.put("username", pick(item, "username", "handle", "账号", "user"));
        if (item.containsKey("url")) result.put("url", item.get("url"));
        return result;
    }

    private Map<String, Object> mapLanguageItem(Map<String, Object> item) {
        Map<String, Object> result = ensureId(item);
        result.put("name", pick(item, "name", "language", "语言"));
        if (item.containsKey("level")) result.put("level", item.get("level"));
        return result;
    }

    private Map<String, Object> mapCertificationItem(Map<String, Object> item) {
        Map<String, Object> result = ensureId(item);
        result.put("name", pick(item, "name", "title", "证书名称", "certification"));
        if (item.containsKey("issuer")) result.put("issuer", item.get("issuer"));
        if (item.containsKey("date")) result.put("date", item.get("date"));
        if (item.containsKey("url")) result.put("url", item.get("url"));
        return result;
    }

    private Map<String, Object> mapAwardItem(Map<String, Object> item) {
        Map<String, Object> result = ensureId(item);
        result.put("title", pick(item, "title", "name", "奖项名称", "award"));
        if (item.containsKey("issuer")) result.put("issuer", item.get("issuer"));
        if (item.containsKey("date")) result.put("date", item.get("date"));
        if (item.containsKey("description")) result.put("description", item.get("description"));
        return result;
    }

    // ========== highlights 格式统一 ==========

    @SuppressWarnings("unchecked")
    private List<String> normalizeHighlights(Map<String, Object> item) {
        // 已有 highlights 数组
        if (item.get("highlights") instanceof List list) {
            return list.stream().map(Object::toString).toList();
        }
        // 从 summary/description 字符串转换
        String text = null;
        if (item.get("summary") instanceof String s && !s.isBlank()) text = s;
        else if (item.get("description") instanceof String s && !s.isBlank()) text = s;
        else if (item.get("responsibilities") instanceof String s && !s.isBlank()) text = s;

        if (text != null) {
            // 如果是多行文本或带项目符号，拆分为数组
            if (text.contains("\n") || text.contains("•") || text.contains("- ")) {
                return java.util.Arrays.stream(text.split("[\\n•]"))
                    .map(s -> s.replaceAll("^[-\\s]+", "").trim())
                    .filter(s -> !s.isEmpty())
                    .toList();
            }
            return List.of(text);
        }
        return new ArrayList<>();
    }

    // ========== 技能格式统一 ==========

    @SuppressWarnings("unchecked")
    private List<String> normalizeSkills(Map<String, Object> item) {
        // 已有 keywords 数组
        if (item.get("keywords") instanceof List list) {
            return list.stream().map(Object::toString).toList();
        }
        // skills 数组
        if (item.get("skills") instanceof List list) {
            return list.stream().map(Object::toString).toList();
        }
        // items 数组（有些 AI 返回 {name:"前端", items:["React","Vue"]}）
        if (item.get("items") instanceof List list) {
            return list.stream().map(Object::toString).toList();
        }
        // 逗号分隔字符串
        Object val = item.getOrDefault("keywords", item.getOrDefault("skills", ""));
        if (val instanceof String s && !s.isBlank()) {
            return java.util.Arrays.stream(s.split("[,，、;；]"))
                .map(String::trim)
                .filter(ss -> !ss.isEmpty())
                .toList();
        }
        // 兜底：name 本身作为唯一 keyword
        String name = pick(item, "name", "category", "类别");
        if (!name.isBlank()) {
            return List.of(name);
        }
        return new ArrayList<>();
    }

    // ========== 顶层别名兼容 ==========

    @SuppressWarnings("unchecked")
    private void mapTopLevelAliases(Map<String, Object> result) {
        Map<String, Object> sections = result.containsKey("sections")
            ? (Map<String, Object>) result.get("sections")
            : new LinkedHashMap<>();

        // 有些 AI 直接返回顶层 experience[] 而非 sections.experience
        Map<String, String> topLevelMappings = Map.of(
            "experience", "experience",
            "work", "experience",
            "workExperience", "experience",
            "education", "education",
            "skills", "skills",
            "projects", "projects",
            "languages", "languages",
            "certifications", "certifications",
            "awards", "awards"
        );

        for (Map.Entry<String, String> mapping : topLevelMappings.entrySet()) {
            String alias = mapping.getKey();
            String target = mapping.getValue();

            if (result.containsKey(alias) && !sections.containsKey(target)) {
                Object value = result.remove(alias);
                if (value instanceof List list && !list.isEmpty()) {
                    Map<String, Object> section = new LinkedHashMap<>();
                    section.put("title", target);
                    section.put("hidden", false);
                    section.put("items", mapItems(target, list));
                    sections.put(target, section);
                }
            }
        }

        if (!sections.isEmpty() && !result.containsKey("sections")) {
            result.put("sections", sections);
        }
    }

    // ========== 日期标准化 ==========

    String normalizeDate(String date) {
        if (date == null || date.isBlank()) return "";

        String trimmed = date.trim();

        // "至今" / "present" / "current" / "now" → null 表示"至今"（当前工作）
        if (trimmed.matches("(?i)^(至今|现在|present|current|now|today|目前|在职)$")) {
            return null;
        }

        var matcher = DATE_PATTERN.matcher(trimmed);
        if (matcher.matches()) {
            String year = matcher.group(1);
            String month = String.format("%02d", Integer.parseInt(matcher.group(2)));
            return year + "-" + month;
        }

        // YYYY 年 M 月 格式
        var cnMatcher = java.util.regex.Pattern.compile("^(\\d{4})年(\\d{1,2})月?$").matcher(trimmed);
        if (cnMatcher.matches()) {
            return cnMatcher.group(1) + "-" + String.format("%02d", Integer.parseInt(cnMatcher.group(2)));
        }

        // YYYY 格式（只有年份）
        if (trimmed.matches("^\\d{4}$")) {
            return trimmed;
        }

        return trimmed;
    }

    // ========== 工具方法 ==========

    private String pick(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object val = map.get(key);
            if (val != null && !val.toString().isBlank()) {
                return val.toString().trim();
            }
        }
        return "";
    }

    private Map<String, Object> ensureId(Map<String, Object> item) {
        Map<String, Object> result = new LinkedHashMap<>(item);
        if (!result.containsKey("id") || result.get("id") == null || result.get("id").toString().isBlank()) {
            result.put("id", java.util.UUID.randomUUID().toString());
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private void mergeSection(Object existing, Object incoming) {
        if (existing instanceof Map e && incoming instanceof Map i) {
            List<Map<String, Object>> eItems = e.get("items") instanceof List ? (List<Map<String, Object>>) e.get("items") : new ArrayList<>();
            List<Map<String, Object>> iItems = i.get("items") instanceof List ? (List<Map<String, Object>>) i.get("items") : new ArrayList<>();
            List<Map<String, Object>> merged = new ArrayList<>(eItems);
            merged.addAll(iItems);
            e.put("items", merged);
        }
    }
}
