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
  user = { username: '', password: '' };
  server = 'http://localhost:3000';  // Your server URL

  constructor(private httpService: HttpClient, private router: Router) {}

  onSubmit(): void {
    const userData = {
      username: this.user.username,
      password: this.user.password
    };

    if (this.user.username !== '' && this.user.password !== '') {
      // Send the login request using RxJS pipe and handle the response
      this.httpService.post(`${this.server}/api/auth`, userData).pipe(
        map((response: any) => {
          // Check if response is valid
          if (response.valid) {
            console.log('Login successful');
            localStorage.setItem("username", response.username);
            localStorage.setItem("id", response.id);
            localStorage.setItem("password", response.password);
            localStorage.setItem("email", response.email);
            localStorage.setItem("roles", response.roles);
            localStorage.setItem("groups", JSON.stringify(response.group));
            localStorage.setItem("valid", response.valid);
            this.router.navigate(['/chat']);  // Navigate to the account page

            // Emit login success to the server (if needed)
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
}

