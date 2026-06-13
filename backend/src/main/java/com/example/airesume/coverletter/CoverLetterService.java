package com.example.airesume.coverletter;

import com.example.airesume.common.ApiException;
import com.example.airesume.task.AiTaskEntity;
import com.example.airesume.task.TaskService;
import com.example.airesume.task.TaskType;
import org.springframework.stereotype.Service;

@Service
public class CoverLetterService {
    private final TaskService taskService;
    private final CoverLetterRepository repository;

    public CoverLetterService(TaskService taskService, CoverLetterRepository repository) {
        this.taskService = taskService;
        this.repository = repository;
    }

    public AiTaskEntity submit(Long resumeId, Long jobId) {
        return taskService.create(TaskType.COVER_LETTER, resumeId, jobId);
    }

    public CoverLetterEntity get(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ApiException("COVER_LETTER_NOT_FOUND", "求职信不存在"));
    }
}
