import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: "bnku25",
  e2e: {
    'baseUrl': 'http://localhost:4200',
     experimentalStudio: true
  },
  
  
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts'
  }
  
})