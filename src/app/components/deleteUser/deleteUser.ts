import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'deleteUser',
  templateUrl: './deleteUser.html',  // Make sure you have a delete.html file
  standalone: false,
})
export class DeleteUser {
  server = 'http://localhost:3000';

  constructor(private httpService: HttpClient, private router: Router) {}

  onSubmit(): void {
    this.httpService.post(`${this.server}/api/delete`, { username: localStorage.getItem('username') }).pipe(
      map((response: any) => {
        if (response.success) {
          this.router.navigate(['/']); // Redirect if needed
        } else {
        }
      }),
      catchError((error) => {
        console.error('Error during deletion:', error);
        return of(null);
      })
    ).subscribe();
    localStorage.clear();
  }
}
