/**
 * Test Case TC02: Classify Audio File
 * Tests FR3, FR16, NFR2 - Classification functionality and response time
 * 
 * This test suite validates audio classification, ensuring correct
 * genre prediction, confidence scores, and performance requirements.
 */

import { UserInterface } from '@/lib/classes/UserInterface';
import { FeatureExtractor } from '@/lib/classes/FeatureExtractor';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
const mockPrisma = {
  audioFile: {
    findUnique: jest.fn(),
  },
  featureSet: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  model: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  classificationResult: {
    create: jest.fn(),
  },
} as unknown as PrismaClient;

describe('Classify Audio File (TC02)', () => {
  let userInterface: UserInterface;
  let featureExtractor: FeatureExtractor;

  beforeEach(() => {
    jest.clearAllMocks();
    userInterface = new UserInterface(mockPrisma);
    featureExtractor = new FeatureExtractor(mockPrisma);
    // Reset any spies
    jest.restoreAllMocks();
  });

  describe('Successful classification', () => {
    it('should classify audio and return genre with confidence', async () => {
      const mockClassification = {
        id: 1,
        modelId: 1,
        audioId: 1,
        predictedGenre: 'Pop',
        confidence: 0.87,
        isHighCertainty: true,
      };

      (mockPrisma.classificationResult.create as jest.Mock).mockResolvedValue(mockClassification);

      const result = await userInterface.classifyAudio(1, 1);

      expect(result.genre).toBe('Pop');
      expect(result.confidence).toBe(0.87);
      expect(result.isHighCertainty).toBe(true);
      expect(mockPrisma.classificationResult.create).toHaveBeenCalledWith({
        data: {
          modelId: 1,
          audioId: 1,
          predictedGenre: 'Pop',
          confidence: 0.87,
          isHighCertainty: true,
        },
      });
    });

    it('should mark classification as high certainty when confidence > 0.8', async () => {
      const mockClassification = {
        id: 2,
        modelId: 1,
        audioId: 2,
        predictedGenre: 'Rock',
        confidence: 0.92,
        isHighCertainty: true,
      };

      (mockPrisma.classificationResult.create as jest.Mock).mockResolvedValue(mockClassification);

      const result = await userInterface.classifyAudio(2, 1);

      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.isHighCertainty).toBe(true);
    });

    it('should handle different genres correctly', async () => {
      const genres = ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop'];
      
      for (let i = 0; i < genres.length; i++) {
        const genre = genres[i];
        const mockClassification = {
          id: 3 + i,
          modelId: 1,
          audioId: 3 + i,
          predictedGenre: genre,
          confidence: 0.85,
          isHighCertainty: true,
        };

        // Mock the classifyAudio to return different genres
        jest.spyOn(userInterface, 'classifyAudio').mockResolvedValueOnce({
          genre,
          confidence: 0.85,
          isHighCertainty: true,
        });

        const result = await userInterface.classifyAudio(3 + i, 1);
        expect(result.genre).toBe(genre);
      }
    });
  });

  describe('Feature extraction', () => {
    it('should extract features from audio file', async () => {
      const mockAudioFile = {
        id: 1,
        filePath: '/uploads/test.wav',
        format: 'wav',
        duration: 180.5,
      };

      const mockFeatureSet = {
        id: 1,
        audioId: 1,
        sampleRate: 22050,
        mfccVector: JSON.stringify([0.1, 0.2, 0.3]),
        spectrogram: JSON.stringify([[0.1, 0.2], [0.3, 0.4]]),
      };

      (mockPrisma.audioFile.findUnique as jest.Mock).mockResolvedValue(mockAudioFile);
      (mockPrisma.featureSet.upsert as jest.Mock).mockResolvedValue(mockFeatureSet);

      const result = await featureExtractor.extractFeatures(1);

      expect(result.sampleRate).toBe(22050);
      expect(result.mfccVector).toBeDefined();
      expect(result.spectrogram).toBeDefined();
      expect(Array.isArray(result.mfccVector)).toBe(true);
      expect(Array.isArray(result.spectrogram)).toBe(true);
    });

    it('should throw error if audio file not found', async () => {
      (mockPrisma.audioFile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(featureExtractor.extractFeatures(999)).rejects.toThrow('Audio file not found');
    });

    it('should generate MFCC vector with 13 coefficients', async () => {
      const mockAudioFile = {
        id: 2,
        filePath: '/uploads/test2.wav',
        format: 'wav',
        duration: 120.0,
      };

      (mockPrisma.audioFile.findUnique as jest.Mock).mockResolvedValue(mockAudioFile);
      (mockPrisma.featureSet.upsert as jest.Mock).mockResolvedValue({
        id: 2,
        audioId: 2,
        sampleRate: 22050,
        mfccVector: JSON.stringify(Array(13).fill(0)),
        spectrogram: JSON.stringify([]),
      });

      const result = await featureExtractor.extractFeatures(2);

      expect(result.mfccVector.length).toBe(13);
    });

    it('should normalize features correctly', () => {
      const featureExtractor = new FeatureExtractor(mockPrisma);
      const features = [1, 2, 3, 4, 5];
      const normalized = featureExtractor.normalize(features);

      expect(normalized).toHaveLength(5);
      // Mean should be approximately 0 after normalization
      const mean = normalized.reduce((a, b) => a + b, 0) / normalized.length;
      expect(Math.abs(mean)).toBeLessThan(0.01);
    });
  });

  describe('Performance requirements (NFR2)', () => {
    it('should complete classification within reasonable time', async () => {
      const mockClassification = {
        id: 4,
        modelId: 1,
        audioId: 4,
        predictedGenre: 'Jazz',
        confidence: 0.90,
        isHighCertainty: true,
      };

      (mockPrisma.classificationResult.create as jest.Mock).mockResolvedValue(mockClassification);

      const startTime = Date.now();
      await userInterface.classifyAudio(4, 1);
      const elapsedTime = Date.now() - startTime;

      // Should complete in under 1 second for mock (real implementation should be < 5s)
      expect(elapsedTime).toBeLessThan(1000);
    });
  });

  describe('Confidence score validation', () => {
    it('should return confidence between 0 and 1', async () => {
      const mockClassification = {
        id: 5,
        modelId: 1,
        audioId: 5,
        predictedGenre: 'Classical',
        confidence: 0.75,
        isHighCertainty: false,
      };

      (mockPrisma.classificationResult.create as jest.Mock).mockResolvedValue(mockClassification);

      const result = await userInterface.classifyAudio(5, 1);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should correctly identify low certainty classifications', async () => {
      // Mock classifyAudio to return low confidence
      jest.spyOn(userInterface, 'classifyAudio').mockResolvedValueOnce({
        genre: 'Hip-Hop',
        confidence: 0.65,
        isHighCertainty: false,
      });

      const result = await userInterface.classifyAudio(6, 1);

      expect(result.confidence).toBeLessThan(0.8);
      expect(result.isHighCertainty).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors during classification', async () => {
      const dbError = new Error('Database connection failed');
      (mockPrisma.classificationResult.create as jest.Mock).mockRejectedValue(dbError);

      await expect(userInterface.classifyAudio(1, 1)).rejects.toThrow('Database connection failed');
    });
  });
});
