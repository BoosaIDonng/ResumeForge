package com.example.airesume.optimization;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.task.AiTaskEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/optimization")
public class OptimizationController {
    private final OptimizationService optimizationService;

    public OptimizationController(OptimizationService optimizationService) {
        this.optimizationService = optimizationService;
    }

    @PostMapping("/proposals")
    public ApiResponse<TaskRef> submitProposal(@RequestBody ProposalRequest request) {
        AiTaskEntity task = optimizationService.submitProposal(request.analysisReportId());
        return ApiResponse.ok(new TaskRef(task.getId(), task.getStatus()));
    }

    @GetMapping("/proposals/{id}")
    public ApiResponse<OptimizationProposalEntity> getProposal(@PathVariable Long id) {
        return ApiResponse.ok(optimizationService.getProposal(id));
    }

    @PostMapping("/proposals/{id}/apply")
    public ApiResponse<OptimizationProposalEntity> applyProposal(@PathVariable Long id) {
        return ApiResponse.ok(optimizationService.applyProposal(id));
    }

    record ProposalRequest(Long analysisReportId) {}
    record TaskRef(Long taskId, String status) {}
}
