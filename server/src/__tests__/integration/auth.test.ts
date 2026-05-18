import { prisma } from '../../lib/prisma.js';
import { api } from '../helpers/test-app.js';
import { registerPayload, TEST_PASSWORD } from '../fixtures/users.js';

const describeIfDb =
  process.env.CI === 'true' || process.env.RUN_INTEGRATION_TESTS === 'true'
    ? describe
    : describe.skip;

describeIfDb('Auth API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers a new customer', async () => {
    const body = registerPayload();
    const res = await api().post('/api/auth/register').send(body).expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(body.email);
    expect(res.body.data.token).toBeDefined();

    await prisma.user.delete({ where: { email: body.email } }).catch(() => {});
  });

  it('rejects duplicate email', async () => {
    const body = registerPayload();
    await api().post('/api/auth/register').send(body).expect(201);
    const dup = await api().post('/api/auth/register').send(body).expect(409);
    expect(dup.body.success).toBe(false);

    await prisma.user.delete({ where: { email: body.email } }).catch(() => {});
  });

  it('logs in with valid credentials', async () => {
    const body = registerPayload();
    await api().post('/api/auth/register').send(body).expect(201);

    const login = await api()
      .post('/api/auth/login')
      .send({ login: body.email, password: TEST_PASSWORD })
      .expect(200);

    expect(login.body.data.token).toBeDefined();

    await prisma.user.delete({ where: { email: body.email } }).catch(() => {});
  });

  it('rejects invalid password', async () => {
    const body = registerPayload();
    await api().post('/api/auth/register').send(body).expect(201);

    await api()
      .post('/api/auth/login')
      .send({ login: body.email, password: 'wrong-password' })
      .expect(401);

    await prisma.user.delete({ where: { email: body.email } }).catch(() => {});
  });
});
