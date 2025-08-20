import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'account',
  templateUrl: './account.html',
  standalone: false,
})
export class Account {

  constructor(private router: Router){}

  username = '';
  birthdate = '';
  age = '';
  email = '';
  valid = false;
  
  updatedUsername = '';
  updatedBirthdate = '';
  updatedAge = '';
  updatedEmail = '';

  userInfo = {
    username: '',
    birthdate: '',
    age: '',
    email: ''
  }
  onSubmit() {
    // Store the email and password in localStorage
    Object.entries(this.userInfo).forEach(([key, value]) => {
      if(value != ''){
        localStorage.setItem(key, value)
      }
    });
    this.ngOnInit();
  }
  logout(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnInit(){
    if(!localStorage.getItem('valid')){
      this.router.navigate(['/login']);
    }
    this.username = localStorage.getItem('username')??'No Username';
    this.birthdate = localStorage.getItem('birthdate')??'No Birthdate';
    this.age = localStorage.getItem('age')??'No Age';
    this.email = localStorage.getItem('email')??'No Email';
  }
}
