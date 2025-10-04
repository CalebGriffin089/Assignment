  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const http = require('http');
  const socketIo = require('socket.io');
  const listen = require("./listen.js")
  const fs = require('fs');
  const app = express();

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



 
  //app.use(express.static(path.join(__dirname , '../dist/imageupload/')));
  // app.use('/images',express.static(path.join(__dirname , './userimages')));
  // app.use(cors());
  // require('./routes/uploads.js')(app,formidable,fs,path);
  // require('./listen.js')(http);
  app.use('/userImages',express.static(path.join(__dirname , './userimages')));

  // Middleware
  app.use(express.static(__dirname + '/www'));
  app.use(express.json());
  app.use("/api/getGroups", require("./routes/getGroups.js"));
  app.use("/api/getChannels", require("./routes/getChannels.js"));
  app.use("/api/delete", require("./routes/deleteUsers.js"));
  app.use("/api/create", require("./routes/createUserRequest.js"));
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
  app.use("/api/acceptUser", require("./routes/acceptUser.js"));
  app.use("/api/createGroupJoinRequest", require("./routes/createGroupJoinRequest.js"));
  app.use("/api/getGroupRequests", require("./routes/getGroupRequests.js"));
  app.use("/api/acceptGroup", require("./routes/acceptGroup.js"));
  app.use("/api/decline", require("./routes/decline.js"));
  app.use("/api/promoteUser", require("./routes/promoteUser.js"));
  app.use("/api/getAdmin", require("./routes/getAdmin.js"));
  app.use("/api/promoteSuperAdmin", require("./routes/promoteSuperAdmin.js"));
  app.use("/api/getUserRequests", require("./routes/getUserRequests.js"));
  app.use("/api/upload", require("./routes/uploadImage.js"));
  app.use("/api/saveMessage", require("./routes/saveMessage.js"));
  app.use("/api/getMessages", require("./routes/getMessages.js"));
  // API endpoint
  
















sockets(io)



// Start server
listen(server)

