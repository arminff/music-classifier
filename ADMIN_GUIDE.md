# How to Get Admin Role

## Method 1: Use Default Admin Account (Easiest)

After running `npm run db:init`, a default admin account is created:

- **Email:** `admin@example.com`
- **Password:** `admin123`

Simply log in with these credentials to access admin features.

## Method 2: Promote Existing User to Admin

If you're already logged in as an admin, you can promote other users:

1. **Navigate to User Management:**
   - Go to `/users` page (link in navbar)
   - Or visit: `http://localhost:3001/users`

2. **Change User Role:**
   - Find the user you want to promote
   - Click "Change Role" button
   - Select "Administrator" from dropdown
   - Click "Save"

## Method 3: Create Admin via Database Script

You can modify the `scripts/init-db.ts` file to create additional admin users:

```typescript
// Add this to the main() function
const newAdmin = await prisma.user.upsert({
  where: { email: 'your-email@example.com' },
  update: { role: 'Administrator' },
  create: {
    email: 'your-email@example.com',
    passwordHash: await bcrypt.hash('your-password', 10),
    role: 'Administrator',
  },
});
```

Then run: `npm run db:init`

## Method 4: Direct Database Update (Advanced)

If you have direct database access:

```sql
-- Update existing user to admin
UPDATE users 
SET role = 'Administrator' 
WHERE email = 'your-email@example.com';
```

## Method 5: Use API Endpoint (Programmatic)

If you're already an admin, you can use the API:

```bash
curl -X PATCH http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"userId": 2, "role": "Administrator"}'
```

## Admin Features

Once you have admin role, you can:

- ✅ Access `/dashboard` - Train models
- ✅ Access `/datasets` - Manage datasets
- ✅ Access `/users` - Manage user roles
- ✅ Create, rename, and delete datasets
- ✅ Start model training
- ✅ Trigger database backups
- ✅ View all users and change their roles

## Security Notes

- Regular users cannot self-promote to admin (prevented in registration)
- Admins cannot remove their own admin role (safety feature)
- All admin actions are logged in the activity log
- Account lockout after 3 failed login attempts applies to all users

## Troubleshooting

**Can't access admin features?**
- Check your role in localStorage: Open browser console and run `JSON.parse(localStorage.getItem('user'))`
- If role is "User", you need to be promoted by an existing admin
- Log out and log back in after role change

**No admin account exists?**
- Run `npm run db:init` to create default admin
- Or use Method 4 to directly update database

