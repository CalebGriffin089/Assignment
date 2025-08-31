import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
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
  isAdmin = false;
  ngOnInit(){
    if(!localStorage.getItem("valid")){
      this.router.navigate(['/']);
    }

    let roles = localStorage.getItem('roles') || ""; // fallback to empty string
    let rolesArray = roles.split(","); // splits into ["admin", "user", "moderator"]

    console.log(rolesArray);

    // Example check if admin exists
    if (rolesArray.includes("admin")) {
      this.isAdmin = true;
    }

    this.httpService.post(`${this.server}/api/getGroups`, {username: localStorage.getItem('username')}).pipe(
    map((response: any) => {
        // Check if response is valid
        this.groups = response.groups
        localStorage.setItem('groups', response.groups);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();

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
    this.httpService.post(`${this.server}/api/getChannels`, {id: msg, username: localStorage.getItem('username')}).pipe(
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

  leaveGroup(){
    this.httpService.post(`${this.server}/api/leaveGroup`, {id: localStorage.getItem('username'), currentGroup: this.currentGroup}).pipe(
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
    window.location.reload();
  }

  deleteGroup(){
    this.httpService.post(`${this.server}/api/deleteGroups`, {groupId: this.currentGroup}).pipe(
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
    window.location.reload();
  }

  newChannel = '';
  addChannel(){
    this.httpService.post(`${this.server}/api/addChannel`, {groupId: this.currentGroup, newChannels: this.newChannel}).pipe(
    map((response: any) => {
        // Check if response is valid
        console.log(response);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();

    this.httpService.post(`${this.server}/api/createChannel`, {groupId: this.currentGroup, name: this.newChannel, members: localStorage.getItem("username")}).pipe(
    map((response: any) => {
        // Check if response is valid
        console.log(response);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();

    // window.location.reload();
  }

  deleteChannel(){
    this.httpService.post(`${this.server}/api/deleteChannel`, {groupId: this.currentGroup, channel: this.selectedChannel}).pipe(
    map((response: any) => {
        // Check if response is valid
        console.log(response);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }
  banUserChannel(){
    this.httpService.post(`${this.server}/api/banUserChannel`, {currentGroup: this.currentGroup, id: this.selectedMember}).pipe(
    map((response: any) => {
        // Check if response is valid
        console.log(response);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

  addUser(){
    this.httpService.post(`${this.server}/api/joinChannel`, {username: this.selectedMember, newChannel: this.selectedChannel}).pipe(
    map((response: any) => {
        // Check if response is valid
        console.log(response);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

  
  removeUser(){
    this.httpService.post(`${this.server}/api/kickUserChannel`, {id: this.selectedMember, currentChannel: this.selectedChannel}).pipe(
    map((response: any) => {
        // Check if response is valid
        console.log(response);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

  removeUserGroups(){
    this.httpService.post(`${this.server}/api/kickUserGroups`, {id: this.selectedMember, currentGroup: this.currentGroup}).pipe(
    map((response: any) => {
        // Check if response is valid
        console.log(response);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }
}

