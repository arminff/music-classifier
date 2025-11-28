import { PrismaClient } from '@prisma/client';

/**
 * UserInterface class - Handles user interactions with the system
 * Maps to FR1, FR2, FR3, FR4
 */
export class UserInterface {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Upload audio file (FR1)
   */
  async uploadAudio(file: File, datasetId?: number): Promise<{ id: number; message: string }> {
    // Validation will be done in API route
    // This method handles the business logic
    const filePath = `/uploads/${Date.now()}-${file.name}`;
    const format = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    
    const audioFile = await this.prisma.audioFile.create({
      data: {
        filePath,
        format,
        duration: 0, // Will be calculated during feature extraction
        datasetId: datasetId || null,
      },
    });

    return {
      id: audioFile.id,
      message: 'File uploaded successfully',
    };
  }

  /**
   * Classify audio file (FR3)
   */
  async classifyAudio(audioId: number, modelId: number): Promise<{
    genre: string;
    confidence: number;
    isHighCertainty: boolean;
  }> {
    // This will be implemented with ML model
    // For now, return a placeholder
    const result = {
      genre: 'Pop',
      confidence: 0.87,
      isHighCertainty: true,
    };

    // Store classification result
    await this.prisma.classificationResult.create({
      data: {
        modelId,
        audioId,
        predictedGenre: result.genre,
        confidence: result.confidence,
        isHighCertainty: result.confidence > 0.8,
      },
    });

    return result;
  }

  /**
   * View results and metrics (FR4)
   */
  async viewResults(modelId: number): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: any;
  }> {
    const evaluation = await this.prisma.evaluationResult.findUnique({
      where: { modelId },
    });

    if (!evaluation) {
      throw new Error('Evaluation results not found');
    }

    return {
      accuracy: evaluation.accuracy,
      precision: evaluation.precision,
      recall: evaluation.recall,
      f1Score: evaluation.f1Score,
      confusionMatrix: JSON.parse(evaluation.confusionMatrix),
    };
  }

  /**
   * Display training progress (FR2)
   */
  async getTrainingProgress(trainingId: string): Promise<{
    epoch: number;
    loss: number;
    accuracy: number;
  }> {
    // This will be implemented with real training tracking
    return {
      epoch: 1,
      loss: 0.5,
      accuracy: 0.85,
    };
  }
}

