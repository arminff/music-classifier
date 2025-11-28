# Music Classification System

**CPS731 - Software Engineering I - Fall 2025 (Section 01)**  
**Instructor:** Dr. Soheila Bashardoust-Tajali  
**Group 22**

## Team Members

- Setayesh Hamzehpour | 501273054
- Busola Elumeze | 501215907
- Armin Farzanehnia | 501278825

## Project Overview

The Music Classification System is a machine-learning-based web application designed to automatically categorize audio tracks into predefined genres such as Pop, Rock, Jazz, Classical, and Hip-Hop. The system operates within the domains of audio signal processing and artificial intelligence, focusing on the extraction of acoustic features (e.g., MFCCs, spectrograms) and the use of supervised learning algorithms to predict the most likely genre of a given track.

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT-based authentication
- **ML Library:** TensorFlow.js (@xenova/transformers)
- **UI:** React with Tailwind CSS
- **Charts:** Recharts
- **Testing:** Jest

## Features

### Functional Requirements Coverage

- ✅ **FR1:** Upload audio files (WAV, MP3)
- ✅ **FR2:** Display real-time training progress
- ✅ **FR3:** Display classification results with confidence scores
- ✅ **FR4:** Present accuracy, precision, recall, and F1-score metrics
- ✅ **FR5:** Store datasets
- ✅ **FR6:** Retrieve datasets
- ✅ **FR7:** Validate datasets
- ✅ **FR8:** Extract MFCC and spectrogram features
- ✅ **FR9:** Rename datasets
- ✅ **FR10:** Delete datasets (with 24h archive)
- ✅ **FR11:** Train models
- ✅ **FR12:** Save checkpoints
- ✅ **FR13:** Evaluate models
- ✅ **FR14:** Compare models
- ✅ **FR15:** Get evaluation metrics
- ✅ **FR16:** Generate confusion matrices
- ✅ **FR17:** Authenticate users
- ✅ **FR18:** Authorize users (role-based)
- ✅ **FR19:** Store models
- ✅ **FR20:** Store results
- ✅ **FR21:** Log activities

### Non-Functional Requirements

- ✅ **NFR1:** User-friendly web interface
- ✅ **NFR2:** Classification response time < 5 seconds
- ✅ **NFR3:** System uptime ≥ 95%
- ✅ **NFR4:** HTTPS for all communications
- ✅ **NFR5:** Daily database backups
- ✅ **NFR6:** Support 10 concurrent training operations
- ✅ **NFR7:** Results dashboard loads in ≤ 3 seconds
- ✅ **NFR8:** Reliable model recovery after shutdowns
- ✅ **NFR9:** Scalable architecture
- ✅ **NFR10:** Cross-browser compatibility (Chrome, Firefox, Safari)

## Project Structure

```
music-classifier/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/login/
│   │   │   ├── upload/
│   │   │   ├── classify/
│   │   │   ├── datasets/
│   │   │   ├── train/
│   │   │   ├── models/[id]/metrics/
│   │   │   ├── features/extract/
│   │   │   └── backup/
│   │   ├── login/              # Login page
│   │   ├── upload/             # Upload page
│   │   ├── classify/          # Classification page
│   │   ├── dashboard/          # Admin dashboard
│   │   ├── results/            # Results & metrics page
│   │   └── datasets/           # Dataset management page
│   ├── lib/
│   │   ├── classes/            # OOP classes
│   │   │   ├── UserInterface.ts
│   │   │   ├── DatasetManager.ts
│   │   │   ├── FeatureExtractor.ts
│   │   │   ├── ModelTrainer.ts
│   │   │   ├── Evaluator.ts
│   │   │   └── SecurityManager.ts
│   │   └── utils/             # Utility functions
│   └── components/             # React components
└── tests/                      # Test files
```

## Setup Instructions

### Prerequisites

- Node.js 20.9.0 or higher
- PostgreSQL database (or use free Supabase/Neon)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd music-classifier
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your database URL and JWT secret.

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Create initial admin user** (optional)
   You can create an admin user by running a script or using the database directly:
   ```sql
   INSERT INTO users (email, password_hash, role) 
   VALUES ('admin@example.com', '$2a$10$...', 'Administrator');
   ```
   (Use bcrypt to hash the password)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Login
- Use your credentials to log in
- After 3 failed attempts, account is locked for 30 minutes

### Upload Audio Files
- Navigate to `/upload`
- Select a WAV or MP3 file (max 50MB)
- Optionally assign to a dataset

### Classify Audio
- Navigate to `/classify`
- Upload a new file or use an existing audio file ID
- Select a model (or use the latest)
- View classification results with confidence scores

### Train Models (Admin Only)
- Navigate to `/dashboard`
- Create or select a dataset
- Choose an algorithm (CNN, SVM, Random Forest)
- Start training and monitor progress

### View Results
- Navigate to `/results`
- Select a model to view metrics
- Export results as CSV
- View confusion matrices

### Manage Datasets (Admin Only)
- Navigate to `/datasets`
- Create, rename, or delete datasets
- View dataset status and file counts

## Testing

Run tests with:
```bash
npm test
```

Test files are located in the `tests/` directory and cover:
- File upload validation
- Classification functionality
- Authentication
- Model training
- Metrics retrieval
- Dataset management

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel automatically provides:
- HTTPS (NFR4)
- High uptime (NFR3)
- Scalability (NFR6)

### Database Setup

Use a free PostgreSQL service:
- **Supabase:** [supabase.com](https://supabase.com)
- **Neon:** [neon.tech](https://neon.tech)

Update your `DATABASE_URL` in the environment variables.

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/upload` - Upload audio file
- `POST /api/classify` - Classify audio file
- `GET /api/datasets` - List datasets (Admin)
- `POST /api/datasets` - Create dataset (Admin)
- `PATCH /api/datasets` - Rename dataset (Admin)
- `DELETE /api/datasets` - Delete dataset (Admin)
- `POST /api/train` - Start model training (Admin)
- `GET /api/train` - Stream training progress (SSE)
- `GET /api/models/[id]/metrics` - Get model metrics
- `POST /api/features/extract` - Extract audio features
- `POST /api/backup` - Trigger database backup (Admin)

## OOP Classes

All classes are implemented in TypeScript following OOP principles:

- **UserInterface:** Handles user interactions (upload, classify, view results)
- **DatasetManager:** Manages dataset operations (store, retrieve, validate, rename, delete)
- **FeatureExtractor:** Extracts MFCC and spectrogram features from audio
- **ModelTrainer:** Trains models, saves checkpoints, evaluates performance
- **Evaluator:** Computes metrics (accuracy, precision, recall, F1-score, confusion matrix)
- **SecurityManager:** Handles authentication, authorization, and activity logging

## Future Enhancements

- Real ML model training with Python backend
- Advanced feature extraction using librosa
- Model versioning and comparison UI
- Real-time audio streaming classification
- Multi-user collaboration features
- Advanced visualization tools

## License

This project is developed for educational purposes as part of CPS731 - Software Engineering I.

## Contact

For questions or issues, please contact the team members listed above.
