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
      
    username: "superAdmin",
    profile: "http://localhost:3000/userImages/profile.jpg",
    email: "2",
    password: "123456",
    groups: [],
    roles: ['superAdmin']
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
