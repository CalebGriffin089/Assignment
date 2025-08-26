import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Chat } from './components/chat/chat';
import { Login } from './components/login/login';

const routes: Routes = [
  {
    path: '',
    component: Login, 
    title:"Login"
  },
  {
    path: 'chat',
    component: Chat, 
    title:"Chat"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),],
  exports: [RouterModule]
})
export class AppRoutingModule { }
