# InvestWise AI - Deployment & GitHub Guide

This application is an AI-powered financial market intelligence platform built with React, Vite, Tailwind CSS, Google Gemini, and Yahoo Finance.

---

## 1. How to Upload All Files to GitHub

If you are uploading files to GitHub using the **web browser drag-and-drop** ("Upload files" button), GitHub automatically skips files that start with a dot (`.`), such as `.gitignore` and `.env.example`.

### Method A: Create Them in GitHub Web in 30 Seconds (Recommended)
1. In your GitHub repository page, click **Add file** > **Create new file**.
2. In the filename box, type: `.gitignore`
3. Copy and paste the contents from `gitignore.txt`, then click **Commit changes**.
4. Repeat for `.env.example`: click **Add file** > **Create new file**, name it `.env.example`, copy the contents from `env.example.txt`, and click **Commit changes**.

### Method B: Using Git Command Line (Includes all dotfiles automatically)
If you clone or push with git from your terminal:
```bash
git add .
git commit -m "Add full project files"
git push origin main
```

---

## 2. How to Deploy to Vercel Successfully

This project includes both:
- **Frontend SPA**: Built with Vite and React.
- **Backend Serverless API**: Located in `/api/analyze.ts` (configured in `vercel.json` for Vercel).

### Step 1: Import Project to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New** > **Project** and select your GitHub repository.
3. Vercel will automatically detect **Vite** as the Framework Preset.

### Step 2: Configure Environment Variables (CRITICAL)
Before hitting Deploy:
1. Open the **Environment Variables** section.
2. Add the following variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API Key (get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey))
3. If you have already deployed without the key:
   - Go to **Project Settings** > **Environment Variables**.
   - Add `GEMINI_API_KEY`.
   - Go to the **Deployments** tab, click the three dots (`...`) on your deployment, and click **Redeploy**.

### Step 3: Project Settings Verification
Ensure the following build configuration in Vercel:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Now your live site on Vercel will execute stock analysis and PDF reports with live Yahoo Finance and Gemini data!
