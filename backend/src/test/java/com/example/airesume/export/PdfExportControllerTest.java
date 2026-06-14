package com.example.airesume.export;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
    controllers = PdfExportController.class,
    excludeAutoConfiguration = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        RabbitAutoConfiguration.class,
        RedisAutoConfiguration.class,
        FlywayAutoConfiguration.class
    }
)
class PdfExportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PdfExportService pdfExportService;

    @MockBean
    private ResumeService resumeService;

    @Test
    void exportPdf_shouldReturnPdfBytes() throws Exception {
        ResumeEntity resume = mock(ResumeEntity.class);
        when(resume.getResumeData()).thenReturn("{\"basics\":{\"name\":\"测试\"}}");
        when(resume.getTitle()).thenReturn("我的简历");
        when(resumeService.get(1L)).thenReturn(resume);
        when(pdfExportService.generatePdf("{\"basics\":{\"name\":\"测试\"}}", TemplateType.CLEAN, false, false))
            .thenReturn(new byte[]{0x25, 0x50, 0x44, 0x46}); // %PDF

        mockMvc.perform(get("/api/resumes/1/export/pdf"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_PDF))
            .andExpect(header().string("Content-Disposition", "attachment; filename=\"我的简历.pdf\""));
    }

    @Test
    void exportPdf_withTemplateParam_usesSpecifiedTemplate() throws Exception {
        ResumeEntity resume = mock(ResumeEntity.class);
        when(resume.getResumeData()).thenReturn("{}");
        when(resume.getTitle()).thenReturn("简历");
        when(resumeService.get(1L)).thenReturn(resume);
        when(pdfExportService.generatePdf("{}", TemplateType.MODERN, true, false))
            .thenReturn(new byte[]{0x25, 0x50, 0x44, 0x46});

        mockMvc.perform(get("/api/resumes/1/export/pdf?template=modern&refine=true"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void exportPdf_withNullTitle_usesDefaultFilename() throws Exception {
        ResumeEntity resume = mock(ResumeEntity.class);
        when(resume.getResumeData()).thenReturn("{}");
        when(resume.getTitle()).thenReturn(null);
        when(resumeService.get(1L)).thenReturn(resume);
        when(pdfExportService.generatePdf("{}", TemplateType.CLEAN, false, false))
            .thenReturn(new byte[]{0x25, 0x50, 0x44, 0x46});

        mockMvc.perform(get("/api/resumes/1/export/pdf"))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Disposition", "attachment; filename=\"resume.pdf\""));
    }
}
