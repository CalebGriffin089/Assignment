import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { io } from 'socket.io-client';
import { Sockets } from '../../services/sockets';

@Component({
  selector: 'joinGroups',
  templateUrl: './joinGroups.html',
  standalone: false,
})

export class JoinGroups{
  server = 'http://localhost:3000';
  constructor(private router: Router, private httpService: HttpClient) {}
  messageOut = signal("");
  messageIn = signal<string[]>([]);
  user = {
    username : ''
  }
  ngOnInit(){
    if(!localStorage.getItem("valid")){
      this.router.navigate(['/']);
    }
  }

 onSubmit() {
  let groups = [];

  // Get the 'groups' from localStorage
  let storedGroups = localStorage.getItem("groups");

  // If 'groups' exists in localStorage and is not null or 'undefined'
  if (storedGroups && storedGroups !== "undefined") {
    try {
      // Parse stored groups, ensuring it's an array or fallback to an empty array
      groups = JSON.parse(storedGroups);
    } catch (error) {
      console.error("Error parsing groups from localStorage", error);
      groups = [];  // Fallback to an empty array if the parsing fails
    }
  }

  // Add this.user to the groups array (make sure this.user is an object, not an array)
  groups.push(this.user.username);
  // Store the updated array back in localStorage
  localStorage.setItem('groups', JSON.stringify(groups));
  let userData = {
    id: localStorage.getItem('id'),
    group: groups
  }
  this.httpService.post(`${this.server}/api/join`, userData).pipe(
    map((response: any) => {
      // Check if response is valid
      if (response.valid) {
        console.log('Login successful');
        console.log(response);

        // Emit login success to the server (if needed)
      } else {
        console.log('Invalid credentials');
      }
    }),
    catchError((error) => {
      console.error('Error during login:', error);
      return of(null);  // Return null if there is an error
    })
  ).subscribe();

}
}

