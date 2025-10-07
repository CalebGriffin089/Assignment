import { login } from "./support/login"

describe('template spec', () => {
  it('passes', () => {
    login("superAdmin", "123456")
    cy.get('.btn-outline-primary').click();
    cy.get('.btn-outline-success').click();
    cy.get('[name="messageOut"]').click();
    cy.get('[name="messageOut"]').clear();
    cy.get('[name="messageOut"]').type('TestMessage');
    cy.get('.btn-primary').click();
    cy.get('.btn-success').click();
  })
})