const express = require("express");
const router = express.Router();
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'mydb';

router.get("/", async (req, res) => {
  let db;

  try {
    // Connect to the database
    await client.connect();
    db = client.db(dbName);
    const accountRequestsCollection = db.collection('accountRequests');
    
    // Fetch all account requests
    const requests = await accountRequestsCollection.find({}).toArray();
    
    res.json({ requests });
  } catch (err) {
    console.error("Error fetching account requests:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Ensure the connection is closed after the query
    await client.close();
  }
});

module.exports = router;
