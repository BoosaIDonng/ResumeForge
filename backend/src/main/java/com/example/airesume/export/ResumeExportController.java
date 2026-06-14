package com.example.airesume.export;

import com.example.airesume.common.ApiException;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resumes")
public class ResumeExportController {
    private final ResumeRepository resumeRepository;
    private final HtmlGenerator htmlGenerator;
    private final PlainTextGenerator plainTextGenerator;
    private final PdfExportService pdfExportService;
    private final DocxExportService docxExportService;

    public ResumeExportController(ResumeRepository resumeRepository, HtmlGenerator htmlGenerator,
                                   PlainTextGenerator plainTextGenerator, PdfExportService pdfExportService,
                                   DocxExportService docxExportService) {
        this.resumeRepository = resumeRepository;
        this.htmlGenerator = htmlGenerator;
        this.plainTextGenerator = plainTextGenerator;
        this.pdfExportService = pdfExportService;
        this.docxExportService = docxExportService;
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> export(@PathVariable Long id, @RequestParam(defaultValue = "html") String format) {
        ResumeEntity resume = resumeRepository.findById(id)
            .orElseThrow(() -> new ApiException("RESUME_NOT_FOUND", "简历不存在"));

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String safeTitle = resume.getTitle().replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5_-]", "_");

        return switch (format) {
            case "json" -> {
                byte[] body = resume.getResumeData().getBytes(java.nio.charset.StandardCharsets.UTF_8);
                yield ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-" + timestamp + ".json\"")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body);
            }
            case "html" -> {
                String html = htmlGenerator.generate(resume.getResumeData(), "default");
                byte[] body = html.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                yield ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-" + timestamp + ".html\"")
                    .contentType(MediaType.TEXT_HTML)
                    .body(body);
            }
            case "txt" -> {
                String txt = plainTextGenerator.generate(resume.getResumeData());
                byte[] body = txt.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                yield ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-" + timestamp + ".txt\"")
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(body);
            }
            case "pdf" -> {
                try {
                    byte[] pdf = pdfExportService.generatePdf(resume.getResumeData(), TemplateType.CLEAN, false, false);
                    yield ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-" + timestamp + ".pdf\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(pdf);
                } catch (Exception e) {
                    throw new ApiException("PDF_GENERATION_FAILED", "PDF生成失败: " + e.getMessage());
                }
            }
            case "docx" -> {
                try {
                    byte[] docx = docxExportService.generateDocx(resume.getResumeData());
                    yield ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-" + timestamp + ".docx\"")
                        .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                        .body(docx);
                } catch (Exception e) {
                    throw new ApiException("DOCX_GENERATION_FAILED", "DOCX生成失败: " + e.getMessage());
                }
            }
            default -> throw new ApiException("UNSUPPORTED_FORMAT", "不支持的格式: " + format);
        };
    }
}
