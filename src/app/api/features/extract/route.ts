import { NextRequest, NextResponse } from 'next/server';
import { FeatureExtractor } from '@/lib/classes/FeatureExtractor';
import { prisma } from '@/lib/utils/prisma';
import { requireAuth } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const { audioFileId } = body;

    if (!audioFileId) {
      return NextResponse.json(
        { error: 'audioFileId is required' },
        { status: 400 }
      );
    }

    const featureExtractor = new FeatureExtractor(prisma);
    const features = await featureExtractor.extractFeatures(audioFileId);

    return NextResponse.json({
      audioFileId,
      sampleRate: features.sampleRate,
      mfccVector: features.mfccVector,
      spectrogram: features.spectrogram,
      message: 'Features extracted successfully',
    }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Feature extraction failed' },
      { status: 500 }
    );
  }
}

