package com.example.airesume.share;

import com.example.airesume.common.ApiException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ShareService {
    private final ShareRepository repository;

    public ShareService(ShareRepository repository) {
        this.repository = repository;
    }

    public ShareEntity enableSharing(Long resumeId, String plainPassword) {
        Optional<ShareEntity> existing = repository.findByResumeId(resumeId);
        ShareEntity share;
        if (existing.isPresent()) {
            share = existing.get();
            share.activate();
            if (plainPassword != null && !plainPassword.isBlank()) {
                share.updatePassword(hashPassword(plainPassword));
            } else {
                share.updatePassword(null);
            }
        } else {
            String hashed = (plainPassword != null && !plainPassword.isBlank())
                ? hashPassword(plainPassword)
                : null;
            share = new ShareEntity(resumeId, generateToken(), hashed);
        }
        return repository.save(share);
    }

    public ShareEntity getShareStatus(Long resumeId) {
        return repository.findByResumeId(resumeId)
            .orElseThrow(() -> new ApiException("SHARE_NOT_FOUND", "该简历未开启分享"));
    }

    public void disableSharing(Long resumeId) {
        ShareEntity share = repository.findByResumeId(resumeId)
            .orElseThrow(() -> new ApiException("SHARE_NOT_FOUND", "该简历未开启分享"));
        share.deactivate();
        repository.save(share);
    }

    public ShareEntity accessShare(String token, String plainPassword) {
        ShareEntity share = repository.findByToken(token)
            .orElseThrow(() -> new ApiException("SHARE_NOT_FOUND", "分享链接不存在或已失效"));

        if (!share.isActive()) {
            throw new ApiException("SHARE_INACTIVE", "该分享链接已关闭");
        }

        if (share.getPassword() != null && !share.getPassword().isBlank()) {
            if (plainPassword == null || plainPassword.isBlank()) {
                throw new ApiPasswordRequiredException();
            }
            if (!hashPassword(plainPassword).equals(share.getPassword())) {
                throw new ApiException("SHARE_PASSWORD_INCORRECT", "密码错误");
            }
        }

        share.incrementViewCount();
        repository.save(share);
        return share;
    }

    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
