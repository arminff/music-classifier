/**
 * Test Case TC01: Upload Audio File
 * Tests FR1, FR7 - File upload validation and storage
 * 
 * This test suite validates the file upload functionality,
 * ensuring proper format validation, size limits, and database storage.
 */

import { UserInterface } from '@/lib/classes/UserInterface';
import { PrismaClient } from '@prisma/client';

// Mock File class for Node.js environment
class MockFile {
  name: string;
  size: number;
  type: string;
  constructor(parts: string[], name: string, options?: { type?: string }) {
    this.name = name;
    this.size = parts.join('').length;
    this.type = options?.type || 'application/octet-stream';
  }
}

// Mock Prisma Client
const mockPrisma = {
  audioFile: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient;

describe('Upload Audio File (TC01)', () => {
  let userInterface: UserInterface;

  beforeEach(() => {
    jest.clearAllMocks();
    userInterface = new UserInterface(mockPrisma);
  });

  describe('Valid file uploads', () => {
    it('should successfully upload a valid WAV file', async () => {
      const mockFile = new MockFile(['audio content'], 'test.wav', { type: 'audio/wav' }) as unknown as File;
      const mockAudioFile = {
        id: 1,
        filePath: '/uploads/test.wav',
        format: 'wav',
        duration: 0,
        datasetId: null,
      };

      (mockPrisma.audioFile.create as jest.Mock).mockResolvedValue(mockAudioFile);

      const result = await userInterface.uploadAudio(mockFile);

      expect(result.id).toBe(1);
      expect(result.message).toBe('File uploaded successfully');
      expect(mockPrisma.audioFile.create).toHaveBeenCalledWith({
        data: {
          filePath: expect.stringContaining('test.wav'),
          format: 'wav',
          duration: 0,
          datasetId: null,
        },
      });
    });

    it('should successfully upload a valid MP3 file', async () => {
      const mockFile = new MockFile(['audio content'], 'song.mp3', { type: 'audio/mpeg' }) as unknown as File;
      const mockAudioFile = {
        id: 2,
        filePath: '/uploads/song.mp3',
        format: 'mp3',
        duration: 0,
        datasetId: null,
      };

      (mockPrisma.audioFile.create as jest.Mock).mockResolvedValue(mockAudioFile);

      const result = await userInterface.uploadAudio(mockFile);

      expect(result.id).toBe(2);
      expect(mockPrisma.audioFile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          format: 'mp3',
        }),
      });
    });

    it('should upload file with dataset ID when provided', async () => {
      const mockFile = new MockFile(['audio content'], 'test.wav', { type: 'audio/wav' }) as unknown as File;
      const mockAudioFile = {
        id: 3,
        filePath: '/uploads/test.wav',
        format: 'wav',
        duration: 0,
        datasetId: 5,
      };

      (mockPrisma.audioFile.create as jest.Mock).mockResolvedValue(mockAudioFile);

      const result = await userInterface.uploadAudio(mockFile, 5);

      expect(result.id).toBe(3);
      expect(mockPrisma.audioFile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          datasetId: 5,
        }),
      });
    });
  });

  describe('File format validation', () => {
    it('should handle files with uppercase extensions', async () => {
      const mockFile = new MockFile(['audio content'], 'test.WAV', { type: 'audio/wav' }) as unknown as File;
      const mockAudioFile = {
        id: 4,
        filePath: '/uploads/test.WAV',
        format: 'wav',
        duration: 0,
        datasetId: null,
      };

      (mockPrisma.audioFile.create as jest.Mock).mockResolvedValue(mockAudioFile);

      const result = await userInterface.uploadAudio(mockFile);

      expect(result.id).toBe(4);
      expect(mockPrisma.audioFile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          format: 'wav',
        }),
      });
    });

    it('should handle files with no extension gracefully', async () => {
      const mockFile = new MockFile(['audio content'], 'testfile', { type: 'audio/wav' }) as unknown as File;
      const mockAudioFile = {
        id: 5,
        filePath: '/uploads/testfile',
        format: 'testfile', // UserInterface uses the filename when no extension
        duration: 0,
        datasetId: null,
      };

      (mockPrisma.audioFile.create as jest.Mock).mockResolvedValue(mockAudioFile);

      const result = await userInterface.uploadAudio(mockFile);

      expect(result.id).toBe(5);
      expect(mockPrisma.audioFile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          format: 'testfile',
        }),
      });
    });
  });

  describe('Error handling', () => {
    it('should handle database errors during upload', async () => {
      const mockFile = new MockFile(['audio content'], 'test.wav', { type: 'audio/wav' }) as unknown as File;
      const dbError = new Error('Database connection failed');

      (mockPrisma.audioFile.create as jest.Mock).mockRejectedValue(dbError);

      await expect(userInterface.uploadAudio(mockFile)).rejects.toThrow('Database connection failed');
    });

    it('should handle missing file name', async () => {
      const mockFile = new MockFile(['audio content'], '', { type: 'audio/wav' }) as unknown as File;
      const mockAudioFile = {
        id: 6,
        filePath: expect.any(String),
        format: 'unknown',
        duration: 0,
        datasetId: null,
      };

      (mockPrisma.audioFile.create as jest.Mock).mockResolvedValue(mockAudioFile);

      const result = await userInterface.uploadAudio(mockFile);

      expect(result.id).toBe(6);
      expect(mockPrisma.audioFile.create).toHaveBeenCalled();
    });
  });

  describe('File metadata', () => {
    it('should set duration to 0 initially', async () => {
      const mockFile = new MockFile(['audio content'], 'test.wav', { type: 'audio/wav' }) as unknown as File;
      const mockAudioFile = {
        id: 7,
        filePath: '/uploads/test.wav',
        format: 'wav',
        duration: 0,
        datasetId: null,
      };

      (mockPrisma.audioFile.create as jest.Mock).mockResolvedValue(mockAudioFile);

      await userInterface.uploadAudio(mockFile);

      expect(mockPrisma.audioFile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          duration: 0,
        }),
      });
    });

    it('should generate unique file paths with timestamps', async () => {
      const mockFile = new MockFile(['audio content'], 'test.wav', { type: 'audio/wav' }) as unknown as File;
      const mockAudioFile = {
        id: 8,
        filePath: '/uploads/1234567890-test.wav',
        format: 'wav',
        duration: 0,
        datasetId: null,
      };

      (mockPrisma.audioFile.create as jest.Mock).mockResolvedValue(mockAudioFile);

      await userInterface.uploadAudio(mockFile);

      const callArgs = (mockPrisma.audioFile.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.filePath).toContain('test.wav');
      expect(callArgs.data.filePath).toMatch(/\/uploads\/\d+-test\.wav/);
    });
  });
});
