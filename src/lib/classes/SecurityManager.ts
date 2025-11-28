import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * SecurityManager class - Handles authentication, authorization, and security
 * Maps to FR17, FR18, FR21
 */
export class SecurityManager {
  private prisma: PrismaClient;
  private jwtSecret: string;

  constructor(prisma: PrismaClient, jwtSecret: string) {
    this.prisma = prisma;
    this.jwtSecret = jwtSecret;
  }

  /**
   * Authenticate user (FR17)
   */
  async authenticate(email: string, password: string): Promise<{
    token: string;
    user: { id: number; email: string; role: string };
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account is locked. Please try again later.');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      // Increment failed login attempts
      const failedLogins = user.failedLogins + 1;
      const lockedUntil = failedLogins >= 3 ? new Date(Date.now() + 30 * 60 * 1000) : null; // 30 minutes

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLogins,
          lockedUntil,
        },
      });

      if (failedLogins >= 3) {
        throw new Error('Account locked due to too many failed login attempts');
      }

      return null;
    }

    // Reset failed logins on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: 0,
        lockedUntil: null,
      },
    });

    // Log access
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Authorize user (FR18)
   */
  async authorize(token: string, requiredRole?: string): Promise<{
    userId: number;
    email: string;
    role: string;
  }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        userId: number;
        email: string;
        role: string;
      };

      if (requiredRole && decoded.role !== requiredRole && decoded.role !== 'Administrator') {
        throw new Error('Insufficient permissions');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Log activity (FR21)
   */
  async logActivity(userId: number | null, action: string): Promise<void> {
    await this.prisma.activityLog.create({
      data: {
        userId,
        action,
      },
    });
  }

  /**
   * Create user (for initial setup)
   */
  async createUser(email: string, password: string, role: string = 'User'): Promise<{ id: number }> {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });

    return { id: user.id };
  }

  /**
   * Check uptime (for monitoring)
   */
  async checkUptime(): Promise<{ uptime: number; status: string }> {
    // This would check system health
    // For now, return mock data
    return {
      uptime: 99.5,
      status: 'operational',
    };
  }
}

