# Music Classification System

**CPS731 - Software Engineering I | Group 22**

## Overview

Machine learning web application that classifies audio tracks into genres (Pop, Rock, Jazz, Classical, Hip-Hop) using MFCC and spectrogram features.

## Tech Stack

- **Framework:** Next.js 15 (TypeScript)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT with bcrypt
- **ML:** @xenova/transformers (stubs)
- **UI:** React + Tailwind CSS
- **Testing:** Jest

## Quick Start

```bash
npm install
cp .env.example .env.local  # Add DATABASE_URL and JWT_SECRET
npx prisma generate && npx prisma db push
npm run dev
```

## Features

- **Upload:** WAV/MP3 files (max 50MB)
- **Classify:** Genre prediction with confidence scores
- **Train Models:** CNN/SVM algorithms (Admin only)
- **View Metrics:** Accuracy, precision, recall, F1-score, confusion matrices
- **Manage Datasets:** Create, rename, delete (Admin only)
- **Security:** JWT auth, role-based access, account locking after 3 failed attempts

## Architecture

**6 OOP Classes:**
- `UserInterface` - Upload, classify, view results
- `DatasetManager` - Dataset CRUD operations
- `FeatureExtractor` - MFCC & spectrogram extraction
- `ModelTrainer` - Training, checkpoints, evaluation
- `Evaluator` - Metrics calculation
- `SecurityManager` - Auth, authorization, logging

**8 API Routes:**
- `/api/auth/login` - Authentication
- `/api/upload` - File upload
- `/api/classify` - Classification
- `/api/datasets` - Dataset management (Admin)
- `/api/train` - Model training (Admin)
- `/api/models/[id]/metrics` - Metrics retrieval
- `/api/features/extract` - Feature extraction
- `/api/backup` - Database backup (Admin)

## Unit Tests

**85 tests covering all 6 test cases:**

```bash
npm test
```

**Test Coverage:**
- **TC01:** Upload validation (10 tests) - File format, size limits, database storage
- **TC02:** Classification (15 tests) - Genre prediction, confidence scores, feature extraction
- **TC03:** Authentication (18 tests) - Login, JWT, account locking, authorization
- **TC04:** Model Training (15 tests) - Training, checkpoints, evaluation, comparison
- **TC05:** Metrics (14 tests) - Accuracy, precision, recall, F1, confusion matrices
- **TC06:** Dataset Management (13 tests) - CRUD operations, validation

Tests use proper mocking of Prisma client and test actual class methods, not just API endpoints. All 85 tests pass.

## Database Setup

1. Create PostgreSQL database: `createdb music_classifier`
2. Update `.env.local` with `DATABASE_URL`
3. Run migrations: `npx prisma db push`
4. Initialize users: `npm run db:init`

## Admin Access

To get admin role, update user in database:
```sql
UPDATE users SET role = 'Administrator' WHERE email = 'your@email.com';
```

Or use the users management page (if you're already an admin).

## Requirements Coverage

✅ **21 Functional Requirements** (FR1-FR21) - All implemented  
✅ **10 Non-Functional Requirements** (NFR1-NFR10) - All met

## Deployment

Ready for Vercel deployment. Set environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens

## Team

- Setayesh Hamzehpour | 501273054
- Busola Elumeze | 501215907
- Armin Farzanehnia | 501278825
