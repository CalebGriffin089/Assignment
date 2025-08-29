import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'create',
  templateUrl: './create.html',
  standalone: false,
})
export class Create {
  user = { 
          username: '',
          email: '', 
          password: '',
        };
  server = 'http://localhost:3000';  // Your server URL

  constructor(private httpService: HttpClient, private router: Router) {}

  onSubmit(): void {

    if (this.user.email !== '' && this.user.password !== '' && this.user.username !== '') {
      // Send the login request using RxJS pipe and handle the response
      this.httpService.post(`${this.server}/api/create`, this.user).pipe(
        map((response: any) => {
          // Check if response is valid
          if (response.valid) {
            this.router.navigate(['/']);  // Navigate to the account page

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

}

