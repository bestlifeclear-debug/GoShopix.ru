import { api } from '../helpers/test-app.js';

describe('Health API', () => {
  it('GET /api/health returns ok', async () => {
    const res = await api().get('/api/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.service).toBe('goshopix-api');
  });

  it('GET /api/health/live returns ok', async () => {
    const res = await api().get('/api/health/live').expect(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /api/health/metrics returns route stats object', async () => {
    await api().get('/api/health').expect(200);
    const res = await api().get('/api/health/metrics').expect(200);
    expect(res.body.data).toHaveProperty('uptimeSeconds');
    expect(res.body.data).toHaveProperty('routes');
  });
});

const describeIfDb =
  process.env.CI === 'true' || process.env.RUN_INTEGRATION_TESTS === 'true'
    ? describe
    : describe.skip;

describeIfDb('Health API (database)', () => {
  it('GET /api/health/ready checks database', async () => {
    const res = await api().get('/api/health/ready');
    expect([200, 503]).toContain(res.status);
    expect(res.body.data.checks).toHaveProperty('database');
  });
});
