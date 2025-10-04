const express = require("express");
const router = express.Router();
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'mydb';

router.post("/", async (req, res) => {
  let { username, groupId } = req.body;

  await client.connect();
  console.log('Connected to the server');

  const db = client.db(dbName);
  const userCollection = db.collection('users');
  const groupCollection = db.collection('groups');
  const groupRequests = db.collection('groupRequests');
  groupId = parseInt(groupId);  // Ensure groupId is an integer
  
  try {
    // Find the user in the userCollection
    const user = await userCollection.findOne({ username });
    console.log("User found:", user);

    // Find the group in the groupCollection
    const group = await groupCollection.findOne({ id: groupId });
    console.log("Group found:", group);
    
    groupId = parseInt(groupId);
    // Check if both user and group exist
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!group) {
      console.log("Group not found");
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Check if the user is already in the group
    if (group.members && group.members.includes(username)) {
      temp = String(groupId)
      console.log(await groupRequests.findOne({ username: username, groupId: temp }))
      await groupRequests.deleteMany({ username: username, groupId: temp });
      console.log("User already in the group");
      
      return res.json({ success: true, message: "User is already in the group" });
    }

    // If user is not in group, add the user to the group
    if (!group.members) {
      group.members = [];
    }

    // Add the user to the group's members
    group.members.push(username);

    // Update the group with the new members array
    const groupUpdateResult = await groupCollection.updateOne(
      { id: groupId },
      { $set: { members: group.members } }
    );

    if (groupUpdateResult.modifiedCount === 0) {
      console.log("Failed to update the group");
      return res.status(500).json({ success: false, message: "Failed to update the group" });
    }

    // Optionally, you might want to add the group reference to the user document
    const userUpdateResult = await userCollection.updateOne(
      { username },
      { $addToSet: { groups: groupId } }
    );

    if (userUpdateResult.modifiedCount === 0) {
      
      console.log("Failed to update the user");
      return res.status(500).json({ success: false, message: "Failed to update the user" });
    }

    // Delete the user from groupRequests collection after being added to the group
    temp = String(groupId)
    await groupRequests.deleteMany({ username: username, groupId: temp });

    console.log('User added to the group');
    res.json({ success: true, message: "User added to the group" });

  } catch (err) {
    console.error('Error handling request:', err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
