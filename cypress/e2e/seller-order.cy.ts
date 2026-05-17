describe('Продавец: кабинет и заказы', () => {
  it('входит как seller1 и открывает заказы', () => {
    cy.visit('/account');
    cy.get('[data-testid="auth-email"]').clear().type('seller1@goshopix.ru');
    cy.get('[data-testid="auth-password"]').clear().type('password123');
    cy.get('[data-testid="auth-submit"]').click();
    cy.contains('seller1@goshopix.ru', { timeout: 15_000 }).should('be.visible');

    cy.visit('/seller/orders');
    cy.url().should('include', '/seller/orders');
    cy.contains(/заказ|orders/i).should('be.visible');
  });
});
