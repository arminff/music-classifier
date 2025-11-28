import { NextRequest, NextResponse } from 'next/server';
import { UserInterface } from '@/lib/classes/UserInterface';
import { FeatureExtractor } from '@/lib/classes/FeatureExtractor';
import { prisma } from '@/lib/utils/prisma';
import { requireAuth } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authenticate user
    const user = await requireAuth(request);

    const body = await request.json();
    const { audioId, modelId } = body;

    if (!audioId || !modelId) {
      return NextResponse.json(
        { error: 'audioId and modelId are required' },
        { status: 400 }
      );
    }

    // Check if features are already extracted
    let features = await prisma.featureSet.findUnique({
      where: { audioId },
    });

    if (!features) {
      // Extract features
      const featureExtractor = new FeatureExtractor(prisma);
      await featureExtractor.extractFeatures(audioId);
    }

    // Get the latest model if modelId is not provided
    let model;
    if (modelId) {
      model = await prisma.model.findUnique({
        where: { id: modelId },
        include: { eval: true },
      });
    } else {
      model = await prisma.model.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { eval: true },
      });
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Classify audio (mock implementation)
    const userInterface = new UserInterface(prisma);
    const result = await userInterface.classifyAudio(audioId, model.id);

    const elapsedTime = Date.now() - startTime;

    // Ensure response is under 5 seconds (NFR2)
    if (elapsedTime > 5000) {
      console.warn(`Classification took ${elapsedTime}ms, exceeding 5s limit`);
    }

    return NextResponse.json({
      ...result,
      modelId: model.id,
      algorithmType: model.algorithmType,
      processingTime: elapsedTime,
    }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Classification failed' },
      { status: 500 }
    );
  }
}

