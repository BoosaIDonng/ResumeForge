# Task 2 后端通用层与配置执行报告

## 已完成

- 新增后端通用响应封装：
  - `backend/src/main/java/com/example/airesume/common/ApiResponse.java`
- 新增业务异常：
  - `backend/src/main/java/com/example/airesume/common/ApiException.java`
- 新增全局异常处理：
  - `backend/src/main/java/com/example/airesume/common/GlobalExceptionHandler.java`
- 新增访客用户常量：
  - `backend/src/main/java/com/example/airesume/common/GuestUser.java`
- 新增本地开发配置：
  - `backend/src/main/resources/application.yml`
- 新增异常处理测试：
  - `backend/src/test/java/com/example/airesume/common/GlobalExceptionHandlerTest.java`

## TDD 记录

- 先写入 `GlobalExceptionHandlerTest`。
- 首次运行 `GlobalExceptionHandlerTest` 失败，原因是 `GlobalExceptionHandler`、`ApiResponse` 和 `ApiException` 尚不存在。
- 实现通用层后重新运行测试，测试通过。

## opencode 协作

- 原计划让 `opencode` 生成简单 common 类和配置文件。
- `opencode` 命令两次超时。
- 第一次超时后留下了部分实现文件；我审查时发现 `GlobalExceptionHandler.java` 中中文提示被写成乱码，并且字符串损坏。
- 第二次尝试让 `opencode` 只做测试侧验证，但它仍然超时，且文件再次出现乱码。
- 最终处理方式：Task 2 不再依赖 `opencode` 结果，由我重写损坏文件并完成验证。

## 验证结果

- `mvn -Dtest=GlobalExceptionHandlerTest test`：通过，1 个测试，0 失败。
- `mvn test`：通过，1 个测试，0 失败。
- `git diff --check`：通过；仅出现 Windows 行尾提示，不是 diff 空白错误。

## 中文与 Unicode 完整性检查

- 已发现并修复 `GlobalExceptionHandler.java` 中由 `opencode` 写入的中文乱码。
- 修复后的中文字符串为 `请求参数不合法`，语义与计划一致。
- 文本乱码标记扫描无输出。
- 隐藏 Unicode 字符扫描无输出。

## 注意事项

- 当前机器仍未安装全局 `mvn`，本次继续使用临时 Maven 3.9.9 执行验证。
- 后续继续让 `opencode` 做测试时，需要限制为只读命令；如果它再次超时或改写文件，应停止使用它处理当前任务。
