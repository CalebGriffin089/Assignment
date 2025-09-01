import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'login',
  templateUrl: './login.html',
  standalone: false,
})
export class Login {
  user = { username: '', password: '' };
  server = 'http://localhost:3000';  // Your server URL
  errorMsg = '';
  constructor(private httpService: HttpClient, private router: Router) {}

  onLogin(): void {

    if (this.user.username !== '' && this.user.password !== '') {

      // Send a http login request with the user data
      this.httpService.post(`${this.server}/api/auth`, this.user).pipe(
        map((response: any) => {
          // Check if response is valid
          if (response.valid) {
            localStorage.setItem("username", response.username);
            localStorage.setItem("id", response.id);
            localStorage.setItem("password", response.password);
            localStorage.setItem("email", response.email);
            localStorage.setItem("roles", response.roles);
            localStorage.setItem("groups", response.groups);
            localStorage.setItem("valid", response.valid);
            this.router.navigate(['/chat']);  // go to the chat page

          } else {
            this.errorMsg ='Invalid credentials';
          }
        }),
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();  // Subscribe to trigger the HTTP request
    }
  }
}

