package com.example.airesume.analysis;

import com.example.airesume.common.ApiException;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskService;
import com.example.airesume.task.TaskType;
import org.springframework.stereotype.Service;

@Service
public class AnalysisService {
    private final TaskService taskService;
    private final AnalysisReportRepository reportRepository;

    public AnalysisService(TaskService taskService, AnalysisReportRepository reportRepository) {
        this.taskService = taskService;
        this.reportRepository = reportRepository;
    }

    public AiTaskEntity submitJdAnalysis(Long resumeId, Long jobId) {
        return taskService.create(TaskType.JD_ANALYSIS, resumeId, jobId);
    }

    public AnalysisReportEntity getReport(Long id) {
        return reportRepository.findById(id)
            .orElseThrow(() -> new ApiException("REPORT_NOT_FOUND", "分析报告不存在"));
    }
}
