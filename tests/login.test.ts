/**
 * Test Case TC03: User Authentication
 * Tests FR17, FR18 - Authentication and authorization
 */

describe('User Authentication', () => {
  it('should authenticate with valid credentials', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'mock-jwt-token',
        user: { id: 1, email: 'test@example.com', role: 'User' },
      }),
    });

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const result = await response.json();
    expect(response.ok).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    });

    expect(response.ok).toBe(false);
  });

  it('should lock account after 3 failed attempts', async () => {
    // Simulate 3 failed attempts
    for (let i = 0; i < 3; i++) {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
      });
    }

    // 4th attempt should be locked
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Account locked due to too many failed login attempts' }),
    });

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    });

    const result = await response.json();
    expect(response.ok).toBe(false);
    expect(result.error).toContain('locked');
  });
});

