  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const http = require('http');
  const socketIo = require('socket.io');

  const fs = require('fs');
  const app = express();
  const listen = require("./listen.js")
  const sockets = require("./socket.js");
  const { group } = require('console');
  app.use(cors());
  const server = http.Server(app);
  const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:4200',  // Allow connections from Angular app
      methods: ['GET', 'POST'],
    }
  });

  // Middleware
  app.use(express.static(__dirname + '/www'));
  app.use(express.json());
  app.use("/api/join", require("./routes/joinGroup.js"));
  app.use("/api/getGroups", require("./routes/getGroups.js"));
  app.use("/api/getChannels", require("./routes/getChannels.js"));
  app.use("/api/delete", require("./routes/deleteUsers.js"));
  app.use("/api/create", require("./routes/createUser.js"));
  app.use("/api/createGroup", require("./routes/createGroup.js"));
  app.use("/api/ban", require("./routes/banUser.js"));
  app.use("/api/auth", require("./routes/auth.js"));
  app.use("/api/leaveGroup", require("./routes/leaveGroup.js"));
  app.use("/api/deleteGroups", require("./routes/deleteGroups.js"));
  app.use("/api/addChannel", require("./routes/addChannels.js"));
  app.use("/api/deleteChannel", require("./routes/deleteChannels.js"));
  app.use("/api/createChannel", require("./routes/createChannel.js"));
  app.use("/api/banUserChannel", require("./routes/banUserChannel.js"));
  app.use("/api/joinChannel", require("./routes/joinChannel.js"));
  app.use("/api/kickUserChannel", require("./routes/kickUserChannel.js"));
  app.use("/api/kickUserGroups", require("./routes/kickUserGroups.js"));
  // API endpoint
















sockets(io)



// Start server
listen(server)

