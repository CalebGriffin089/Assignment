import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Chat } from './components/chat/chat';
import { Login } from './components/login/login';
import { Create } from './components/create/create';
import { JoinGroups } from './components/joinGroups/joinGroups';
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
  },
  {
    path: 'create',
    component: Create, 
    title:"Create"
  },
  {
    path: 'joinGroups',
    component: JoinGroups, 
    title:"joinGroups"
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes),],
  exports: [RouterModule]
})
export class AppRoutingModule { }
