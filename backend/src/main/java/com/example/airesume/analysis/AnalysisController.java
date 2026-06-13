package com.example.airesume.analysis;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.task.AiTaskEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {
    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/jd-match")
    public ApiResponse<TaskRef> submitJdMatch(@RequestBody JdMatchRequest request) {
        AiTaskEntity task = analysisService.submitJdAnalysis(request.resumeId(), request.jobId());
        return ApiResponse.ok(new TaskRef(task.getId(), task.getStatus()));
    }

    @GetMapping("/reports/{id}")
    public ApiResponse<AnalysisReportEntity> getReport(@PathVariable Long id) {
        return ApiResponse.ok(analysisService.getReport(id));
    }

    record JdMatchRequest(Long resumeId, Long jobId) {}
    record TaskRef(Long taskId, String status) {}
}
