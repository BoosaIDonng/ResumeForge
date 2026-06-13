package com.example.airesume.optimization;

import com.example.airesume.analysis.AnalysisReportEntity;
import com.example.airesume.analysis.AnalysisReportRepository;
import com.example.airesume.common.ApiException;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeService;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskService;
import com.example.airesume.task.TaskType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OptimizationService {
    private final TaskService taskService;
    private final OptimizationProposalRepository proposalRepository;
    private final AnalysisReportRepository analysisReportRepository;
    private final OptimizationValidator validator;
    private final ResumeService resumeService;
    private final ObjectMapper objectMapper;

    public OptimizationService(
        TaskService taskService,
        OptimizationProposalRepository proposalRepository,
        AnalysisReportRepository analysisReportRepository,
        OptimizationValidator validator,
        ResumeService resumeService,
        ObjectMapper objectMapper
    ) {
        this.taskService = taskService;
        this.proposalRepository = proposalRepository;
        this.analysisReportRepository = analysisReportRepository;
        this.validator = validator;
        this.resumeService = resumeService;
        this.objectMapper = objectMapper;
    }

    public AiTaskEntity submitProposal(Long analysisReportId) {
        AnalysisReportEntity report = analysisReportRepository.findById(analysisReportId)
            .orElseThrow(() -> new ApiException("REPORT_NOT_FOUND", "分析报告不存在"));
        return taskService.create(TaskType.OPTIMIZATION_PROPOSAL, report.getResumeId(), report.getJobId());
    }

    public OptimizationProposalEntity getProposal(Long id) {
        return proposalRepository.findById(id)
            .orElseThrow(() -> new ApiException("PROPOSAL_NOT_FOUND", "优化建议不存在"));
    }

    public OptimizationProposalEntity applyProposal(Long id) {
        OptimizationProposalEntity proposal = getProposal(id);
        if (!"GENERATED".equals(proposal.getStatus())) {
            throw new ApiException("PROPOSAL_NOT_APPLICABLE", "只能应用已生成的建议");
        }

        Long reportId = proposal.getAnalysisReportId();
        AnalysisReportEntity report = analysisReportRepository.findById(reportId)
            .orElseThrow(() -> new ApiException("REPORT_NOT_FOUND", "分析报告不存在"));

        ResumeEntity resume = resumeService.get(report.getResumeId());
        String resumeJson = resume.getResumeData();

        try {
            List<ResumeChange> changes = objectMapper.readValue(
                proposal.getChanges(), new TypeReference<List<ResumeChange>>() {}
            );

            ValidationResult result = validator.validate(resumeJson, changes);

            // Apply validated changes to resume data (simple string replacement)
            String updatedResume = resumeJson;
            for (ResumeChange change : result.applied()) {
                if (change.action() == ChangeAction.REPLACE && change.original() != null) {
                    updatedResume = updatedResume.replace(change.original(), change.value());
                }
            }

            resumeService.update(resume.getId(), resume.getTitle(), updatedResume);

            String appliedJson = objectMapper.writeValueAsString(result.applied());
            String rejectedJson = objectMapper.writeValueAsString(result.rejected());
            proposal.apply(appliedJson, rejectedJson, updatedResume);
            return proposalRepository.save(proposal);

        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException("APPLY_FAILED", "应用优化建议失败: " + ex.getMessage());
        }
    }
}
