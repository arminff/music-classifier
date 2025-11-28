import { NextRequest, NextResponse } from 'next/server';
import { ModelTrainer } from '@/lib/classes/ModelTrainer';
import { prisma } from '@/lib/utils/prisma';
import { requireAuth } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const user = await requireAuth(request, 'Administrator');

    const body = await request.json();
    const { datasetId, algorithmType, hyperparameters } = body;

    if (!datasetId || !algorithmType) {
      return NextResponse.json(
        { error: 'datasetId and algorithmType are required' },
        { status: 400 }
      );
    }

    const modelTrainer = new ModelTrainer(prisma);
    const { modelId, trainingId } = await modelTrainer.trainModel(
      datasetId,
      algorithmType,
      hyperparameters || {}
    );

    // Simulate training progress and evaluation
    // In a real implementation, this would be done asynchronously
    setTimeout(async () => {
      await modelTrainer.evaluateModel(modelId);
    }, 1000);

    return NextResponse.json({
      modelId,
      trainingId,
      message: 'Training started',
    }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Training failed' },
      { status: 500 }
    );
  }
}

// Server-Sent Events endpoint for training progress
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'Administrator');
    const { searchParams } = new URL(request.url);
    const trainingId = searchParams.get('trainingId');

    if (!trainingId) {
      return NextResponse.json(
        { error: 'trainingId is required' },
        { status: 400 }
      );
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Simulate training progress
        for (let epoch = 1; epoch <= 10; epoch++) {
          const loss = 0.5 - (epoch * 0.04);
          const accuracy = 0.7 + (epoch * 0.025);
          
          const data = JSON.stringify({
            epoch,
            loss: Math.max(0, loss),
            accuracy: Math.min(1, accuracy),
          });
          
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to stream training progress' },
      { status: 500 }
    );
  }
}

