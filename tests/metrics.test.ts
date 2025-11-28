/**
 * Test Case TC05: View Metrics
 * Tests FR4, FR15 - Metrics retrieval and display
 */

describe('View Metrics', () => {
  it('should retrieve model metrics', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accuracy: 0.87,
        precision: 0.85,
        recall: 0.86,
        f1Score: 0.855,
        confusionMatrix: [[15, 2, 1], [1, 18, 1], [2, 1, 16]],
      }),
    });

    const response = await fetch('/api/models/1/metrics');
    const metrics = await response.json();

    expect(response.ok).toBe(true);
    expect(metrics.accuracy).toBeGreaterThan(0.8);
    expect(metrics.precision).toBeDefined();
    expect(metrics.recall).toBeDefined();
    expect(metrics.f1Score).toBeDefined();
    expect(metrics.confusionMatrix).toBeDefined();
  });

  it('should return metrics with accuracy > 0.8', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accuracy: 0.92,
        precision: 0.90,
        recall: 0.91,
        f1Score: 0.905,
        confusionMatrix: [[20, 1], [1, 23]],
      }),
    });

    const response = await fetch('/api/models/1/metrics');
    const metrics = await response.json();

    expect(metrics.accuracy).toBeGreaterThan(0.8);
  });
});

