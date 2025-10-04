const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { id, currentGroup } = req.body;

  console.log("Ban request - id:", id, "group:", currentGroup);

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");
    const groupsCollection = db.collection("groups");

    // Find the user by username (assuming id is username)
    const user = await usersCollection.findOne({ username: id });
    if (!user) {
      
      return res.status(404).json({ error: "User not found" });
    }

    if (user.roles && user.roles.includes("superAdmin")) {
      console.log("Super Admin cannot be banned");
      return res.status(403).json({ error: "Cannot remove a super admin" });
    }
    
    // Remove the group from user's groups array
    await usersCollection.updateOne(
      { username: id },
      { $pull: { groups: parseInt(currentGroup) } } // assuming groups array stores group ids as strings
    );

    // Find the group by id (convert to string if needed)
    const group = await groupsCollection.findOne({ id: parseInt(currentGroup) });
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Remove user from members array
    await groupsCollection.updateOne(
      { id: parseInt(currentGroup) },
      {
        $pull: { members: id },
        $push: { banned: id } // add to banned only if not already present
      }
    );

    console.log(`User ${id} banned from group ${currentGroup} and removed from user's groups`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error processing ban request:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
