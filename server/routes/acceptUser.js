const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { username, email, password } = req.body;

  const newUser = {
    username,
    profile: 'http://localhost:3000/userImages/profile.jpg',
    email,
    password,  // Consider hashing the password before storing it
    groups: [],
    roles: ["user"],
  };

  try {
    await client.connect();
    console.log("Connected to the server");

    const db = client.db(dbName);
    const userCollection = db.collection("users");
    const requestsCollection = db.collection("accountRequests");

    // Check if the user already exists
    const existingUser = await userCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Check if there's an existing request from the user
    const existingRequest = await requestsCollection.findOne({ username });
    if (existingRequest) {
      // Delete the old request
      await requestsCollection.deleteOne({ username });

      // Insert the new user into the users collection
      const result = await userCollection.insertOne(newUser);
      console.log("User created:", result);

      return res.json({ success: true, message: "User successfully registered", userId: result.insertedId });
    } else {
      console.log("No request found for this username.");
      return res.status(404).json({ success: false, message: "No account request found for this user" });
    }

  } catch (err) {
    console.error("Error handling user registration:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
