import { prisma } from '../../lib/prisma.js';
import { api } from '../helpers/test-app.js';
import { uniqueEmail, uniquePhone } from '../fixtures/users.js';

const describeIfDb =
  process.env.CI === 'true' || process.env.RUN_INTEGRATION_TESTS === 'true'
    ? describe
    : describe.skip;

describeIfDb('Auth API (passwordless)', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers via OTP when email is new', async () => {
    const email = uniqueEmail('otp-register');
    const send = await api().post('/api/auth/otp/send').send({ identifier: email }).expect(200);
    const devCode = send.body.data.devCode as string;
    expect(devCode).toBeDefined();

    const verify = await api()
      .post('/api/auth/otp/verify')
      .send({ identifier: email, code: devCode })
      .expect(200);

    expect(verify.body.data.user.email).toBe(email);
    expect(verify.body.data.token).toBeDefined();

    await prisma.user.delete({ where: { email } }).catch(() => {});
  });

  it('logs in existing user via OTP', async () => {
    const email = uniqueEmail('otp-login');
    const send1 = await api().post('/api/auth/otp/send').send({ identifier: email }).expect(200);
    await api()
      .post('/api/auth/otp/verify')
      .send({ identifier: email, code: send1.body.data.devCode })
      .expect(200);

    const send2 = await api().post('/api/auth/otp/send').send({ identifier: email }).expect(200);
    const login = await api()
      .post('/api/auth/otp/verify')
      .send({ identifier: email, code: send2.body.data.devCode })
      .expect(200);

    expect(login.body.data.token).toBeDefined();

    await prisma.user.delete({ where: { email } }).catch(() => {});
  });

  it('rejects invalid OTP', async () => {
    const email = uniqueEmail('otp-bad');
    await api().post('/api/auth/otp/send').send({ identifier: email }).expect(200);

    await api()
      .post('/api/auth/otp/verify')
      .send({ identifier: email, code: '000000' })
      .expect(400);

    await prisma.user.delete({ where: { email } }).catch(() => {});
  });

  it('registers via phone OTP', async () => {
    const phone = uniquePhone();
    const send = await api().post('/api/auth/otp/send').send({ identifier: phone }).expect(200);
    const verify = await api()
      .post('/api/auth/otp/verify')
      .send({ identifier: phone, code: send.body.data.devCode })
      .expect(200);

    expect(verify.body.data.user.profile?.phone).toBeTruthy();

    await prisma.user.delete({ where: { id: verify.body.data.user.id } }).catch(() => {});
  });
});
