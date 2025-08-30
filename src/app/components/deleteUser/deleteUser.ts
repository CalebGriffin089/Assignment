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
  user = {
    username: '',
    email: '',     // Not used for deletion
    password: '',  // Not used for deletion
  };

  server = 'http://localhost:3000';
  response = '';

  constructor(private httpService: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (this.user.username.trim() !== '') {
      this.httpService.post(`${this.server}/api/delete`, { username: this.user.username }).pipe(
        map((response: any) => {
          if (response.success) {
            this.response = 'User successfully deleted.';
            this.router.navigate(['/']); // Redirect if needed
          } else {
            this.response = response.message || 'Failed to delete user.';
          }
        }),
        catchError((error) => {
          console.error('Error during deletion:', error);
          this.response = 'An error occurred while trying to delete the user.';
          return of(null);
        })
      ).subscribe();
    } else {
      this.response = 'Username is required to delete a user.';
    }
  }
}
