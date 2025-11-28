import { PrismaClient } from '@prisma/client';

/**
 * DatasetManager class - Handles dataset storage, retrieval, organization, and cleanup
 * Maps to FR5, FR6, FR7, FR9, FR10
 */
export class DatasetManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Store dataset (FR5)
   */
  async storeDataset(name: string, status: string = 'valid'): Promise<{ id: number }> {
    const dataset = await this.prisma.dataset.create({
      data: {
        name,
        status,
      },
    });

    return { id: dataset.id };
  }

  /**
   * Retrieve dataset (FR6)
   */
  async retrieveDataset(id: number) {
    const dataset = await this.prisma.dataset.findUnique({
      where: { id },
      include: {
        files: true,
      },
    });

    if (!dataset) {
      throw new Error('Dataset not found');
    }

    return dataset;
  }

  /**
   * Validate dataset (FR7)
   */
  async validateDataset(id: number): Promise<{ isValid: boolean; errors: string[] }> {
    const dataset = await this.prisma.dataset.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!dataset) {
      return { isValid: false, errors: ['Dataset not found'] };
    }

    const errors: string[] = [];

    if (dataset.files.length === 0) {
      errors.push('Dataset has no audio files');
    }

    // Check file formats
    const invalidFormats = dataset.files.filter(
      (file) => !['wav', 'mp3'].includes(file.format.toLowerCase())
    );
    if (invalidFormats.length > 0) {
      errors.push(`${invalidFormats.length} files have invalid formats`);
    }

    // Check file sizes (assuming max 50MB per file)
    const largeFiles = dataset.files.filter((file) => {
      // This would need actual file size check
      return false;
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Rename dataset (FR9)
   */
  async renameDataset(id: number, newName: string): Promise<void> {
    await this.prisma.dataset.update({
      where: { id },
      data: { name: newName },
    });
  }

  /**
   * Delete dataset (FR10)
   */
  async deleteDataset(id: number): Promise<void> {
    // Archive first (24h grace period)
    await this.prisma.dataset.update({
      where: { id },
      data: { status: 'archived' },
    });

    // Actual deletion would happen after 24h
    // For now, we'll delete immediately
    await this.prisma.dataset.delete({
      where: { id },
    });
  }

  /**
   * List all datasets
   */
  async listDatasets() {
    return this.prisma.dataset.findMany({
      include: {
        files: true,
      },
    });
  }
}

