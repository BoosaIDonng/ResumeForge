# 新功能集成指南

> ⚠️ **等待另一个AI完成前端修复后再执行以下步骤**

## 新增文件清单

### 后端 (8 个新文件)
| 文件 | 功能 |
|------|------|
| `ai/optimize/AiSectionOptimizeController.java` | POST /api/ai/optimize-section |
| `ai/optimize/AiSectionOptimizeService.java` | 逐栏AI优化服务 |
| `ai/optimize/SectionOptimizeRequest.java` | 请求DTO |
| `ai/optimize/SectionOptimizeResponse.java` | 响应DTO |
| `ai/quality/AiQualityScoreController.java` | GET /api/resumes/{id}/quality-score |
| `ai/quality/AiQualityScoreService.java` | 独立质量评分服务 |
| `ai/quality/QualityScoreResponse.java` | 响应DTO |
| `import_/DocxImportService.java` | DOCX文件解析(Apache POI + AI) |
| `import_/ImportController.java` | POST /api/import/docx |
| `version/VersionEntity.java` | 版本历史实体 |
| `version/VersionRepository.java` | 版本仓库 |
| `version/VersionService.java` | 版本管理服务 |
| `version/VersionController.java` | 版本API |
| `db/migration/V10__create_resume_versions_table.sql` | Flyway迁移 |

### 前端 (5 个新文件)
| 文件 | 功能 |
|------|------|
| `lib/ai-api.ts` | 新API函数(不与api.ts冲突) |
| `components/ai/SectionOptimizeButton.tsx` | 逐栏AI优化按钮+弹窗 |
| `components/ai/QualityScorePanel.tsx` | 简历质量评分面板 |
| `components/ai/VersionHistoryPanel.tsx` | 版本历史面板 |
| `components/ai/DocxImportButton.tsx` | DOCX导入按钮 |

### 已修改文件 (1 个)
| 文件 | 改动 |
|------|------|
| `ai/PromptType.java` | 新增 SECTION_OPTIMIZE, QUALITY_SCORE, DOCX_PARSE |

---

## 集成步骤（等另一个AI完成后执行）

### 步骤 1: 在编辑页面添加 AI 工具栏

在 `frontend/app/resumes/[id]/edit/page.tsx` 中添加：

```tsx
import AiToolbar from '@/components/ai/AiToolbar';
import QualityScorePanel from '@/components/ai/QualityScorePanel';
import VersionHistoryPanel from '@/components/ai/VersionHistoryPanel';
```

在页面布局中合适位置插入这些组件。

### 步骤 2: 在仪表盘添加 DOCX 导入

在 `frontend/app/page.tsx` 中添加：

```tsx
import DocxImportButton from '@/components/ai/DocxImportButton';
```

在"新建简历"按钮旁边放 `<DocxImportButton />`。

### 步骤 3: 在 ResumeForm 中添加逐栏优化

在 `frontend/components/resume/ResumeForm.tsx` 中，为每个 section 的编辑区域添加：

```tsx
import SectionOptimizeButton from '@/components/ai/SectionOptimizeButton';

// 在每个 section 的编辑区域旁添加：
<SectionOptimizeButton
  sectionType="experience"
  currentContent={JSON.stringify(item)}
  onApply={(optimized) => {
    // 解析优化结果并更新对应字段
    const parsed = JSON.parse(optimized);
    updateItem('experience', index, parsed);
  }}
/>
```

### 步骤 4: 验证新API端点

```bash
# 测试逐栏优化
curl -X POST http://localhost:8080/api/ai/optimize-section \
  -H "Content-Type: application/json" \
  -d '{"sectionType":"summary","currentContent":"我是一个Java开发","goal":"improve_writing"}'

# 测试质量评分
curl http://localhost:8080/api/resumes/1/quality-score

# 测试版本历史
curl http://localhost:8080/api/resumes/1/versions

# 测试DOCX导入
curl -X POST http://localhost:8080/api/import/docx -F "file=@resume.docx"
```

---

## 新API端点汇总

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/ai/optimize-section` | 逐栏AI优化 |
| GET | `/api/resumes/{id}/quality-score` | 独立质量评分 |
| POST | `/api/resumes/{id}/versions` | 创建版本快照 |
| GET | `/api/resumes/{id}/versions` | 获取版本列表 |
| POST | `/api/resumes/{id}/versions/{vid}/restore` | 恢复到指定版本 |
| POST | `/api/import/docx` | DOCX文件导入 |
