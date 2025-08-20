const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const app = express();
app.use(cors());
const server = http.Server(app);
// Middleware
app.use(express.static(__dirname + '/www'));
app.use(express.json());

class User{
    constructor(username, birthdate, age, email, password, valid){
        this.username = username;
        this.birthdate = birthdate;
        this.age = age;
        this.email = email;
        this.password = password;
        this.valid = valid;
    }
    upDateVlaid(){
        this.valid = true;
    }

    removePwd(){
        this.password = '';
    }
}

// API endpoint
app.post('/api/auth', function(req, res) {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = [
    new User("Test", '09/02/09', 16, "test@com.au", "123", false),
    new User("JaneSmith", '03/22/1985', 40, 'jane.smith@example.com', 'mypassword!', false),
    new User("JohnDoe", '01/15/1990', 35, 'john.doe@example.com', 'password123', false)
  ];

  // Check if user exists and passwords match
  const user = users.find(u => u.email == email && u.password == password);

  if (user) {
    user.upDateVlaid();
    user.removePwd();
    res.json(user);
  } else {
    res.json({ valid: false });
  }
});

// Start server
server.listen(3000, () => {
    console.log("My First Node Server");
    console.log("Server is listening on http://localhost:3000");
});

