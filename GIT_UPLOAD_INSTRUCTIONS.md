# Git Upload Instructions for E-Commerce Project

This guide will help you upload your full-stack e-commerce project (both API and client) to GitHub.

## Prerequisites

1. **Git Installed** - Verify by opening Command Prompt and typing:
   ```bash
   git --version
   ```
   If not installed, download from: https://git-scm.com/download/win

2. **GitHub Account** - Create one at https://github.com if you don't have one

## Step 1: Configure Git (First Time Setup)

Open Command Prompt or Git Bash and run these commands:

```bash
# Set your name (use your real name or GitHub username)
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --global user.name
git config --global user.email
```

## Step 2: Create a GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in the top-right corner
3. Click **"New repository"**
4. Fill in the details:
   - **Repository name:** `ecommerce-fullstack` (or your preferred name)
   - **Description:** "Full-stack e-commerce application with React & ASP.NET Core"
   - **Visibility:** Choose Public or Private
   - **DO NOT** check "Initialize with README" (we'll add our own)
   - **DO NOT** add .gitignore or license (we already have them)
5. Click **"Create repository"**
6. **Copy the repository URL** shown on the next page (it will look like: `https://github.com/yourusername/ecommerce-fullstack.git`)

## Step 3: Initialize Git in Your Project

Open Command Prompt and navigate to your project root:

```bash
# Navigate to project root directory
cd C:\Users\Administrator\source\repos\Ecomm_diplomski

# Initialize Git repository
git init

# Verify .gitignore exists
dir .gitignore
```

## Step 4: Stage All Files

Add all project files to Git (both API and client):

```bash
# Add all files (respecting .gitignore)
git add .

# Check what will be committed
git status
```

**What you should see:**
- Green files: Files that will be committed
- Red files: Files that are ignored (node_modules, bin, obj, etc.)

**Important:** Make sure sensitive files are NOT listed in green:
- ❌ .env files
- ❌ appsettings.Development.json (with real secrets)
- ❌ Database files (.db, .sqlite)
- ❌ node_modules folder
- ❌ bin/obj folders

If you see any sensitive files, add them to `.gitignore` and run:
```bash
git reset
git add .
```

## Step 5: Create Initial Commit

```bash
# Create your first commit
git commit -m "Initial commit: Full-stack e-commerce application

- React 19 + TypeScript frontend with Redux Toolkit
- ASP.NET Core 8 backend with Entity Framework Core
- PostgreSQL/SQLite database support
- Stripe payment integration
- SignalR real-time notifications
- Digital and physical product support
- Admin dashboard with analytics
- Complete authentication and authorization system"
```

## Step 6: Connect to GitHub Repository

Replace `YOUR_GITHUB_URL` with the URL you copied in Step 2:

```bash
# Add remote repository
git remote add origin YOUR_GITHUB_URL

# Example:
# git remote add origin https://github.com/yourusername/ecommerce-fullstack.git

# Verify remote was added
git remote -v
```

## Step 7: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin main
```

**If you get an error about 'master' vs 'main':**
```bash
# Rename branch to main
git branch -M main

# Then push again
git push -u origin main
```

## Step 8: Verify Upload

1. Go to your GitHub repository URL in a browser
2. You should see all your files and folders:
   - ✅ API/ folder (backend)
   - ✅ client/ folder (frontend)
   - ✅ Documentation files (.md)
   - ✅ .gitignore
   - ✅ Solution file (.sln)
   - ❌ node_modules/ (should NOT be there)
   - ❌ bin/, obj/ (should NOT be there)

## Step 9: Create a README (Optional but Recommended)

Create a README.md file in the root:

```bash
# This file should already exist, but you can view it
type README.md
```

If you want to create/update it, I can help you create a comprehensive README.

## Authentication Methods

### Method 1: HTTPS with Personal Access Token (Recommended)

When you run `git push`, Git will ask for credentials:
- **Username:** Your GitHub username
- **Password:** Use a Personal Access Token (NOT your GitHub password)

**To create a Personal Access Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "E-commerce Project Upload"
4. Select scopes: ✅ repo (all), ✅ workflow
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

### Method 2: SSH (Alternative)

If you prefer SSH keys, see: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

## Future Updates

After the initial upload, to push new changes:

```bash
# Check status
git status

# Add modified files
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## Common Issues and Solutions

### Issue 1: "Permission denied" or "Authentication failed"

**Solution:** Use a Personal Access Token instead of your password (see Method 1 above)

### Issue 2: Files too large error

**Solution:** GitHub has a 100MB file size limit. Check for large files:
```bash
git ls-files -z | xargs -0 du -h | sort -h -r | head -20
```

### Issue 3: Accidentally committed sensitive files

**Solution:** Remove from Git history:
```bash
# Remove file from Git but keep locally
git rm --cached path/to/sensitive/file

# Commit the removal
git commit -m "Remove sensitive file"

# Push
git push
```

### Issue 4: "fatal: not a git repository"

**Solution:** Make sure you're in the correct directory:
```bash
cd C:\Users\Administrator\source\repos\Ecomm_diplomski
git init
```

## Project Structure Verification

Your GitHub repository should have this structure:

```
ecommerce-fullstack/
├── .gitignore
├── .vs/                          (ignored)
├── API/                          ✅ Backend
│   ├── Controllers/
│   ├── Services/
│   ├── Entities/
│   ├── Data/
│   ├── Dto/
│   ├── Middleware/
│   ├── Hubs/
│   ├── Program.cs
│   ├── API.csproj
│   ├── appsettings.json          ✅ (without secrets)
│   ├── bin/                      (ignored)
│   └── obj/                      (ignored)
├── client/                       ✅ Frontend
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   ├── components/
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .env                      (ignored)
│   └── node_modules/             (ignored)
├── APPLICATION_ARCHITECTURE_DOCUMENTATION.md  ✅
├── CONTROLLER_ARCHITECTURE_PLAN.md
├── ORDER_SYSTEM_DESIGN.md
├── Ecomm_diplomski.sln           ✅
└── README.md                     (create this)
```

## Security Checklist Before Uploading

Before you push to GitHub, verify these files are **NOT** being committed:

- ❌ .env files (any environment variables with secrets)
- ❌ appsettings.Development.json (if it contains real API keys)
- ❌ Database files (.db, .sqlite)
- ❌ node_modules/
- ❌ bin/, obj/ folders
- ❌ Any Stripe keys or Cloudinary secrets
- ❌ User secrets files

**To check:**
```bash
git status
```

Green files = will be committed
Files not shown = ignored (good for node_modules, etc.)

## Post-Upload Recommendations

After uploading to GitHub:

1. **Add Repository Topics** (on GitHub):
   - react
   - typescript
   - aspnet-core
   - ecommerce
   - redux
   - stripe
   - signalr
   - postgresql
   - entity-framework-core

2. **Add Repository Description** (on GitHub)

3. **Create a comprehensive README.md** with:
   - Project description
   - Screenshots
   - Setup instructions
   - Technology stack
   - Features list
   - License

4. **Consider adding:**
   - LICENSE file (MIT, Apache, etc.)
   - CONTRIBUTING.md
   - Code of Conduct
   - Issue templates
   - Pull request templates

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify your .gitignore is working: `git status`
3. Check Git configuration: `git config --list`
4. Verify remote URL: `git remote -v`

---

**Ready to start?** Open Command Prompt and begin with Step 1!
