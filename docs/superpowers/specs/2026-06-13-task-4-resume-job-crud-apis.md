# Task 4 简历与岗位 CRUD API 执行报告

## 已完成

- 新增简历服务、控制器和 DTO：
  - `backend/src/main/java/com/example/airesume/resume/ResumeService.java`
  - `backend/src/main/java/com/example/airesume/resume/ResumeController.java`
  - `backend/src/main/java/com/example/airesume/resume/dto/CreateResumeRequest.java`
  - `backend/src/main/java/com/example/airesume/resume/dto/UpdateResumeRequest.java`
  - `backend/src/main/java/com/example/airesume/resume/dto/ResumeResponse.java`
- 新增岗位服务、控制器和 DTO：
  - `backend/src/main/java/com/example/airesume/job/JobService.java`
  - `backend/src/main/java/com/example/airesume/job/JobController.java`
  - `backend/src/main/java/com/example/airesume/job/dto/CreateJobRequest.java`
  - `backend/src/main/java/com/example/airesume/job/dto/UpdateJobRequest.java`
  - `backend/src/main/java/com/example/airesume/job/dto/JobResponse.java`
- 扩展岗位仓库：
  - `backend/src/main/java/com/example/airesume/job/JobRepository.java`
  - 新增 `findByResumeId(Long resumeId)`。
- 新增服务测试：
  - `backend/src/test/java/com/example/airesume/resume/ResumeServiceTest.java`
  - `backend/src/test/java/com/example/airesume/job/JobServiceTest.java`
- 调整既有测试以适配新增 Controller/Service：
  - `AiResumeApplicationContextTest` 为无数据库上下文提供 mock repository。
  - `GlobalExceptionHandlerMvcTest` 将 WebMvc slice 限定到测试控制器。

## TDD 记录

- 先写 `ResumeServiceTest` 和 `JobServiceTest`。
- 首次运行 `mvn -Dtest=ResumeServiceTest,JobServiceTest test` 失败，原因是 `ResumeService`、`JobService` 和 `JobRepository.findByResumeId` 尚不存在。
- 实现服务、DTO、控制器和仓库方法后，指定测试通过。

## API 覆盖

- `POST /api/resumes`
- `GET /api/resumes`
- `GET /api/resumes/{id}`
- `PUT /api/resumes/{id}`
- `POST /api/jobs`
- `GET /api/resumes/{resumeId}/jobs`
- `GET /api/jobs/{id}`
- `PUT /api/jobs/{id}`

## 验证结果

- `tools/apache-maven-3.9.16/bin/mvn.cmd -Dtest=ResumeServiceTest,JobServiceTest test`：通过，9 个测试，0 失败。
- `tools/apache-maven-3.9.16/bin/mvn.cmd test`：通过，34 个测试，0 失败。
- `git diff --check`：通过，仅有 Git 的 LF/CRLF 工作区提示，无空白错误。

## 中文与 Unicode 完整性检查

- 扫描 `README.md`、`backend/src`、`frontend/app`、`frontend/src`、`frontend/package.json`、`frontend/tsconfig.json`、`docs` 中的文本文件：未发现工作区指令列出的常见乱码标记。
- 未发现双向控制字符、零宽字符、BOM、全角空格等隐藏 Unicode 字符。
- 复核本轮新增和触碰文件中的中文字符串，语义正常：
  - `简历不存在`
  - `岗位不存在`
  - `Java 后端工程师简历`
  - `请求参数不合法`
  - `测试异常`
  - `名称不能为空`

## 注意事项

- 本轮未执行提交。
- 当前工作区仍包含 Task 1/2/3 相关改动和未跟踪文件，提交前需要按任务范围分批 staging。
