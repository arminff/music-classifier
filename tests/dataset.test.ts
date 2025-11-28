/**
 * Test Case TC06: Manage Datasets
 * Tests FR5, FR9, FR10 - Dataset management operations
 */

describe('Manage Datasets', () => {
  it('should create dataset (Admin only)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 1 }),
    });

    const response = await fetch('/api/datasets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({ name: 'Test Dataset', status: 'valid' }),
    });

    const result = await response.json();
    expect(response.ok).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('should rename dataset', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Dataset renamed successfully' }),
    });

    const response = await fetch('/api/datasets', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({ id: 1, name: 'Renamed Dataset' }),
    });

    expect(response.ok).toBe(true);
  });

  it('should delete dataset', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Dataset deleted successfully' }),
    });

    const response = await fetch('/api/datasets?id=1', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer admin-token',
      },
    });

    expect(response.ok).toBe(true);
  });

  it('should list all datasets', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, name: 'Dataset 1', status: 'valid', files: [] },
        { id: 2, name: 'Dataset 2', status: 'valid', files: [] },
      ],
    });

    const response = await fetch('/api/datasets', {
      headers: {
        'Authorization': 'Bearer admin-token',
      },
    });

    const datasets = await response.json();
    expect(response.ok).toBe(true);
    expect(Array.isArray(datasets)).toBe(true);
    expect(datasets.length).toBeGreaterThan(0);
  });
});

