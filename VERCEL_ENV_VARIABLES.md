# Vercel Environment Variables Setup

## ⚠️ Important: Don't Use Local Files for Vercel

- `.env` - For LOCAL development only
- `.env.local` - For LOCAL development only  
- `.env.example` - Just a template/reference

**For Vercel, you MUST set variables in the Vercel Dashboard, not in files!**

## Step-by-Step: Add Variables to Vercel

### 1. Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your project: **music-classifier**
3. Go to **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)

### 2. Add These Variables

Click **Add New** for each variable:

#### Variable 1: `DATABASE_URL`
- **Key:** `DATABASE_URL`
- **Value:** Your production PostgreSQL connection string
- **Environment:** Check ✅ Production, ✅ Preview, ✅ Development

**Get a production database:**
- **Supabase** (Free): https://supabase.com → Create project → Settings → Database → Copy connection string
- **Neon** (Free): https://neon.tech → Create project → Copy connection string
- **Railway** (Free tier): https://railway.app → Create PostgreSQL → Copy connection string

**Example format:**
```
postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
```

#### Variable 2: `JWT_SECRET`
- **Key:** `JWT_SECRET`
- **Value:** Generate a secure random string (min 32 characters)
- **Environment:** Check ✅ Production, ✅ Preview, ✅ Development

**Generate one:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

**Example:**
```
aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1p
```

#### Variable 3: `NEXT_PUBLIC_API_URL` (Optional)
- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** Leave empty (or your API URL if separate)
- **Environment:** Check ✅ Production, ✅ Preview, ✅ Development

### 3. Save and Redeploy

After adding all variables:
1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click **⋯** on latest deployment
4. Click **Redeploy**

Or push a new commit to trigger deployment.

## What NOT to Do

❌ Don't commit `.env` or `.env.local` to GitHub (they're in `.gitignore`)
❌ Don't use `localhost` database URLs in Vercel
❌ Don't put environment variables in code files
❌ Don't use the same JWT_SECRET as in your local `.env`

## Quick Checklist

- [ ] Created production PostgreSQL database (Supabase/Neon/Railway)
- [ ] Copied production `DATABASE_URL` (NOT localhost!)
- [ ] Generated secure `JWT_SECRET` (32+ characters)
- [ ] Added `DATABASE_URL` to Vercel dashboard
- [ ] Added `JWT_SECRET` to Vercel dashboard
- [ ] Set variables for Production environment
- [ ] Redeployed application
- [ ] Tested login functionality

## Your Current Local Files (For Reference Only)

Your `.env` and `.env.local` have:
```
DATABASE_URL="postgresql://arminfn@localhost:5432/music_classifier?schema=public"
```

**This won't work on Vercel!** You need a cloud database like:
```
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

## Need Help?

- Check Vercel logs: **Deployments** → Click deployment → **Logs**
- Verify variables are set: **Settings** → **Environment Variables**
- Test database connection locally with production URL first

