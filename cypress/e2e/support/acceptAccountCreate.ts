import { login } from "./login"
import { createUser } from "./CreateAccountRequets"
export function acceptUserAccount(username: string, email:string, password: string) {
  createUser(username, email, password)
  login("superAdmin", "123456")
  cy.get('#navbarNav [routerlink="/requests"]').click();
  cy.get('.btn-success').click();
}