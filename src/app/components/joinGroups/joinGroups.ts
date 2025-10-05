import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'joinGroups',
  templateUrl: './joinGroups.html',
  standalone: false,
})

export class JoinGroups{
  server = 'http://localhost:3000';
  constructor(private router: Router, private httpService: HttpClient) {}
  groupName = '';

  ngOnInit(){
    if(!localStorage.getItem("valid")){
      this.router.navigate(['/']);
    }
  }
 
 onSubmit() {
  let userData = {
    id: localStorage.getItem('id'),
    username: localStorage.getItem('username'),
    groupId: this.groupName
  }

  this.httpService.post(`${this.server}/api/groupRequest`, userData).pipe(
    map((response: any) => {
      alert(`A Join Request Has Sucessfully Been Sent to Group ${this.groupName}`)
    }),
    catchError((error) => {
      alert(error.error.error)
      console.error('Error during login:', error);
      return of(null);  // Return null if there is an error
    })
  ).subscribe(() =>{
    this.groupName = ''; // reset the text box once the request has been saved
  });  // Subscribe to trigger the HTTP request

}
}

