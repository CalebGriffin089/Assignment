const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017"; // MongoDB connection URL
const client = new MongoClient(url);
const dbName = "mydb"; // Replace with your database name

const db = client.db(dbName);

router.post("/", async (req, res) => {
  const { username } = req.body;

  try {
    await client.connect();

    const usersCollection = db.collection("users");
    const groupsCollection = db.collection("groups");
    const channelsCollection = db.collection("channels");

    // 1. Find the user by username
    const user = await usersCollection.findOne({ username });

    if (!user) {
      console.log("User not found");
      return res.json({ success: false, message: "User not found" });
    }

    // 2. Add 'superAdmin' role if not already present
    if (!user.roles.includes("superAdmin")) {
      user.roles.push("superAdmin");

      // Update the user in the database
      await usersCollection.updateOne(
        { username },
        { $set: { roles: user.roles } }
      );
    }

    // 3. Add user to all groups
    await groupsCollection.updateMany(
      {}, // Match all groups
      { $addToSet: { members: username } } // Add the user to the 'members' array if not already present
    );

    // 4. Add user to all channels
    await channelsCollection.updateMany(
      {}, // Match all channels
      { $addToSet: { members: username } } // Add the user to the 'members' array if not already present
    );

    // 5. Update user's groups array with all groups they're now a part of
    const allGroups = await groupsCollection.find().toArray(); // Fetch all groups
    const allGroupIds = allGroups.map(group => group.id); // Extract group IDs

    // Update the user's groups array if they aren't already in those groups
    await usersCollection.updateOne(
      { username },
      { $addToSet: { groups: { $each: allGroupIds } } } // Add all group IDs to the user's groups array
    );

    console.log(`User ${username} added as 'superAdmin', added to all groups and channels, and updated their groups array`);
    res.json({
      success: true,
      message: `User ${username} is now a superAdmin, added to all groups and channels, and their groups array has been updated.`
    });

  } catch (error) {
    console.error("Error updating user roles:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
