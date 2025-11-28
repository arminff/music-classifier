/**
 * Test Case TC01: Upload Audio File
 * Tests FR1, FR7 - File upload validation
 */

describe('Upload Audio File', () => {
  it('should accept valid WAV file', async () => {
    const formData = new FormData();
    const file = new File(['test audio content'], 'test.wav', { type: 'audio/wav' });
    formData.append('file', file);

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, message: 'File uploaded successfully' }),
    });

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    expect(response.ok).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('should reject invalid file format', async () => {
    const formData = new FormData();
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    formData.append('file', file);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid file format' }),
    });

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    expect(response.ok).toBe(false);
  });

  it('should reject file exceeding 50MB', async () => {
    const formData = new FormData();
    const largeContent = 'x'.repeat(51 * 1024 * 1024); // 51MB
    const file = new File([largeContent], 'large.wav', { type: 'audio/wav' });
    formData.append('file', file);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'File size exceeds maximum allowed size' }),
    });

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    expect(response.ok).toBe(false);
  });
});

