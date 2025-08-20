import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'login',
  templateUrl: './login.html',
  standalone: false,
})
export class Login {
  private httpService = inject(HttpClient);
  private server = "http://localhost:3000";
  // getUsers(){
  //   return this.httpService.get(this.server + "/api/auth");
  // }

  constructor(private router: Router){}
  user = {
    email: '',
    password: '',
  }
  onSubmit() {
    const userData = {
      email: this.user.email,
      password: this.user.password
    };
    if(this.user.email != '' && this.user.password != ''){
      // Send the login request using RxJS pipe and handle response
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
          this.router.navigate(['/account']); // Navigate to account page
        } else {
          console.log('Invalid credentials');
        }
      }),
      catchError(error => {
        console.error('Error during login:', error);
        return of(null); // You can handle error in a way that suits your app
      })
      ).subscribe(); // Subscribe to the observable to trigger the HTTP request
    }
  }
}
