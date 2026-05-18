Cypress.Commands.add('loginDemo', () => {
  const email = Cypress.env('demoEmail') as string;
  const password = Cypress.env('demoPassword') as string;

  cy.visit('/auth');
  cy.contains('button', 'Войти по логину или email').click();
  cy.get('[data-testid="auth-login"]').clear().type(email);
  cy.get('[data-testid="auth-password"]').clear().type(password);
  cy.get('[data-testid="auth-submit"]').click();
  cy.contains('Личный кабинет').should('be.visible');
  cy.contains(email).should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginDemo(): Chainable<void>;
    }
  }
}

export {};
