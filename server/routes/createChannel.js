const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  // groupId, channel name, username
  const { groupId, name, members } = req.body;
  
  if (!groupId || !name || !members) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = new MongoClient(url);
    await client.connect();

    const db = client.db(dbName);
    const usersCollection = db.collection("users");
    const groupsCollection = db.collection("groups");
    const channelsCollection = db.collection("channels");

    
    // Check if group exists
    const group = await groupsCollection.findOne({ id: parseInt(groupId) });

    if (!group) {
      await client.close();
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Find all superAdmins
    const superAdmins = await groupsCollection.find({
      membersArray: { $in: [members] }
    }).toArray();
    const superAdminUsernames = superAdmins.map(user => user.username);

    // Prepare members and admins arrays
    let membersArray = Array.isArray(members) ? [...members] : [members];
    let adminsArray = [...membersArray]; // start with members as admins

    // Add superAdmins to members and admins if not already included
    for (const admin of superAdminUsernames) {
      if (!membersArray.includes(admin)) membersArray.push(admin);
      if (!adminsArray.includes(admin)) adminsArray.push(admin);
    }

    // Get the last channel id (numeric)
    const lastChannel = await channelsCollection
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray();

    const newId = lastChannel.length === 0 ? 1 : (parseInt(lastChannel[0].id) || 0) + 1;

    // Construct new channel document
    const channelData = {
      id: newId.toString(),
      groupId: groupId.toString(),
      name: name,
      admins: adminsArray,
      banned: [],
      members: membersArray,
    };
    
    // Insert new channel
    await channelsCollection.insertOne(channelData);

    await groupsCollection.updateOne(
        { _id: group._id }, // or { id: parseInt(groupId) } if you're using numeric IDs
        { $addToSet: { channels: name } } // prevents duplicates
      );

    await client.close();

    console.log("Channel registered:", channelData);
    res.json({ valid: true, channelId: channelData.id });
  } catch (err) {
    console.error("Error creating channel:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
