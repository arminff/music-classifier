import { NextRequest, NextResponse } from 'next/server';
import { SecurityManager } from '@/lib/classes/SecurityManager';
import { prisma } from '@/lib/utils/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user (default role is 'User', only existing admins can create admins)
    const securityManager = new SecurityManager(prisma, JWT_SECRET);
    const userRole = role === 'Administrator' ? 'User' : (role || 'User'); // Prevent self-admin registration
    
    const result = await securityManager.createUser(email, password, userRole);

    // Log registration
    await securityManager.logActivity(result.id, 'REGISTRATION');

    // Get the created user to generate token directly (avoid authentication issues)
    const createdUser = await prisma.user.findUnique({
      where: { id: result.id },
    });

    if (!createdUser) {
      throw new Error('Failed to retrieve created user');
    }

    // Generate JWT token directly (avoid authentication race condition)
    const token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email, role: createdUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json(
      {
        message: 'User registered successfully',
        token,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

