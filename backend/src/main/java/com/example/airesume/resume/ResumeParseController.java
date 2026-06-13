package com.example.airesume.resume;

import com.example.airesume.common.ApiResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resumes")
public class ResumeParseController {
    private final ResumeParseService parseService;

    public ResumeParseController(ResumeParseService parseService) {
        this.parseService = parseService;
    }

    @PostMapping("/parse-pdf")
    public ApiResponse<ResumeData> parsePdf(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("请上传 PDF 文件");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("仅支持 PDF 格式");
        }

        String text = parseService.extractText(file);
        if (text.isBlank()) {
            throw new IllegalArgumentException("PDF 内容为空，可能是扫描件（暂不支持 OCR）");
        }

        ResumeData data = parseService.parseToStructured(text);
        return ApiResponse.ok(data);
    }
}
