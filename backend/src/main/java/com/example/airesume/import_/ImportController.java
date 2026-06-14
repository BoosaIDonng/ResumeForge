package com.example.airesume.import_;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeRepository;
import com.example.airesume.resume.ResumeService;
import com.example.airesume.resume.dto.ResumeResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/import")
public class ImportController {
    private final DocxImportService docxImportService;
    private final ResumeService resumeService;
    private final ResumeRepository resumeRepository;

    public ImportController(DocxImportService docxImportService, ResumeService resumeService,
                            ResumeRepository resumeRepository) {
        this.docxImportService = docxImportService;
        this.resumeService = resumeService;
        this.resumeRepository = resumeRepository;
    }

    /**
     * Import a DOCX file and create a new resume from it.
     */
    @PostMapping("/docx")
    public ApiResponse<ResumeResponse> importDocx(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model
    ) {
        String resumeDataJson = docxImportService.parseDocx(file, provider, apiKey, baseUrl, model);
        String title = file.getOriginalFilename() != null
            ? file.getOriginalFilename().replaceAll("\\.docx?$", "")
            : "导入的简历";
        ResumeEntity entity = resumeService.create(title, false);
        entity.update(entity.getTitle(), resumeDataJson);
        resumeRepository.save(entity);
        return ApiResponse.ok(ResumeResponse.from(entity));
    }
}
