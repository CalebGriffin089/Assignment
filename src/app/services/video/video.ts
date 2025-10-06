import { Injectable } from "@angular/core";
import Peer, { MediaConnection } from 'peerjs';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private peers: { [peerId: string]: MediaConnection } = {};

 async createPeer(): Promise<Peer> {
  // Return existing peer if still valid
  if (this.peer && !this.peer.destroyed) return this.peer;

  return new Promise((resolve, reject) => {
      // Create Peer with optional userId
      this.peer = new Peer({
        host: 'localhost',
        port: 3001,
        path: '/peerjs',
        debug: 2
      });

      // PeerJS assigns an ID asynchronously
      this.peer.on('open', (id: string) => {
        console.log('Peer connection open. Assigned ID:', id);
        resolve(this.peer!);
      });

      this.peer.on('error', (err) => {
        console.error('Peer error', err);
        reject(err);
      });
    });
  }

  async getLocalStream(): Promise<MediaStream> {
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
    }
    return this.localStream;
  }

  getPeer(): Peer | null {
    return this.peer;
  }

  callPeer(peerId: string, stream: MediaStream): MediaConnection {
    if (!this.peer) throw new Error("Peer not initialized");
    const call = this.peer.call(peerId, stream);
    this.peers[peerId] = call;
    return call;
  }

  answerCall(callback: (call: MediaConnection, stream: MediaStream) => void) {
    if (!this.peer) return;
    this.peer.on('call', async (call: MediaConnection) => {
      const stream = await this.getLocalStream();
      call.answer(stream);
      this.peers[call.peer] = call;
      callback(call, stream);
    });
  }

  closePeer(peerId: string) {
    const call = this.peers[peerId];
    if (call) {
      call.close();
      delete this.peers[peerId];
    }
  }
}
