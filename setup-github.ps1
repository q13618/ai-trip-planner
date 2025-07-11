# GitHub仓库设置脚本
Write-Host "=== GitHub仓库设置脚本 ===" -ForegroundColor Green

# 检查GitHub CLI是否可用
try {
    $ghVersion = & "C:\Program Files\GitHub CLI\gh.exe" --version
    Write-Host "GitHub CLI已安装: $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "GitHub CLI未找到，请手动安装" -ForegroundColor Red
    exit 1
}

Write-Host "`n请按照以下步骤操作：" -ForegroundColor Yellow
Write-Host "1. 打开浏览器访问: https://github.com/q13618" -ForegroundColor Cyan
Write-Host "2. 点击 'New' 创建新仓库" -ForegroundColor Cyan
Write-Host "3. 仓库名称: ai-trip-planner" -ForegroundColor Cyan
Write-Host "4. 描述: Interactive United Card Benefits Explorer with AI Assistant" -ForegroundColor Cyan
Write-Host "5. 选择 Public 或 Private" -ForegroundColor Cyan
Write-Host "6. 不要勾选 'Add a README file'" -ForegroundColor Cyan
Write-Host "7. 点击 'Create repository'" -ForegroundColor Cyan

Write-Host "`n创建完成后，请告诉我仓库的完整URL，我会帮你推送代码。" -ForegroundColor Yellow

# 等待用户输入
$repoUrl = Read-Host "`n请输入GitHub仓库URL (例如: https://github.com/q13618/ai-trip-planner.git)"

if ($repoUrl) {
    Write-Host "`n正在设置远程仓库..." -ForegroundColor Green
    git remote add origin $repoUrl
    
    Write-Host "正在推送代码到GitHub..." -ForegroundColor Green
    git branch -M main
    git push -u origin main
    
    Write-Host "`n✅ 代码已成功推送到GitHub!" -ForegroundColor Green
    Write-Host "仓库地址: $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host "未提供仓库URL，请手动完成推送。" -ForegroundColor Red
} 