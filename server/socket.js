module.exports = function handleConnection(io){
    io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for the loginSuccess event
    socket.on('loginSuccess', () => {
      console.log('User Logged In');
      // Send back a response to the client if needed
      socket.emit('response', 'Server: You Have Logged in');
    });
    socket.on('joinRoom', (room) => {
      for (const room of socket.rooms) {
        // Skip the socket's own room (its own id)
        if (room !== socket.id) {
          socket.leave(room);
          console.log(`Socket ${socket.id} left room ${room}`);
        }
      }
      socket.join(room);
    });

    socket.on('message', (message, room) => {
      io.to(room).emit('response', message);
    });
    socket.on('disconnect', () => {
      socket.emit('response', 'A user has disconnected')
    });
    socket.on('rooms', () =>{
      socket.emit('room', socket.rooms);
      console.log(socket.rooms);
    })
  });
}
