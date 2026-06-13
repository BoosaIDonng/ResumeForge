package com.example.airesume.optimization;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.airesume.analysis.AnalysisReportEntity;
import com.example.airesume.analysis.AnalysisReportRepository;
import com.example.airesume.common.ApiException;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeService;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskService;
import com.example.airesume.task.TaskType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OptimizationServiceTest {

    private TaskService taskService;
    private OptimizationProposalRepository proposalRepository;
    private AnalysisReportRepository analysisReportRepository;
    private OptimizationValidator validator;
    private ResumeService resumeService;
    private ObjectMapper objectMapper;
    private OptimizationService service;

    @BeforeEach
    void setUp() {
        taskService = mock(TaskService.class);
        proposalRepository = mock(OptimizationProposalRepository.class);
        analysisReportRepository = mock(AnalysisReportRepository.class);
        validator = new OptimizationValidator();
        resumeService = mock(ResumeService.class);
        objectMapper = new ObjectMapper();
        service = new OptimizationService(taskService, proposalRepository, analysisReportRepository, validator, resumeService, objectMapper);
    }

    @Test
    void submitProposal_createsTask_whenReportExists() {
        AnalysisReportEntity report = mock(AnalysisReportEntity.class);
        when(report.getResumeId()).thenReturn(1L);
        when(report.getJobId()).thenReturn(2L);
        when(analysisReportRepository.findById(10L)).thenReturn(Optional.of(report));
        AiTaskEntity task = new AiTaskEntity(TaskType.OPTIMIZATION_PROPOSAL.name(), 1L, 2L);
        when(taskService.create(TaskType.OPTIMIZATION_PROPOSAL, 1L, 2L)).thenReturn(task);

        AiTaskEntity result = service.submitProposal(10L);

        assertThat(result.getTaskType()).isEqualTo(TaskType.OPTIMIZATION_PROPOSAL.name());
    }

    @Test
    void submitProposal_throwsWhenReportNotFound() {
        when(analysisReportRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.submitProposal(999L))
            .isInstanceOf(ApiException.class)
            .hasMessage("分析报告不存在");
    }

    @Test
    void getProposal_throwsWhenNotFound() {
        when(proposalRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProposal(99L))
            .isInstanceOf(ApiException.class)
            .hasMessage("优化建议不存在");
    }

    @Test
    void applyProposal_throwsWhenStatusNotGenerated() {
        OptimizationProposalEntity proposal = new OptimizationProposalEntity(10L, "[]", "");
        // status is PENDING by default from constructor
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));

        assertThatThrownBy(() -> service.applyProposal(1L))
            .isInstanceOf(ApiException.class)
            .hasMessage("只能应用已生成的建议");
    }

    @Test
    void applyProposal_appliesValidChangesAndRejectsInvalid() {
        // Create a proposal with GENERATED status
        OptimizationProposalEntity proposal = new OptimizationProposalEntity(10L, "[]", "");
        proposal.markGenerated(
            "[{\"path\":\"summary.content\",\"action\":\"REPLACE\",\"original\":\"旧摘要\",\"value\":\"新摘要\",\"reason\":\"更精准\"},{\"path\":\"basics.name\",\"action\":\"REPLACE\",\"original\":\"张三\",\"value\":\"李四\",\"reason\":\"改名\"}]",
            ""
        );
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));

        // Set up analysis report
        AnalysisReportEntity report = mock(AnalysisReportEntity.class);
        when(report.getResumeId()).thenReturn(5L);
        when(analysisReportRepository.findById(10L)).thenReturn(Optional.of(report));

        // Resume with matching original text
        ResumeEntity resume = mock(ResumeEntity.class);
        when(resume.getId()).thenReturn(5L);
        when(resume.getTitle()).thenReturn("简历");
        when(resume.getResumeData()).thenReturn("{\"summary\":{\"content\":\"旧摘要\"},\"basics\":{\"name\":\"张三\"}}");
        when(resumeService.get(5L)).thenReturn(resume);
        when(resumeService.update(eq(5L), any(), any())).thenReturn(resume);
        when(proposalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OptimizationProposalEntity result = service.applyProposal(1L);

        assertThat(result.getStatus()).isEqualTo("APPLIED");
        verify(resumeService).update(eq(5L), eq("简历"), any(String.class));
    }

    @Test
    void applyProposal_rejectsChangesWhereOriginalNotFound() {
        OptimizationProposalEntity proposal = new OptimizationProposalEntity(10L, "[]", "");
        proposal.markGenerated(
            "[{\"path\":\"summary.content\",\"action\":\"REPLACE\",\"original\":\"不存在的文字\",\"value\":\"新内容\",\"reason\":\"测试\"}]",
            ""
        );
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));

        AnalysisReportEntity report = mock(AnalysisReportEntity.class);
        when(report.getResumeId()).thenReturn(5L);
        when(analysisReportRepository.findById(10L)).thenReturn(Optional.of(report));

        ResumeEntity resume = mock(ResumeEntity.class);
        when(resume.getId()).thenReturn(5L);
        when(resume.getTitle()).thenReturn("简历");
        when(resume.getResumeData()).thenReturn("{\"summary\":{\"content\":\"实际内容\"}}");
        when(resumeService.get(5L)).thenReturn(resume);
        when(resumeService.update(eq(5L), any(), any())).thenReturn(resume);
        when(proposalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OptimizationProposalEntity result = service.applyProposal(1L);

        assertThat(result.getStatus()).isEqualTo("APPLIED");
        // Change should be rejected (original text not found)
        assertThat(result.getRejectedChanges()).contains("原文不匹配");
    }
}
