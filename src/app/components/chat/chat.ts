import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { io } from 'socket.io-client';

@Component({
  selector: 'chat',
  templateUrl: './chat.html',
  standalone: false,
})

export class Chat {
  socket: any;
  user = { email: '', password: '' };
  server = 'http://localhost:3000';  // Your server URL

  constructor(private httpService: HttpClient, private router: Router) {}
  messageNumb =0;
  messages : string[] = [];
  message = '';
  name = localStorage.getItem('username');
  userInfo = {
    message: '',
    username: this.name
  }
  ngOnInit(): void {
    if(this.userInfo.username == null){
      this.userInfo.username = "No User";
    }
    this.socket = io(this.server);  // Connect to the server
    this.socket.on('connect', () => {
    console.log('Socket connected');
      this.socket.emit('loginSuccess', 'Welcome gg');
    });

    // Listen for server's response
    this.socket.on('response', (messageResponse: string) => {
      this.messages.push(messageResponse);
    });
  }

  onSubmit(): void {

    this.socket.emit('message', this.userInfo);
  }

  logout(){
    localStorage.clear();
    this.router.navigate(['/']);
  }

  // Remember to disconnect the socket when the component is destroyed
  ngOnDestroy(): void {
    if (this.socket) {
      this.userInfo.message = this.userInfo.username + " Has Left";
      this.userInfo.username = "Server"
      this.onSubmit();
      this.socket.disconnect();
    }
  }
}

