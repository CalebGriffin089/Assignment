import { createUser } from "./support/CreateAccountRequets"
import { login } from "./support/login"
describe('template spec', () => {
  it('passes', () => {
    createUser('testUser2', "testUser2@email.com", "123456")
    login("superAdmin", "123456")
    cy.get('#navbarNav [routerlink="/requests"]').click();
    cy.get('.btn-danger').click();
  })
})