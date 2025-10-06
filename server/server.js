const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { ExpressPeerServer } = require('peer');
const listen = require('./listen.js');  // Your custom listen helper

const app = express();

// Setup middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'www')));
app.use('/userImages', express.static(path.join(__dirname, 'userimages')));

// Your API routes
app.use('/api/getGroups', require('./routes/getGroups.js'));
app.use('/api/getChannels', require('./routes/getChannels.js'));
app.use('/api/delete', require('./routes/deleteUsers.js'));
app.use('/api/create', require('./routes/createUserRequest.js'));
app.use('/api/createGroup', require('./routes/createGroup.js'));
app.use('/api/ban', require('./routes/banUser.js'));
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/leaveGroup', require('./routes/leaveGroup.js'));
app.use('/api/deleteGroups', require('./routes/deleteGroups.js'));
app.use('/api/addChannel', require('./routes/addChannels.js'));
app.use('/api/deleteChannel', require('./routes/deleteChannels.js'));
app.use('/api/createChannel', require('./routes/createChannel.js'));
app.use('/api/banUserChannel', require('./routes/banUserChannel.js'));
app.use('/api/joinChannel', require('./routes/joinChannel.js'));
app.use('/api/kickUserChannel', require('./routes/kickUserChannel.js')); // fixed missing slash here
app.use('/api/kickUserGroups', require('./routes/kickUserGroups.js'));
app.use('/api/acceptUser', require('./routes/acceptUser.js'));
app.use('/api/groupRequest', require('./routes/createGroupJoinRequest.js'));
app.use('/api/getGroupRequests', require('./routes/getGroupRequests.js'));
app.use('/api/acceptGroup', require('./routes/acceptGroup.js'));
app.use('/api/decline', require('./routes/decline.js'));
app.use('/api/promoteUser', require('./routes/promoteUser.js'));
app.use('/api/getAdmin', require('./routes/getAdmin.js'));
app.use('/api/promoteSuperAdmin', require('./routes/promoteSuperAdmin.js'));
app.use('/api/getUserRequests', require('./routes/getUserRequests.js'));
app.use('/api/upload', require('./routes/uploadImage.js'));
app.use('/api/saveMessage', require('./routes/saveMessage.js'));
app.use('/api/getMessages', require('./routes/getMessages.js'));
app.use('/api/editProfile', require('./routes/editProfile.js'));

// HTTP server + Socket.IO
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
});

// PeerJS server attached to the same HTTP server, on /peerjs path
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/peerjs',
});
app.use('/peerjs', peerServer);

// Your existing socket handler function (assuming in sockets.js)
const sockets = require('./socket.js');
sockets(io);

// Manage video peers per channel for signaling
const videoPeers = new Map();

io.on('connection', (socket) => {

  socket.on('join-video', ({ channelId, userId, peerId }) => {
    console.log(`User joined video channel: ${channelId} with peerId: ${peerId}`);
    socket.join(`video ${channelId}`);

    if (!videoPeers.has(channelId)) {
      videoPeers.set(channelId, new Set());
    }
    videoPeers.get(channelId).add(peerId);

    // Send existing peers to this client (except itself)
    const existingPeers = Array.from(videoPeers.get(channelId)).filter((p) => p !== peerId);
    socket.emit('video-peers', existingPeers);

    // Notify others of new peer
    socket.to(`video ${channelId}`).emit('new-video-peer', peerId);
  });

  socket.on('leave-video', ({ channelId, peerId }) => {
    console.log(`User leaving video channel: ${channelId} peerId: ${peerId}`);

    if (videoPeers.has(channelId)) {
      videoPeers.get(channelId).delete(peerId);
      if (videoPeers.get(channelId).size === 0) {
        videoPeers.delete(channelId);
      }
    }

    io.to(`video ${channelId}`).emit('video-peer-left', peerId);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    videoPeers.forEach((peers, channelId) => {
      // Check if this socket was in the room and remove peers accordingly
      if (socket.rooms.has(`video ${channelId}`)) {
        peers.forEach((peerId) => {
          peers.delete(peerId);
          io.to(`video ${channelId}`).emit('video-peer-left', peerId);
        });
        if (peers.size === 0) {
          videoPeers.delete(channelId);
        }
      }
    });
  });
});

// Start server
(async () => {
  const PORT = process.env.PORT || 3000;
  await listen(server, PORT);
  console.log(`Server listening on port ${PORT}`);
})();

module.exports = app;
