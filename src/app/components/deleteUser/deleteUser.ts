import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'deleteUser',
  templateUrl: './deleteUser.html',
  standalone: false,
})
export class DeleteUser {
  server = 'http://localhost:3000';
  userInput = '';
  constructor(private httpService: HttpClient, private router: Router) {}
  isSuperAdmin = false;

  ngOnInit(){
    if(!localStorage.getItem("valid")){
      this.router.navigate(['/']);
    }

    let roles = localStorage.getItem('roles') || ""; // fallback to empty string
    let rolesArray = roles.split(","); // splits into ["admin", "user", "superAdmin"]

    // check if superAdmin is a role
    if (rolesArray.includes("superAdmin")) {
      this.isSuperAdmin = true;
    }

  }

  deleteAccount(): void {
    if(!this.isSuperAdmin){
      this.httpService.post(`${this.server}/api/delete`, { username: localStorage.getItem('username') }).pipe(
        map((response: any) => {
          if (response.success) {
            this.router.navigate(['/']); // Redirect once account has been deleted
          }
        }),
        catchError((error) => {
          console.error('Error during deletion:', error);
          return of(null);
        })
      ).subscribe();
      localStorage.clear();
    }else{
      alert("This Button Cannot Delete A superAdmin")
    }
  }

  deleteAccountSuperAdmin(){
    this.httpService.post(`${this.server}/api/delete`, { username: this.userInput }).pipe(
      map((response: any) => {
          console.log(response.body)
        }),
      catchError((error) => {
        alert(error.error.message)
        console.error('Error during deletion:', error);
        return of(null); // Return null if there is an error
      })
    ).subscribe(() =>{
      this.userInput = ''; // reset the text box once the request has been saved
    });
  }

}
