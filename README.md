# AI 简历优化与模拟面试平台

基于 Spring Boot 和 Next.js 的全功能 AI 简历平台。支持结构化简历编辑、JD 匹配分析、ATS 评分、智能优化建议、多人格模拟面试、求职信生成、PDF 导出和 AI 聊天助手。

融合了 4 个参考项目（ai_mock_interviews、Resume-Matcher、JadeAI、reactive-resume）的核心技术，用 Java 后端重新实现。

## 核心功能

| 功能 | 说明 |
|------|------|
| 简历编辑器 | 结构化 JSON 简历，分栏编辑 + 实时预览 |
| JD 匹配分析 | ATS 评分、关键词匹配、缺失技能识别 |
| 智能优化 | Diff-based 优化建议，路径白名单校验，一键应用 |
| 多人格模拟面试 | 4 种面试官（HR总监/技术专家/首席架构师/技术VP），针对性提问 |
| 面试反馈 | 多维评分 + 改进建议 |
| 求职信生成 | 支持正式/友好/自信三种语气 |
| PDF 导出 | 3 套模板（clean/modern/minimal），中文字体嵌入，可选去AI化 |
| AI 去AI化 | 50+ 条正则规则，自动将AI腔替换为朴实表达 |
| PDF 简历解析 | 上传 PDF → PDFBox 提取文本 → AI 结构化解析 |
| AI 聊天助手 | SSE 流式对话，支持工具调用直接修改简历 |
| 健壮 JSON 解析 | 5步修复流水线（strip think/fence/brute-force/repair） |

## 技术栈

- **后端**: Spring Boot 3.3.6, Java 17, Maven, MySQL, Redis, RabbitMQ, Flyway
- **前端**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **AI**: OpenAI-compatible Chat Completions（DeepSeek、OpenAI、OpenRouter 等）
- **PDF 生成**: Thymeleaf + OpenHTMLtoPDF（纯 Java，无需浏览器）
- **PDF 解析**: Apache PDFBox
- **异步任务**: RabbitMQ 队列 → TaskWorker → Redis 进度 → SSE 推送

## 本地运行

### 前置条件

- Java 17+
- Node.js 18+
- MySQL 8.x
- Redis
- RabbitMQ

### 步骤

1. 启动 MySQL、Redis 和 RabbitMQ。
2. 创建数据库：

```sql
CREATE DATABASE ai_resume CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 配置环境变量（参考 `.env.example`）：

```bash
AI_BASE_URL=https://api.deepseek.com/v1   # OpenAI-compatible API 地址
AI_API_KEY=sk-xxx                          # API 密钥
AI_MODEL=deepseek-chat                     # 模型名称
```

4. 启动后端：

```powershell
cd backend
mvn spring-boot:run
```

5. 启动前端：

```powershell
cd frontend
npm install
npm run dev
```

6. 打开 `http://localhost:3000`

## API 端点

### 简历

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/resumes` | 创建简历 |
| GET | `/api/resumes` | 列表 |
| GET | `/api/resumes/{id}` | 获取详情 |
| PUT | `/api/resumes/{id}` | 更新 |
| POST | `/api/resumes/parse-pdf` | 上传 PDF 解析为结构化数据 |
| GET | `/api/resumes/{id}/export/pdf?template=clean&refine=false` | 导出 PDF |

### 分析 & 优化

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/analysis/jd-match` | 提交 JD 分析任务 |
| GET | `/api/analysis/reports/{id}` | 获取分析报告 |
| POST | `/api/optimization/proposals` | 生成优化方案 |
| GET | `/api/optimization/proposals/{id}` | 获取方案详情 |
| POST | `/api/optimization/proposals/{id}/apply` | 应用修改 |

### 面试

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/interviews` | 创建面试（可选 persona: HR/TECHNICAL/ARCHITECTURE/LEADERSHIP） |
| GET | `/api/interviews/{id}` | 获取面试详情 |
| POST | `/api/interviews/{id}/answers` | 提交回答 |
| POST | `/api/interviews/{id}/feedback` | 生成反馈报告 |

### 求职信

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/cover-letters` | 生成求职信 |
| GET | `/api/cover-letters/{id}` | 获取求职信 |

### AI 聊天

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat/stream` | SSE 流式对话（支持简历工具调用） |

### 任务进度

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks/{id}/progress` | SSE 进度推送 |

## PDF 导出模板

- `clean` — 居中排版，经典专业风格
- `modern` — 深色头部 + 蓝色边框，创意风格
- `minimal` — 极简字母风，大量留白

添加 `refine=true` 参数可在导出前自动去除 AI 腔用词。

## 项目结构

```
backend/
├── src/main/java/com/example/airesume/
│   ├── ai/            # AI 客户端、JSON 解析、去AI化
│   ├── analysis/      # JD 分析模块
│   ├── chat/          # AI 聊天助手（SSE 流式）
│   ├── common/        # 通用组件（ApiResponse、异常处理）
│   ├── coverletter/   # 求职信生成
│   ├── export/        # PDF 导出（Thymeleaf + OpenHTMLtoPDF）
│   ├── interview/     # 模拟面试（多人格）
│   ├── job/           # 职位管理
│   ├── optimization/  # 智能优化（diff-based）
│   ├── resume/        # 简历 CRUD + PDF 解析
│   └── task/          # 异步任务（RabbitMQ + Redis + SSE）
├── src/main/resources/
│   ├── db/migration/  # Flyway 迁移脚本
│   ├── fonts/         # 中文字体（SimHei）
│   └── templates/export/  # PDF HTML 模板
frontend/
├── app/               # Next.js 页面
├── components/        # React 组件
└── lib/               # API 客户端、类型定义
```

## MVP 验证路径

1. 创建一份结构化简历（或上传 PDF 自动解析）
2. 粘贴目标岗位 JD，提交分析任务
3. 查看 ATS/JD 匹配报告
4. 生成优化建议，预览 before/after
5. 应用通过校验的修改
6. 导出 PDF（选择模板 + 去AI化）
7. 基于同一简历和 JD 创建模拟面试（选择面试官人格）
8. 回答面试问题，生成反馈报告
9. 生成针对性求职信
10. 使用 AI 聊天助手微调简历细节
