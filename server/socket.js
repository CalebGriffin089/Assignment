module.exports = function handleConnection(io){
    io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for the loginSuccess event
    socket.on('loginSuccess', () => {
      console.log('User Logged In');
      // Send back a response to the client if needed
      socket.emit('response', 'Server: You Have Logged in');
    });

    socket.on('message', (message) => {
      io.emit('response', message);
    });
    socket.on('disconnect', () => {
      socket.emit('response', 'A user has disconnected')
    });
  });
}
