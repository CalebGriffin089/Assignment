import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Sockets } from '../../services/sockets/sockets';

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
  
  currentGroup = '';
  selectedChannel: any = null;
  //have groups, channels, members, and requestsGroups, selectedMember so they can be bound in html and displayed
  groups = []
  channels = [];
  members = [];
  requestsGroups: any[] = [];
  selectedMember = '';

  isAdmin = false;
  

  ngOnInit(){
    if(!localStorage.getItem("valid")){
      this.router.navigate(['/']);
    }

    let roles = localStorage.getItem('roles') || ""; // fallback to empty string
    let rolesArray = roles.split(","); // splits into ["admin", "user", "superAdmin"]

    // Example check if admin exists
    if (rolesArray.includes("admin")) {
      this.isAdmin = true;
    }else if (rolesArray.includes("superAdmin")) {
      this.isAdmin = true;
    }

    //get all groups the user is in
    this.httpService.post(`${this.server}/api/getGroups`, {username: localStorage.getItem('username')}).pipe(
    map((response: any) => {
        //set this.groups so they can be displayed
        this.groups = response.groups;
        localStorage.setItem('groups', response.groups);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();

    this.socketService.onMessage().subscribe(
      (msg) =>{
        this.messageIn.update((msgs)=>[...msgs, msg])
      }
    );
  }

  selectChannel(selectedChannel: any) {
    this.selectedChannel = selectedChannel
    // have the socket join the selectedChannel
    this.socketService.joinRoom(selectedChannel);
  }

  send(){
    this.socketService.sendMessage(this.messageOut(), this.selectedChannel);
    this.messageOut.set('');
  }

  getChannels(selectedGroup: any){
    //get the channels for a group
     this.httpService.post(`${this.server}/api/getChannels`, {id: selectedGroup, username: localStorage.getItem('username')}).pipe(
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

  //checks if the user is an admin in the current group
  checkAdmin(selectedGroup: any){
    
    this.httpService.post(`${this.server}/api/getAdmin`, {id: selectedGroup, username: localStorage.getItem('username')}).pipe(
      map((response: any) => {
          // Check if response is valid
          if(response.isSuperAdmin){
            localStorage.setItem('roles', 'superAdmin, admin, user');
            this.isAdmin = true
          }else if(response.isAdmin){
            localStorage.setItem('roles', 'admin, user');
            this.isAdmin = true;
          }else{
            localStorage.setItem('roles', 'user');
            this.isAdmin = false;
          }
        }),
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
    ).subscribe();
  }

  getGroupRequests(){
    this.httpService.post(`${this.server}/api/getGroupRequests`, { groupId: this.currentGroup }).pipe(
        map((response: any) => {
            this.requestsGroups = response.response;
        }),
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();
  }

  selectGroup(selectedGroup: any) {
    this.currentGroup = selectedGroup;

    //get channels for the current group
    this.getChannels(selectedGroup);

    //check if they are an admin in the curren group
    this.checkAdmin(selectedGroup);

    //if they are an admin get all requests to join the group
    if(this.isAdmin){
      this.getGroupRequests();
    }


  }
  
  selectMember(member: any){
    this.selectedMember = member;
  }
  
  //NEEDS WORK
  banUser(){
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
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
    window.location.reload();
  }

  deleteGroup(){
    this.httpService.post(`${this.server}/api/deleteGroups`, {groupId: this.currentGroup}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
    window.location.reload();
  }

  addChannel(newChannel:string){
    //update the group text file
    this.httpService.post(`${this.server}/api/addChannel`, {groupId: this.currentGroup, newChannels: newChannel}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();

    //update the channel text file
    this.httpService.post(`${this.server}/api/createChannel`, {groupId: this.currentGroup, name: newChannel, members: localStorage.getItem("username")}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();

    // window.location.reload();
  }

  deleteChannel(){
    this.httpService.post(`${this.server}/api/deleteChannel`, {groupId: this.currentGroup, channel: this.selectedChannel}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

  //ban the a member from the selected channel
  banUserChannel(){
    this.httpService.post(`${this.server}/api/banUserChannel`, {currentGroup: this.currentGroup, id: this.selectedMember}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

  //add a user to the selected channel
  addUser(){
    this.httpService.post(`${this.server}/api/joinChannel`, {username: this.selectedMember, newChannel: this.selectedChannel}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

  //kick a user from the selected channel
  removeUser(){
    this.httpService.post(`${this.server}/api/kickUserChannel`, {id: this.selectedMember, currentChannel: this.selectedChannel}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

  //kick a user from the current group
  removeUserGroups(){
    this.httpService.post(`${this.server}/api/kickUserGroups`, {id: this.selectedMember, currentGroup: this.currentGroup}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

  //promote a user to a group admin
  promoteUser(){
    this.httpService.post(`${this.server}/api/promoteUser`, {id: this.selectedMember, currentGroup: this.currentGroup}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();
  }

  //accept a rrquest to join a group
  acceptGroup(username:string, groupId:string){
    this.httpService.post(`${this.server}/api/acceptGroup`, { username: username, groupId: groupId}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe(() => {});
    window.location.reload();
  }

  //decline a request to join a group
  decline(username:string, file:string){
    this.httpService.post(`${this.server}/api/decline`, { username: username, file}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe(() => {});
    window.location.reload();
  }

}

