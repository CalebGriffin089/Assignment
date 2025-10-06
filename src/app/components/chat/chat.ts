import { HttpClient } from '@angular/common/http';
import { Component, CSP_NONCE, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Sockets } from '../../services/sockets/sockets';
import { ImguploadService } from '../../services/imgupload.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CallService } from '../../services/video/video';
import { ElementRef, ViewChild } from '@angular/core';
import Peer, { MediaConnection } from 'peerjs';
import { io } from 'socket.io-client';

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

  @ViewChild('videoContainer') videoContainer: ElementRef | undefined; // Fixed typo from 'vidoContainer'

  constructor(private router: Router, private httpService: HttpClient, private imguploadService:ImguploadService, private sanitizer: DomSanitizer, private callService: CallService) {}
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
  oldPeerId = null

  socket = io(this.server); // Add this as a class member
  peer: Peer | null = null;
  localStream: MediaStream | null = null;
  remoteVideos: { [peerId: string]: MediaStream } = {};
  videoStarted = false;
  peerConnections: { [peerId: string]: MediaConnection } = {};
  isScreenSharing = true;

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

    const peer = new Peer('superAdmin', {
      host: 'localhost',
      port: 3000,
      path: '/peerjs',
      secure: false  // If not using HTTPS
    });

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
    const fileInput = document.querySelector('input[name="uploadfile"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
  addUser(test:any){
    console.log(test)
    this.httpService.post(`${this.server}/api/joinChannel`, {username: test, newChannel: this.selectedChannel}).pipe(
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
    console.log(username, groupId);
    this.httpService.post(`${this.server}/api/acceptGroup`, { username: username, groupId: groupId}).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return of(null);  // Return null if there is an error
      })
    ).subscribe(() => {});
    // window.location.reload();
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

  onFileSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  // Optional: Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('Only JPG, PNG, and WebP images are allowed.');
    return;
  }

  // Optional: Validate file size (< 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('File is too large. Maximum 5MB allowed.');
    return;
  }

  this.selectedfile = file;
  console.log('Selected file:', this.selectedfile);
}

onUpload(): void {
  if (!this.selectedfile) {
    this.send(); // Send message without image
    return;
  }

  const fd = new FormData();
  fd.append('image', this.selectedfile, this.selectedfile.name);

  this.isLoading = true;

  this.imguploadService.imgupload(fd).subscribe({
    next: (res: any) => {
      this.isLoading = false;
      this.imagepath = res.data.filename;
      console.log('Image uploaded successfully:', res);

      this.send(); // Send the message after upload
    },
    error: (err) => {
      this.isLoading = false;
      console.error('Image upload failed:', err);
      alert('Error uploading image. Please try again.');
    }
  });
}

  async makeVideo(useCame: boolean){
    if(useCame){
      const camera = await navigator.mediaDevices.getUserMedia({ video: true });
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const combinedStream = new MediaStream([
        ...camera.getVideoTracks(),
        ...micStream.getAudioTracks()
      ]);
      return combinedStream
    }else{
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...micStream.getAudioTracks()
      ]);
      return combinedStream
    }
  }

  async startVideoCall(useCamera: boolean) {
    if (!this.selectedChannel || !this.selectedChannel._id) {
      alert('Select a channel to start video.');
      return;
    }

    const username = localStorage.getItem('username') || 'unknown';
    const channelId = this.selectedChannel._id;
    // If we had a previous peer, destroy it first
    if (this.peer) {
        this.peer.destroy();
        this.peer = null;
        await new Promise(res => setTimeout(res, 100)); // 100ms to ensure server cleanup
      }

    // Create a new Peer every time
    const peer = await this.callService.createPeer();
    this.oldPeerId;
    this.peer = peer;

    // setup local stream...
    const combinedStream = await this.makeVideo(useCamera)

    this.localStream = combinedStream;

    const video = document.getElementById('local-video')
    const localVideo = document.getElementById('local-video') as HTMLVideoElement;
    

    if (localVideo) {
      localVideo.srcObject = combinedStream;
      localVideo.muted = true;
      await localVideo.play();
    }

    if (!video){
      return
    }else{
      video.replaceWith(localVideo);
    }

    this.socketService.joinVideo(channelId, username, peer.id);
    this.videoStarted = true;

    // Answer incoming calls
    peer.on('call', call => {
      call.answer(combinedStream);
      call.on('stream', remoteStream => this.addRemoteStream(call.peer, remoteStream));
      call.on('close', () => this.removeRemoteStream(call.peer));
      this.peerConnections[call.peer] = call;
    });

    // Listen for peers safely
    this.socketService.on('video-peers').subscribe((peers: string[]) => {
      peers.forEach((peerId: string) => {  // <-- add :string
        if (peerId !== peer.id && !this.peerConnections[peerId]) {
          const call = peer.call(peerId, combinedStream);
          call.on('stream', (remoteStream: MediaStream) => this.addRemoteStream(peerId, remoteStream));
          call.on('close', () => this.removeRemoteStream(peerId));
          this.peerConnections[peerId] = call;
        }
      });
    });
  }

  addRemoteStream(peerId: string, stream: MediaStream) {
    if (this.remoteVideos[peerId]) return;

    const video = document.createElement('video');
    video.id = `remote-video-${peerId}`;
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.width = 200;
    video.style.margin = '5px';
    video.muted = false; // allow audio

    const container = this.videoContainer?.nativeElement;
    if (container) {
      container.appendChild(video);
    }

    this.remoteVideos[peerId] = stream;
  }


  leaveVideoCall() {
  // Stop local stream tracks
  if (this.localStream) {
    this.localStream.getTracks().forEach(track => track.stop());
    this.localStream = null;
  }

  // Clear local video element
  const localVideo = document.getElementById('local-video') as HTMLVideoElement;
  if (localVideo) {
    localVideo.srcObject = null;
  }

  // Close all PeerJS connections
  Object.keys(this.peerConnections).forEach(peerId => {
    const conn = this.peerConnections[peerId];
    if (conn) {
      conn.close(); // closes the peer connection
      delete this.peerConnections[peerId];
    }
  });

  // Remove remote videos from container
  Object.keys(this.remoteVideos).forEach(peerId => this.removeRemoteStream(peerId));

  // Notify server that this user left the video call
  if (this.selectedChannel && this.peer) {
    const username = localStorage.getItem('username') || 'unknown';
    this.socketService.leaveVideo(this.selectedChannel._id, username, this.peer.id);
  }


  this.videoStarted = false;
}

  removeRemoteStream(peerId: string) {
    const video = document.getElementById(`remote-video-${peerId}`);
    if (video) video.remove();
    delete this.remoteVideos[peerId];
  }



  async toggleStream() {
    if(this.isScreenSharing){
        try{
          const camera = await navigator.mediaDevices.getUserMedia({ video: true }) || null;
          this.leaveVideoCall();
          this.startVideoCall(true);
          this.isScreenSharing = false
        }catch(err){
          alert("Camera Not Found or Access Denied");
        }
    }else{
      this.leaveVideoCall();
      this.startVideoCall(false);
      this.isScreenSharing = true;
    }
  }
}


