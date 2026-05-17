describe('Аутентификация', () => {
  it('входит с демо-аккаунтом', () => {
    cy.loginDemo();
    cy.contains('Мои заказы').should('be.visible');
  });

  it('выходит из аккаунта', () => {
    cy.loginDemo();
    cy.contains('button', 'Выйти').click();
    cy.get('[data-testid="auth-email"]').should('be.visible');
  });
});
