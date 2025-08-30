import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, OnInit, CSP_NONCE } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, connect, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { io } from 'socket.io-client';
import { Sockets } from '../../services/sockets';

@Component({
  selector: 'chat',
  templateUrl: './chat.html',
  standalone: false,
})

export class Chat{
  constructor(private router: Router, private httpService: HttpClient) {}
  server = 'http://localhost:3000';
  private socketService = inject(Sockets)
  messageOut = signal("");
  messageIn = signal<string[]>([]);
  channels = [];
  members = [];
  currentGroup = '';
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
    this.socketService.sendMessage(this.messageOut(), this.selectedChannel);
    this.messageOut.set('');
  }

  selectedChannel: any = null;  // or the appropriate type

  selectChannel(msg: any) {
    this.selectedChannel = msg;
    console.log('Current group:', msg);
    this.socketService.joinRoom(this.selectedChannel);
    this.socketService.findRooms();
    // You can do whatever you want here with the selected group
  }

  selectGroup(msg: any) {
    this.currentGroup = msg;
    //get channels for a group
    this.httpService.post(`${this.server}/api/getChannels`, {id: msg}).pipe(
    map((response: any) => {
        // Check if response is valid
        this.channels = response.channels;
        this.members = response.members;
        localStorage.setItem('channels', response.channels);
        localStorage.setItem('members', response.members);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }
  selectedMember = '';
  selectMember(msg: any){
    this.selectedMember = msg;
  }

  banUser(){
    console.log(this.selectedMember)
    this.httpService.post(`${this.server}/api/ban`, {id: this.selectedMember, currentGroup: this.currentGroup}).pipe(
    map((response: any) => {
        // Check if response is valid
        this.channels = response.channels;
        this.members = response.members;
        localStorage.setItem('channels', response.channels);
        localStorage.setItem('members', response.members);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

}

