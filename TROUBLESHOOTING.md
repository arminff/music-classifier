# Troubleshooting Login Issues

## Common Login Problems

### 1. "Invalid credentials" Error

**Possible causes:**
- Wrong password entered
- Account locked due to too many failed attempts
- Password hash mismatch in database

**Solutions:**

#### Check if account is locked:
```sql
SELECT email, failed_logins, locked_until 
FROM users 
WHERE email = 'your-email@example.com';
```

If `locked_until` is in the future, wait 30 minutes or reset it:
```sql
UPDATE users 
SET failed_logins = 0, locked_until = NULL 
WHERE email = 'your-email@example.com';
```

#### Reset password:
```bash
npx tsx scripts/reset-user-password.ts your-email@example.com newpassword123
```

### 2. Can't Login as Regular User

**Default test accounts:**
- **Admin:** `admin@example.com` / `admin123`
- **User:** `user@example.com` / `user123`

**If these don't work:**

1. **Re-initialize database:**
   ```bash
   npm run db:init
   ```

2. **Or reset the user password:**
   ```bash
   npx tsx scripts/reset-user-password.ts user@example.com user123
   ```

3. **Or create a new user:**
   - Go to `/register`
   - Create a new account
   - It will have "User" role by default

### 3. Account Locked After 3 Failed Attempts

**What happens:**
- After 3 failed login attempts, account is locked for 30 minutes
- You'll see: "Account locked due to too many failed login attempts"

**Solutions:**

#### Option 1: Wait 30 minutes
The lock automatically expires after 30 minutes.

#### Option 2: Unlock via database
```sql
UPDATE users 
SET failed_logins = 0, locked_until = NULL 
WHERE email = 'your-email@example.com';
```

#### Option 3: Reset password (also unlocks account)
```bash
npx tsx scripts/reset-user-password.ts your-email@example.com newpassword123
```

### 4. "Unauthorized" Errors After Login

**If you can login but get unauthorized errors:**

1. **Check your role:**
   - Open browser console
   - Run: `JSON.parse(localStorage.getItem('user'))`
   - Verify the role is correct

2. **Clear localStorage and re-login:**
   ```javascript
   localStorage.clear();
   // Then login again
   ```

3. **Check token expiration:**
   - Tokens expire after 24 hours
   - Simply log out and log back in

### 5. Password Not Working After Registration

**If you just registered but can't login:**

1. **Try the exact password you used during registration**
2. **Check for typos** - passwords are case-sensitive
3. **Reset password if needed:**
   ```bash
   npx tsx scripts/reset-user-password.ts your-email@example.com newpassword123
   ```

## Quick Fixes

### Reset All Test Accounts
```bash
# Re-run database initialization
npm run db:init
```

This will recreate:
- `admin@example.com` / `admin123`
- `user@example.com` / `user123`

### Check User Status
```sql
SELECT 
  id, 
  email, 
  role, 
  failed_logins, 
  locked_until,
  created_at
FROM users;
```

### Unlock All Accounts
```sql
UPDATE users 
SET failed_logins = 0, locked_until = NULL;
```

### Change User Role to Admin
```sql
UPDATE users 
SET role = 'Administrator' 
WHERE email = 'your-email@example.com';
```

## Still Having Issues?

1. **Check browser console** for JavaScript errors
2. **Check server logs** for backend errors
3. **Verify database connection** is working
4. **Try incognito/private window** to rule out cache issues
5. **Clear browser cache and localStorage**

## Test Credentials

After running `npm run db:init`:

- **Admin Account:**
  - Email: `admin@example.com`
  - Password: `admin123`
  - Role: Administrator

- **Regular User Account:**
  - Email: `user@example.com`
  - Password: `user123`
  - Role: User

