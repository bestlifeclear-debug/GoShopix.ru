export const TEST_PASSWORD = 'TestPassword123!';

export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.goshopix.ru`;
}

export const SEED_CUSTOMER = {
  email: 'customer@goshopix.ru',
  password: 'password123',
};

export const registerPayload = (overrides?: Partial<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}>) => ({
  email: uniqueEmail('register'),
  password: TEST_PASSWORD,
  firstName: 'Test',
  lastName: 'User',
  ...overrides,
});
