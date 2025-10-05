import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'requests',
  templateUrl: './requests.html',
  standalone: false,
})

export class Requests {
  constructor(private router: Router, private httpService: HttpClient) {}
  
  server = 'http://localhost:3000';
  isSuperAdmin = false;
  requestsUsers: any[] = [];
  ngOnInit() {
    if (!localStorage.getItem("valid")) {
      this.router.navigate(['/']);
    }

    let roles = localStorage.getItem('roles') || ""; // fallback to empty string
    let rolesArray = roles.split(","); // splits into ["admin", "user", "superAdmin"]

    // Example check if admin exists
    if (rolesArray.includes("superAdmin")) {
      this.isSuperAdmin = true;
    }
    this.httpService.get(`${this.server}/api/getUserRequests`).pipe(
      map((response: any) => {
        console.log('response');
        // Assuming response is an object with a 'requests' property that contains an array
        if (response && Array.isArray(response.requests)) {
          // Store the 'requests' array in the class's requests property
          this.requestsUsers = response.requests;
        } else {
          console.warn('Unexpected response format:', response);
          this.requestsUsers = [];  // Default to empty array if response is not in expected format
        }
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe(() => {
      console.log(this.requestsUsers);
    });

  }
  
  accept(username:string, email:string, password:string){
    this.httpService.post(`${this.server}/api/acceptUser`, { username: username, email: email, password: password }).pipe(
      map((response: any) => {
        // Assuming response is an object with a 'requests' property that contains an array
        if (response && Array.isArray(response.requests)) {
          // Store the 'requests' array in the class's requests property
          this.requestsUsers = response.requests;
        } else {
          console.warn('Unexpected response format:', response);
          this.requestsUsers = [];  // Default to empty array if response is not in expected format
        }
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe(() => {
      console.log(this.requestsUsers);
    });
    window.location.reload();
  }

   decline(username:string, file:string){
    this.httpService.post(`${this.server}/api/decline`, { username: username, file: file}).pipe(
      map((response: any) => {
        console.log(response);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
    window.location.reload();
  }
//promoteSuperAdmin
  userInput = '';
  onSubmitSuper(){
    this.httpService.post(`${this.server}/api/promoteSuperAdmin`, { username: this.userInput}).pipe(
      map((response: any) => {
        if(response.success){
          alert('User Has Been Sucessfully Promoted To superAdmin ');
        }else{
          alert(response.message)
        }
        
      }),
      catchError((error) => {
        alert('There Has Been An Error');
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }
}


