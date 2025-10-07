export function logout() {
  cy.visit('http://localhost:4200')
  cy.get('#navbarNav li:nth-child(9) .nav-link').click();
}