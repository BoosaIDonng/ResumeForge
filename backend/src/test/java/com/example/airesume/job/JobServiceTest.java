package com.example.airesume.job;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.airesume.common.ApiException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class JobServiceTest {
    @Test
    void createsJobForResume() {
        JobRepository repository = mock(JobRepository.class);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        JobService service = new JobService(repository);

        JobEntity job = service.create(1L, "Java 后端工程师", "Acme", "需要 Spring Boot 和 Redis");

        assertThat(job.getResumeId()).isEqualTo(1L);
        assertThat(job.getTitle()).isEqualTo("Java 后端工程师");
        assertThat(job.getCompany()).isEqualTo("Acme");
        assertThat(job.getDescription()).contains("Spring Boot");
        verify(repository).save(any(JobEntity.class));
    }

    @Test
    void listsJobsByResume() {
        JobRepository repository = mock(JobRepository.class);
        JobEntity job = new JobEntity(1L, "Java 后端工程师", "Acme", "JD");
        when(repository.findByResumeId(1L)).thenReturn(List.of(job));

        JobService service = new JobService(repository);

        assertThat(service.listByResume(1L)).containsExactly(job);
    }

    @Test
    void readsExistingJob() {
        JobRepository repository = mock(JobRepository.class);
        JobEntity job = new JobEntity(1L, "Java 后端工程师", "Acme", "JD");
        when(repository.findById(2L)).thenReturn(Optional.of(job));

        JobService service = new JobService(repository);

        assertThat(service.get(2L)).isSameAs(job);
    }

    @Test
    void throwsWhenJobMissing() {
        JobRepository repository = mock(JobRepository.class);
        when(repository.findById(404L)).thenReturn(Optional.empty());

        JobService service = new JobService(repository);

        assertThatThrownBy(() -> service.get(404L))
            .isInstanceOf(ApiException.class)
            .hasMessage("岗位不存在");
    }

    @Test
    void updatesExistingJob() {
        JobRepository repository = mock(JobRepository.class);
        JobEntity job = new JobEntity(1L, "旧岗位", "旧公司", "旧 JD");
        when(repository.findById(2L)).thenReturn(Optional.of(job));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        JobService service = new JobService(repository);

        JobEntity updated = service.update(2L, "新岗位", "新公司", "新 JD");

        assertThat(updated.getTitle()).isEqualTo("新岗位");
        assertThat(updated.getCompany()).isEqualTo("新公司");
        assertThat(updated.getDescription()).isEqualTo("新 JD");
        verify(repository).save(job);
    }
}
