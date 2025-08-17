import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Home } from './components/home/home';
import { Account } from './components/account/account';
import { Login } from './components/login/login';

const routes: Routes = [
  {
    path: '',
    component: Home, 
    title:"Home"
  },
  {
    path: 'login',
    component: Login, 
    title:"Login"
  },
  {
    path: 'account',
    component: Account, 
    title:"Account"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),],
  exports: [RouterModule]
})
export class AppRoutingModule { }
