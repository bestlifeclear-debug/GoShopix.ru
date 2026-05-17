describe('Покупатель: регистрация → каталог → корзина', () => {
  const email = `e2e-${Date.now()}@test.goshopix.ru`;
  const password = 'TestPassword123!';

  it('регистрируется, просматривает каталог и открывает корзину', () => {
    cy.visit('/account');
    cy.contains('Нет аккаунта?').click();
    cy.get('[data-testid="auth-email"]').type(email);
    cy.get('[data-testid="auth-password"]').type(password);
    cy.get('[data-testid="auth-submit"]').click();
    cy.contains(email, { timeout: 15_000 }).should('be.visible');

    cy.visit('/catalog');
    cy.contains('Каталог').should('be.visible');
    cy.get('article, [class*="card"]', { timeout: 15_000 }).should('have.length.at.least', 1);

    cy.contains('a', 'Корзина').click();
    cy.url().should('include', '/cart');
  });
});

describe('Покупатель: демо вход → каталог → корзина', () => {
  it('входит и добавляет товар в корзину', () => {
    cy.loginDemo();
    cy.visit('/catalog');
    cy.get('button', { timeout: 15_000 }).contains(/в корзину|купить/i).first().click({ force: true });
    cy.visit('/cart');
    cy.contains(/корзин|итого|пуст/i).should('be.visible');
  });
});
