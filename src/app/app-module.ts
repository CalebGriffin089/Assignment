import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './components/login/login';
import { Chat } from './components/chat/chat';
import { Create } from './components/create/create';
import { JoinGroups } from './components/joinGroups/joinGroups';
import { CreateGroup } from './components/createGroups/createGroups';
import { DeleteUser } from './components/deleteUser/deleteUser';
@NgModule({
  declarations: [
    App,
    Login, 
    Chat,
    Create,
    JoinGroups, 
    CreateGroup,
    DeleteUser
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule { }
