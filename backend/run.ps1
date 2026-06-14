Write-Host "[run] Killing any existing Java process on port 8080..." -ForegroundColor Yellow
$procs = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $procs) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    Write-Host "[run] Killed PID $procId"
}

Set-Location $PSScriptRoot
Write-Host "[run] Starting backend from $PWD" -ForegroundColor Green
Write-Host ""

mvn spring-boot:run 2>&1 | Tee-Object -Variable mvnOutput

$logFile = Join-Path $PSScriptRoot "backend.log"
$mvnOutput | Out-File $logFile -Encoding utf8

Write-Host ""
if ($LASTEXITCODE -ne 0) {
    Write-Host "[run] FAILED. Searching for error..." -ForegroundColor Red
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    $errors = $mvnOutput | Select-String -Pattern "ERROR|Exception|Caused by|failed|Cannot|not found|refused" | Select-Object -First 20
    if ($errors) {
        $errors | ForEach-Object { Write-Host $_.Line -ForegroundColor Red }
    } else {
        Write-Host "[run] No specific error found. Showing last 20 lines:" -ForegroundColor Yellow
        $mvnOutput | Select-Object -Last 20 | ForEach-Object { Write-Host $_ }
    }
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    Write-Host "[run] Full log: $logFile" -ForegroundColor DarkGray
}

Read-Host "Press Enter to close"
