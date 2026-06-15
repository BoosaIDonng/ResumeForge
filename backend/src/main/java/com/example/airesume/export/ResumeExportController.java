package com.example.airesume.export;

import com.example.airesume.common.ApiException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resumes")
public class ResumeExportController {
    private final HtmlGenerator htmlGenerator;
    private final PlainTextGenerator plainTextGenerator;
    private final PdfExportService pdfExportService;
    private final DocxExportService docxExportService;

    public ResumeExportController(HtmlGenerator htmlGenerator,
                                   PlainTextGenerator plainTextGenerator, PdfExportService pdfExportService,
                                   DocxExportService docxExportService) {
        this.htmlGenerator = htmlGenerator;
        this.plainTextGenerator = plainTextGenerator;
        this.pdfExportService = pdfExportService;
        this.docxExportService = docxExportService;
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam("resumeData") String resumeData,
                                          @RequestParam("title") String title,
                                          @RequestParam(defaultValue = "html") String format) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String safeTitle = title.replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5_-]", "_");

        return switch (format) {
            case "json" -> {
                byte[] body = resumeData.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                yield ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-" + timestamp + ".json\"")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body);
            }
            case "html" -> {
                String html = htmlGenerator.generate(resumeData, "default");
                byte[] body = html.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                yield ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-" + timestamp + ".html\"")
                    .contentType(MediaType.TEXT_HTML)
                    .body(body);
            }
            case "txt" -> {
                String txt = plainTextGenerator.generate(resumeData);
                byte[] body = txt.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                yield ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "-" + timestamp + ".txt\"")
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(body);
            }
            case "pdf" -> {
                try {
                    byte[] pdf = pdfExportService.generatePdf(resumeData, TemplateType.CLEAN, false, false);
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
                    byte[] docx = docxExportService.generateDocx(resumeData);
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
