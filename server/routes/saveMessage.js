const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "mydb";

router.post("/", async (req, res) => {
  let { msg, channel, group } = req.body;
  
  try {
    if(channel == null){
        res.status(404).json({ error: "Unknown Channel" })
    }else{
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db(dbName);
        const messagesCollection = db.collection("messages");

        // Insert the new message into the messages collection
        const result = await messagesCollection.insertOne({
        username: msg.username,
        msg: msg.msg,
        image: msg.image,
        channel: channel,
        group: String(group),
        timeStamp: new Date(), // Timestamp of the message
        });

        // Send success response
        res.status(201).json({ success: true, message: "Message inserted", data: result });
    }
    
  } catch (err) {
    console.error("Error accessing database:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
