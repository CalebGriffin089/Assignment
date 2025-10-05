const express = require("express");
const router = express.Router();
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'mydb'; // Replace with your actual DB name

// Connect to DB and get collections
async function connectDb() {
  await client.connect();
  const db = client.db(dbName);
  return {
    groupsCollection: db.collection('groups'),
    usersCollection: db.collection('users')
  };
}

router.post("/", async (req, res) => {
  const { name: name, currentGroup: groupId } = req.body;
  
  console.log("Leave request - id:", name, "group:", groupId);

  if (!name || !groupId) {
    return res.status(400).json({ success: false, message: "Missing username or groupId" });
  }

  try {
    // Step 1: Connect to DB
    const { groupsCollection, usersCollection } = await connectDb();

    const user = await usersCollection.findOne({ username: name });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.roles.includes('admin') || user.roles.includes('superAdmin')){
      return res.status(404).json({ success: false, message: "Admins cannot leave groups" });
    }

    // Step 2: Check if group exists using _id (MongoDB default)
    const group = await groupsCollection.findOne({ id: parseInt(groupId) });

    if (!group) {
      
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Step 3: Remove the user from the group's members array
    const groupUpdateResult = await groupsCollection.updateOne(
      { id: parseInt(groupId) },
      { $pull: { members: name } }
    );
    
    

    if (groupUpdateResult.modifiedCount === 0) {
          
      return res.status(404).json({ success: false, message: "User not found in group members" });
    }
    
    console.log(`User ${name} removed from group ${groupId}`);

    // Step 4: Find the user in the users collection
   
    temp = parseInt(groupId)
    // Step 5: Remove the group from the user's groups array
    const userUpdateResult = await usersCollection.updateOne(
      { username: name },
      { $pull: { groups: temp } }
    );

    if (userUpdateResult.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Group not found in user's groups" });
    }

    console.log(`Group ${groupId} removed from user ${name}'s groups`);

    // Step 6: Success response
    res.json({ success: true, message: "User left successfully" });

  } catch (error) {
    console.error("Error banning user from group:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Ensure the MongoDB client is closed
    await client.close();
  }
});

module.exports = router;
