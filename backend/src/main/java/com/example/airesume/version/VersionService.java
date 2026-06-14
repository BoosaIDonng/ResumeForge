package com.example.airesume.version;

import com.example.airesume.common.ApiException;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VersionService {
    private final VersionRepository versionRepository;
    private final ResumeRepository resumeRepository;

    public VersionService(VersionRepository versionRepository, ResumeRepository resumeRepository) {
        this.versionRepository = versionRepository;
        this.resumeRepository = resumeRepository;
    }

    /**
     * Save a snapshot of the current resume state.
     */
    @Transactional
    public VersionEntity createVersion(Long resumeId, String changeDescription) {
        ResumeEntity resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new ApiException("RESUME_NOT_FOUND", "简历不存在"));

        int nextVersion = 1;
        var latest = versionRepository.findFirstByResumeIdOrderByVersionNumberDesc(resumeId);
        if (latest.isPresent()) {
            nextVersion = latest.get().getVersionNumber() + 1;
        }

        VersionEntity version = new VersionEntity(
            resumeId,
            resume.getTitle(),
            resume.getResumeData(),
            nextVersion,
            changeDescription
        );
        return versionRepository.save(version);
    }

    /**
     * List all versions for a resume (newest first).
     */
    public List<VersionEntity> listVersions(Long resumeId) {
        return versionRepository.findByResumeIdOrderByVersionNumberDesc(resumeId);
    }

    /**
     * Get a specific version.
     */
    public VersionEntity getVersion(Long versionId) {
        return versionRepository.findById(versionId)
            .orElseThrow(() -> new ApiException("VERSION_NOT_FOUND", "版本不存在"));
    }

    /**
     * Restore a resume to a specific version.
     */
    @Transactional
    public ResumeEntity restoreVersion(Long resumeId, Long versionId) {
        ResumeEntity resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new ApiException("RESUME_NOT_FOUND", "简历不存在"));
        VersionEntity version = versionRepository.findById(versionId)
            .orElseThrow(() -> new ApiException("VERSION_NOT_FOUND", "版本不存在"));

        if (!version.getResumeId().equals(resumeId)) {
            throw new ApiException("VERSION_MISMATCH", "版本不属于该简历");
        }

        // Save current state as a new version before restoring
        createVersion(resumeId, "恢复前自动备份");

        resume.update(resume.getTitle(), version.getResumeData());
        return resumeRepository.save(resume);
    }
}
