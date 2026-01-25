# ============================================
# Clean Git Cache Script for Windows (PowerShell)
# ============================================
# This script removes files from Git cache that are now in .gitignore
# Files will remain in your local directory but won't be tracked by Git

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Edge Reader - Git Cache Cleanup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Removing files from Git cache..." -ForegroundColor Yellow
Write-Host ""

# Remove documentation files from cache
Write-Host "Removing documentation files (docs/*.md)..." -ForegroundColor Gray
Get-ChildItem -Path docs -Filter *.md -Recurse | ForEach-Object {
    git rm --cached $_.FullName 2>$null
}
git rm --cached IMPLEMENTATION_SUMMARY.md 2>$null
git rm --cached IMPLEMENTATION_PLAN.md 2>$null
git rm --cached README_HARDWARE.md 2>$null
git rm --cached README_ML_Workflow.md 2>$null

# Remove dev-reports
Write-Host "Removing dev-reports directory..." -ForegroundColor Gray
git rm -r --cached dev-reports/ 2>$null

# Remove logs
Write-Host "Removing log files..." -ForegroundColor Gray
git rm -r --cached logs/ 2>$null
git rm --cached *.log 2>$null

# Remove Python cache
Write-Host "Removing Python cache files..." -ForegroundColor Gray
git rm -r --cached __pycache__/ 2>$null
git rm --cached *.pyc 2>$null

# Remove node_modules (if accidentally committed)
Write-Host "Removing node_modules..." -ForegroundColor Gray
git rm -r --cached apps/web/node_modules/ 2>$null
git rm -r --cached node_modules/ 2>$null

# Remove build artifacts
Write-Host "Removing build artifacts..." -ForegroundColor Gray
git rm -r --cached apps/web/dist/ 2>$null
git rm -r --cached apps/web/build/ 2>$null
git rm -r --cached apps/web/.vite/ 2>$null

# Remove IDE files
Write-Host "Removing IDE files..." -ForegroundColor Gray
git rm -r --cached .vscode/ 2>$null
git rm -r --cached .idea/ 2>$null

# Remove OS files
Write-Host "Removing OS files..." -ForegroundColor Gray
git rm --cached .DS_Store 2>$null
git rm --cached Thumbs.db 2>$null

Write-Host ""
Write-Host "Step 2: Checking git status..." -ForegroundColor Yellow
Write-Host ""
git status --short

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Cache cleanup complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the changes: git status" -ForegroundColor White
Write-Host "2. Stage the .gitignore update: git add .gitignore" -ForegroundColor White
Write-Host "3. Commit the changes: git commit -m 'Update .gitignore and remove tracked files'" -ForegroundColor White
Write-Host ""
Write-Host "Note: Files are still in your local directory, just not tracked by Git anymore." -ForegroundColor Yellow
Write-Host ""
