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



 
  app.use('/userImages',express.static(path.join(__dirname , './userimages')));

  // Middleware
  app.use(express.static(__dirname + '/www'));
  app.use(express.json());
  app.use("/api/getGroups", require("./routes/getGroups.js")); //done
  app.use("/api/getChannels", require("./routes/getChannels.js")); //done
  app.use("/api/delete", require("./routes/deleteUsers.js")); //done
  app.use("/api/create", require("./routes/createUserRequest.js")); //doing
  app.use("/api/createGroup", require("./routes/createGroup.js")); // done
  app.use("/api/ban", require("./routes/banUser.js")); // done
  app.use("/api/auth", require("./routes/auth.js")); // done
  app.use("/api/leaveGroup", require("./routes/leaveGroup.js")); //done
  app.use("/api/deleteGroups", require("./routes/deleteGroups.js")); //done
  app.use("/api/addChannel", require("./routes/addChannels.js")); // done
  app.use("/api/deleteChannel", require("./routes/deleteChannels.js")); //done
  app.use("/api/createChannel", require("./routes/createChannel.js")); //done
  app.use("/api/banUserChannel", require("./routes/banUserChannel.js"));// done
  app.use("/api/joinChannel", require("./routes/joinChannel.js"));// done
  app.use("/api/kickUserChannel", require("./routes/kickUserChannel.js")); //done
  app.use("/api/kickUserGroups", require("./routes/kickUserGroups.js")); // done
  app.use("/api/acceptUser", require("./routes/acceptUser.js")); //done
  app.use("/api/groupRequest", require("./routes/createGroupJoinRequest.js")); //done
  app.use("/api/getGroupRequests", require("./routes/getGroupRequests.js")); //done
  app.use("/api/acceptGroup", require("./routes/acceptGroup.js"));// done
  app.use("/api/decline", require("./routes/decline.js")); //done
  app.use("/api/promoteUser", require("./routes/promoteUser.js"));
  app.use("/api/getAdmin", require("./routes/getAdmin.js")); //done
  app.use("/api/promoteSuperAdmin", require("./routes/promoteSuperAdmin.js")); // done
  app.use("/api/getUserRequests", require("./routes/getUserRequests.js")); //done
  app.use("/api/upload", require("./routes/uploadImage.js"));
  app.use("/api/saveMessage", require("./routes/saveMessage.js"));
  app.use("/api/getMessages", require("./routes/getMessages.js")); //done
  app.use("/api/editProfile", require("./routes/editProfile.js"));
  // API endpoint
sockets(io)



// Start server
listen(server)

module.exports = app;
