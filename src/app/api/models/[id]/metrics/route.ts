import { NextRequest, NextResponse } from 'next/server';
import { Evaluator } from '@/lib/classes/Evaluator';
import { prisma } from '@/lib/utils/prisma';
import { requireAuth } from '@/lib/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const modelId = parseInt(id);

    if (isNaN(modelId)) {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }

    const evaluator = new Evaluator(prisma);
    const metrics = await evaluator.getEvaluation(modelId);
    const confusionMatrix = await evaluator.generateConfusionMatrix(modelId);

    return NextResponse.json({
      ...metrics,
      confusionMatrix,
    }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

