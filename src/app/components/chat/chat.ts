import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { io } from 'socket.io-client';
import { Sockets } from '../../services/sockets';

@Component({
  selector: 'chat',
  templateUrl: './chat.html',
  standalone: false,
})

export class Chat{
  constructor(private router: Router) {}
  private socketService = inject(Sockets)
  messageOut = signal("");
  messageIn = signal<string[]>([]);

  ngOnInit(){
    if(!localStorage.getItem("valid")){
      this.router.navigate(['/']);
    }
     let storedGroups = localStorage.getItem("groups");
    let groups = []
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
    console.log(groups);
    this.socketService.joinRoom(groups)
    this.socketService.onMessage().subscribe(
      (msg) =>{
        this.messageIn.update((msgs)=>[...msgs, msg])
      }
    );
  }

  send(){
    this.socketService.sendMessage(this.messageOut());
    this.messageOut.set('');
  }
}

