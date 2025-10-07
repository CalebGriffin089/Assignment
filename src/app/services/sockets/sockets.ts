import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { io,Socket } from 'socket.io-client'
import { HttpClient } from '@angular/common/http';
import Peer from 'peerjs';

interface Message {
  msg: string,
  image: string,
  username: 'Server',
  profileImage: 'http://localhost:3000/userImages/profile.jpg'
}


@Injectable({
  providedIn: 'root'
})

export class Sockets {
  private socket:Socket;
  messages = signal<string[]>([]);
  private apiServer = "http://localhost:3000"

  constructor(private httpService: HttpClient){
    this.socket = io(this.apiServer);
  }

  saveMessage (msg:any, room:string, group:string){
    this.httpService.post('http://localhost:3000/api/saveMessage', {msg: msg, channel: room, group: group}).pipe().subscribe();
  }

  sendMessage(msg:any, room:string, group:string){
    if(group == ''){
      this.socket.emit("message", msg, room)
    }else{
      this.saveMessage(msg, room, group)
      this.socket.emit("message", msg, room)
    } 
  }

  onMessage():Observable<any>{
    let temp:Observable<any> = new Observable((observer)=>{
      this.socket.on("response", (msg:any)=>{
        observer.next(msg);
      })
    })
    return temp
  }

  joinRoom(rooms:string, username:string){
      const msg: Message = {
          msg: `${username} has joined the room.`,
          image: 'http://localhost:3000/userImages/',
          username: 'Server',
          profileImage: 'http://localhost:3000/userImages/profile.jpg'
        };
      this.socket.emit("message", msg, rooms)

     this.socket.emit('joinRoom', rooms);  
     
  }

  leaveRoom(room:string, username:string){
    const msg: Message = {
        msg: `${username} has left the room.`,
        image: 'http://localhost:3000/userImages/',
        username: 'Server',
        profileImage: 'http://localhost:3000/userImages/profile.jpg'
      };
     this.socket.emit("message", msg, room)
  }

  findRooms(){
    this.socket.emit('rooms');
  }

  on(eventName: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (data: any) => {
        observer.next(data);
      });

      // Remove listener on unsubscribe
      return () => {
        this.socket.off(eventName);
      };
    });
  }

 joinVideo(channelId: string, userId: string, peerId: string) {
    this.socket.emit('join-video', { channelId, userId, peerId });
  }

  leaveVideo(channelId: string, userId: string, peerId: string) {
    this.socket.emit('leave-video', { channelId, userId, peerId });
  }
}
