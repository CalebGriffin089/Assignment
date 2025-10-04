const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { img, username } = req.body;

  try {
    if (!img || ! username) {
      return res.status(404).json({ error: "No Image or Username" });
    }

    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const updateResult = await usersCollection.updateOne(
        { username: username },
        { $set: { profile: "http://localhost:3000/userImages/" + img } } 
        );


    res.status(201).json({ success: true, message: "Profile Image Updated"});

  } catch (err) {
    console.error("Error accessing database:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;