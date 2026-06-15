package com.example.airesume.export;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resumes")
public class PdfExportController {
    private final PdfExportService pdfExportService;

    public PdfExportController(PdfExportService pdfExportService) {
        this.pdfExportService = pdfExportService;
    }

    @PostMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@Valid @RequestBody PdfExportRequest request) {
        TemplateType templateType = TemplateType.fromString(request.template());
        byte[] pdf = pdfExportService.generatePdf(request.resumeData(), templateType, request.refine(), request.fitOnePage());
        String filename = (request.title() != null ? request.title() : "resume") + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    public record PdfExportRequest(
        @NotBlank(message = "简历数据不能为空") String resumeData,
        String title,
        String template,
        boolean refine,
        boolean fitOnePage
    ) {}
}
