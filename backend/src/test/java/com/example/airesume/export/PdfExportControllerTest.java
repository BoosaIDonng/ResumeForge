package com.example.airesume.export;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = PdfExportController.class)
class PdfExportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PdfExportService pdfExportService;

    @Test
    void exportPdf_shouldReturnPdfBytes() throws Exception {
        String resumeData = "{\"basics\":{\"name\":\"测试\"}}";
        when(pdfExportService.generatePdf(eq(resumeData), eq(TemplateType.CLEAN), eq(false), eq(false)))
            .thenReturn(new byte[]{0x25, 0x50, 0x44, 0x46}); // %PDF

        PdfExportController.PdfExportRequest request = new PdfExportController.PdfExportRequest(
            resumeData, "我的简历", "clean", false, false
        );

        mockMvc.perform(post("/api/resumes/export/pdf")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_PDF))
            .andExpect(header().string("Content-Disposition", "attachment; filename=\"我的简历.pdf\""));
    }

    @Test
    void exportPdf_withTemplateParam_usesSpecifiedTemplate() throws Exception {
        when(pdfExportService.generatePdf(eq("{}"), eq(TemplateType.MODERN), eq(true), eq(false)))
            .thenReturn(new byte[]{0x25, 0x50, 0x44, 0x46});

        PdfExportController.PdfExportRequest request = new PdfExportController.PdfExportRequest(
            "{}", "简历", "modern", true, false
        );

        mockMvc.perform(post("/api/resumes/export/pdf")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void exportPdf_withNullTitle_usesDefaultFilename() throws Exception {
        when(pdfExportService.generatePdf(eq("{}"), eq(TemplateType.CLEAN), eq(false), eq(false)))
            .thenReturn(new byte[]{0x25, 0x50, 0x44, 0x46});

        PdfExportController.PdfExportRequest request = new PdfExportController.PdfExportRequest(
            "{}", null, "clean", false, false
        );

        mockMvc.perform(post("/api/resumes/export/pdf")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Disposition", "attachment; filename=\"resume.pdf\""));
    }
}
