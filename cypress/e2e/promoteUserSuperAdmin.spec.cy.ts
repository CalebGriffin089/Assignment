import { acceptUserAccount } from "./support/acceptAccountCreate"
import { login } from "./support/login";
import { logout } from "./support/logout";

describe('template spec', () => {
  it('passes', () => {
    acceptUserAccount("super2", "super@email.com", "123456")
    cy.get('[name="userInput"]').click();
    cy.get('[name="userInput"]').clear();
    cy.get('[name="userInput"]').type('super2');
    cy.get('.btn').click();
    logout()
    login("super2", "123456")
    cy.get('.btn-outline-primary').click();
    cy.get('.btn-outline-success').click();
    // assert that TestMessage should be on this page
    cy.contains('TestMessage').should('be.visible');
    cy.get('#navbarNav [routerlink="/deleteUser"]').click();
    cy.get('[name="userInput"]').click();
    cy.get('[name="userInput"]').clear();
    cy.get('[name="userInput"]').type('super2');
    cy.get('.btn-primary').click();
    cy.get('#navbarNav li:nth-child(9) .nav-link').click();
    cy.get('[name="username"]').click();
    cy.get('[name="username"]').clear();
    cy.get('[name="username"]').type('super2');
    cy.get('[name="password"]').click();
    cy.get('[name="password"]').clear();
    cy.get('[name="password"]').type('123456');
    cy.get('.btn').click();
    // assert that the credentials are wrong
    cy.contains('Invalid credentials').should('be.visible');
  })
})