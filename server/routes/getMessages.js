const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "mydb";

router.post("/", async (req, res) => {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const messagesCollection = db.collection("messages");
    const usersCollection = db.collection("users");
    const channel = req.body.channel;
    const group = req.body.group;
    
    try {
        // Step 1: Fetch the last 5 messages from the database for the specific channel and group
        const messages = await messagesCollection.find({ channel: channel._id, group: String(group) })
            .sort({ timeStamp: -1 }) // Sort by timestamp (newest first)
            .limit(5)
            .toArray();
        // Step 2: Extract unique userIds from the messages to query the users collection
        const userIds = [...new Set(messages.map(message => message.username))];  // Assuming `userId` is the identifier

        // Step 3: Fetch user profiles (including profile images) for the unique userIds
        const users = await usersCollection.find({ username: { $in: userIds.map(username => username) } }).toArray();
        
        // Step 4: Create a map of userId to profileImage
        const usersMap = users.reduce((acc, user) => {
            acc[user.username.toString()] = user.profile;  
            return acc;
        }, {});

        // Step 5: Add profile images to the messages
        const messagesWithProfiles = messages.map(message => ({
            ...message,
            profileImage: usersMap[message.username] || null // Add profile image if exists, else null
        }));
        // Step 6: Send the modified messages with profile images
        res.status(200).json(messagesWithProfiles); // Now contains messages with profile images
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching messages');
    }
});

module.exports = router;
