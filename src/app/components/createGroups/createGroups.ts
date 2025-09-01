import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'createGroups',
  templateUrl: './createGroups.html',
  standalone: false,
})
export class CreateGroup {
  server = 'http://localhost:3000';
  groupData = { 
          id: null,
          channels: [],
          admins: [localStorage.getItem("username")],
          banned: null,
          members: [localStorage.getItem("username")]
        };
  

  constructor(private httpService: HttpClient, private router: Router) {}

  ngOnInit(){
    if(!localStorage.getItem("valid")){
      this.router.navigate(['/']);
    }
  }

  createGroup(): void {

    if (this.groupData.channels.length > 0) {
      // Send a http request to create the group
      this.httpService.post(`${this.server}/api/createGroup`, this.groupData).pipe(
        map((response: any) => {
          // Check if response is valid
          if (response.valid) {
            this.router.navigate(['/chat']);  // Navigate to the chat page
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

