package com.example.airesume.export;

import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resumes")
public class PdfExportController {
    private final PdfExportService pdfExportService;
    private final ResumeService resumeService;

    public PdfExportController(PdfExportService pdfExportService, ResumeService resumeService) {
        this.pdfExportService = pdfExportService;
        this.resumeService = resumeService;
    }

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable Long id,
            @RequestParam(defaultValue = "clean") String template,
            @RequestParam(defaultValue = "false") boolean refine,
            @RequestParam(defaultValue = "false") boolean fitOnePage) {

        ResumeEntity resume = resumeService.get(id);
        TemplateType templateType = TemplateType.fromString(template);

        byte[] pdf = pdfExportService.generatePdf(resume.getResumeData(), templateType, refine, fitOnePage);

        String filename = (resume.getTitle() != null ? resume.getTitle() : "resume") + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
}
