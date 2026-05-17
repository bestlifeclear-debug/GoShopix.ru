describe('Каталог', () => {
  beforeEach(() => {
    cy.visit('/catalog');
  });

  it('загружает список товаров', () => {
    cy.contains('Каталог', { timeout: 15_000 }).should('be.visible');
    cy.get('article, [class*="product"], [class*="card"]', { timeout: 15_000 }).should(
      'have.length.at.least',
      1,
    );
  });
});
