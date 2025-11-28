import { NextRequest } from 'next/server';
import { SecurityManager } from '../classes/SecurityManager';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function authenticateRequest(request: NextRequest): Promise<{
  userId: number;
  email: string;
  role: string;
} | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;

  }

  const token = authHeader.substring(7);
  const securityManager = new SecurityManager(prisma, JWT_SECRET);

  try {
    return await securityManager.authorize(token);
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest, requiredRole?: string): Promise<{
  userId: number;
  email: string;
  role: string;
}> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized');
    error.name = 'UnauthorizedError';
    throw error;
  }

  const token = authHeader.substring(7);
  const securityManager = new SecurityManager(prisma, JWT_SECRET);

  try {
    const decoded = await securityManager.authorize(token, requiredRole);
    return decoded;
  } catch (error: any) {
    const authError = new Error('Unauthorized');
    authError.name = 'UnauthorizedError';
    throw authError;
  }
}

