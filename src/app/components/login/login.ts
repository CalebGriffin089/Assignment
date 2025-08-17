import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'login',
  templateUrl: './login.html',
  standalone: false,
})
export class Login {
  user = {
    email: '',
    password: ''
  }

  constructor(private router: Router) {}
  logins = [
    {
      email: "test@com",
      password: "123"
    },
    {
      email: "user1@example.com",
      password: "password1"
    },
    {
      email: "admin@domain.com",
      password: "adminpass"
    }
  ];
  onSubmit(){
    console.log("Email: " + this.user.email);
    console.log("Password: " + this.user.password);
    let found = false
    for(let i =0; i<this.logins.length; i++){
        if(this.logins[i].email == this.user.email && this.logins[i].password == this.user.password){
            found = true
            break
        }
    }

    if(found){
        this.router.navigate(['/account']);
    }else{
        console.log("error");
    }
    
  }
}
