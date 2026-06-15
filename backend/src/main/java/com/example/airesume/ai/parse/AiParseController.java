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

    /**
     * 解析简历文件（PDF/DOCX），返回结构化数据但不保存。
     */
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

    /**
     * 导入简历文件（PDF/DOCX），解析并返回结构化数据 + 标题。
     * 前端 ResumeUploadZone 使用此端点。
     */
    @PostMapping("/import-resume")
    public ApiResponse<ImportResumeResponse> importResume(
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
        String title = file.getOriginalFilename();
        if (title != null) {
            // 去掉扩展名作为标题
            int dotIdx = title.lastIndexOf('.');
            if (dotIdx > 0) title = title.substring(0, dotIdx);
        }
        if (title == null || title.isBlank()) {
            title = "导入的简历";
        }

        return ApiResponse.ok(new ImportResumeResponse(data, title));
    }

    public record ImportResumeResponse(ResumeData resumeData, String title) {}
}
