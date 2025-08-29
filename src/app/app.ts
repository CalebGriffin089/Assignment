import { Component, signal, OnInit } from '@angular/core';
import { Sockets } from './services/sockets';
import { inject } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
//  private socketService = inject(Sockets)
//   messageOut = signal("");
//   messageIn = signal<string[]>([]);

//   ngOnInit(){
//     this.socketService.onMessage().subscribe(
//       (msg) =>{
//         this.messageIn.update((msgs)=>[...msgs, msg])
//       }
//     );
//   }

//   send(){
//     this.socketService.sendMessage(this.messageOut());
//     this.messageOut.set('');
//   }
}
