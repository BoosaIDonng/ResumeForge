package com.example.airesume.analysis;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.airesume.common.ApiException;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskService;
import com.example.airesume.task.TaskType;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AnalysisServiceTest {

    private TaskService taskService;
    private AnalysisReportRepository reportRepository;
    private AnalysisService service;

    @BeforeEach
    void setUp() {
        taskService = mock(TaskService.class);
        reportRepository = mock(AnalysisReportRepository.class);
        service = new AnalysisService(taskService, reportRepository);
    }

    @Test
    void submitJdAnalysis_createsTaskWithCorrectType() {
        AiTaskEntity task = new AiTaskEntity(TaskType.JD_ANALYSIS.name(), 1L, 2L);
        when(taskService.create(TaskType.JD_ANALYSIS, 1L, 2L)).thenReturn(task);

        AiTaskEntity result = service.submitJdAnalysis(1L, 2L);

        assertThat(result.getTaskType()).isEqualTo(TaskType.JD_ANALYSIS.name());
    }

    @Test
    void getReport_returnsExistingReport() {
        AnalysisReportEntity report = new AnalysisReportEntity(1L, 2L, 85, 90, "[]", "[]", "[]", "总结");
        when(reportRepository.findById(10L)).thenReturn(Optional.of(report));

        AnalysisReportEntity result = service.getReport(10L);

        assertThat(result.getOverallScore()).isEqualTo(85);
        assertThat(result.getAtsScore()).isEqualTo(90);
        assertThat(result.getSummary()).isEqualTo("总结");
    }

    @Test
    void getReport_throwsWhenNotFound() {
        when(reportRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getReport(99L))
            .isInstanceOf(ApiException.class)
            .hasMessage("分析报告不存在");
    }
}
