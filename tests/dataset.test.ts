/**
 * Test Case TC06: Manage Datasets
 * Tests FR5, FR9, FR10 - Dataset management operations
 * 
 * This test suite validates dataset creation, retrieval,
 * validation, renaming, and deletion functionality.
 */

import { DatasetManager } from '@/lib/classes/DatasetManager';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
const mockPrisma = {
  dataset: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('Manage Datasets (TC06)', () => {
  let datasetManager: DatasetManager;

  beforeEach(() => {
    jest.clearAllMocks();
    datasetManager = new DatasetManager(mockPrisma);
  });

  describe('Store dataset (FR5)', () => {
    it('should create dataset with valid name', async () => {
      const mockDataset = {
        id: 1,
        name: 'Test Dataset',
        status: 'valid',
        files: [],
      };

      (mockPrisma.dataset.create as jest.Mock).mockResolvedValue(mockDataset);

      const result = await datasetManager.storeDataset('Test Dataset');

      expect(result.id).toBe(1);
      expect(mockPrisma.dataset.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Dataset',
          status: 'valid',
        },
      });
    });

    it('should create dataset with custom status', async () => {
      const mockDataset = {
        id: 2,
        name: 'Invalid Dataset',
        status: 'invalid',
        files: [],
      };

      (mockPrisma.dataset.create as jest.Mock).mockResolvedValue(mockDataset);

      const result = await datasetManager.storeDataset('Invalid Dataset', 'invalid');

      expect(result.id).toBe(2);
      expect(mockPrisma.dataset.create).toHaveBeenCalledWith({
        data: {
          name: 'Invalid Dataset',
          status: 'invalid',
        },
      });
    });

    it('should default to valid status when not specified', async () => {
      const mockDataset = {
        id: 3,
        name: 'Default Dataset',
        status: 'valid',
        files: [],
      };

      (mockPrisma.dataset.create as jest.Mock).mockResolvedValue(mockDataset);

      await datasetManager.storeDataset('Default Dataset');

      expect(mockPrisma.dataset.create).toHaveBeenCalledWith({
        data: {
          name: 'Default Dataset',
          status: 'valid',
        },
      });
    });
  });

  describe('Retrieve dataset (FR6)', () => {
    it('should retrieve dataset with files', async () => {
      const mockDataset = {
        id: 1,
        name: 'Test Dataset',
        status: 'valid',
        files: [
          { id: 1, filePath: '/uploads/file1.wav', format: 'wav', duration: 180.5 },
          { id: 2, filePath: '/uploads/file2.mp3', format: 'mp3', duration: 200.0 },
        ],
      };

      (mockPrisma.dataset.findUnique as jest.Mock).mockResolvedValue(mockDataset);

      const result = await datasetManager.retrieveDataset(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Dataset');
      expect(result.files).toHaveLength(2);
      expect(mockPrisma.dataset.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { files: true },
      });
    });

    it('should throw error when dataset not found', async () => {
      (mockPrisma.dataset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(datasetManager.retrieveDataset(999)).rejects.toThrow('Dataset not found');
    });

    it('should retrieve empty dataset', async () => {
      const mockDataset = {
        id: 2,
        name: 'Empty Dataset',
        status: 'valid',
        files: [],
      };

      (mockPrisma.dataset.findUnique as jest.Mock).mockResolvedValue(mockDataset);

      const result = await datasetManager.retrieveDataset(2);

      expect(result.files).toHaveLength(0);
    });
  });

  describe('Validate dataset (FR7)', () => {
    it('should validate dataset with valid files', async () => {
      const mockDataset = {
        id: 1,
        name: 'Valid Dataset',
        status: 'valid',
        files: [
          { id: 1, filePath: '/uploads/file1.wav', format: 'wav', duration: 180.5 },
          { id: 2, filePath: '/uploads/file2.mp3', format: 'mp3', duration: 200.0 },
        ],
      };

      (mockPrisma.dataset.findUnique as jest.Mock).mockResolvedValue(mockDataset);

      const result = await datasetManager.validateDataset(1);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject dataset with no files', async () => {
      const mockDataset = {
        id: 2,
        name: 'Empty Dataset',
        status: 'valid',
        files: [],
      };

      (mockPrisma.dataset.findUnique as jest.Mock).mockResolvedValue(mockDataset);

      const result = await datasetManager.validateDataset(2);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Dataset has no audio files');
    });

    it('should reject dataset with invalid file formats', async () => {
      const mockDataset = {
        id: 3,
        name: 'Invalid Format Dataset',
        status: 'valid',
        files: [
          { id: 1, filePath: '/uploads/file1.wav', format: 'wav', duration: 180.5 },
          { id: 2, filePath: '/uploads/file2.txt', format: 'txt', duration: 0 },
          { id: 3, filePath: '/uploads/file3.avi', format: 'avi', duration: 0 },
        ],
      };

      (mockPrisma.dataset.findUnique as jest.Mock).mockResolvedValue(mockDataset);

      const result = await datasetManager.validateDataset(3);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: string) => e.includes('invalid formats'))).toBe(true);
    });

    it('should handle case-insensitive format validation', async () => {
      const mockDataset = {
        id: 4,
        name: 'Mixed Case Dataset',
        status: 'valid',
        files: [
          { id: 1, filePath: '/uploads/file1.WAV', format: 'WAV', duration: 180.5 },
          { id: 2, filePath: '/uploads/file2.MP3', format: 'MP3', duration: 200.0 },
        ],
      };

      (mockPrisma.dataset.findUnique as jest.Mock).mockResolvedValue(mockDataset);

      const result = await datasetManager.validateDataset(4);

      // Should be valid because format check is case-insensitive
      expect(result.isValid).toBe(true);
    });

    it('should return error when dataset not found', async () => {
      (mockPrisma.dataset.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await datasetManager.validateDataset(999);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Dataset not found');
    });
  });

  describe('Rename dataset (FR9)', () => {
    it('should rename dataset successfully', async () => {
      const mockUpdatedDataset = {
        id: 1,
        name: 'Renamed Dataset',
        status: 'valid',
      };

      (mockPrisma.dataset.update as jest.Mock).mockResolvedValue(mockUpdatedDataset);

      await datasetManager.renameDataset(1, 'Renamed Dataset');

      expect(mockPrisma.dataset.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Renamed Dataset' },
      });
    });

    it('should handle special characters in dataset name', async () => {
      const specialName = 'Dataset #1 (2024)';
      (mockPrisma.dataset.update as jest.Mock).mockResolvedValue({
        id: 2,
        name: specialName,
        status: 'valid',
      });

      await datasetManager.renameDataset(2, specialName);

      expect(mockPrisma.dataset.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { name: specialName },
      });
    });
  });

  describe('Delete dataset (FR10)', () => {
    it('should delete dataset', async () => {
      (mockPrisma.dataset.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Dataset to Delete',
        status: 'archived',
      });
      (mockPrisma.dataset.delete as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Dataset to Delete',
        status: 'archived',
      });

      await datasetManager.deleteDataset(1);

      expect(mockPrisma.dataset.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'archived' },
      });
      expect(mockPrisma.dataset.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should archive dataset before deletion', async () => {
      (mockPrisma.dataset.update as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Another Dataset',
        status: 'archived',
      });
      (mockPrisma.dataset.delete as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Another Dataset',
        status: 'archived',
      });

      await datasetManager.deleteDataset(2);

      // Should update to archived first, then delete
      expect(mockPrisma.dataset.update).toHaveBeenCalled();
      expect(mockPrisma.dataset.delete).toHaveBeenCalled();
      expect(mockPrisma.dataset.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { status: 'archived' },
      });
    });
  });

  describe('List datasets', () => {
    it('should list all datasets', async () => {
      const mockDatasets = [
        {
          id: 1,
          name: 'Dataset 1',
          status: 'valid',
          files: [],
        },
        {
          id: 2,
          name: 'Dataset 2',
          status: 'valid',
          files: [{ id: 1, filePath: '/uploads/file.wav', format: 'wav', duration: 180.5 }],
        },
      ];

      (mockPrisma.dataset.findMany as jest.Mock).mockResolvedValue(mockDatasets);

      const result = await datasetManager.listDatasets();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(mockPrisma.dataset.findMany).toHaveBeenCalledWith({
        include: { files: true },
      });
    });

    it('should return empty array when no datasets exist', async () => {
      (mockPrisma.dataset.findMany as jest.Mock).mockResolvedValue([]);

      const result = await datasetManager.listDatasets();

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors during dataset creation', async () => {
      const dbError = new Error('Database connection failed');
      (mockPrisma.dataset.create as jest.Mock).mockRejectedValue(dbError);

      await expect(datasetManager.storeDataset('Test Dataset')).rejects.toThrow('Database connection failed');
    });

    it('should handle errors during dataset retrieval', async () => {
      const dbError = new Error('Query failed');
      (mockPrisma.dataset.findUnique as jest.Mock).mockRejectedValue(dbError);

      await expect(datasetManager.retrieveDataset(1)).rejects.toThrow('Query failed');
    });

    it('should handle errors during dataset deletion', async () => {
      (mockPrisma.dataset.update as jest.Mock).mockResolvedValue({ id: 1, status: 'archived' });
      const dbError = new Error('Delete failed');
      (mockPrisma.dataset.delete as jest.Mock).mockRejectedValue(dbError);

      await expect(datasetManager.deleteDataset(1)).rejects.toThrow('Delete failed');
    });
  });
});
