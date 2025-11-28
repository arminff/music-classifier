# Vercel Deployment Setup Guide

## Required Environment Variables

You **must** set these environment variables in your Vercel project settings:

### 1. Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project: `music-classifier`
3. Go to **Settings** → **Environment Variables**

### 2. Add These Variables

#### `DATABASE_URL` (Required)
Your PostgreSQL connection string. Format:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Options for PostgreSQL:**

**Option A: Supabase (Free tier available)**
1. Go to https://supabase.com
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI)
5. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

**Option B: Neon (Free tier available)**
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string from the dashboard
4. Format: `postgresql://user:password@host/database`

**Option C: Railway (Free tier available)**
1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string from the database settings

**Option D: Your own PostgreSQL server**
```
postgresql://username:password@host:5432/database_name?schema=public
```

#### `JWT_SECRET` (Required)
A secure random string for JWT token signing. Generate one:
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use an online generator:
# https://generate-secret.vercel.app/32
```

Example: `your-super-secret-jwt-key-change-this-in-production-12345`

#### `NEXT_PUBLIC_API_URL` (Optional)
Leave empty if your API is on the same domain. Only needed if you're using a separate API server.

### 3. Set for All Environments
Make sure to add the variables for:
- ✅ **Production**
- ✅ **Preview** (optional, but recommended)
- ✅ **Development** (optional)

### 4. After Adding Variables
1. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Select **Redeploy**

Or push a new commit to trigger a new deployment.

## Database Setup After Deployment

Once your app is deployed with the correct `DATABASE_URL`:

### 1. Run Prisma Migrations
You can do this via Vercel CLI or manually:

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project
vercel link

# Run Prisma migrations
npx prisma migrate deploy
```

**Option B: Using Vercel's Database Tab**
1. Go to your Vercel project
2. Use the **Database** tab if available
3. Or use a database management tool to run SQL

**Option C: Manual SQL (if you have database access)**
Run the Prisma schema SQL manually in your database client.

### 2. Initialize Database (Optional)
If you want to create the default admin user, you can:
- Use a database client to run the init script manually
- Or create the admin user via SQL:
```sql
INSERT INTO users (email, password_hash, role, failed_logins)
VALUES (
  'admin@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- hash of 'admin123'
  'Administrator',
  0
);
```

## Troubleshooting

### Error: "the URL must start with the protocol `postgresql://`"
- ✅ Make sure `DATABASE_URL` is set in Vercel
- ✅ Check the format starts with `postgresql://` or `postgres://`
- ✅ No spaces or quotes around the URL
- ✅ Redeploy after adding environment variables

### Error: "Can't reach database server"
- ✅ Check your database is accessible from the internet
- ✅ Verify firewall rules allow connections
- ✅ Check if your database provider requires IP whitelisting (add Vercel IPs)

### Error: "Authentication failed"
- ✅ Verify username and password are correct
- ✅ Check if the database user has proper permissions
- ✅ Some providers require SSL: add `?sslmode=require` to the URL

## Quick Checklist

- [ ] Created PostgreSQL database (Supabase/Neon/Railway/etc.)
- [ ] Copied `DATABASE_URL` connection string
- [ ] Added `DATABASE_URL` to Vercel environment variables
- [ ] Generated and added `JWT_SECRET` to Vercel
- [ ] Set variables for Production environment
- [ ] Redeployed the application
- [ ] Ran Prisma migrations (if needed)
- [ ] Tested login functionality

## Example Environment Variables in Vercel

```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NEXT_PUBLIC_API_URL=
```

## Need Help?

- Check Vercel logs: **Deployments** → Click deployment → **Logs**
- Check database connection: Use a database client to verify connection
- Test locally: Copy the same `DATABASE_URL` to your local `.env.local` and test

