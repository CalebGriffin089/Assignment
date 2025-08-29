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
  groups = [];
  ngOnInit(){
    if(!localStorage.getItem("valid")){
      this.router.navigate(['/']);
    }
    let storedGroups = localStorage.getItem("groups");
    // If 'groups' exists in localStorage and is not null or 'undefined'
    if (storedGroups && storedGroups !== "undefined") {
      try {
        // Parse stored groups, ensuring it's an array or fallback to an empty array
        this.groups = JSON.parse(storedGroups);
      } catch (error) {
        console.error("Error parsing groups from localStorage", error);
        this.groups = [];  // Fallback to an empty array if the parsing fails
      }
    }
    // this.socketService.joinRoom(groups)
    this.socketService.onMessage().subscribe(
      (msg) =>{
        this.messageIn.update((msgs)=>[...msgs, msg])
      }
    );
  }

  send(){
    this.socketService.sendMessage(this.messageOut(), this.selectedGroup);
    this.messageOut.set('');
  }

  selectedGroup: any = null;  // or the appropriate type

  selectGroup(msg: any) {
    this.selectedGroup = msg;
    console.log('Current group:', msg);
    this.socketService.joinRoom(this.selectedGroup);
    this.socketService.findRooms();
    // You can do whatever you want here with the selected group
  }

}

