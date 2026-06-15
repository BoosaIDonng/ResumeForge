# AI 简历优化与模拟面试平台

基于 Spring Boot 和 Next.js 的全功能 AI 简历平台。支持结构化简历编辑、JD 匹配分析、ATS 评分、智能优化建议、多人格模拟面试、求职信生成、PDF 导出和 AI 聊天助手。

融合了 4 个参考项目（ai_mock_interviews、Resume-Matcher、JadeAI、reactive-resume）的核心技术，用 Java 后端重新实现。

## 架构特点

- **零数据库**：所有数据存储在浏览器 localStorage，无需 MySQL/Redis/RabbitMQ
- **零登录**：无需用户注册，打开即用
- **零配置部署**：后端仅需 AI API Key 即可启动
- **纯 AI 代理**：后端仅负责 AI 调用、文件解析、PDF/DOCX 导出
- **数据自主**：支持导出/导入 JSON 备份，数据完全在用户手中

## 核心功能

| 功能 | 说明 |
|------|------|
| 简历编辑器 | 结构化 JSON 简历，分栏编辑 + 实时预览 |
| JD 匹配分析 | ATS 评分、关键词匹配、缺失技能识别 |
| 智能优化 | Diff-based 优化建议，路径白名单校验，一键应用 |
| 多人格模拟面试 | 4 种面试官（HR总监/技术专家/首席架构师/技术VP），针对性提问 |
| 面试反馈 | 多维评分 + 改进建议 |
| 求职信生成 | 支持正式/友好/自信三种语气 |
| PDF/DOCX 导出 | 3 套模板（clean/modern/minimal），中文字体嵌入，可选去AI化 |
| AI 去AI化 | 50+ 条正则规则，自动将AI腔替换为朴实表达 |
| PDF/DOCX 简历解析 | 上传文件 → AI 结构化解析 |
| AI 聊天助手 | 对话式助手，支持工具调用直接修改简历 |
| 求职跟踪 | 投递记录管理，状态筛选，统计面板 |
| 数据备份 | 一键导出/导入所有数据（JSON），支持清除重置 |
| 全局搜索 | Ctrl+K 快捷搜索简历、职位、投递、面试 |

## 技术栈

- **后端**: Spring Boot 3.3.6, Java 17, Maven（纯 AI 代理，无数据库依赖）
- **前端**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, localStorage
- **AI**: OpenAI-compatible Chat Completions（DeepSeek、OpenAI、OpenRouter 等）
- **PDF 生成**: Thymeleaf + OpenHTMLtoPDF（纯 Java，无需浏览器）
- **PDF 解析**: Apache PDFBox
- **DOCX 解析**: Apache POI

## 本地运行

### 前置条件

- Java 17+
- Node.js 18+
- AI API Key（DeepSeek/OpenAI/OpenRouter 等 OpenAI-compatible 服务）

**无需安装**：MySQL、Redis、RabbitMQ 均不需要。

### 步骤

1. 配置 AI 环境变量（**必需**，未配置则 AI 功能不可用）：

```bash
AI_BASE_URL=https://api.deepseek.com/v1   # OpenAI-compatible API 地址
AI_API_KEY=sk-xxx                          # API 密钥
AI_MODEL=deepseek-chat                     # 模型名称
```

2. 启动后端：

```powershell
cd backend
mvn spring-boot:run
```

3. 启动前端：

```powershell
cd frontend
npm install
npm run dev
```

4. 打开 `http://localhost:3000`

## 数据存储

所有用户数据存储在浏览器 `localStorage` 中，Key 前缀为 `ai_`：

| Key | 内容 |
|-----|------|
| `ai_resumes` | 简历列表（JSON） |
| `ai_jobs` | 职位列表 |
| `ai_applications` | 投递记录 |
| `ai_interviews` | 面试记录（含对话、题目、反馈） |
| `ai_versions` | 简历版本历史 |
| `ai_grammar_history` | 语法检查历史 |
| `ai_shares` | 分享链接 |

**数据备份**：设置页提供导出/导入 JSON 功能，建议定期备份。

## API 端点

### AI 相关（后端处理）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/grammar-check` | 语法检查 |
| POST | `/api/ai/jd-match` | JD 匹配分析 |
| POST | `/api/ai/optimize-section` | 段落优化 |
| POST | `/api/ai/generate-cover-letter` | 求职信生成 |
| POST | `/api/ai/generate-resume` | AI 生成简历 |
| POST | `/api/ai/translate` | 简历翻译 |
| POST | `/api/ai/chat` | AI 对话 |
| POST | `/api/ai/parse-resume` | PDF/DOCX 解析 |
| POST | `/api/ai/diff/apply` | 应用 diff 修改 |
| POST | `/api/ai/enrichment/analyze` | 简历诊断 |
| POST | `/api/ai/enrichment/enhance` | 简历增强 |
| POST | `/api/ai/enrichment/apply` | 应用增强内容 |
| POST | `/api/ai/enrichment/regenerate` | 重新生成增强内容 |
| GET | `/api/ai/config` | 获取 AI 配置 |
| PUT | `/api/ai/config` | 更新 AI 配置 |
| GET | `/api/ai/settings` | 获取 AI 设置 |
| PUT | `/api/ai/settings` | 更新 AI 设置 |

### 文件导出（后端处理）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/resumes/export/pdf` | 导出 PDF（JSON body：resumeData / title / template / refine / fitOnePage） |
| POST | `/api/resumes/export` | 通用导出（form 参数：resumeData / title / format=html\|json\|txt\|pdf\|docx） |
| GET | `/api/templates` | 获取模板列表 |

### 数据 CRUD（前端 localStorage 处理）

前端 `apiGet/apiPost/apiPut/apiDelete` 自动路由以下路径到 localStorage：

| 路径 | 说明 |
|------|------|
| `/api/resumes` | 简历 CRUD |
| `/api/jobs` | 职位 CRUD |
| `/api/applications` | 投递 CRUD |
| `/api/applications/stats` | 投递统计 |
| `/api/interviews` | 面试 CRUD |
| `/api/interviews/{id}/messages` | 面试消息 |
| `/api/interviews/{id}/feedback` | 面试反馈 |
| `/api/interviews/{id}/answers` | 面试回答 |
| `/api/interviews/{id}/chat` | 面试对话 |
| `/api/resumes/{id}/share` | 分享管理 |
| `/api/share/{token}` | 访问分享 |
| `/api/search` | 全局搜索 |

## 响应格式与错误处理

所有接口统一返回 JSON：

```json
{ "success": true, "code": "OK", "message": "success", "data": { ... } }
```

错误时 `success` 为 `false`，`code` 为错误码。全局异常处理统一兜底，不会泄露堆栈信息。

| 错误码 | HTTP | 含义 |
|--------|------|------|
| `VALIDATION_ERROR` | 400 | 请求参数校验失败（`@Valid`） |
| `MISSING_PARAM` | 400 | 缺少必需的请求参数 |
| `MISSING_PART` | 400 | 缺少必需的文件字段 |
| `INVALID_BODY` | 400 | 请求体格式错误或为空 |
| `UNSUPPORTED_FILE_TYPE` | 400 | 不支持的文件类型 |
| `EMPTY_FILE` | 400 | 上传文件为空 |
| 业务错误码（如 `OPTIMIZE_FAILED`） | 400 | AI 调用或业务处理失败 |
| `INTERNAL_ERROR` | 500 | 未预期的服务器内部错误 |

AI 配置可通过环境变量或请求头（`x-api-key` / `x-base-url` / `x-model` / `x-provider`）覆盖，请求头优先级更高。

## PDF 导出模板

- `clean` — 居中排版，经典专业风格
- `modern` — 深色头部 + 蓝色边框，创意风格
- `minimal` — 极简字母风，大量留白

添加 `refine=true` 参数可在导出前自动去除 AI 腔用词。

## 项目结构

```
backend/
├── src/main/java/com/example/airesume/
│   ├── ai/            # AI 客户端、JSON 解析、去AI化、PDF/DOCX 解析、各功能模块
│   ├── common/        # 通用组件（ApiResponse、全局异常处理）
│   └── export/        # PDF/DOCX 导出（Thymeleaf + OpenHTMLtoPDF）
├── src/main/resources/
│   ├── fonts/         # 中文字体（SimHei）
│   └── templates/export/  # PDF HTML 模板
frontend/
├── app/               # Next.js 页面
│   ├── resumes/       # 简历管理 + 编辑
│   ├── applications/  # 求职跟踪
│   ├── interviews/    # 模拟面试
│   ├── jobs/          # JD 分析
│   ├── settings/      # 设置 + 数据管理
│   └── share/         # 分享查看
├── components/        # React 组件
│   ├── ai/            # AI 功能组件（聊天、诊断、版本历史）
│   ├── dashboard/     # 首页卡片、列表
│   ├── export/        # 导出菜单、对话框
│   ├── interview/     # 面试题目、反馈报告
│   ├── resume/        # 简历编辑器、预览
│   └── ui/            # 通用 UI 组件
└── lib/               # 工具库
    ├── api.ts         # API 路由层（localStorage + 后端代理）
    ├── storage.ts     # localStorage CRUD 封装
    ├── types.ts       # TypeScript 类型定义
    ├── ai-api.ts      # AI 专用 API（版本管理、DOCX 导入）
    ├── ai-settings.ts # AI 配置管理
    └── completeness.ts # 简历完整度计算
```

## MVP 验证路径

1. 创建一份结构化简历（或上传 PDF/DOCX 自动解析）
2. 粘贴目标岗位 JD，提交分析任务
3. 查看 ATS/JD 匹配报告
4. 生成优化建议，预览 before/after
5. 应用通过校验的修改
6. 导出 PDF（选择模板 + 去AI化）
7. 基于同一简历和 JD 创建模拟面试（选择面试官人格）
8. 回答面试问题，生成反馈报告
9. 生成针对性求职信
10. 使用 AI 聊天助手微调简历细节
11. 投递记录跟踪（新增投递 → 状态流转 → 统计查看）
12. 设置页导出数据备份

## 从旧版本迁移

如果之前使用的是带数据库的版本，数据已丢失（MySQL 数据库已移除）。所有新数据从零开始，存储在浏览器 localStorage 中。建议使用设置页的"导出数据"功能定期备份。
