import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { io } from 'socket.io-client';

@Component({
  selector: 'login',
  templateUrl: './login.html',
  standalone: false,
})
export class Login {
  socket: any;
  user = { email: '', password: '' };
  server = 'http://localhost:3000';  // Your server URL

  constructor(private httpService: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Initialize the WebSocket connection
    this.socket = io(this.server);  // Adjust this URL if necessary

    // Listen for login success or failure events
    this.socket.on('loginSuccess', (message: string) => {
      console.log('Login Success:', message);
      // You can show a toast or alert for the login success
    });

    this.socket.on('loginFailed', (message: string) => {
      console.log('Login Failed:', message);
      // You can show a toast or alert for the failed login attempt
    });
  }

  onSubmit(): void {
    const userData = {
      email: this.user.email,
      password: this.user.password
    };

    if (this.user.email !== '' && this.user.password !== '') {
      // Send the login request using RxJS pipe and handle the response
      this.httpService.post(`${this.server}/api/auth`, userData).pipe(
        map((response: any) => {
          // Check if response is valid
          if (response.valid) {
            console.log('Login successful');
            localStorage.setItem("username", response.username);
            localStorage.setItem("birthdate", response.birthdate);
            localStorage.setItem("age", response.age);
            localStorage.setItem("email", response.email);
            localStorage.setItem("valid", response.valid);
            this.router.navigate(['/chat']);  // Navigate to the account page

            // Emit login success to the server (if needed)
            this.socket.emit('loginSuccess', `Welcome ${response.username}`);
          } else {
            console.log('Invalid credentials');
          }
        }),
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();  // Subscribe to trigger the HTTP request
    }
  }

  // Remember to disconnect the socket when the component is destroyed
  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

