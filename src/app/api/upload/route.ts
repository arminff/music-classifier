import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { UserInterface } from '@/lib/classes/UserInterface';
import { prisma } from '@/lib/utils/prisma';
import { requireAuth } from '@/lib/utils/auth';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FORMATS = ['wav', 'mp3'];

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const datasetId = formData.get('datasetId') ? parseInt(formData.get('datasetId') as string) : undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Save file to disk
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    // Create database record
    const userInterface = new UserInterface(prisma);
    const result = await userInterface.uploadAudio(file, datasetId);

    // Update file path in database
    await prisma.audioFile.update({
      where: { id: result.id },
      data: { filePath: `/uploads/${fileName}` },
    });

    return NextResponse.json({
      id: result.id,
      message: 'File uploaded successfully',
      filePath: `/uploads/${fileName}`,
    }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

