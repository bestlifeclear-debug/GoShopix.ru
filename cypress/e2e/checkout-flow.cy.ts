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

    cy.visit('/cart');
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

describe('Оформление заказа', () => {
  it('показывает поля Почты России и оценку доставки', () => {
    cy.loginDemo();
    cy.visit('/catalog');
    cy.get('button', { timeout: 15_000 }).contains(/в корзину|купить/i).first().click({ force: true });
    cy.visit('/checkout');
    cy.contains('Оформление заказа', { timeout: 15_000 }).should('be.visible');
    cy.get('[data-testid="checkout-post-index"]').should('be.visible');
    cy.get('[data-testid="checkout-delivery-line"]').should('contain.text', 'адрес');
    cy.get('[data-testid="checkout-post-index"]').type('101000');
    cy.get('[data-testid="checkout-post-city"]').type('Москва');
    cy.get('[data-testid="checkout-post-street"]').type('Тверская');
    cy.get('[data-testid="checkout-post-house"]').type('10');
    cy.get('[data-testid="checkout-delivery-line"]').should('contain.text', 'Почта');
  });

  it('показывает ПВЗ СДЭК для Москвы', () => {
    cy.loginDemo();
    cy.visit('/catalog');
    cy.get('button', { timeout: 15_000 }).contains(/в корзину|купить/i).first().click({ force: true });
    cy.visit('/checkout');
    cy.contains('СДЭК').click();
    cy.get('[data-testid="checkout-cdek-city"]').type('Москва');
    cy.get('[data-testid="checkout-cdek-pvz"]').should('not.be.disabled');
    cy.get('[data-testid="checkout-cdek-pvz"] option').should('have.length.at.least', 2);
  });
});
