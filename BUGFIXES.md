# Bug Fixes Applied

## Issues Fixed

### 1. Missing `await` on `requireAuth` calls
**Problem:** Several API routes were calling `requireAuth()` without `await`, causing unhandled promise rejections.

**Fixed in:**
- `/api/datasets/route.ts` - All methods (GET, POST, PATCH, DELETE)
- `/api/train/route.ts` - POST and GET methods
- `/api/backup/route.ts` - POST method

### 2. Next.js 15 Async Params
**Problem:** In Next.js 15+, route params are now Promises and must be awaited.

**Fixed in:**
- `/api/models/[id]/metrics/route.ts` - Changed `params: { id: string }` to `params: Promise<{ id: string }>` and added `await params`

### 3. Error Handling Improvements
**Problem:** Error checks were only looking at `error.message` but not `error.name`, causing some errors to not be caught properly.

**Fixed in:**
- All API routes now check both `error.message === 'Unauthorized'` and `error.name === 'UnauthorizedError'`
- Updated error handling in frontend pages to use optional chaining (`err.message?.includes()`)

### 4. Frontend Error Handling
**Problem:** Some pages weren't handling errors gracefully, causing unhandled rejections.

**Fixed in:**
- `/app/upload/page.tsx` - Better error handling for dataset loading
- `/app/dashboard/page.tsx` - Improved error handling with redirect on unauthorized
- `/app/datasets/page.tsx` - Added optional chaining for error messages

## Files Modified

1. `src/lib/utils/auth.ts` - Added error.name to Unauthorized errors
2. `src/app/api/datasets/route.ts` - Added await to all requireAuth calls, improved error handling
3. `src/app/api/train/route.ts` - Added await to requireAuth calls
4. `src/app/api/backup/route.ts` - Added await to requireAuth call
5. `src/app/api/models/[id]/metrics/route.ts` - Fixed async params, added await
6. `src/app/upload/page.tsx` - Improved error handling
7. `src/app/dashboard/page.tsx` - Improved error handling
8. `src/app/datasets/page.tsx` - Improved error handling

## Testing

After these fixes:
- All API routes should properly handle authentication errors
- No more unhandled promise rejections
- Proper error messages returned to frontend
- Next.js 15 compatibility maintained

