package com.example.airesume.job;

import com.example.airesume.common.ApiException;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class JobService {
    private final JobRepository repository;

    public JobService(JobRepository repository) {
        this.repository = repository;
    }

    public JobEntity create(Long resumeId, String title, String company, String description) {
        return repository.save(new JobEntity(resumeId, title, company, description));
    }

    public List<JobEntity> listByResume(Long resumeId) {
        return repository.findByResumeId(resumeId);
    }

    public JobEntity get(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ApiException("JOB_NOT_FOUND", "岗位不存在"));
    }

    public JobEntity update(Long id, String title, String company, String description) {
        JobEntity entity = get(id);
        entity.update(title, company, description);
        return repository.save(entity);
    }

    public JobEntity save(JobEntity entity) {
        return repository.save(entity);
    }
}
