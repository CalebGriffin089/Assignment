export function login(username: string, password: string) {
  cy.visit('http://localhost:4200')
  cy.get('[name="username"]').click();
  cy.get('[name="username"]').clear();
  cy.get('[name="username"]').type(username);
  cy.get('[name="password"]').click();
  cy.get('[name="password"]').clear();
  cy.get('[name="password"]').type(password);
  cy.get('.btn').click();
}