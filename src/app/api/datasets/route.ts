import { NextRequest, NextResponse } from 'next/server';
import { DatasetManager } from '@/lib/classes/DatasetManager';
import { prisma } from '@/lib/utils/prisma';
import { requireAuth } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const user = await requireAuth(request, 'Administrator');

    const datasetManager = new DatasetManager(prisma);
    const datasets = await datasetManager.listDatasets();

    return NextResponse.json(datasets, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Datasets GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const user = await requireAuth(request, 'Administrator');

    const body = await request.json();
    const { name, status } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Dataset name is required' },
        { status: 400 }
      );
    }

    const datasetManager = new DatasetManager(prisma);
    const result = await datasetManager.storeDataset(name, status || 'valid');

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create dataset' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Require admin role
    const user = await requireAuth(request, 'Administrator');

    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Dataset id and name are required' },
        { status: 400 }
      );
    }

    const datasetManager = new DatasetManager(prisma);
    await datasetManager.renameDataset(id, name);

    return NextResponse.json({ message: 'Dataset renamed successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to rename dataset' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require admin role
    const user = await requireAuth(request, 'Administrator');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Dataset id is required' },
        { status: 400 }
      );
    }

    const datasetManager = new DatasetManager(prisma);
    await datasetManager.deleteDataset(parseInt(id));

    return NextResponse.json({ message: 'Dataset deleted successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete dataset' },
      { status: 500 }
    );
  }
}

