const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { channels, members } = req.body;

  if (!channels || !members) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);

    const usersCollection = db.collection("users");
    const groupsCollection = db.collection("groups");
    const channelsCollection = db.collection("channels");

    // Prepare new group data
    const groupData = {
      id: 0,
      channels: [channels],
      admins: Array.isArray(members) ? [...members] : [members],
      banned: [],
      members: Array.isArray(members) ? [...members] : [members],
    };

    // Find last group id
    const lastGroup = await groupsCollection.find({}).sort({ id: -1 }).limit(1).toArray();
    groupData.id = lastGroup.length === 0 ? 1 : (parseInt(lastGroup[0].id) || 0) + 1;

    // Add superAdmins to group members/admins and update their user documents
    const superAdmins = await usersCollection.find({ roles: "superAdmin" }).toArray();

    for (const admin of superAdmins) {
      if (!groupData.members.includes(admin.username)) groupData.members.push(admin.username);
      if (!groupData.admins.includes(admin.username)) groupData.admins.push(admin.username);

      // Update superAdmin user's groups array if not already included
      if (!admin.groups) admin.groups = [];
      if (!admin.groups.includes(groupData.id.toString())) {
        await usersCollection.updateOne(
          { username: admin.username },
          { $push: { groups: groupData.id.toString() } }
        );
      }
    }

    // Insert new group
    await groupsCollection.insertOne(groupData);

    // Update the original member's groups array (the creator)
    const creatorUsernames = Array.isArray(members) ? members : [members];
    for (const username of creatorUsernames) {
      await usersCollection.updateOne(
        { username },
        { $addToSet: { groups: groupData.id.toString() } }
      );
    }

    // Prepare channel data based on new group
    const channelData = {
      id: 0,
      groupId: groupData.id.toString(),
      name: groupData.channels[0],
      admins: groupData.admins,
      banned: [],
      members: groupData.members,
    };

    // Find last channel id
    const lastChannel = await channelsCollection.find({}).sort({ id: -1 }).limit(1).toArray();
    channelData.id = lastChannel.length === 0 ? 1 : (parseInt(lastChannel[0].id) || 0) + 1;

    // Insert new channel
    await channelsCollection.insertOne(channelData);

    await client.close();

    console.log("Group registered:", groupData);
    console.log("Channel registered:", channelData);

    res.json({ valid: true, groupId: groupData.id });
  } catch (err) {
    console.error("Error creating group and channel:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
