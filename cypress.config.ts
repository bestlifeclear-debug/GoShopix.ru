import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://127.0.0.1:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10_000,
    env: {
      apiUrl: process.env.CYPRESS_API_URL ?? 'http://127.0.0.1:3000',
      demoEmail: 'customer@goshopix.ru',
      demoPassword: 'password123',
    },
  },
});
