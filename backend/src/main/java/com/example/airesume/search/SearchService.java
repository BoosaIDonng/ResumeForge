package com.example.airesume.search;

import com.example.airesume.interview.InterviewSessionEntity;
import com.example.airesume.interview.InterviewSessionRepository;
import com.example.airesume.job.JobEntity;
import com.example.airesume.job.JobRepository;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SearchService {
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final InterviewSessionRepository interviewSessionRepository;

    public SearchService(ResumeRepository resumeRepository, JobRepository jobRepository,
                         InterviewSessionRepository interviewSessionRepository) {
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.interviewSessionRepository = interviewSessionRepository;
    }

    public List<SearchResult> search(String query) {
        List<SearchResult> results = new ArrayList<>();

        for (ResumeEntity r : resumeRepository.searchByTitle(query)) {
            results.add(new SearchResult("resume", r.getId(), r.getTitle(), null, "/api/resumes/" + r.getId()));
            if (results.size() >= 20) return results;
        }

        for (JobEntity j : jobRepository.searchByTitleOrCompany(query)) {
            String subtitle = j.getCompany() != null ? j.getCompany() : "";
            results.add(new SearchResult("job", j.getId(), j.getTitle(), subtitle, "/api/jobs/" + j.getId()));
            if (results.size() >= 20) return results;
        }

        for (InterviewSessionEntity i : interviewSessionRepository.searchByRole(query)) {
            String subtitle = i.getLevel() != null ? i.getLevel() : "";
            results.add(new SearchResult("interview", i.getId(), i.getRole(), subtitle, "/api/interviews/" + i.getId()));
            if (results.size() >= 20) return results;
        }

        return results;
    }
}
