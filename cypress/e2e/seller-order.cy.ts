describe('Продавец: кабинет и заказы', () => {
  it('входит как seller1 и открывает заказы', () => {
    const email = 'seller1@goshopix.ru';
    cy.visit('/account');
    cy.get('[data-testid="auth-identifier"]').clear().type(email);
    cy.get('[data-testid="auth-submit"]').click();
    cy.request('POST', '/api/auth/otp/send', { identifier: email }).then((res) => {
      cy.get('[data-testid="auth-otp"]').clear().type(res.body.data.devCode);
      cy.get('input[type="checkbox"]').check({ force: true });
      cy.get('[data-testid="auth-submit"]').click();
    });
    cy.contains(email, { timeout: 15_000 }).should('be.visible');

    cy.visit('/seller/orders');
    cy.url().should('include', '/seller/orders');
    cy.contains(/заказ|orders/i).should('be.visible');
  });
});
