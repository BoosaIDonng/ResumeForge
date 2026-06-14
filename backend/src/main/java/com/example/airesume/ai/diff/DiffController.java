package com.example.airesume.ai.diff;

import com.example.airesume.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/diff")
public class DiffController {
    private final ResumeDiffService diffService;

    public DiffController(ResumeDiffService diffService) {
        this.diffService = diffService;
    }

    @PostMapping("/apply")
    public ApiResponse<DiffApplyResult> apply(@Valid @RequestBody DiffApplyRequest request) {
        DiffApplyResult result = diffService.applyChangesToResume(
            request.resumeId(), request.changes()
        );
        return ApiResponse.ok(result);
    }
}
