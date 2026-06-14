package com.example.airesume.share;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.resume.ResumeEntity;
import com.example.airesume.resume.ResumeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ShareController {
    private final ShareService shareService;
    private final ResumeService resumeService;

    public ShareController(ShareService shareService, ResumeService resumeService) {
        this.shareService = shareService;
        this.resumeService = resumeService;
    }

    @PostMapping("/api/resumes/{id}/share")
    public ApiResponse<ShareResponse> enableSharing(
        @PathVariable Long id,
        @Valid @RequestBody EnableShareRequest request
    ) {
        resumeService.get(id);
        ShareEntity share = shareService.enableSharing(id, request.password());
        return ApiResponse.ok(ShareResponse.from(share));
    }

    @GetMapping("/api/resumes/{id}/share")
    public ApiResponse<ShareResponse> getShareStatus(@PathVariable Long id) {
        resumeService.get(id);
        ShareEntity share = shareService.getShareStatus(id);
        return ApiResponse.ok(ShareResponse.from(share));
    }

    @DeleteMapping("/api/resumes/{id}/share")
    public ApiResponse<Void> disableSharing(@PathVariable Long id) {
        resumeService.get(id);
        shareService.disableSharing(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/api/share/{token}")
    public ApiResponse<PublicShareResponse> accessShare(
        @PathVariable String token,
        @RequestParam(required = false) String password
    ) {
        ShareEntity share = shareService.accessShare(token, password);
        ResumeEntity resume = resumeService.get(share.getResumeId());
        return ApiResponse.ok(PublicShareResponse.from(share, resume));
    }

    record EnableShareRequest(String password) {}

    record ShareResponse(Long id, Long resumeId, String token, boolean hasPassword, int viewCount, boolean active) {
        static ShareResponse from(ShareEntity entity) {
            return new ShareResponse(
                entity.getId(),
                entity.getResumeId(),
                entity.getToken(),
                entity.getPassword() != null && !entity.getPassword().isBlank(),
                entity.getViewCount(),
                entity.isActive()
            );
        }
    }

    record PublicShareResponse(String title, String resumeData, String template, int viewCount) {
        static PublicShareResponse from(ShareEntity share, ResumeEntity resume) {
            return new PublicShareResponse(
                resume.getTitle(),
                resume.getResumeData(),
                "default",
                share.getViewCount()
            );
        }
    }
}
