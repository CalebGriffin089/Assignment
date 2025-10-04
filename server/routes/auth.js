const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    // Find user by username and password
    const user = await usersCollection.findOne({ username, password });

    if (user) {
      // Exclude password from response for security
      const { password, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (err) {
    console.error("Error accessing database:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
