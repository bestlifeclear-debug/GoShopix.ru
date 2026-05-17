describe('Главная страница', () => {
  it('отображает бренд и навигацию', () => {
    cy.visit('/');
    cy.contains('GoShopix').should('be.visible');
    cy.contains('a', 'Каталог').should('be.visible');
    cy.get('input[aria-label="Поиск"]').should('be.visible');
  });

  it('переходит в каталог', () => {
    cy.visit('/');
    cy.contains('a', 'Каталог').click();
    cy.url().should('include', '/catalog');
  });
});
