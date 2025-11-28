import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
import { requireAuth } from '@/lib/utils/auth';

/**
 * GET /api/users - List all users (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'Administrator');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        failedLogins: true,
        lockedUntil: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users - Update user role (Admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAuth(request, 'Administrator');

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!['User', 'Administrator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "User" or "Administrator"' },
        { status: 400 }
      );
    }

    // Prevent admin from removing their own admin role
    if (userId === admin.userId && role !== 'Administrator') {
      return NextResponse.json(
        { error: 'Cannot remove your own administrator role' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser,
    }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}

