import { PrismaClient } from '@prisma/client';

/**
 * Evaluator class - Computes accuracy, precision, recall, F1-score, and confusion matrices
 * Maps to FR15, FR16
 */
export class Evaluator {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get evaluation metrics (FR15)
   */
  async getEvaluation(modelId: number): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
  }> {
    const evaluation = await this.prisma.evaluationResult.findUnique({
      where: { modelId },
    });

    if (!evaluation) {
      throw new Error('Evaluation not found for this model');
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
   * Generate confusion matrix (FR16)
   */
  async generateConfusionMatrix(modelId: number): Promise<number[][]> {
    const evaluation = await this.prisma.evaluationResult.findUnique({
      where: { modelId },
    });

    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    return JSON.parse(evaluation.confusionMatrix);
  }

  /**
   * Calculate metrics from predictions
   */
  calculateMetrics(
    predictions: Array<{ predicted: string; actual: string }>
  ): {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: Record<string, Record<string, number>>;
  } {
    const classes = Array.from(new Set([...predictions.map((p) => p.predicted), ...predictions.map((p) => p.actual)]));
    const confusionMatrix: Record<string, Record<string, number>> = {};

    // Initialize confusion matrix
    classes.forEach((cls) => {
      confusionMatrix[cls] = {};
      classes.forEach((cls2) => {
        confusionMatrix[cls][cls2] = 0;
      });
    });

    // Fill confusion matrix
    predictions.forEach((p) => {
      confusionMatrix[p.actual][p.predicted]++;
    });

    // Calculate metrics
    let correct = 0;
    const truePositives: Record<string, number> = {};
    const falsePositives: Record<string, number> = {};
    const falseNegatives: Record<string, number> = {};

    classes.forEach((cls) => {
      truePositives[cls] = confusionMatrix[cls][cls];
      falsePositives[cls] = Object.values(confusionMatrix)
        .map((row) => row[cls] || 0)
        .reduce((a, b) => a + b, 0) - truePositives[cls];
      falseNegatives[cls] = Object.values(confusionMatrix[cls])
        .reduce((a, b) => a + b, 0) - truePositives[cls];
      correct += truePositives[cls];
    });

    const accuracy = correct / predictions.length;
    const precision = classes.reduce((sum, cls) => {
      const tp = truePositives[cls];
      const fp = falsePositives[cls];
      return sum + (tp + fp > 0 ? tp / (tp + fp) : 0);
    }, 0) / classes.length;
    const recall = classes.reduce((sum, cls) => {
      const tp = truePositives[cls];
      const fn = falseNegatives[cls];
      return sum + (tp + fn > 0 ? tp / (tp + fn) : 0);
    }, 0) / classes.length;
    const f1Score = (2 * precision * recall) / (precision + recall);

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix,
    };
  }
}

