Cypress.Commands.add('loginDemo', () => {
  const email = Cypress.env('demoEmail') as string;

  cy.visit('/auth');
  cy.get('[data-testid="auth-identifier"]').clear().type(email);
  cy.get('[data-testid="auth-submit"]').click();
  cy.get('[data-testid="auth-otp"]').should('be.visible');

  cy.request('POST', '/api/auth/otp/send', { identifier: email }).then((res) => {
    const code = res.body.data.devCode as string;
    cy.get('[data-testid="auth-otp"]').clear().type(code);
    cy.get('input[type="checkbox"]').check({ force: true });
    cy.get('[data-testid="auth-submit"]').click();
  });

  cy.contains('Личный кабинет').should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginDemo(): Chainable<void>;
    }
  }
}

export {};
