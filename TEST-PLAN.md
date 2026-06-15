# 后端 API 测试方案

> 项目已改为**零数据库架构**（纯 AI 代理，无需 MySQL/Redis/RabbitMQ）。本方案已更新。

## 测试脚本

执行 `test-ai-features.ps1`，覆盖后端实际暴露的 20 个 HTTP 端点：

- **第一轮 SMOKE**：20 端点反向冒烟（空/非法请求），识别 5xx 崩溃与缺失校验
- **第二轮 POSITIVE**：7 个核心 AI 端点正向契约（grammar-check / jd-match / optimize-section / generate-cover-letter / generate-resume / translate / chat）

## 执行

```powershell
# 后端已启动后执行
powershell -ExecutionPolicy Bypass -File test-ai-features.ps1
```

## 前置条件

1. 后端已启动：`cd backend; mvn spring-boot:run`
2. AI 环境变量已配置（`AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL`）

## 判定标准

| 等级 | SMOKE 失败数 | 含义 |
|------|-------------|------|
| 正常 | 0 | 所有端点错误处理与校验健全 |
| 基本可用 | ≤2 | 存在非核心问题 |
| 异常 | >2 | 存在崩溃或严重缺陷 |

## 报告

结果归档至 `test-report.txt`。
