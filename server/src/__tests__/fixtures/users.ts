export const SEED_CUSTOMER = {
  email: 'customer@goshopix.ru',
};

export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.goshopix.ru`;
}

export function uniquePhone(): string {
  const suffix = Math.floor(1000000 + Math.random() * 8999999);
  return `+7900${suffix}`;
}
