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
  private socketService = inject(Sockets)
  messageOut = signal("");
  messageIn = signal<string[]>([]);

  ngOnInit(){
    console.log("msg");
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

