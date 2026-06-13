# AI 简历优化与模拟面试平台设计文档

## 目标

本项目建设一个可放入简历的全栈 AI 应用：用户维护一份结构化主简历，粘贴目标岗位 JD 后，系统生成 ATS/JD 匹配报告、安全优化建议和模拟面试反馈。项目重点展示 Java 后端工程能力、AI 工作流设计能力，以及把简历优化和模拟面试放进同一产品闭环的能力。

第一版不追求完整商业化平台。它先完成“简历编辑 -> JD 分析 -> 优化预览 -> 文本面试 -> 面试报告”的核心路径。登录、复杂模板编辑、语音面试和 Docker 部署不进入第一版范围。

## 参考项目映射

### JadeAI

JadeAI 作为主产品参考。它已经把简历、JD 分析、模拟面试和面试报告放在同一个产品里。我们参考它的产品边界和数据结构，不直接复用它的 Next.js API 后端。

可迁移能力：

- 简历结构：个人信息、总结、工作经历、教育经历、技能、项目经历、自定义模块。
- JD 分析输出：综合匹配分、ATS 分、命中关键词、缺失关键词、优化建议和总结。
- 面试结构：面试会话、面试轮次、面试消息、面试报告。
- 面试官类型：HR、技术、场景设计、行为面试、项目深挖和管理视角。

### Resume Matcher

Resume Matcher 是 JD 匹配和安全优化的核心参考。它最有价值的地方不是简单打分，而是让 LLM 只输出可验证的修改建议，再由后端决定是否应用。

可迁移能力：

- Master Resume 作为事实来源。
- AI 输出 `ResumeChange`，而不是直接返回一份完整重写后的简历。
- 每条修改包含 `path`、`action`、`original`、`value` 和 `reason`。
- 后端校验路径白名单、禁改字段、原文匹配和技能来源。
- 拒绝虚构公司、学历、职位、技能、证书和未经支持的指标。
- 统计优化前后关键词匹配率、缺失关键词和可安全注入关键词。

### reactive-resume

reactive-resume 作为简历编辑器和简历 JSON 模型参考。第一版不照搬它的完整模板系统，但采用“结构化 JSON + 元数据 + Patch 预览”的思路。

可迁移能力：

- 简历以 JSON 存储，包含 `basics`、`summary`、`sections`、`customSections` 和 `metadata`。
- 模板、布局、字体、颜色等设计信息放入 `metadata`。
- AI 修改先生成 Patch Proposal，前端展示 before/after，用户确认后应用。

### ai_mock_interviews

ai_mock_interviews 作为模拟面试流程参考。第一版先做文本面试，保留语音面试扩展点。

可迁移能力：

- 根据岗位、级别、技术栈、面试类型和题目数量生成问题。
- 保存面试问题、用户回答和完整 transcript。
- 基于 transcript 生成反馈报告。
- 反馈报告包含总分、分类评分、优势、改进点和最终评价。

## 第一版范围

第一版必须完成这些能力：

- 创建和编辑结构化简历。
- 保存主简历和目标岗位 JD。
- 提交异步 JD 分析任务。
- 展示 ATS 分数、综合匹配分、关键词命中、缺失关键词和优化建议。
- 生成安全优化建议，支持预览和应用。
- 根据简历和 JD 创建文本模拟面试。
- 保存问题、回答和 transcript。
- 生成面试反馈报告。
- 使用 RabbitMQ 执行 AI 分析任务，使用 Redis 保存任务进度。
- 后端只适配 OpenAI-compatible API。

第一版暂不做这些能力：

- 登录、注册、RBAC 和多租户。
- 语音面试、实时通话和 Vapi 接入。
- 完整拖拽式简历模板编辑器。
- 支付、订阅、团队协作和岗位投递管理。
- Docker 部署亮点包装。

## 技术栈

后端使用 Spring Boot、MySQL、Redis 和 RabbitMQ。Spring Boot 负责 REST API、业务服务、AI Provider 适配、任务生产消费和数据校验。MySQL 存储简历、JD、报告、优化建议、面试会话和 AI 调用日志。Redis 存储任务进度、短期状态和 SSE 推送状态。RabbitMQ 承载耗时 AI 任务。

前端使用 Next.js、TypeScript、Tailwind CSS 和 shadcn/ui。前端只负责交互、状态展示和 API 调用，不再承担核心业务规则。简历编辑器第一版采用表单化结构编辑，后续再升级成更完整的模板编辑器。

AI 层只实现 OpenAI-compatible Chat Completions 接口。配置项包含 `baseUrl`、`apiKey`、`model`、`temperature` 和 `maxTokens`。这样可以连接 DeepSeek、OpenAI、OpenRouter 或其他兼容服务。

## 后端模块

### resume

`resume` 模块管理简历 CRUD、主简历标记、简历 JSON 数据和版本记录。简历数据以 JSON 存储，但后端提供 DTO 校验核心字段，避免前端传入不可控结构。

核心能力：

- 创建默认简历。
- 更新结构化简历数据。
- 读取简历详情。
- 复制简历版本。
- 将简历转换为 AI 分析用纯文本。

### job

`job` 模块管理目标岗位 JD。用户可以粘贴 JD，系统保存岗位标题、公司名、JD 原文和抽取后的关键词。

核心能力：

- 创建岗位记录。
- 更新 JD。
- 提取岗位关键词。
- 查询某份简历关联的岗位列表。

### analysis

`analysis` 模块负责 JD 匹配和 ATS 评分。它读取简历和 JD，创建 AI 任务，任务完成后保存结构化报告。

报告字段：

- `overallScore`：综合匹配分，0-100。
- `atsScore`：ATS 友好度，0-100。
- `keywordMatches`：已命中关键词。
- `missingKeywords`：缺失关键词。
- `suggestions`：按简历模块组织的优化建议。
- `summary`：整体评价。

### optimization

`optimization` 模块是后端亮点。它不允许 AI 直接覆盖整份简历，而是要求 AI 生成可校验的修改建议。

支持的修改动作：

- `replace`：替换某个文本字段。
- `append`：给经历描述、项目描述或技能列表追加内容。
- `reorder`：调整已有列表顺序。
- `add_skill`：添加主简历已支持的技能。

校验规则：

- 只允许修改白名单路径，例如总结、经历描述、项目描述和技能列表。
- 禁止修改姓名、邮箱、电话、公司名、学校名、职位名、学历、时间、地点和链接。
- `replace` 必须校验 `original` 与当前简历原文一致。
- `add_skill` 必须确认该技能或同义变体已存在于主简历事实来源中。
- 禁止新增未经支持的量化指标、雇主、证书和项目成果。
- 校验失败的修改进入 rejected 列表，前端展示拒绝原因。

### interview

`interview` 模块管理文本模拟面试。第一版按“生成题目 -> 用户逐题回答 -> 生成报告”的流程实现。

核心能力：

- 基于简历、JD、岗位、级别、技术栈和面试类型生成问题。
- 保存面试会话和问题列表。
- 保存候选人回答。
- 基于 transcript 生成面试反馈。
- 展示维度评分、逐题评价、优势、短板和改进计划。

### ai

`ai` 模块封装 OpenAI-compatible Provider。业务模块不能直接拼 HTTP 请求，必须通过 AI 服务调用。

核心能力：

- 统一构造 Chat Completions 请求。
- 支持 JSON-only 输出约束。
- 解析和校验结构化响应。
- 记录 AI 调用日志。
- 处理超时、限流、格式错误和 Provider 错误。

### task

`task` 模块管理异步任务。所有耗时 AI 流程都走任务表和 RabbitMQ。

任务类型：

- `JD_ANALYSIS`
- `OPTIMIZATION_PROPOSAL`
- `INTERVIEW_QUESTION_GENERATION`
- `INTERVIEW_FEEDBACK`

任务状态：

- `PENDING`
- `RUNNING`
- `SUCCEEDED`
- `FAILED`

任务流程：

```text
Frontend submit task
-> Spring Boot API creates ai_task in MySQL
-> Spring Boot publishes RabbitMQ message
-> Worker consumes message
-> Worker updates Redis progress
-> Worker calls AI adapter
-> Worker saves result in MySQL
-> Worker marks task SUCCEEDED or FAILED
-> Frontend reads progress by SSE or polling
```

## 数据模型

### resumes

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| user_id | bigint nullable | 第一版默认空或 guest，后续登录使用 |
| title | varchar | 简历标题 |
| is_master | boolean | 是否主简历 |
| resume_data | json | 结构化简历数据 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### jobs

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| resume_id | bigint | 关联简历 |
| title | varchar | 岗位标题 |
| company | varchar | 公司名，可为空 |
| description | text | JD 原文 |
| extracted_keywords | json | 抽取关键词 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### ai_tasks

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| task_type | varchar | 任务类型 |
| status | varchar | 任务状态 |
| progress | int | 进度，0-100 |
| resume_id | bigint nullable | 关联简历 |
| job_id | bigint nullable | 关联 JD |
| result_ref_type | varchar nullable | 结果类型 |
| result_ref_id | bigint nullable | 结果 ID |
| error_message | text nullable | 失败原因 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### analysis_reports

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| resume_id | bigint | 关联简历 |
| job_id | bigint | 关联 JD |
| overall_score | int | 综合匹配分 |
| ats_score | int | ATS 分 |
| keyword_matches | json | 命中关键词 |
| missing_keywords | json | 缺失关键词 |
| suggestions | json | 优化建议 |
| summary | text | 总结 |
| created_at | datetime | 创建时间 |

### optimization_proposals

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| analysis_report_id | bigint | 关联分析报告 |
| status | varchar | `PENDING_REVIEW`、`APPLIED` 或 `REJECTED` |
| changes | json | AI 生成的修改建议 |
| applied_changes | json | 已通过校验的修改 |
| rejected_changes | json | 被拒绝的修改和原因 |
| preview | json | before/after 预览 |
| created_at | datetime | 创建时间 |
| applied_at | datetime nullable | 应用时间 |

### interview_sessions

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| resume_id | bigint | 关联简历 |
| job_id | bigint nullable | 关联 JD |
| role | varchar | 面试岗位 |
| level | varchar | 级别 |
| type | varchar | 技术、行为、综合等 |
| status | varchar | `CREATED`、`IN_PROGRESS`、`COMPLETED` |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### interview_questions

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| session_id | bigint | 关联会话 |
| sort_order | int | 题目顺序 |
| question | text | 问题文本 |
| answer | text nullable | 用户回答 |
| created_at | datetime | 创建时间 |
| answered_at | datetime nullable | 回答时间 |

### interview_feedback

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| session_id | bigint | 关联会话 |
| total_score | int | 总分 |
| category_scores | json | 维度评分 |
| strengths | json | 优势 |
| areas_for_improvement | json | 改进点 |
| final_assessment | text | 最终评价 |
| created_at | datetime | 创建时间 |

### ai_call_logs

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | bigint | 主键 |
| task_id | bigint nullable | 关联任务 |
| provider | varchar | Provider 名称 |
| model | varchar | 模型名 |
| prompt_type | varchar | Prompt 类型 |
| request_tokens | int nullable | 输入 token |
| response_tokens | int nullable | 输出 token |
| status | varchar | 调用状态 |
| error_message | text nullable | 错误信息 |
| created_at | datetime | 创建时间 |

## API 设计

### Resume API

- `POST /api/resumes`：创建简历。
- `GET /api/resumes`：获取简历列表。
- `GET /api/resumes/{id}`：获取简历详情。
- `PUT /api/resumes/{id}`：更新简历。
- `POST /api/resumes/{id}/duplicate`：复制简历。

### Job API

- `POST /api/jobs`：创建 JD。
- `GET /api/resumes/{resumeId}/jobs`：获取简历关联的 JD 列表。
- `GET /api/jobs/{id}`：获取 JD 详情。
- `PUT /api/jobs/{id}`：更新 JD。

### Analysis API

- `POST /api/analysis/jd-match`：提交 JD 匹配任务。
- `GET /api/analysis/reports/{id}`：获取分析报告。
- `GET /api/tasks/{id}`：查询任务状态。
- `GET /api/tasks/{id}/events`：通过 SSE 获取任务进度。

### Optimization API

- `POST /api/optimization/proposals`：基于分析报告生成优化建议任务。
- `GET /api/optimization/proposals/{id}`：查看优化建议和预览。
- `POST /api/optimization/proposals/{id}/apply`：应用通过校验的修改。

### Interview API

- `POST /api/interviews`：创建面试会话并生成问题。
- `GET /api/interviews/{id}`：获取面试详情。
- `POST /api/interviews/{id}/answers`：提交某题回答。
- `POST /api/interviews/{id}/feedback`：生成面试反馈任务。
- `GET /api/interviews/{id}/feedback`：获取面试报告。

### AI Config API

- `GET /api/ai/config`：读取当前 AI 配置的非敏感信息。
- `PUT /api/ai/config`：更新 baseUrl、model 等配置。API Key 可以第一版放在环境变量，不通过前端保存。

## 前端页面设计

### 工作台

`/` 展示最近简历、最近 JD 分析、最近面试和任务状态。它是项目的第一屏，不做营销落地页。

主要区域：

- 简历列表入口。
- JD 分析入口。
- 优化建议待处理入口。
- 最近面试报告入口。
- 正在运行的 AI 任务进度。

### 简历编辑

`/resumes/[id]/edit` 使用分栏布局。左侧是模块导航，中间是表单编辑区，右侧是简历预览。第一版预览可以是清晰的 HTML 简历，不必须导出 PDF。

编辑模块：

- 基本信息。
- 个人总结。
- 技能。
- 工作经历。
- 项目经历。
- 教育经历。
- 自定义模块。

### JD 分析

`/jobs/[id]/analysis` 展示匹配报告。页面重点服务于决策，而不是堆叠图表。

内容：

- 综合匹配分和 ATS 分。
- 命中关键词。
- 缺失关键词。
- 分模块优化建议。
- “生成优化建议”按钮。
- “开始模拟面试”按钮。

### 优化建议预览

`/optimization/[proposalId]` 展示 AI 建议的 before/after。用户可以看到每条建议的原因、风险和校验状态。

交互：

- 逐条展开修改建议。
- 标记通过和被拒绝的修改。
- 展示被拒绝原因。
- 一键应用全部通过校验的修改。
- 应用后跳回简历编辑页。

### 模拟面试

`/interviews/[id]` 展示文本面试。第一版用逐题卡片或聊天式界面，不接入语音。

交互：

- 展示当前问题。
- 用户输入回答。
- 支持上一题和下一题。
- 保存草稿回答。
- 完成后生成反馈报告。

### 面试报告

`/interviews/[id]/report` 展示反馈结果。

内容：

- 总分。
- 维度评分。
- 逐题评价。
- 优势。
- 改进点。
- 最终评价。
- 针对简历和 JD 的后续学习建议。

## AI Prompt 与结构化输出

所有 AI 任务都要求返回 JSON。后端必须用 DTO 或 JSON Schema 校验输出，校验失败时进入失败状态，并记录原始错误。

Prompt 类型：

- `JD_ANALYSIS_PROMPT`：分析简历和 JD 匹配度。
- `OPTIMIZATION_DIFF_PROMPT`：生成安全修改建议。
- `INTERVIEW_QUESTION_PROMPT`：生成面试问题。
- `INTERVIEW_FEEDBACK_PROMPT`：基于 transcript 生成反馈报告。

Prompt 必须包含反注入规则。用户输入的 JD 和简历内容被视为数据，不允许覆盖系统指令。

## 错误处理

后端返回统一响应格式。业务错误使用明确错误码，系统错误写入日志后返回通用提示。

常见错误：

- 简历不存在。
- JD 不存在。
- AI 配置缺失。
- AI 响应不是合法 JSON。
- AI 输出未通过结构校验。
- 优化建议修改了禁改字段。
- 任务超时或 Provider 返回错误。

任务失败后，前端展示失败原因和重试按钮。重试会创建新任务，不覆盖旧任务日志。

## 测试策略

后端测试优先覆盖业务规则。

必须测试：

- 简历 CRUD。
- JD 分析任务创建。
- RabbitMQ 消息消费后的状态流转。
- AI Provider 的请求构造和错误处理。
- Optimization path whitelist。
- `replace` 原文匹配校验。
- 禁改字段拒绝。
- `add_skill` 来源校验。
- 面试问题和反馈 JSON 解析。

前端测试优先覆盖关键交互。

必须测试：

- 简历编辑表单保存。
- JD 分析任务提交。
- 任务进度展示。
- 优化建议 before/after 预览。
- 面试答题流程。
- 面试报告渲染。

## 简历亮点表述

项目完成后，简历可以这样描述：

- 基于 Spring Boot、MySQL、Redis 和 RabbitMQ 实现 AI 简历优化平台，支持简历编辑、JD 匹配、ATS 评分、优化建议和模拟面试。
- 设计 OpenAI-compatible AI 适配层，支持 DeepSeek、OpenAI、OpenRouter 等兼容服务切换。
- 使用 RabbitMQ 将 JD 分析、优化建议和面试反馈异步化，使用 Redis 实现任务进度追踪和前端状态同步。
- 实现 diff-based 简历优化引擎，限制 AI 只输出可校验修改建议，并通过路径白名单、原文匹配和事实来源校验降低虚构内容风险。
- 实现基于简历和 JD 的模拟面试流程，支持问题生成、文本回答、transcript 保存和多维度反馈报告。

## 验收标准

第一版完成时，用户应能走通以下路径：

1. 创建一份结构化简历。
2. 粘贴一个目标岗位 JD。
3. 提交 JD 分析任务并看到进度。
4. 查看 ATS/JD 匹配报告。
5. 生成优化建议并查看 before/after。
6. 应用通过校验的修改。
7. 基于同一份简历和 JD 创建模拟面试。
8. 回答面试问题。
9. 生成并查看面试反馈报告。

完成这些路径后，项目已经具备可以展示的完整闭环。后续再增加登录、PDF 导出、语音面试和更复杂的模板编辑。

## 后续扩展

登录模块可以在第二阶段加入。当前数据表预留 `user_id`，后续可以接入 JWT 或 Spring Security Session。

语音面试可以在第三阶段加入。第一版已经保存 transcript 和问题结构，后续可以接入浏览器录音、语音转文字或 Vapi 类服务。

简历模板可以逐步增强。第一版先用 HTML 预览，后续再加入 PDF 导出、多模板和布局设置。

岗位投递管理可以单独做成第四阶段。它会引入公司、投递状态、时间线和提醒，不影响第一版核心闭环。
