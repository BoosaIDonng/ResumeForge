package com.example.airesume.resume;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.airesume.common.ApiException;
import com.example.airesume.common.GuestUser;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ResumeServiceTest {
    @Test
    void createsGuestMasterResume() {
        ResumeRepository repository = mock(ResumeRepository.class);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ResumeService service = new ResumeService(repository);

        ResumeEntity resume = service.create("Java 后端工程师简历", true);

        assertThat(resume.getUserId()).isEqualTo(GuestUser.ID);
        assertThat(resume.getTitle()).isEqualTo("Java 后端工程师简历");
        assertThat(resume.isMaster()).isTrue();
        assertThat(resume.getResumeData()).contains("\"sections\"");
        verify(repository).save(any(ResumeEntity.class));
    }

    @Test
    void readsExistingResume() {
        ResumeRepository repository = mock(ResumeRepository.class);
        ResumeEntity entity = new ResumeEntity(0L, "简历", true, ResumeDataFactory.defaultResumeData());
        when(repository.findById(1L)).thenReturn(Optional.of(entity));

        ResumeService service = new ResumeService(repository);

        assertThat(service.get(1L)).isSameAs(entity);
    }

    @Test
    void throwsWhenResumeMissing() {
        ResumeRepository repository = mock(ResumeRepository.class);
        when(repository.findById(404L)).thenReturn(Optional.empty());

        ResumeService service = new ResumeService(repository);

        assertThatThrownBy(() -> service.get(404L))
            .isInstanceOf(ApiException.class)
            .hasMessage("简历不存在");
    }

    @Test
    void updatesExistingResume() {
        ResumeRepository repository = mock(ResumeRepository.class);
        ResumeEntity entity = new ResumeEntity(0L, "旧简历", true, ResumeDataFactory.defaultResumeData());
        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ResumeService service = new ResumeService(repository);

        ResumeEntity updated = service.update(1L, "新简历", "{\"sections\":{}}");

        assertThat(updated.getTitle()).isEqualTo("新简历");
        assertThat(updated.getResumeData()).isEqualTo("{\"sections\":{}}");
        verify(repository).save(entity);
    }
}
