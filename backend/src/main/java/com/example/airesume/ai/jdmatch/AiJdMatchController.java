package com.example.airesume.ai.jdmatch;

import com.example.airesume.common.ApiResponse;
import com.example.airesume.task.AiTaskEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiJdMatchController {
    private final AiJdMatchService jdMatchService;

    public AiJdMatchController(AiJdMatchService jdMatchService) {
        this.jdMatchService = jdMatchService;
    }

    @PostMapping("/jd-match")
    public ApiResponse<JdMatchResponse> jdMatch(
            @RequestHeader(value = "x-provider", required = false) String provider,
            @RequestHeader(value = "x-api-key", required = false) String apiKey,
            @RequestHeader(value = "x-base-url", required = false) String baseUrl,
            @RequestHeader(value = "x-model", required = false) String model,
            @Valid @RequestBody JdMatchRequest request
    ) {
        JdMatchResponse response = jdMatchService.match(
            provider, apiKey, baseUrl, model,
            request.resumeId(), request.jobDescription()
        );
        return ApiResponse.ok(response);
    }

    @PostMapping("/jd-match/async")
    public ApiResponse<TaskRef> jdMatchAsync(
            @Valid @RequestBody JdMatchRequest request
    ) {
        AiTaskEntity task = jdMatchService.submitAsync(request.resumeId(), request.jobDescription());
        return ApiResponse.ok(new TaskRef(task.getId(), task.getStatus()));
    }

    record TaskRef(Long taskId, String status) {}
}
