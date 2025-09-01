import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { io,Socket } from 'socket.io-client'

@Injectable({
  providedIn: 'root'
})

export class Sockets {
  private socket:Socket;
  messages = signal<string[]>([]);
  private apiServer = "http://localhost:3000"

  constructor(){
    this.socket = io(this.apiServer);
  }

  sendMessage(msg:string, room:string){
    this.socket.emit("message", msg, room)
  }

  onMessage():Observable<string>{
    let temp:Observable<string> = new Observable((observer)=>{
      this.socket.on("response", (msg:string)=>{
        observer.next(msg);
      })
    })
    return temp
  }

  joinRoom(rooms:string){
     this.socket.emit('joinRoom', rooms);
  }

  findRooms(){
    this.socket.emit('rooms');
  }

}
