# Database Setup Guide

## Option 1: Free Cloud Database (Recommended - Easiest)

### Using Supabase (Free Tier)

1. **Sign up for Supabase:**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub (easiest)

2. **Create a new project:**
   - Click "New Project"
   - Choose a name (e.g., "music-classifier")
   - Set a database password (save it!)
   - Choose a region close to you
   - Click "Create new project"

3. **Get your connection string:**
   - Wait for project to finish setting up (~2 minutes)
   - Go to Project Settings → Database
   - Find "Connection string" section
   - Copy the "URI" connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

4. **Update your .env.local:**
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
   ```
   Replace `YOUR_PASSWORD` with the password you set, and use the full connection string from Supabase.

### Using Neon (Alternative - Also Free)

1. **Sign up for Neon:**
   - Go to https://neon.tech
   - Click "Sign Up" (GitHub login works)

2. **Create a project:**
   - Click "Create a project"
   - Name it (e.g., "music-classifier")
   - Click "Create project"

3. **Get connection string:**
   - After creation, you'll see a connection string
   - Copy it (it includes the password)
   - Format: `postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

4. **Update your .env.local:**
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

## Option 2: Local PostgreSQL (If you prefer)

### macOS (using Homebrew)

1. **Install PostgreSQL:**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create database:**
   ```bash
   createdb music_classifier
   ```

3. **Update .env.local:**
   ```bash
   DATABASE_URL="postgresql://$(whoami)@localhost:5432/music_classifier?schema=public"
   ```

### Windows

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download and install PostgreSQL
   - Remember the password you set for the `postgres` user

2. **Create database:**
   - Open pgAdmin or use psql
   - Create a database named `music_classifier`

3. **Update .env.local:**
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/music_classifier?schema=public"
   ```

## After Setting Up Database

1. **Test the connection:**
   ```bash
   npm run db:push
   ```

2. **Initialize with default users:**
   ```bash
   npm run db:init
   ```

3. **You're ready! Start the dev server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

- **"Can't reach database server"**: Check your DATABASE_URL is correct
- **"Authentication failed"**: Verify your password in the connection string
- **"Database does not exist"**: Make sure the database name in the URL matches your actual database

