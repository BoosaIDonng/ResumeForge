package com.example.airesume.import_;

import com.example.airesume.ai.AiClient;
import com.example.airesume.ai.AiClientFactory;
import com.example.airesume.ai.PromptType;
import com.example.airesume.common.ApiException;
import java.io.InputStream;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocxImportService {
    private static final Logger log = LoggerFactory.getLogger(DocxImportService.class);
    private final AiClientFactory clientFactory;

    public DocxImportService(AiClientFactory clientFactory) {
        this.clientFactory = clientFactory;
    }

    /**
     * Extract text from a DOCX file, then use AI to parse it into structured resume JSON.
     */
    public String parseDocx(MultipartFile file, String provider, String apiKey, String baseUrl, String model) {
        String text = extractText(file);
        if (text.isBlank()) {
            throw new ApiException("EMPTY_DOCX", "DOCX 文件内容为空");
        }

        AiClient client = clientFactory.create(provider, apiKey, baseUrl, model);

        String systemPrompt = """
            你是一位简历解析专家。请将以下从 DOCX 文件提取的纯文本解析为结构化的简历 JSON 数据。

            必须返回以下 JSON 格式：
            {
              "basics": {"name":"","jobTitle":"","email":"","phone":"","location":"","summary":"","website":"","linkedin":"","github":"","customFields":{}},
              "sections": {
                "profiles":{"visible":true,"items":[]},
                "experience":{"visible":true,"items":[{"company":"","position":"","startDate":"","endDate":"","summary":"","highlights":[]}]},
                "projects":{"visible":true,"items":[{"name":"","description":"","url":"","startDate":"","endDate":"","highlights":[]}]},
                "education":{"visible":true,"items":[{"institution":"","area":"","studyType":"","startDate":"","endDate":""}]},
                "skills":{"visible":true,"items":[{"name":"","level":"","keywords":[]}]},
                "languages":{"visible":true,"items":[{"name":"","level":""}]},
                "certifications":{"visible":true,"items":[{"name":"","issuer":"","date":""}]},
                "awards":{"visible":true,"items":[{"title":"","date":"","awarder":""}]}
              },
              "customSections":[]
            }

            规则：
            1. 从文本中提取所有可识别的信息填入对应字段
            2. 日期格式统一为 YYYY-MM-DD 或 YYYY-MM
            3. 无法识别的字段留空字符串
            4. highlights 是字符串数组
            5. 不要编造信息，只提取文本中明确存在的内容
            """;

        try {
            return client.completeJson(PromptType.RESUME_PARSE, systemPrompt, text);
        } catch (Exception e) {
            log.error("DOCX AI parsing failed", e);
            throw new ApiException("DOCX_PARSE_FAILED", "DOCX 解析失败: " + e.getMessage());
        }
    }

    private String extractText(MultipartFile file) {
        try (InputStream is = file.getInputStream(); XWPFDocument doc = new XWPFDocument(is)) {
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph para : doc.getParagraphs()) {
                String text = para.getText();
                if (text != null && !text.isBlank()) {
                    sb.append(text).append("\n");
                }
            }
            // Also extract text from tables
            doc.getTables().forEach(table -> {
                table.getRows().forEach(row -> {
                    row.getTableCells().forEach(cell -> {
                        sb.append(cell.getText()).append("\t");
                    });
                    sb.append("\n");
                });
            });
            return sb.toString().trim();
        } catch (Exception e) {
            log.error("Failed to extract text from DOCX", e);
            throw new ApiException("DOCX_READ_FAILED", "无法读取 DOCX 文件: " + e.getMessage());
        }
    }
}
