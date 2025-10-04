const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017"; // MongoDB connection URL
const dbName = "mydb"; // Replace with your database name

const client = new MongoClient(url);

async function seedSuperUser() {
  try {
    // Connect to MongoDB
    await client.connect();

    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    // Check if the super user already exists
    const existingUser = await usersCollection.findOne({ username: "superAdmin" });

    if (existingUser) {
      console.log("Super user already exists");
      return;
    }

    // Seed super user
    const superUser = {
      username: "superAdmin",  // Choose a username for your super user
      password: "supersecretpassword",  // You should hash passwords before storing them in production!
      roles: ["superAdmin"],  // Assign the superAdmin role
      groups: [],  // Add any initial groups the super user is part of
      createdAt: new Date(),
    };

    // Insert the super user into the database
    await usersCollection.insertOne(superUser);

    console.log("Super user seeded successfully");
  } catch (error) {
    console.error("Error seeding super user:", error);
  } finally {
    // Close the MongoDB client
    await client.close();
  }
}

seedSuperUser();
