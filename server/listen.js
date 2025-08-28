function startServer(server){
    server.listen(3000, () => {
        console.log("My First Node Server");
        console.log("Server is listening on http://localhost:3000");
    });
}

module.exports = startServer;