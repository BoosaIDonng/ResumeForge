package com.example.airesume.export;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listTemplates() {
        List<Map<String, Object>> templates = Arrays.stream(TemplateType.values())
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", t.name().toLowerCase());
                    map.put("name", t.getDisplayName());
                    map.put("description", t.getDescription());
                    map.put("templateFile", t.getTemplateName());
                    return map;
                })
                .toList();

        return ResponseEntity.ok(templates);
    }
}
