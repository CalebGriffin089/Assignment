import { createGroup } from "./support/createGroup"
import { createUser } from "./support/CreateAccountRequets"
import { login } from "./support/login"

import { logout } from "./support/logout"
import { acceptUserAccount } from "./support/acceptAccountCreate"


describe('template spec', () => {


  it('should decline a user account request', () => {
    createUser('testUser', "testUser@email.com", "123456")
    login("superAdmin", "123456")
    cy.get('#navbarNav [routerlink="/requests"]').click();
    cy.get('.btn-danger').click();
  })

  it('should delete a group', () => {
    createGroup()
    cy.get('.btn-outline-primary').click();
    cy.get('.btn-danger').click();
  })

  it('should create a request to join a group', () => {
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


  it('should accept thhe user join request and send a message', () => {
    login("superAdmin", "123456")
    cy.get('.btn-outline-primary').click();
    cy.get('.btn-outline-success').click();
    cy.get('[name="messageOut"]').click();
    cy.get('[name="messageOut"]').clear();
    cy.get('[name="messageOut"]').type('TestMessage');
    cy.get('.btn-primary').click();
    cy.get('.btn-success').click();
  })


  it('promote user to super admin, make sure the test message that was sent appears in the channel and the super admin can delete any user by typing their name', () => {
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