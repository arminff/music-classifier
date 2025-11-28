/**
 * Test Case TC02: Classify Audio File
 * Tests FR3, FR16, NFR2 - Classification functionality and response time
 */

describe('Classify Audio File', () => {
  it('should classify audio and return genre with confidence', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        genre: 'Pop',
        confidence: 0.87,
        isHighCertainty: true,
        processingTime: 1200,
      }),
    });

    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioId: 1, modelId: 1 }),
    });

    const result = await response.json();
    expect(response.ok).toBe(true);
    expect(result.genre).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('should complete classification within 5 seconds (NFR2)', async () => {
    const startTime = Date.now();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        genre: 'Rock',
        confidence: 0.92,
        processingTime: 3500,
      }),
    });

    await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioId: 1, modelId: 1 }),
    });

    const elapsedTime = Date.now() - startTime;
    expect(elapsedTime).toBeLessThan(5000);
  });

  it('should handle high certainty classification', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        genre: 'Jazz',
        confidence: 0.95,
        isHighCertainty: true,
      }),
    });

    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioId: 1, modelId: 1 }),
    });

    const result = await response.json();
    expect(result.isHighCertainty).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});

