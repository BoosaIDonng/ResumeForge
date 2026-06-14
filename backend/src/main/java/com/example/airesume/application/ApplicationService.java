package com.example.airesume.application;

import com.example.airesume.common.ApiException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ApplicationService {
    private final ApplicationRepository repository;

    public ApplicationService(ApplicationRepository repository) {
        this.repository = repository;
    }

    public ApplicationEntity create(Long resumeId, Long jobId, String company, String position,
                                    ApplicationStatus status, LocalDate appliedDate,
                                    String salaryRange, String jobUrl, String contactPerson, String notes) {
        return repository.save(new ApplicationEntity(resumeId, jobId, company, position,
                status, appliedDate, salaryRange, jobUrl, contactPerson, notes));
    }

    public List<ApplicationEntity> listAll() {
        return repository.findAll();
    }

    public List<ApplicationEntity> listByResume(Long resumeId) {
        return repository.findByResumeId(resumeId);
    }

    public List<ApplicationEntity> listByStatus(ApplicationStatus status) {
        return repository.findByStatus(status);
    }

    public ApplicationEntity get(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ApiException("APPLICATION_NOT_FOUND", "Application not found"));
    }

    public ApplicationEntity update(Long id, String company, String position,
                                    ApplicationStatus status, LocalDate appliedDate,
                                    String salaryRange, String jobUrl, String contactPerson, String notes) {
        ApplicationEntity entity = get(id);
        entity.update(company, position, status, appliedDate, salaryRange, jobUrl, contactPerson, notes);
        return repository.save(entity);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ApiException("APPLICATION_NOT_FOUND", "Application not found");
        }
        repository.deleteById(id);
    }

    public Map<String, Long> getStats() {
        List<Object[]> results = repository.countByStatus();
        Map<String, Long> stats = new LinkedHashMap<>();
        for (ApplicationStatus s : ApplicationStatus.values()) {
            stats.put(s.name(), 0L);
        }
        for (Object[] row : results) {
            ApplicationStatus status = (ApplicationStatus) row[0];
            Long count = (Long) row[1];
            stats.put(status.name(), count);
        }
        stats.put("total", repository.count());
        return stats;
    }
}
