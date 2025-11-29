/**
 * Test Case TC04: Train Model
 * Tests FR11, FR12, FR13 - Model training and evaluation
 * 
 * This test suite validates model training functionality,
 * checkpoint saving, and evaluation metrics generation.
 */

import { ModelTrainer } from '@/lib/classes/ModelTrainer';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
const mockPrisma = {
  model: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  evaluationResult: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient;

describe('Train Model (TC04)', () => {
  let modelTrainer: ModelTrainer;

  beforeEach(() => {
    jest.clearAllMocks();
    modelTrainer = new ModelTrainer(mockPrisma);
  });

  describe('Model training', () => {
    it('should start training with valid dataset', async () => {
      const mockModel = {
        id: 1,
        algorithmType: 'CNN',
        weightsPath: '/models/1234567890-CNN.h5',
        hyperparameters: JSON.stringify({ epochs: 50, batchSize: 32 }),
      };

      (mockPrisma.model.create as jest.Mock).mockResolvedValue(mockModel);

      const result = await modelTrainer.trainModel(1, 'CNN', { epochs: 50, batchSize: 32 });

      expect(result.modelId).toBe(1);
      expect(result.trainingId).toBeDefined();
      expect(result.trainingId).toContain('training-1-');
      expect(mockPrisma.model.create).toHaveBeenCalledWith({
        data: {
          algorithmType: 'CNN',
          weightsPath: expect.stringMatching(/\/models\/\d+-CNN\.h5/),
          hyperparameters: JSON.stringify({ epochs: 50, batchSize: 32 }),
        },
      });
    });

    it('should support different algorithm types', async () => {
      const algorithms = ['CNN', 'SVM', 'RandomForest'];
      
      for (const algorithm of algorithms) {
        const mockModel = {
          id: 2,
          algorithmType: algorithm,
          weightsPath: `/models/${Date.now()}-${algorithm}.h5`,
          hyperparameters: JSON.stringify({}),
        };

        (mockPrisma.model.create as jest.Mock).mockResolvedValue(mockModel);

        const result = await modelTrainer.trainModel(1, algorithm);

        expect(result.modelId).toBe(2);
        expect(mockPrisma.model.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            algorithmType: algorithm,
          }),
        });
      }
    });

    it('should handle default hyperparameters', async () => {
      const mockModel = {
        id: 3,
        algorithmType: 'CNN',
        weightsPath: '/models/test.h5',
        hyperparameters: JSON.stringify({}),
      };

      (mockPrisma.model.create as jest.Mock).mockResolvedValue(mockModel);

      const result = await modelTrainer.trainModel(1, 'CNN');

      expect(result.modelId).toBe(3);
      expect(mockPrisma.model.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hyperparameters: JSON.stringify({}),
        }),
      });
    });
  });

  describe('Checkpoint saving (FR12)', () => {
    it('should save checkpoint with epoch and metrics', async () => {
      const mockUpdatedModel = {
        id: 1,
        weightsPath: '/models/checkpoint-1-epoch-10.h5',
      };

      (mockPrisma.model.update as jest.Mock).mockResolvedValue(mockUpdatedModel);

      await modelTrainer.saveCheckpoint(1, 10, 0.25, 0.88);

      expect(mockPrisma.model.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          weightsPath: '/models/checkpoint-1-epoch-10.h5',
        },
      });
    });

    it('should save multiple checkpoints for different epochs', async () => {
      const epochs = [5, 10, 15, 20];
      
      for (const epoch of epochs) {
        (mockPrisma.model.update as jest.Mock).mockResolvedValue({
          id: 1,
          weightsPath: `/models/checkpoint-1-epoch-${epoch}.h5`,
        });

        await modelTrainer.saveCheckpoint(1, epoch, 0.3, 0.85);

        expect(mockPrisma.model.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: {
            weightsPath: `/models/checkpoint-1-epoch-${epoch}.h5`,
          },
        });
      }
    });
  });

  describe('Model evaluation (FR13)', () => {
    it('should evaluate model and return metrics', async () => {
      const mockEvaluation = {
        id: 1,
        modelId: 1,
        accuracy: 0.87,
        precision: 0.85,
        recall: 0.86,
        f1Score: 0.855,
        confusionMatrix: JSON.stringify([[15, 2], [1, 18]]),
      };

      (mockPrisma.evaluationResult.upsert as jest.Mock).mockResolvedValue(mockEvaluation);

      const result = await modelTrainer.evaluateModel(1);

      expect(result.accuracy).toBeGreaterThanOrEqual(0.85);
      expect(result.accuracy).toBeLessThanOrEqual(0.95);
      expect(result.precision).toBeDefined();
      expect(result.recall).toBeDefined();
      expect(result.f1Score).toBeDefined();
      expect(result.confusionMatrix).toBeDefined();
      expect(Array.isArray(result.confusionMatrix)).toBe(true);
    });

    it('should calculate F1 score correctly', async () => {
      const mockEvaluation = {
        id: 2,
        modelId: 2,
        accuracy: 0.90,
        precision: 0.88,
        recall: 0.89,
        f1Score: 0.885,
        confusionMatrix: JSON.stringify([[20, 1], [1, 23]]),
      };

      (mockPrisma.evaluationResult.upsert as jest.Mock).mockResolvedValue(mockEvaluation);

      const result = await modelTrainer.evaluateModel(2);

      // F1 should be calculated as 2 * (precision * recall) / (precision + recall)
      const expectedF1 = (2 * result.precision * result.recall) / (result.precision + result.recall);
      expect(Math.abs(result.f1Score - expectedF1)).toBeLessThan(0.01);
    });

    it('should generate confusion matrix with correct dimensions', async () => {
      const genres = ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop'];
      const mockEvaluation = {
        id: 3,
        modelId: 3,
        accuracy: 0.92,
        precision: 0.90,
        recall: 0.91,
        f1Score: 0.905,
        confusionMatrix: JSON.stringify(
          genres.map(() => genres.map(() => Math.floor(Math.random() * 100)))
        ),
      };

      (mockPrisma.evaluationResult.upsert as jest.Mock).mockResolvedValue(mockEvaluation);

      const result = await modelTrainer.evaluateModel(3);

      expect(result.confusionMatrix.length).toBe(genres.length);
      expect(result.confusionMatrix[0].length).toBe(genres.length);
    });

    it('should store evaluation results in database', async () => {
      const mockEvaluation = {
        id: 4,
        modelId: 4,
        accuracy: 0.88,
        precision: 0.86,
        recall: 0.87,
        f1Score: 0.865,
        confusionMatrix: JSON.stringify([[10, 2], [1, 12]]),
      };

      (mockPrisma.evaluationResult.upsert as jest.Mock).mockResolvedValue(mockEvaluation);

      await modelTrainer.evaluateModel(4);

      expect(mockPrisma.evaluationResult.upsert).toHaveBeenCalledWith({
        where: { modelId: 4 },
        create: expect.objectContaining({
          modelId: 4,
          accuracy: expect.any(Number),
          precision: expect.any(Number),
          recall: expect.any(Number),
          f1Score: expect.any(Number),
          confusionMatrix: expect.any(String),
        }),
        update: expect.objectContaining({
          accuracy: expect.any(Number),
          precision: expect.any(Number),
          recall: expect.any(Number),
          f1Score: expect.any(Number),
          confusionMatrix: expect.any(String),
        }),
      });
    });
  });

  describe('Model comparison (FR14)', () => {
    it('should compare multiple models', async () => {
      const mockModels = [
        {
          id: 1,
          algorithmType: 'CNN',
          eval: { accuracy: 0.87, f1Score: 0.855 },
        },
        {
          id: 2,
          algorithmType: 'SVM',
          eval: { accuracy: 0.82, f1Score: 0.810 },
        },
      ];

      (mockPrisma.model.findMany as jest.Mock).mockResolvedValue(mockModels);

      const result = await modelTrainer.compareModels([1, 2]);

      expect(result).toHaveLength(2);
      expect(result[0].modelId).toBe(1);
      expect(result[0].algorithmType).toBe('CNN');
      expect(result[0].accuracy).toBe(0.87);
      expect(result[1].modelId).toBe(2);
      expect(result[1].algorithmType).toBe('SVM');
      expect(result[1].accuracy).toBe(0.82);
    });

    it('should handle models without evaluation results', async () => {
      const mockModels = [
        {
          id: 3,
          algorithmType: 'CNN',
          eval: null,
        },
      ];

      (mockPrisma.model.findMany as jest.Mock).mockResolvedValue(mockModels);

      const result = await modelTrainer.compareModels([3]);

      expect(result[0].accuracy).toBe(0);
      expect(result[0].f1Score).toBe(0);
    });

    it('should return empty array for non-existent models', async () => {
      (mockPrisma.model.findMany as jest.Mock).mockResolvedValue([]);

      const result = await modelTrainer.compareModels([999, 1000]);

      expect(result).toHaveLength(0);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors during training', async () => {
      const dbError = new Error('Database connection failed');
      (mockPrisma.model.create as jest.Mock).mockRejectedValue(dbError);

      await expect(modelTrainer.trainModel(1, 'CNN')).rejects.toThrow('Database connection failed');
    });

    it('should handle errors during checkpoint saving', async () => {
      const dbError = new Error('Failed to save checkpoint');
      (mockPrisma.model.update as jest.Mock).mockRejectedValue(dbError);

      await expect(modelTrainer.saveCheckpoint(1, 5, 0.3, 0.85)).rejects.toThrow('Failed to save checkpoint');
    });
  });
});
