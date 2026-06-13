package com.example.airesume.coverletter;

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

class CoverLetterServiceTest {

    private TaskService taskService;
    private CoverLetterRepository repository;
    private CoverLetterService service;

    @BeforeEach
    void setUp() {
        taskService = mock(TaskService.class);
        repository = mock(CoverLetterRepository.class);
        service = new CoverLetterService(taskService, repository);
    }

    @Test
    void submit_createsTaskWithCorrectType() {
        AiTaskEntity task = new AiTaskEntity(TaskType.COVER_LETTER.name(), 1L, 2L);
        when(taskService.create(TaskType.COVER_LETTER, 1L, 2L)).thenReturn(task);

        AiTaskEntity result = service.submit(1L, 2L);

        assertThat(result.getTaskType()).isEqualTo(TaskType.COVER_LETTER.name());
    }

    @Test
    void get_returnsCoverLetter() {
        CoverLetterEntity entity = new CoverLetterEntity(1L, 2L, "formal", "尊敬的HR...");
        when(repository.findById(10L)).thenReturn(Optional.of(entity));

        CoverLetterEntity result = service.get(10L);

        assertThat(result.getContent()).isEqualTo("尊敬的HR...");
        assertThat(result.getTone()).isEqualTo("formal");
    }

    @Test
    void get_throwsWhenNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(99L))
            .isInstanceOf(ApiException.class)
            .hasMessage("求职信不存在");
    }
}
