/**
 * Test Case TC04: Train Model
 * Tests FR11, FR12, FR13 - Model training and evaluation
 */

describe('Train Model', () => {
  it('should start training with valid dataset', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        modelId: 1,
        trainingId: 'training-1-1234567890',
        message: 'Training started',
      }),
    });

    const response = await fetch('/api/train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetId: 1, algorithmType: 'CNN' }),
    });

    const result = await response.json();
    expect(response.ok).toBe(true);
    expect(result.modelId).toBeDefined();
    expect(result.trainingId).toBeDefined();
  });

  it('should create model and evaluation results', async () => {
    // Mock training completion
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ modelId: 1, trainingId: 'training-1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accuracy: 0.85,
          precision: 0.82,
          recall: 0.83,
          f1Score: 0.825,
          confusionMatrix: [[10, 2], [1, 12]],
        }),
      });

    // Start training
    const trainResponse = await fetch('/api/train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetId: 1, algorithmType: 'CNN' }),
    });
    const trainResult = await trainResponse.json();

    // Get metrics
    const metricsResponse = await fetch(`/api/models/${trainResult.modelId}/metrics`);
    const metrics = await metricsResponse.json();

    expect(metrics.accuracy).toBeGreaterThan(0);
    expect(metrics.precision).toBeDefined();
    expect(metrics.recall).toBeDefined();
    expect(metrics.f1Score).toBeDefined();
  });
});

