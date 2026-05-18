describe('Аутентификация', () => {
  it('входит с демо-аккаунтом', () => {
    cy.loginDemo();
    cy.contains('Мои заказы').should('be.visible');
  });

  it('выходит из аккаунта', () => {
    cy.loginDemo();
    cy.contains('button', 'Выйти').click();
    cy.url().should('include', '/auth');
    cy.get('[data-testid="auth-phone"]').should('be.visible');
  });
});
