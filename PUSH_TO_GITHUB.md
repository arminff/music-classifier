# Push to GitHub - Quick Guide

## Step 1: Create Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `music-classifier`
3. Description: "Music Classification System using Next.js 15, Prisma, and TensorFlow.js"
4. Choose: **Public** or **Private** (your choice)
5. **DO NOT** check "Initialize with README" (we already have code)
6. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repository, run:

```bash
cd "/Users/arminfn/TMU/Fall 2025/CPS731/Final_project/c/music-classifier"
git push -u origin main
```

Or if you prefer a different repository name, update the remote:

```bash
git remote set-url origin https://github.com/arminff/YOUR_REPO_NAME.git
git push -u origin main
```

## What Will Be Pushed

✅ All source code (52 files)
✅ Complete application
✅ Documentation
✅ Database schema
✅ Tests
✅ Configuration files

❌ NOT included (safely excluded):
- `.env` files (sensitive data)
- `node_modules/`
- Build files

## After Pushing

Your code will be available at:
**https://github.com/arminff/music-classifier**

