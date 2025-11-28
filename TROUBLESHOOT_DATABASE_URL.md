# Troubleshooting DATABASE_URL Error on Vercel

## Error Message
```
Invalid `prisma.user.findUnique()` invocation: 
error: Error validating datasource `db`: 
the URL must start with the protocol `postgresql://` or `postgres://`
```

## This Means:
The `DATABASE_URL` environment variable is either:
1. ❌ Not set in Vercel
2. ❌ Set incorrectly (wrong format, has quotes, empty)
3. ❌ Set but app wasn't redeployed

## Step-by-Step Fix

### Step 1: Check Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your project: **music-classifier**
3. Go to **Settings** → **Environment Variables**
4. Look for `DATABASE_URL`

**If it's NOT there:**
- Click **Add New**
- Key: `DATABASE_URL`
- Value: Your PostgreSQL connection string (see Step 2)
- Environment: Check ✅ **Production**, ✅ **Preview**, ✅ **Development**
- Click **Save**

**If it IS there:**
- Click on it to edit
- Check the value format (see Step 2)

### Step 2: Get Correct DATABASE_URL Format

You need a **production database** (NOT localhost). Get one from:

#### Option A: Supabase (Recommended - Free)
1. Go to https://supabase.com
2. Sign up / Log in
3. Click **New Project**
4. Fill in project details
5. Wait for database to be created
6. Go to **Settings** → **Database**
7. Scroll to **Connection string** → **URI**
8. Copy the connection string
9. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
10. Replace `[YOUR-PASSWORD]` with your actual database password

#### Option B: Neon (Free)
1. Go to https://neon.tech
2. Sign up / Log in
3. Click **New Project**
4. Copy the connection string from dashboard
5. Format: `postgresql://user:password@host/database`

#### Option C: Railway (Free tier)
1. Go to https://railway.app
2. Sign up / Log in
3. Click **New Project** → **Provision PostgreSQL**
4. Click on PostgreSQL service
5. Go to **Variables** tab
6. Copy `DATABASE_URL` value

### Step 3: Add to Vercel (Correct Format)

**✅ CORRECT:**
```
postgresql://postgres:mypassword@db.xxxxx.supabase.co:5432/postgres
```

**❌ WRONG (has quotes):**
```
"postgresql://postgres:mypassword@db.xxxxx.supabase.co:5432/postgres"
```

**❌ WRONG (localhost):**
```
postgresql://user@localhost:5432/database
```

**❌ WRONG (missing protocol):**
```
postgres:user:password@host:5432/database
```

**Key Points:**
- ✅ Must start with `postgresql://` or `postgres://`
- ✅ NO quotes around the value
- ✅ NO spaces
- ✅ Use production database (NOT localhost)
- ✅ Include full connection string

### Step 4: Redeploy

After adding/updating `DATABASE_URL`:

1. Go to **Deployments** tab in Vercel
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete
5. Try logging in again

**OR** push a new commit to trigger deployment:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Step 5: Verify It's Set

1. Go to **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click on it
4. Verify:
   - ✅ Value starts with `postgresql://` or `postgres://`
   - ✅ No quotes around it
   - ✅ Not empty
   - ✅ Not `localhost`

## Common Mistakes

### Mistake 1: Using Localhost
```
❌ postgresql://user@localhost:5432/database
✅ postgresql://user:password@db.xxxxx.supabase.co:5432/postgres
```

### Mistake 2: Adding Quotes
```
❌ "postgresql://..."
✅ postgresql://...
```

### Mistake 3: Wrong Environment
- Make sure you set it for **Production** environment
- Also set for **Preview** and **Development** if needed

### Mistake 4: Not Redeploying
- After adding variables, you MUST redeploy
- Variables are only loaded during build/deployment

### Mistake 5: Copying from .env file
- Don't copy from your local `.env` file
- Local files use `localhost` which won't work on Vercel
- Get a fresh connection string from your database provider

## Quick Checklist

- [ ] Created production PostgreSQL database (Supabase/Neon/Railway)
- [ ] Copied connection string (starts with `postgresql://`)
- [ ] Removed any quotes
- [ ] Added `DATABASE_URL` to Vercel dashboard
- [ ] Set for Production environment
- [ ] Redeployed application
- [ ] Verified in Vercel logs that variable is loaded

## Still Not Working?

1. **Check Vercel Logs:**
   - Go to **Deployments** → Click deployment → **Logs**
   - Look for any errors about DATABASE_URL

2. **Test Connection String:**
   - Try connecting to your database with a database client
   - If it works locally, the connection string is correct

3. **Verify Variable is Set:**
   - In Vercel, go to **Settings** → **Environment Variables**
   - Make sure `DATABASE_URL` shows a value (not empty)

4. **Check for Typos:**
   - Variable name must be exactly: `DATABASE_URL` (all caps)
   - No spaces, no underscores in wrong places

## Need More Help?

- Check Vercel documentation: https://vercel.com/docs/environment-variables
- Verify your database is accessible from the internet
- Some databases require IP whitelisting (add Vercel IPs)

