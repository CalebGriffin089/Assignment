import { createGroup } from "./support/createGroup"
describe('template spec', () => {
  it('passes', () => {
    createGroup()
    cy.get('.btn-outline-primary').click();
    cy.get('.btn-danger').click();
    
  })
})