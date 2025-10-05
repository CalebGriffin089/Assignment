import { TestBed } from '@angular/core/testing';
import { Sockets } from './sockets';
import { HttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';

// Import the real io function to spy on it
import * as socketIoClient from 'socket.io-client';

describe('Sockets Service', () => {
  let service: Sockets;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  const mockSocket = {
    emit: jasmine.createSpy('emit'),
    on: jasmine.createSpy('on'),
    off: jasmine.createSpy('off')
  };

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);

    TestBed.configureTestingModule({
      providers: [
        Sockets,
        { provide: HttpClient, useValue: httpClientSpy }
      ]
    });

    service = TestBed.inject(Sockets);

    // Override the socket instance in the service after creation
    (service as any).socket = mockSocket;

    // Reset spies
    mockSocket.emit.calls.reset();
    mockSocket.on.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveMessage', () => {
    it('should call HttpClient.post with correct arguments', () => {
      httpClientSpy.post.and.returnValue(of({}));

      service.saveMessage('Hello', 'room1', 'group1');

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/saveMessage',
        { msg: 'Hello', channel: 'room1', group: 'group1' }
      );
    });
  });

  describe('sendMessage', () => {
    it('should emit message directly if group is empty', () => {
      service.sendMessage('Hi', 'room1', '');

      expect(mockSocket.emit).toHaveBeenCalledWith('message', 'Hi', 'room1');
      expect(httpClientSpy.post).not.toHaveBeenCalled();
    });

    it('should save message and emit if group is not empty', () => {
      httpClientSpy.post.and.returnValue(of({}));

      service.sendMessage('Hi', 'room1', 'group1');

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/saveMessage',
        { msg: 'Hi', channel: 'room1', group: 'group1' }
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('message', 'Hi', 'room1');
    });
  });

  describe('onMessage', () => {
    it('should return observable that emits when socket receives "response"', (done) => {
      const socketResponseSubject = new Subject<any>();
      mockSocket.on.and.callFake((eventName, cb) => {
        if (eventName === 'response') {
          socketResponseSubject.subscribe(cb);
        }
      });

      const obs = service.onMessage();
      const testMsg = { text: 'test' };

      obs.subscribe(msg => {
        expect(msg).toEqual(testMsg);
        done();
      });

      socketResponseSubject.next(testMsg);
    });
  });

  describe('joinRoom', () => {
    it('should emit join message and joinRoom event', () => {
      const username = 'user1';
      const room = 'room1';

      service.joinRoom(room, username);

      const expectedMsg = {
        msg: `${username} has joined the room.`,
        image: 'http://localhost:3000/userImages/',
        username: 'Server',
        profileImage: 'http://localhost:3000/userImages/profile.jpg'
      };

      expect(mockSocket.emit).toHaveBeenCalledWith('message', expectedMsg, room);
      expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', room);
    });
  });

  describe('leaveRoom', () => {
    it('should emit leave message', () => {
      const username = 'user2';
      const room = 'room2';

      service.leaveRoom(room, username);

      const expectedMsg = {
        msg: `${username} has left the room.`,
        image: 'http://localhost:3000/userImages/',
        username: 'Server',
        profileImage: 'http://localhost:3000/userImages/profile.jpg'
      };

      expect(mockSocket.emit).toHaveBeenCalledWith('message', expectedMsg, room);
    });
  });

  describe('findRooms', () => {
    it('should emit rooms event', () => {
      service.findRooms();

      expect(mockSocket.emit).toHaveBeenCalledWith('rooms');
    });
  });
});
