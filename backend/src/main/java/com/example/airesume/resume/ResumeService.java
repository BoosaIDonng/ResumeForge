package com.example.airesume.resume;

import com.example.airesume.common.ApiException;
import com.example.airesume.common.GuestUser;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ResumeService {
    private final ResumeRepository repository;

    public ResumeService(ResumeRepository repository) {
        this.repository = repository;
    }

    public ResumeEntity create(String title, boolean master) {
        ResumeEntity entity = new ResumeEntity(
            GuestUser.ID,
            title,
            master,
            ResumeDataFactory.defaultResumeData()
        );
        return repository.save(entity);
    }

    public List<ResumeEntity> list() {
        return repository.findAll();
    }

    public ResumeEntity get(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ApiException("RESUME_NOT_FOUND", "简历不存在"));
    }

    public ResumeEntity update(Long id, String title, String resumeData) {
        ResumeEntity entity = get(id);
        entity.update(title, resumeData);
        return repository.save(entity);
    }

    public ResumeEntity duplicate(Long id) {
        ResumeEntity source = get(id);
        ResumeEntity copy = new ResumeEntity(
            source.getUserId(),
            source.getTitle() + " (副本)",
            false,
            source.getResumeData()
        );
        return repository.save(copy);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ApiException("RESUME_NOT_FOUND", "简历不存在");
        }
        repository.deleteById(id);
    }
}
