const express = require("express");
const router = express.Router();
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'mydb'; // Replace with your actual DB name

const db = client.db(dbName);

router.post("/", async (req, res) => {
  const { id: username, currentGroup: groupId } = req.body;

  console.log("Remove user request - id:", username, "group:", groupId);

  try {
    await client.connect();

    // Get collections
    const groupsCollection = db.collection('groups');
    const usersCollection = db.collection('users');

    // Find the group
    const group = await groupsCollection.findOne({ id: parseInt(groupId) });

    if (!group) {
      return res.json({ success: false, message: "Group not found" });
    }

    // Check if user is a member of the group
    if (!group.members.includes(username)) {
      return res.json({ success: false, message: "User is not a member of the group" });
    }

    // Remove user from group's members array
    await groupsCollection.updateOne(
      { id: parseInt(groupId) },
      { $pull: { members: username } }
    );

    // Find the user
    const user = await usersCollection.findOne({ username });

    if (!user) {
      console.log("User not found in users collection");
      return res.json({ success: false, message: "User not found in users collection" });
    }

    // Prevent removing superAdmin
    if (user.roles.includes("superAdmin")) {
      console.log("Super Admin cannot be kicked");
      return res.json({ error: "Cannot remove a super admin" });
    }

    // Remove the group from user's groups array
    await usersCollection.updateOne(
      { username },
      { $pull: { groups: parseInt(groupId) } }
    );

    console.log(`User ${username} removed from group ${groupId}`);
    res.json({ success: true });

  } catch (err) {
    console.error("Error removing user from group:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Ensure the connection is closed after the operation
    await client.close();
  }
});

module.exports = router;
