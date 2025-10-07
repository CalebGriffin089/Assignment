import { login } from "./login"

export function createGroup() {
  login("superAdmin", "123456")
  cy.get('#navbarNav [routerlink="/createGroups"]').click();
  cy.get('[name="channels"]').click();
  cy.get('[name="channels"]').clear();
  cy.get('[name="channels"]').type('testBaseChannel');
  cy.get('.btn').click();
}