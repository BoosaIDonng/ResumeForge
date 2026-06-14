# AI 助手核心功能可用性测试方案

## 1. 测试范围

| 功能模块 | 端点 | 请求格式 | 正常可用标准 |
|---------|------|---------|------------|
| 语法检查 | `POST /api/ai/grammar-check` | JSON `{resumeId}` | 返回评分+问题列表，问题包含type/severity/suggestion |
| AI优化 | `POST /api/ai/optimize-section` | JSON `{sectionType,currentContent,goal}` | 返回优化后文本+修改详情+评分变化 |
| 解析简历 | `POST /api/ai/parse-resume` | multipart/form-data (PDF) | 返回完整ResumeData，包含basics/experience/education/skills |

## 2. 测试用例

### 2.1 语法检查 (Grammar Check)

| 用例ID | 输入 | 预期结果 |
|--------|------|---------|
| G1 | 测试简历（含口语化summary） | API连通，返回score字段 |
| G2 | 同上 | issues数组中每个元素包含type/severity/suggestion |
| G3 | 同上 | summary中的口语化表达（"做了很多年"、"会很多东西"）被检测 |

### 2.2 AI优化 (Section Optimize)

| 用例ID | sectionType | goal | 输入文本 | 预期结果 |
|--------|------------|------|---------|---------|
| O1 | summary | improve_writing | "我是一个Java开发，做了很多年，会很多东西..." | 返回更专业的表达 |
| O2 | experience | quantify_achievements | "做后端开发，写了接口，改了bug..." | 返回含数字/指标的描述 |
| O3 | summary | make_concise | 同O1 | 返回更精炼的版本 |
| O4 | experience | add_keywords | "做后端开发，写了接口，改了bug" | 返回含行业关键词的文本 |
| O5 | summary | tailor_jd | "我是一个Java开发..." + JD | 返回针对JD优化的内容 |
| O6 | — | — | 检查O1响应 | scoreBefore和scoreAfter字段存在 |

### 2.3 解析简历 (Resume Parse)

| 用例ID | 输入 | 预期结果 |
|--------|------|---------|
| P1 | 真实PDF简历文件 | 返回ResumeData，basics.name非空 |
| P2 | 同上 | sections中包含experience/education/skills |
| P3 | 非PDF文件（如.txt） | 返回success=false，正确拒绝 |

## 3. 执行方法

### Windows PowerShell
```powershell
# 确保后端已启动
cd C:\Users\35456\Desktop\AI
powershell -ExecutionPolicy Bypass -File test-ai-features.ps1

# 指定PDF文件路径
powershell -ExecutionPolicy Bypass -File test-ai-features.ps1 -PdfPath "C:\path\to\resume.pdf"
```

### Linux/Mac Bash
```bash
cd ~/Desktop/AI
chmod +x test-ai-features.sh
./test-ai-features.sh
```

## 4. 判定标准

| 等级 | 通过率 | 含义 |
|------|--------|------|
| ✓ 正常 | 100% | 所有功能完全可用 |
| ⚠ 基本可用 | ≥ 80% | 核心功能正常，个别边缘用例失败 |
| ✗ 异常 | < 80% | 存在功能不可用，需排查 |

## 5. 测试报告模板

```
┌──────────────────────────────────────────────┐
│          AI 助手核心功能测试报告              │
├──────────────┬──────┬──────┬─────────────────┤
│  功能模块     │ 通过 │ 失败 │ 状态            │
├──────────────┼──────┼──────┼─────────────────┤
│  语法检查     │  N   │  N   │  ✓/✗            │
│  AI优化       │  N   │  N   │  ✓/✗            │
│  解析简历     │  N   │  N   │  ✓/✗            │
├──────────────┼──────┼──────┤                 │
│  合计         │  N   │  N   │  通过率: XX%    │
└──────────────┴──────┴──────┴─────────────────┘
```

## 6. 前置条件

1. 后端已启动并监听 `http://localhost:8080`
2. AI服务已配置（`application.yml` 中的 `ai.api-key` 和 `ai.base-url`）
3. MySQL 数据库已启动，Flyway 迁移已执行
4. （可选）测试PDF文件已准备
