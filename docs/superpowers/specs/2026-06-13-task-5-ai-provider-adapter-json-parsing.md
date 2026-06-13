# Task 5 Report: AI Provider Adapter And Structured JSON Parsing

## Scope

Implemented Task 5 from `docs/superpowers/plans/2026-06-13-ai-resume-platform.md`.

## Files Added

- `backend/src/main/java/com/example/airesume/ai/AiResponseFormatException.java`
- `backend/src/main/java/com/example/airesume/ai/JsonResponseParser.java`
- `backend/src/main/java/com/example/airesume/ai/AiClient.java`
- `backend/src/main/java/com/example/airesume/ai/PromptType.java`
- `backend/src/main/java/com/example/airesume/ai/AiProperties.java`
- `backend/src/main/java/com/example/airesume/ai/OpenAiCompatibleClient.java`
- `backend/src/test/java/com/example/airesume/ai/JsonResponseParserTest.java`

## Behavior Implemented

- Added a JSON-only AI response parser.
- Rejects markdown-wrapped responses before attempting Jackson parsing.
- Parses plain JSON into typed DTO/record classes.
- Added OpenAI-compatible chat completions client using configured base URL, API key, and model.
- Sends `response_format: { "type": "json_object" }`.
- Returns the first message content from the AI response.
- Throws readable API errors for empty AI responses and missing AI base URL.

## TDD Evidence

- Red: `JsonResponseParserTest` was created first and initially failed to compile because `JsonResponseParser` and `AiResponseFormatException` did not exist.
- Green: after implementation, the focused test command passed:

```powershell
& 'C:\Users\35456\Desktop\AI\tools\apache-maven-3.9.16\bin\mvn.cmd' '-Dtest=JsonResponseParserTest' test
```

Result: 2 tests, 0 failures, 0 errors.

## Fix Applied During Verification

Full backend verification initially failed because Spring could not choose a constructor for `OpenAiCompatibleClient`.

Fix:

- Added `@Autowired` to the public `OpenAiCompatibleClient(AiProperties properties)` constructor.
- Kept the package-private constructor available for tests.

## Verification

Focused Task 5 test:

```powershell
& 'C:\Users\35456\Desktop\AI\tools\apache-maven-3.9.16\bin\mvn.cmd' '-Dtest=JsonResponseParserTest' test
```

Result: 2 tests, 0 failures, 0 errors.

Full backend test suite:

```powershell
& 'C:\Users\35456\Desktop\AI\tools\apache-maven-3.9.16\bin\mvn.cmd' test
```

Result: 36 tests, 0 failures, 0 errors, build success.

Diff whitespace check:

```powershell
git diff --check
```

Result: no whitespace errors. Git only reported existing LF/CRLF warnings.

## Unicode Integrity

Task 5 files were read as UTF-8 and checked for Chinese text integrity.

Affected files:

- `backend/src/main/java/com/example/airesume/ai/JsonResponseParser.java`
- `backend/src/main/java/com/example/airesume/ai/OpenAiCompatibleClient.java`
- `backend/src/test/java/com/example/airesume/ai/JsonResponseParserTest.java`

Suspicious characters or fragments: none found.

Confirmed Chinese text:

- `AI 响应不是纯 JSON 对象`
- `AI JSON 解析失败`
- `AI 响应为空`
- `AI 服务地址未配置`
- `匹配度较高`

Suggested repair: none required.

Wider text-file scan:

- Scope: `README.md`, `backend/src`, `frontend/app`, `frontend/src`, `frontend/package.json`, `frontend/tsconfig.json`, `docs`
- Text files scanned: 66
- Mojibake/replacement-character hits: 0
- Hidden Unicode hits: 0

## Commit

No commit was created.
