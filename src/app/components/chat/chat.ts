import { HttpClient } from '@angular/common/http';
import { Component, CSP_NONCE, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Sockets } from '../../services/sockets/sockets';
import { ImguploadService } from '../../services/imgupload.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface Message {
  msg: string,
  image: string,
  username: string,
  profileImage: string
}

interface Raw_Message {
  _id: string;
  username: string;
  msg: string;
  channel: string;
  group: string;
  profileImage: string;
  timeStamp: string;
  image?: string;
}


@Component({
  selector: 'chat',
  templateUrl: './chat.html',
  standalone: false,
})

export class Chat{
  constructor(private router: Router, private httpService: HttpClient, private imguploadService:ImguploadService, private sanitizer: DomSanitizer) {}
  server = 'http://localhost:3000';
  private socketService = inject(Sockets)
  messageOut = signal<Message>({
    msg: '',           // Initial message content (empty string by default)
    image: '',
    username: localStorage.getItem('username') || 'null',      // Initial username (empty string by default)
    profileImage: localStorage.getItem('profile') || 'null',  // Initial profile image (empty string by default)
  });

  messageIn = signal<Message[]>([]);
  currentGroup = '';
  selectedChannel: any = null;

  title = 'imageupload';
  selectedfile:any = null;
  imagepath="";
  isLoading = true;
  //have groups, channels, members, and requestsGroups, selectedMember so they can be bound in html and displayed
  groups = []
  channels: { _id: string; name: string }[] = [];
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


  hoveredMember: string | null = null;

  onMemberEnter(member: string) {
    this.hoveredMember = member;
  }

  onMemberLeave() {
    this.hoveredMember = null;
  }

 hoverTimeout: any = null;
 hoveredGroup: string | null = null;

  onGroupEnter(group: string) {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
      this.hoveredGroup = group;
    }

    onGroupLeave() {
      // Delay hiding the panel to avoid flicker when moving mouse fast
      this.hoverTimeout = setTimeout(() => {
        this.hoveredGroup = null;
      }, 200); // 200ms delay - adjust as needed
    }

    hoveredChannel: any = null;

  onChannelEnter(channel: any) {
    this.hoveredChannel = channel;
  }

  onChannelLeave() {
    this.hoveredChannel = null;
  }


  setMessageOut(msg:string){
    let currentMessage = this.messageOut() 
    currentMessage.msg = msg
    this.messageOut.set(currentMessage) 
  }

 get messageOutMsg(): string {
    return this.messageOut().msg; // Access msg property from the signal
  }

  set messageOutMsg(msg: string) {
    this.setMessageOut(msg); // Use the setMessageOut function to update the signal
  }

  


  selectChannel(selectedChannel: any) {
    let username = localStorage.getItem('username') || '' 
    let oldChannel = this.selectedChannel;
    this.selectedChannel = selectedChannel
    // have the socket join the selectedChannel
    this.socketService.joinRoom(selectedChannel._id, username);
    if(oldChannel != null){
      this.socketService.leaveRoom(oldChannel._id, username);
    }
    
    this.httpService.post(`${this.server}/api/getMessages`, {channel: selectedChannel, group: this.currentGroup}).pipe(
      map((response: any) => {
        const messages: Message[] = response.map((res: Raw_Message) => ({
          msg: res.msg,
          image: res.image || '',
          username: res.username,
          profileImage: res.profileImage || '',
        }));
        this.messageIn.update((currentMessages: Message[]) => [...messages.reverse()]);
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();


  }

  hasImage(url: string){
    let urlSplit = url.split("http://localhost:3000/userImages/")
    if(urlSplit[1] == ''){
      return false
    }else{
      return true
    }
  }

  splitMsg(msg:any, pos:any){
    let msgSplit = msg.split('http://localhost:3000/userImages/');
    return msgSplit[pos]
  }

  getSanitizedUrl(url: string): SafeUrl {
    let urlSplit = url.split("http://localhost:3000/userImages/")
    return this.sanitizer.bypassSecurityTrustUrl('http://localhost:3000/userImages/' + urlSplit[1]);
  }

  send(){
    const imageUrl = "http://localhost:3000/userImages/" + encodeURIComponent(this.imagepath);
    const currentMessage = this.messageOut();
    currentMessage.image = imageUrl;
    this.messageOut.set(currentMessage);

    let username = localStorage.getItem('username') || 'null';
    this.socketService.sendMessage(this.messageOut(), this.selectedChannel._id, this.currentGroup);
    this.messageOut.set({
      msg: '',
      image: '',
      username: localStorage.getItem('username') || 'null',
      profileImage: localStorage.getItem('profile') || 'null'
    });
    this.imagepath = '';
    this.selectedfile = null;
    const fileInput = document.getElementById('uploadfile') as HTMLInputElement;
    fileInput.value = ''; // Reset file input field
  }

  getChannels(selectedGroup: any) {
  this.httpService.post(`${this.server}/api/getChannels`, {
    groupId: selectedGroup,
    username: localStorage.getItem('username')
  }).pipe(
    map((response: any) => {
      this.channels = response.channels;  // array of objects with _id and name
      this.members = response.members

      // Save only the channel names or IDs if you want strings in localStorage
      localStorage.setItem('channels', JSON.stringify(response.channels)); 
      localStorage.setItem('members', JSON.stringify(response.members));
    }),
    catchError((error) => {
      console.error('Error during login:', error);
      return of(null);
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
            console.log(response)
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
  

  banUser(){
    if(confirm(`Are you sure you want to leave the group: ${this.currentGroup}?`)){
      this.httpService.post(`${this.server}/api/ban`, {id: this.selectedMember, currentGroup: this.currentGroup}).pipe(
      map((response: any) => {
        }),
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();
    }
  }

  
  leaveGroup(){
    if(confirm(`Are you sure you want to leave the group: ${this.currentGroup}?`)){
        this.httpService.post(`${this.server}/api/leaveGroup`, {name: localStorage.getItem('username'), currentGroup: this.currentGroup}).pipe(
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();
      window.location.reload();
    }
  }

  deleteGroup(){
    if(confirm(`Are you sure you want to leave the group: ${this.currentGroup}?`)){
      this.httpService.post(`${this.server}/api/deleteGroups`, {groupId: this.currentGroup}).pipe(
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();
      window.location.reload();
    }
  }

  addChannel(newChannel:string){
    //update the group text file
    

    //update the channel text file
    this.httpService.post(`${this.server}/api/createChannel`, {groupId: this.currentGroup, name: newChannel, members: localStorage.getItem("username")}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();

    this.httpService.post(`${this.server}/api/addChannel`, {groupId: this.currentGroup, newChannels: newChannel, username: localStorage.getItem("username")}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe();

    window.location.reload();
  }

  deleteChannel(){
    if(confirm(`Are you sure you want to leave the group: ${this.currentGroup}?`)){
      this.httpService.post(`${this.server}/api/deleteChannel`, {groupId: this.currentGroup, channel: this.selectedChannel}).pipe(
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();
      window.location.reload();
    }
  }

  //ban the a member from the selected channel
  banUserChannel(){
    if(confirm(`Are you sure you want to leave the group: ${this.currentGroup}?`)){
      this.httpService.post(`${this.server}/api/banUserChannel`, {currentGroup: this.currentGroup, user: this.selectedMember}).pipe(
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();
    }
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
    if(confirm(`Are you sure you want to leave the group: ${this.currentGroup}?`)){
      this.httpService.post(`${this.server}/api/kickUserChannel`, {id: this.selectedMember, currentChannel: this.selectedChannel}).pipe(
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();
    }
  }

  //kick a user from the current group
  removeUserGroups(){
    if(confirm(`Are you sure you want to leave the group: ${this.currentGroup}?`)){
      this.httpService.post(`${this.server}/api/kickUserGroups`, {id: this.selectedMember, currentGroup: this.currentGroup}).pipe(
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();
    }
  }

  //promote a user to a group admin
  promoteUser(){
    if(confirm(`Are you sure you want to leave the group: ${this.currentGroup}?`)){
      this.httpService.post(`${this.server}/api/promoteUser`, {id: this.selectedMember, currentGroup: this.currentGroup}).pipe(
        catchError((error) => {
          console.error('Error during login:', error);
          return of(null);  // Return null if there is an error
        })
      ).subscribe();
    }
  }

  //accept a rquest to join a group
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
  onFileSelected(event:any){
    this.selectedfile = event.target.files[0];
  }


  onUpload(): void {
    const fd = new FormData();
    this.isLoading = true;  // Set loading state to true when uploading starts

    if (this.selectedfile != null) {
      fd.append('image', this.selectedfile, this.selectedfile.name);
      
      // Upload the image
      this.imguploadService.imgupload(fd).subscribe(
        res => {
          this.isLoading = false;  // Set loading state to false when upload finishes
          this.imagepath = res.data.filename;
          console.log('Image uploaded successfully', res);

          // After upload, send the message
          this.send();
        },
        error => {
          this.isLoading = false;  // Reset loading state if upload fails
          console.error('Image upload failed', error);
          alert('Error uploading image. Please try again.');
        }
      );
    } else {
      this.isLoading = false;  // Reset loading state if no file is selected
      this.send();  // Send the message without image if no file selected
    }
  }
}
