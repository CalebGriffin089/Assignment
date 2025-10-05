const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ valid: false, error: "Missing username, email, or password" });
  }

  const userRequest = {
    username,
    email,
    password,
  };

  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);

    const usersCollection = db.collection("users");
    const requestsCollection = db.collection("accountRequests");

    // Check if username already exists in users collection
    const userExists = await usersCollection.findOne({ username });
    if (userExists) {
      await client.close();
      return res.json({ valid: false, message: "Username already exists" });
    }

    // Check if username already requested in accountRequests collection
    const requestExists = await requestsCollection.findOne({ username });
    if (requestExists) {
      await client.close();
      return res.json({ valid: false, message: "Registration request already submitted" });
    }

    // Insert registration request
    await requestsCollection.insertOne(userRequest);

    await client.close();

    console.log("Registration request submitted:", username);
    res.json({ valid: true });
  } catch (err) {
    console.error("Error handling registration request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
