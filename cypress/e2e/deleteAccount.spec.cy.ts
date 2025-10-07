import { login } from "./support/login"

describe('template spec', () => {
  it('passes', () => {
    login("testUser3", "123456")
    cy.get('#navbarNav [routerlink="/deleteUser"]').click();
    cy.get('.btn').click();
  })
})