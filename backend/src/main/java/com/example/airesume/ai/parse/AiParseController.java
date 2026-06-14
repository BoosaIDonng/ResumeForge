package com.example.airesume.ai.parse;

import com.example.airesume.common.ApiException;
import com.example.airesume.common.ApiResponse;
import com.example.airesume.resume.ResumeData;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
public class AiParseController {
    private final AiParseService parseService;

    public AiParseController(AiParseService parseService) {
        this.parseService = parseService;
    }

    @PostMapping("/parse-resume")
    public ApiResponse<ResumeData> parseResume(
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            throw new ApiException("EMPTY_FILE", "请上传文件");
        }

        ResumeData data = parseService.parse(provider, apiKey, baseUrl, model, file);
        return ApiResponse.ok(data);
    }
}
