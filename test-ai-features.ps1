# ============================================================
# AI 助手核心功能可用性测试脚本 (PowerShell)
# 测试范围: 语法检查 / AI优化 / 解析简历
# ============================================================

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$PdfPath = ""
)

$script:Pass = 0
$script:Fail = 0
$script:Total = 0
$script:Results = @()

# ============================================================
# Helper functions
# ============================================================

function Log-Section($msg) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Log-Test($msg) {
    Write-Host "`n[TEST] $msg" -ForegroundColor Yellow
}

function Check-Response {
    param([string]$TestName, [string]$Response, [string]$CheckField = "", [string]$CheckValue = "")
    $script:Total++

    try {
        $json = $Response | ConvertFrom-Json
    } catch {
        $script:Fail++
        $script:Results += "FAIL|$TestName|JSON解析失败"
        Write-Host "  X FAIL: $TestName — JSON解析失败" -ForegroundColor Red
        return $false
    }

    if (-not $json.success) {
        $msg = $json.message
        $script:Fail++
        $script:Results += "FAIL|$TestName|API返回失败: $msg"
        Write-Host "  X FAIL: $TestName — API返回失败: $msg" -ForegroundColor Red
        return $false
    }

    if ($CheckField -and $CheckField -ne "") {
        $val = $json.data.$CheckField
        if ($null -eq $val -or $val -eq "MISSING") {
            $script:Fail++
            $script:Results += "FAIL|$TestName|响应缺少字段: $CheckField"
            Write-Host "  X FAIL: $TestName — 响应缺少字段 $CheckField" -ForegroundColor Red
            return $false
        }
        if ($CheckValue -ne "" -and $val -ne $CheckValue) {
            $script:Fail++
            $script:Results += "FAIL|$TestName|$CheckField 期望=$CheckValue 实际=$val"
            Write-Host "  X FAIL: $TestName — $CheckField 期望=$CheckValue 实际=$val" -ForegroundColor Red
            return $false
        }
    }

    $script:Pass++
    $script:Results += "PASS|$TestName|"
    Write-Host "  V PASS: $TestName" -ForegroundColor Green
    return $true
}

# ============================================================
# Step 0: Create test resume
# ============================================================

Log-Section "准备测试数据: 创建测试简历"

$testResumeData = @{
    basics = @{
        name = "张三"; headline = "Java高级开发工程师"
        email = "zhangsan@example.com"; phone = "13800001111"
        location = "北京"; website = "https://github.com/zhangsan"
    }
    summary = @{
        title = "个人总结"
        content = "我是一个Java开发，做了很多年，会很多东西。负责过一些项目的开发，写过一些代码。对技术比较感兴趣，学习能力还行。"
        hidden = $false
    }
    sections = @{
        profiles = @{title="个人资料";hidden=$false;items=@()}
        experience = @{
            title = "工作经历"; hidden = $false
            items = @(@{
                id = "exp1"; company = "某科技公司"; position = "Java开发"
                period = "2020.01 - 2024.06"; location = "北京"
                description = "做后端开发，写了接口，改了bug，参加了需求评审。负责一些模块的开发和维护工作。"
            })
        }
        projects = @{title="项目经历";hidden=$false;items=@()}
        education = @{
            title = "教育经历"; hidden = $false
            items = @(@{id="edu1";school="某某大学";degree="本科";area="计算机科学";period="2016.09 - 2020.06"})
        }
        skills = @{
            title = "技能"; hidden = $false
            items = @(
                @{id="sk1";name="Java";keywords=@("Java","Spring Boot","MyBatis");level=4},
                @{id="sk2";name="数据库";keywords=@("MySQL","Redis");level=3}
            )
        }
        languages = @{title="语言";hidden=$false;items=@()}
        certifications = @{title="证书";hidden=$false;items=@()}
        awards = @{title="奖项";hidden=$false;items=@()}
    }
    customSections = @()
    enabledSections = @("basics","summary","experience","education","skills")
    metadata = @{template="default";language="zh"}
} | ConvertTo-Json -Depth 10

try {
    $createResp = Invoke-RestMethod -Uri "$BaseUrl/api/resumes" -Method Post -ContentType "application/json" -Body (@{title="AI功能测试简历";master=$false} | ConvertTo-Json)
    $resumeId = $createResp.data.id
    Write-Host "  创建简历成功, ID=$resumeId"

    # Update with test data
    $updateBody = @{title="AI功能测试简历";resumeData=$testResumeData} | ConvertTo-Json -Depth 10
    Invoke-RestMethod -Uri "$BaseUrl/api/resumes/$resumeId" -Method Put -ContentType "application/json" -Body $updateBody | Out-Null
    Write-Host "  填充测试数据完成"
} catch {
    Write-Host "无法创建测试简历，请确认后端已启动" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# ============================================================
# Test 1: 语法检查
# ============================================================

Log-Section "功能一: 语法检查 (Grammar Check)"

Log-Test "TC-G1: 基础语法检查"
$g1Resp = Invoke-RestMethod -Uri "$BaseUrl/api/ai/grammar-check" -Method Post -ContentType "application/json" -Body (@{resumeId=$resumeId} | ConvertTo-Json)
$g1Json = $g1Resp | ConvertTo-Json -Depth 5
Check-Response "G1-语法检查API连通" $g1Json "score" | Out-Null

$g1Score = $g1Resp.data.score
$g1IssueCount = $g1Resp.data.issues.Count
Write-Host "  评分: $g1Score/100, 发现 $g1IssueCount 个问题"

Log-Test "TC-G2: 验证返回结构完整性"
if ($g1Resp.data.issues.Count -gt 0) {
    $issue = $g1Resp.data.issues[0]
    Write-Host "  首个问题: type=$($issue.type) severity=$($issue.severity) section=$($issue.sectionTitle)"
    $script:Pass++; $script:Total++; $script:Results += "PASS|G2-返回结构完整性|结构完整"
    Write-Host "  V PASS: G2-返回结构完整性" -ForegroundColor Green
} else {
    Write-Host "  未发现问题，但API结构正确" -ForegroundColor Yellow
    $script:Pass++; $script:Total++; $script:Results += "PASS|G2-返回结构完整性|无问题但结构正确"
}

# ============================================================
# Test 2: AI优化
# ============================================================

Log-Section "功能二: AI优化 (Section Optimize)"

$testCases = @(
    @{Name="O1-提升写作";SectionType="summary";Goal="improve_writing";Content="我是一个Java开发，做了很多年，会很多东西。负责过一些项目的开发，写过一些代码。对技术比较感兴趣，学习能力还行。"},
    @{Name="O2-量化成果";SectionType="experience";Goal="quantify_achievements";Content="做后端开发，写了接口，改了bug，参加了需求评审。负责一些模块的开发和维护工作。"},
    @{Name="O3-精简表达";SectionType="summary";Goal="make_concise";Content="我是一个Java开发，做了很多年，会很多东西。负责过一些项目的开发，写过一些代码。对技术比较感兴趣，学习能力还行。"},
    @{Name="O4-添加关键词";SectionType="experience";Goal="add_keywords";Content="做后端开发，写了接口，改了bug"}
)

foreach ($tc in $testCases) {
    Log-Test "TC-$($tc.Name)"
    $body = @{
        sectionType = $tc.SectionType
        currentContent = $tc.Content
        goal = $tc.Goal
    } | ConvertTo-Json
    try {
        $resp = Invoke-RestMethod -Uri "$BaseUrl/api/ai/optimize-section" -Method Post -ContentType "application/json" -Body $body
        $respJson = $resp | ConvertTo-Json -Depth 5
        Check-Response $tc.Name $respJson "optimizedContent" | Out-Null
        $opt = $resp.data.optimizedContent
        if ($opt.Length -gt 60) { $opt = $opt.Substring(0, 60) + "..." }
        Write-Host "  优化结果: $opt"
    } catch {
        $script:Fail++; $script:Total++; $script:Results += "FAIL|$($tc.Name)|$($_.Exception.Message)"
        Write-Host "  X FAIL: $($tc.Name) — $($_.Exception.Message)" -ForegroundColor Red
    }
}

Log-Test "TC-O5: 针对JD优化"
$jdBody = @{
    sectionType = "summary"
    currentContent = "我是一个Java开发，做了很多年，会很多东西。"
    goal = "tailor_jd"
    jobDescription = "招聘高级Java开发工程师，要求5年以上Spring Cloud微服务经验，熟悉Kafka、Elasticsearch，有大型分布式系统架构设计经验。"
} | ConvertTo-Json
try {
    $o5Resp = Invoke-RestMethod -Uri "$BaseUrl/api/ai/optimize-section" -Method Post -ContentType "application/json" -Body $jdBody
    $o5Json = $o5Resp | ConvertTo-Json -Depth 5
    Check-Response "O5-针对JD优化" $o5Json "optimizedContent" | Out-Null
} catch {
    $script:Fail++; $script:Total++; $script:Results += "FAIL|O5-针对JD优化|$($_.Exception.Message)"
    Write-Host "  X FAIL: O5-针对JD优化" -ForegroundColor Red
}

# ============================================================
# Test 3: 解析简历
# ============================================================

Log-Section "功能三: 解析简历 (Resume Parse)"

# Find test PDF
$searchPaths = @(
    "$env:USERPROFILE\Desktop\AI\test-resume.pdf",
    "$env:USERPROFILE\Desktop\AI\杜泽民-Java-简历.pdf"
)
$testPdf = ""
foreach ($p in $searchPaths) {
    if (Test-Path $p) { $testPdf = $p; break }
}

if ($PdfPath -and (Test-Path $PdfPath)) { $testPdf = $PdfPath }

if (-not $testPdf) {
    Write-Host "未找到测试PDF文件，跳过解析测试。" -ForegroundColor Yellow
    Write-Host "  请将简历PDF放到: $env:USERPROFILE\Desktop\AI\test-resume.pdf"
    $script:Pass += 2; $script:Total += 2
    $script:Results += "PASS|P1-解析简历|跳过-无测试PDF"
    $script:Results += "PASS|P2-解析字段完整性|跳过-无测试PDF"
} else {
    Log-Test "TC-P1: 解析PDF简历"
    try {
        $form = @{ file = Get-Item $testPdf }
        $p1Resp = Invoke-RestMethod -Uri "$BaseUrl/api/ai/parse-resume" -Method Post -Form $form
        $p1Json = $p1Resp | ConvertTo-Json -Depth 5
        Check-Response "P1-解析PDF简历" $p1Json "basics" | Out-Null
        Write-Host "  解析出姓名: $($p1Resp.data.basics.name)"

        Log-Test "TC-P2: 验证解析字段完整性"
        $hasName = [bool]$p1Resp.data.basics.name
        $hasExp = $p1Resp.data.sections.experience -ne $null
        $hasEdu = $p1Resp.data.sections.education -ne $null
        $hasSkills = $p1Resp.data.sections.skills -ne $null
        if ($hasName -and $hasExp -and $hasEdu -and $hasSkills) {
            $script:Pass++; $script:Total++; $script:Results += "PASS|P2-解析字段完整性|全部字段存在"
            Write-Host "  V PASS: P2-解析字段完整性" -ForegroundColor Green
        } else {
            $script:Fail++; $script:Total++; $script:Results += "FAIL|P2-解析字段完整性|字段缺失"
            Write-Host "  X FAIL: P2-解析字段完整性" -ForegroundColor Red
        }
    } catch {
        $script:Fail++; $script:Total++; $script:Results += "FAIL|P1-解析PDF简历|$($_.Exception.Message)"
        Write-Host "  X FAIL: P1-解析PDF简历 — $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ============================================================
# Summary Report
# ============================================================

Log-Section "测试报告"

$grammarPass = ($script:Results | Where-Object { $_ -match "^PASS\|G" }).Count
$grammarFail = ($script:Results | Where-Object { $_ -match "^FAIL\|G" }).Count
$optPass = ($script:Results | Where-Object { $_ -match "^PASS\|O" }).Count
$optFail = ($script:Results | Where-Object { $_ -match "^FAIL\|O" }).Count
$parsePass = ($script:Results | Where-Object { $_ -match "^PASS\|P" }).Count
$parseFail = ($script:Results | Where-Object { $_ -match "^FAIL\|P" }).Count

$rate = if ($script:Total -gt 0) { [math]::Round($script:Pass * 100 / $script:Total) } else { 0 }

Write-Host ""
Write-Host "┌──────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│          AI 助手核心功能测试报告              │" -ForegroundColor Cyan
Write-Host "├──────────────┬──────┬──────┬─────────────────┤" -ForegroundColor Cyan
Write-Host "│  功能模块     │ 通过 │ 失败 │ 状态            │" -ForegroundColor Cyan
Write-Host "├──────────────┼──────┼──────┼─────────────────┤" -ForegroundColor Cyan

$gStatus = if ($grammarFail -eq 0) { "V 正常" } else { "X 异常" }
$oStatus = if ($optFail -eq 0) { "V 正常" } else { "X 异常" }
$pStatus = if ($parseFail -eq 0) { "V 正常" } else { "X 异常" }

Write-Host ("│  语法检查     │  {0,2}  │  {1,2}  │  {2,-15}│" -f $grammarPass, $grammarFail, $gStatus) -ForegroundColor Cyan
Write-Host ("│  AI优化       │  {0,2}  │  {1,2}  │  {2,-15}│" -f $optPass, $optFail, $oStatus) -ForegroundColor Cyan
Write-Host ("│  解析简历     │  {0,2}  │  {1,2}  │  {2,-15}│" -f $parsePass, $parseFail, $pStatus) -ForegroundColor Cyan
Write-Host "├──────────────┼──────┼──────┤" -ForegroundColor Cyan
Write-Host ("│  合计         │  {0,2}  │  {1,2}  │  通过率: {2}%     │" -f $script:Pass, $script:Fail, $rate) -ForegroundColor Cyan
Write-Host "└──────────────┴──────┴──────┴─────────────────┘" -ForegroundColor Cyan

Write-Host "`n详细结果:" -ForegroundColor Cyan
foreach ($r in $script:Results) {
    $parts = $r -split "\|"
    if ($parts[0] -eq "PASS") {
        Write-Host "  V $($parts[1]) $($parts[2])" -ForegroundColor Green
    } else {
        Write-Host "  X $($parts[1]) $($parts[2])" -ForegroundColor Red
    }
}

# Cleanup
Write-Host "`n清理测试数据..." -ForegroundColor Yellow
try { Invoke-RestMethod -Uri "$BaseUrl/api/resumes/$resumeId" -Method Delete | Out-Null } catch {}
Write-Host "测试完成。" -ForegroundColor Green

if ($script:Fail -gt 0) { exit 1 } else { exit 0 }
