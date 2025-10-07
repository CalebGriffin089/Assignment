import { createGroup } from "./support/createGroup"
import { createUser } from "./support/CreateAccountRequets"
import { logout } from "./support/logout"
import { login } from "./support/login"
import { acceptUserAccount } from "./support/acceptAccountCreate"

describe('template spec', () => {
  it('passes', () => {
    createGroup()
    logout()
    acceptUserAccount("testUser3", "testUser3@email.com", "123456")
    login("testUser3", "123456")
    cy.get('#navbarNav [routerlink="/joinGroups"]').click();
    cy.get('[name="groupName"]').click();
    cy.get('[name="groupName"]').clear();
    cy.get('[name="groupName"]').type('1');
    cy.get('.btn').click();
  })
})