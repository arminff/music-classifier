/**
 * Test Case TC05: View Metrics
 * Tests FR4, FR15 - Metrics retrieval and display
 * 
 * This test suite validates the retrieval and calculation
 * of model evaluation metrics including accuracy, precision, recall, and F1-score.
 */

import { Evaluator } from '@/lib/classes/Evaluator';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
const mockPrisma = {
  evaluationResult: {
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient;

describe('View Metrics (TC05)', () => {
  let evaluator: Evaluator;

  beforeEach(() => {
    jest.clearAllMocks();
    evaluator = new Evaluator(mockPrisma);
  });

  describe('Retrieve evaluation metrics', () => {
    it('should retrieve model metrics', async () => {
      const mockEvaluation = {
        id: 1,
        modelId: 1,
        accuracy: 0.87,
        precision: 0.85,
        recall: 0.86,
        f1Score: 0.855,
        confusionMatrix: JSON.stringify([[15, 2, 1], [1, 18, 1], [2, 1, 16]]),
      };

      (mockPrisma.evaluationResult.findUnique as jest.Mock).mockResolvedValue(mockEvaluation);

      const result = await evaluator.getEvaluation(1);

      expect(result.accuracy).toBe(0.87);
      expect(result.precision).toBe(0.85);
      expect(result.recall).toBe(0.86);
      expect(result.f1Score).toBe(0.855);
      expect(result.confusionMatrix).toBeDefined();
      expect(Array.isArray(result.confusionMatrix)).toBe(true);
    });

    it('should return metrics with accuracy > 0.8', async () => {
      const mockEvaluation = {
        id: 2,
        modelId: 2,
        accuracy: 0.92,
        precision: 0.90,
        recall: 0.91,
        f1Score: 0.905,
        confusionMatrix: JSON.stringify([[20, 1], [1, 23]]),
      };

      (mockPrisma.evaluationResult.findUnique as jest.Mock).mockResolvedValue(mockEvaluation);

      const result = await evaluator.getEvaluation(2);

      expect(result.accuracy).toBeGreaterThan(0.8);
      expect(result.accuracy).toBe(0.92);
    });

    it('should parse confusion matrix from JSON string', async () => {
      const confusionMatrix = [[10, 2, 1], [1, 12, 2], [0, 1, 11]];
      const mockEvaluation = {
        id: 3,
        modelId: 3,
        accuracy: 0.88,
        precision: 0.86,
        recall: 0.87,
        f1Score: 0.865,
        confusionMatrix: JSON.stringify(confusionMatrix),
      };

      (mockPrisma.evaluationResult.findUnique as jest.Mock).mockResolvedValue(mockEvaluation);

      const result = await evaluator.getEvaluation(3);

      expect(result.confusionMatrix).toEqual(confusionMatrix);
      expect(result.confusionMatrix.length).toBe(3);
      expect(result.confusionMatrix[0].length).toBe(3);
    });

    it('should throw error when evaluation not found', async () => {
      (mockPrisma.evaluationResult.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(evaluator.getEvaluation(999)).rejects.toThrow('Evaluation not found for this model');
    });
  });

  describe('Confusion matrix generation (FR16)', () => {
    it('should generate confusion matrix for model', async () => {
      const confusionMatrix = [[15, 2], [1, 18]];
      const mockEvaluation = {
        id: 4,
        modelId: 4,
        accuracy: 0.89,
        precision: 0.87,
        recall: 0.88,
        f1Score: 0.875,
        confusionMatrix: JSON.stringify(confusionMatrix),
      };

      (mockPrisma.evaluationResult.findUnique as jest.Mock).mockResolvedValue(mockEvaluation);

      const result = await evaluator.generateConfusionMatrix(4);

      expect(result).toEqual(confusionMatrix);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should handle multi-class confusion matrix', async () => {
      const confusionMatrix = [
        [20, 1, 0, 1, 0],
        [1, 18, 1, 0, 1],
        [0, 1, 19, 0, 0],
        [1, 0, 0, 17, 1],
        [0, 1, 0, 1, 19],
      ];
      const mockEvaluation = {
        id: 5,
        modelId: 5,
        accuracy: 0.91,
        precision: 0.89,
        recall: 0.90,
        f1Score: 0.895,
        confusionMatrix: JSON.stringify(confusionMatrix),
      };

      (mockPrisma.evaluationResult.findUnique as jest.Mock).mockResolvedValue(mockEvaluation);

      const result = await evaluator.generateConfusionMatrix(5);

      expect(result.length).toBe(5);
      expect(result[0].length).toBe(5);
      expect(result[0][0]).toBe(20); // True positives for first class
    });

    it('should throw error when evaluation not found for confusion matrix', async () => {
      (mockPrisma.evaluationResult.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(evaluator.generateConfusionMatrix(999)).rejects.toThrow('Evaluation not found');
    });
  });

  describe('Metrics calculation from predictions', () => {
    it('should calculate accuracy correctly', () => {
      const predictions = [
        { predicted: 'Pop', actual: 'Pop' },
        { predicted: 'Rock', actual: 'Rock' },
        { predicted: 'Jazz', actual: 'Jazz' },
        { predicted: 'Pop', actual: 'Rock' },
        { predicted: 'Jazz', actual: 'Jazz' },
      ];

      const result = evaluator.calculateMetrics(predictions);

      // 4 correct out of 5 (Pop, Rock, Jazz, Jazz are correct)
      expect(result.accuracy).toBe(0.8);
      expect(result.accuracy).toBeGreaterThanOrEqual(0);
      expect(result.accuracy).toBeLessThanOrEqual(1);
    });

    it('should calculate precision and recall', () => {
      const predictions = [
        { predicted: 'Pop', actual: 'Pop' },
        { predicted: 'Pop', actual: 'Pop' },
        { predicted: 'Pop', actual: 'Rock' },
        { predicted: 'Rock', actual: 'Rock' },
        { predicted: 'Rock', actual: 'Jazz' },
      ];

      const result = evaluator.calculateMetrics(predictions);

      expect(result.precision).toBeDefined();
      expect(result.recall).toBeDefined();
      expect(result.precision).toBeGreaterThanOrEqual(0);
      expect(result.precision).toBeLessThanOrEqual(1);
      expect(result.recall).toBeGreaterThanOrEqual(0);
      expect(result.recall).toBeLessThanOrEqual(1);
    });

    it('should calculate F1 score correctly', () => {
      const predictions = [
        { predicted: 'Pop', actual: 'Pop' },
        { predicted: 'Pop', actual: 'Pop' },
        { predicted: 'Rock', actual: 'Rock' },
        { predicted: 'Jazz', actual: 'Jazz' },
      ];

      const result = evaluator.calculateMetrics(predictions);

      // F1 = 2 * (precision * recall) / (precision + recall)
      const expectedF1 = (2 * result.precision * result.recall) / (result.precision + result.recall);
      expect(Math.abs(result.f1Score - expectedF1)).toBeLessThan(0.01);
    });

    it('should generate confusion matrix from predictions', () => {
      const predictions = [
        { predicted: 'Pop', actual: 'Pop' },
        { predicted: 'Pop', actual: 'Pop' },
        { predicted: 'Rock', actual: 'Rock' },
        { predicted: 'Pop', actual: 'Rock' },
        { predicted: 'Jazz', actual: 'Jazz' },
      ];

      const result = evaluator.calculateMetrics(predictions);

      expect(result.confusionMatrix).toBeDefined();
      expect(result.confusionMatrix['Pop']).toBeDefined();
      expect(result.confusionMatrix['Rock']).toBeDefined();
      expect(result.confusionMatrix['Jazz']).toBeDefined();
      expect(result.confusionMatrix['Pop']['Pop']).toBe(2);
      // Pop predicted when actual was Rock
      expect(result.confusionMatrix['Rock']['Pop']).toBe(1);
    });

    it('should handle empty predictions array', () => {
      const predictions: Array<{ predicted: string; actual: string }> = [];

      const result = evaluator.calculateMetrics(predictions);

      expect(result.accuracy).toBeNaN(); // Division by zero
      expect(result.confusionMatrix).toBeDefined();
    });

    it('should handle single class predictions', () => {
      const predictions = [
        { predicted: 'Pop', actual: 'Pop' },
        { predicted: 'Pop', actual: 'Pop' },
        { predicted: 'Pop', actual: 'Pop' },
      ];

      const result = evaluator.calculateMetrics(predictions);

      expect(result.accuracy).toBe(1.0);
      expect(result.precision).toBe(1.0);
      expect(result.recall).toBe(1.0);
      expect(result.f1Score).toBe(1.0);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      (mockPrisma.evaluationResult.findUnique as jest.Mock).mockRejectedValue(dbError);

      await expect(evaluator.getEvaluation(1)).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid JSON in confusion matrix', async () => {
      const mockEvaluation = {
        id: 6,
        modelId: 6,
        accuracy: 0.85,
        precision: 0.83,
        recall: 0.84,
        f1Score: 0.835,
        confusionMatrix: 'invalid-json',
      };

      (mockPrisma.evaluationResult.findUnique as jest.Mock).mockResolvedValue(mockEvaluation);

      await expect(evaluator.getEvaluation(6)).rejects.toThrow();
    });
  });
});
