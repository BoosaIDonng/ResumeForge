package com.example.airesume.share;

import com.example.airesume.common.ApiException;

public class ApiPasswordRequiredException extends ApiException {
    public ApiPasswordRequiredException() {
        super("SHARE_PASSWORD_REQUIRED", "请输入访问密码");
    }
}
