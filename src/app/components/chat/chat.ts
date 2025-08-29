import { Component, inject, signal, OnInit } from '@angular/core';
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

