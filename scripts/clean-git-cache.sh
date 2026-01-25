#!/bin/bash
# ============================================
# Clean Git Cache Script for Linux/Mac
# ============================================
# This script removes files from Git cache that are now in .gitignore
# Files will remain in your local directory but won't be tracked by Git

echo "============================================"
echo "Edge Reader - Git Cache Cleanup"
echo "============================================"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "Error: Not a git repository!"
    exit 1
fi

echo "Step 1: Removing files from Git cache..."
echo ""

# Remove documentation files from cache
echo "Removing documentation files (docs/*.md)..."
git rm -r --cached docs/*.md 2>/dev/null
git rm --cached IMPLEMENTATION_SUMMARY.md 2>/dev/null
git rm --cached IMPLEMENTATION_PLAN.md 2>/dev/null
git rm --cached README_HARDWARE.md 2>/dev/null
git rm --cached README_ML_Workflow.md 2>/dev/null

# Remove dev-reports
echo "Removing dev-reports directory..."
git rm -r --cached dev-reports/ 2>/dev/null

# Remove logs
echo "Removing log files..."
git rm -r --cached logs/ 2>/dev/null
git rm --cached *.log 2>/dev/null

# Remove Python cache
echo "Removing Python cache files..."
git rm -r --cached __pycache__/ 2>/dev/null
git rm --cached *.pyc 2>/dev/null

# Remove node_modules (if accidentally committed)
echo "Removing node_modules..."
git rm -r --cached apps/web/node_modules/ 2>/dev/null
git rm -r --cached node_modules/ 2>/dev/null

# Remove build artifacts
echo "Removing build artifacts..."
git rm -r --cached apps/web/dist/ 2>/dev/null
git rm -r --cached apps/web/build/ 2>/dev/null
git rm -r --cached apps/web/.vite/ 2>/dev/null

# Remove IDE files
echo "Removing IDE files..."
git rm -r --cached .vscode/ 2>/dev/null
git rm -r --cached .idea/ 2>/dev/null

# Remove OS files
echo "Removing OS files..."
git rm --cached .DS_Store 2>/dev/null
git rm --cached Thumbs.db 2>/dev/null

echo ""
echo "Step 2: Checking git status..."
echo ""
git status --short

echo ""
echo "============================================"
echo "Cache cleanup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Review the changes: git status"
echo "2. Stage the .gitignore update: git add .gitignore"
echo "3. Commit the changes: git commit -m 'Update .gitignore and remove tracked files'"
echo ""
echo "Note: Files are still in your local directory, just not tracked by Git anymore."
echo ""
