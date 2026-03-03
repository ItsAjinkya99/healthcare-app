# Git Repository Setup Guide

## Overview

This is a **monorepo** structure where both backend and frontend are tracked in a single git repository.

### Repository Structure
```
healthcare-app/                    # Root repository
├── backend/            # Backend (Node + Express)
├── frontend/           # Frontend (Angular)
├── .git/                          # Single git repository
├── .gitignore                     # Ignore rules for both
├── .gitattributes                 # Line ending rules
└── .editorconfig                  # Code style rules
```

---

## 🔧 Repository Status

### What Changed
✅ Removed `.git` directories from `backend/`  
✅ Removed `.git` directories from `frontend/`  
✅ Created single `.git` at root level  
✅ Created comprehensive `.gitignore`  
✅ Created `.gitattributes` for line endings  
✅ Created `.editorconfig` for code style  

### Repository Now Tracks
- Both backend and frontend in same commits
- Single branch history for entire project
- Unified version control

---

## 📝 .gitignore Breakdown

### What's Ignored

#### Backend
```
backend/node_modules/
backend/.env
backend/.env.local
backend/logs/
backend/*.log
```

#### Frontend
```
frontend/node_modules/
frontend/dist/
frontend/.env
frontend/coverage/
```

#### Common
```
.vscode/
.idea/
.DS_Store
Thumbs.db
*.swp
*.log
```

---

## 🔒 Important Files NOT in Repository

### Never Commit These!
```
.env                          # Secrets, API keys
.env.local                    # Local configuration
node_modules/                 # Dependencies
dist/                         # Built files
*.log                         # Log files
.vscode/settings.json         # Personal settings
```

---

## 🚀 Common Git Commands

### Initial Setup
```bash
# Check current status
git status

# See what files are tracked
git ls-files

# Check git log
git log --oneline --graph --all
```

### Adding Files
```bash
# Stage all changes
git add .

# Stage specific file
git add backend/src/controllers/auth.controller.js

# Stage specific folder
git add frontend/src/

# Unstage file
git reset HEAD path/to/file
```

### Committing
```bash
# Commit with message
git commit -m "feat: add JWT authentication"

# Amend last commit
git commit --amend

# See what will be committed
git diff --cached
```

### Branching
```bash
# Create and switch to new branch
git checkout -b feature/patient-management

# List all branches
git branch -a

# Switch branch
git checkout main

# Delete branch
git branch -d feature/patient-management
```

### Pushing & Pulling
```bash
# Push to remote
git push origin feature/patient-management

# Pull latest changes
git pull origin main

# Fetch without merging
git fetch origin
```

### Viewing Changes
```bash
# See unstaged changes
git diff

# See staged changes
git diff --cached

# See changes in specific file
git diff path/to/file

# See log
git log --oneline

# See log with graph
git log --oneline --graph --all
```

---

## 📋 Commit Message Format

Use conventional commit format:

```
feat: add JWT authentication
fix: resolve CORS issue in login
docs: update API documentation
style: format code with prettier
refactor: simplify auth service
test: add login endpoint tests
chore: update dependencies
```

### By Component
```
feat(auth): implement JWT token generation
feat(frontend): add dashboard component
fix(backend): fix password comparison bug
docs(api): update endpoint documentation
```

---

## 🔄 Typical Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/add-patients-list
```

### 2. Make Changes
```bash
# Edit files in backend/ and/or frontend/
```

### 3. Check Status
```bash
git status
```

### 4. Stage Changes
```bash
git add .
```

### 5. Commit
```bash
git commit -m "feat(backend): add /api/patients endpoint"
```

### 6. Push
```bash
git push origin feature/add-patients-list
```

### 7. Create Pull Request (if using GitHub)

### 8. Merge to Main
```bash
git checkout main
git pull origin main
git merge feature/add-patients-list
git push origin main
```

---

## 🛡️ Git Safety Tips

### Before Pushing
```bash
# Check what's about to be pushed
git diff origin/main

# Make sure all changes are committed
git status
```

### .gitignore Check
```bash
# Verify .env is not staged
git ls-files | grep -i env   # Should return nothing

# Verify node_modules not staged
git ls-files | grep node_modules   # Should return nothing
```

### Viewing What Will Be Committed
```bash
git diff --cached | head -100
```

---

## 🔍 File Size Check

```bash
# Find large files in git
git rev-list --all --objects | sort -k2 | tail -10

# See repo size
du -sh .git/
```

---

## 📊 Repository Statistics

```bash
# Lines of code by file
find . -name "*.js" -o -name "*.ts" | xargs wc -l

# Commits per author
git shortlog -sn

# Files changed in last commit
git diff-tree --no-commit-id --name-only -r HEAD
```

---

## 🔧 Useful .gitignore Patterns

```
# Ignore directory and all contents
backend/node_modules/

# Ignore specific file
backend/.env

# Ignore all .log files
*.log

# Ignore files matching pattern
**/dist/

# Negation: DON'T ignore this
!important-file.txt

# Ignore hidden directories except .gitignore
.**
!.gitignore
!.gitattributes
!.editorconfig
```

---

## 📝 .gitattributes Purpose

Ensures consistent line endings across different operating systems:

- **Windows:** CRLF (\r\n)
- **Mac/Linux:** LF (\n)

**Our setting:** All text files use LF (Unix standard)

Benefits:
- No "file changed" when only line endings differ
- Consistent across team members
- Easier diffs

---

## 🚨 Removing Accidentally Committed Files

### Remove from Git (But Keep Locally)
```bash
git rm --cached backend/.env
git commit -m "remove: .env file from tracking"
```

### Remove from Git and Disk
```bash
git rm backend/.env
git commit -m "remove: .env file"
```

### After Removing
Add to .gitignore to prevent re-commit:
```
backend/.env
```

---

## 📌 Protected Files

These should NEVER be in repository:

```
.env files              # Secrets, passwords
node_modules/          # Dependencies (too large)
dist/                  # Build outputs
*.log                  # Log files
.vscode/settings.json  # Personal settings
*.pem / *.key          # Certificates
```

---

## 🔗 Remote Repository

### Add Remote
```bash
git remote add origin https://github.com/yourusername/healthcare.git
```

### Check Remote
```bash
git remote -v
```

### Fetch from Remote
```bash
git fetch origin
```

### Push All Branches
```bash
git push origin --all
```

---

## 📚 Git Resources

- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Guides](https://guides.github.com/)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)

---

## Summary

✅ Single git repository at root  
✅ Both backend and frontend tracked together  
✅ Comprehensive .gitignore configured  
✅ Line endings standardized  
✅ Code style defined  
✅ Ready for team collaboration  

Start tracking your changes now with `git add .` and `git commit -m "message"`!
