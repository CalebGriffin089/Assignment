var assert = require('assert');
var app = require('../server.js');  // Your Express app
let chai = require('chai');
let chaiHttp = require('chai-http');
const { readdirSync } = require('fs');
const { MongoClient, ObjectId } = require("mongodb");
chai.should();  // This is how you use Chai's BDD-style assertions
const path = require("path");
const fs = require("fs");
// Use Chai HTTP plugin
chai.use(chaiHttp);



// MongoDB connection URL
const url = "mongodb://localhost:27017";
const dbName = "mydb";
const client = new MongoClient(url);
let db;

describe("/api/create", () => {
    // Before each test, connect to the database
    beforeEach(async function () {
        await client.connect();
        db = client.db(dbName);
    });

    // After each test, clean up the database
    afterEach(async function () {
        // Clear the users and accountRequests collection before each test
        const usersCollection = db.collection("users");
        const requestsCollection = db.collection("accountRequests");
        await usersCollection.deleteMany({});  // Clear all users
        await requestsCollection.deleteMany({});  // Clear all account requests
    });

    it("should POST a request to create a user account request", async () => {
        const res = await chai.request(app)
            .post("/api/create")
            .send({
                username: "Katie",
                email: "Katie@gmail.com",
                password: "123456",
            });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(true);
    });

    it("should POST a request to create a user account request that is already registered", async () => {
        // Insert a user directly into the users collection for the test case
        const usersCollection = db.collection("users");
        await usersCollection.insertOne({
            username: "Katie",
            email: "Katie@gmail.com",
            password: "hashedPassword123",
        });

        const res = await chai.request(app)
            .post("/api/create")
            .send({
                username: "Katie",
                email: "Katie@gmail.com",
                password: "123456",
            });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(false);
        res.body.should.have.property("message").eql("Username already exists");
    });

    it("should POST a request to create a user account request that is already requested", async () => {
        // Insert an existing registration request directly into the accountRequests collection for the test case
        const requestsCollection = db.collection("accountRequests");
        await requestsCollection.insertOne({
            username: "Katie",
            email: "Katie@gmail.com",
            password: "hashedPassword123",
        });

        const res = await chai.request(app)
            .post("/api/create")
            .send({
                username: "Katie",
                email: "Katie@gmail.com",
                password: "123456",
            });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(false);
        res.body.should.have.property("message").eql("Registration request already submitted");
    });

    it("should POST a request to create a user account request with missing data", async () => {
        const res = await chai.request(app)
            .post("/api/create")
            .send({
                email: "Katie@gmail.com",
                password: "123456",
            }); // Missing username

        res.should.have.status(400);
        res.body.should.have.property("valid").eql(false);
        res.body.should.have.property("error").eql("Missing username, email, or password");
    });
});

describe("/api/acceptUser", function () {
  let client;
  let db;
  const url = "mongodb://localhost:27017";
  const dbName = "mydb";

  beforeEach(async function () {
    client = new MongoClient(url);
    await client.connect();
    db = client.db(dbName);
  });

  afterEach(async function () {
    const usersCollection = db.collection("users");
    const requestsCollection = db.collection("accountRequests");
    await usersCollection.deleteMany({});
    await requestsCollection.deleteMany({});
    await client.close();
  });

  it("should POST a request to create a user account request", async function () {
    // Simulate submitting an account request before registering the user
    const requestsCollection = db.collection("accountRequests");
    await requestsCollection.insertOne({
      username: "Katie",
      email: "Katie@gmail.com",
      password: "123456",
    });

    const res = await chai
      .request(app)
      .post("/api/acceptUser")
      .send({
        username: "Katie",
        email: "Katie@gmail.com",
        password: "123456",
      });

    res.should.have.status(200);
    res.body.should.have.property("success").eql(true);
    res.body.should.have.property("message").eql("User successfully registered");
    res.body.should.have.property("userId");
  });

  it("should return error if the user already exists", async function () {
    const usersCollection = db.collection("users");

    // Create a user directly in the 'users' collection for the test case
    await usersCollection.insertOne({
      username: "Katie",
      email: "Katie@gmail.com",
      password: "123456",
      profile: "http://localhost:3000/userImages/profile.jpg",
      groups: [],
      roles: ["user"],
    });

    const res = await chai
      .request(app)
      .post("/api/acceptUser")
      .send({
        username: "Katie",
        email: "Katie@gmail.com",
        password: "123456",
      });

    res.should.have.status(400);
    res.body.should.have.property("success").eql(false);
    res.body.should.have.property("message").eql("User already exists");
  });

  it("should return error if there's no account request", async function () {
    // Try to create a user without a pending request
    const res = await chai
      .request(app)
      .post("/api/acceptUser")
      .send({
        username: "Katie",
        email: "Katie@gmail.com",
        password: "123456",
      });

    res.should.have.status(404);
    res.body.should.have.property("success").eql(false);
    res.body.should.have.property("message").eql("No account request found for this user");
  });

  it("should POST a request to create a user account request that has already been requested", async function () {
    const requestsCollection = db.collection("accountRequests");

    // Simulate a request for an account creation
    await requestsCollection.insertOne({
      username: "Katie",
      email: "Katie@gmail.com",
      password: "123456",
    });

    // Simulate submitting the same request again to ensure it's replaced in `accountRequests`
    const res = await chai
      .request(app)
      .post("/api/acceptUser")
      .send({
        username: "Katie",
        email: "Katie@gmail.com",
        password: "123456",
      });

    res.should.have.status(200);
    res.body.should.have.property("success").eql(true);
    res.body.should.have.property("message").eql("User successfully registered");
  });
});

describe("/api/auth", function () {
    let client;
    let db;
    const url = "mongodb://localhost:27017";
    const dbName = "mydb";

    beforeEach(async function () {
        client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
    });

    afterEach(async function () {
        const usersCollection = db.collection("users");
        await usersCollection.deleteMany({});
        await client.close();
    });

    it("should successfully log in with correct username and password", async function () {
        const usersCollection = db.collection("users");

        // Insert a test user into the database
        await usersCollection.insertOne({
            username: "Katie",
            password: "123456",
            email: "Katie@gmail.com",
        });

        const res = await chai
            .request(app)
            .post("/api/auth")
            .send({
                username: "Katie",
                password: "123456",
            });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(true);
        res.body.should.have.property("username").eql("Katie");
        res.body.should.have.property("email").eql("Katie@gmail.com");
    });

    it("should return invalid login when incorrect username or password is provided", async function () {
        const usersCollection = db.collection("users");

        // Insert a test user into the database
        await usersCollection.insertOne({
            username: "Katie",
            password: "123456",
            email: "Katie@gmail.com",
        });

        const res = await chai
            .request(app)
            .post("/api/auth")
            .send({
                username: "Katie",
                password: "wrongpassword",
            });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(false);
    });

    it("should return invalid login when user doesn't exist", async function () {
        const res = await chai
            .request(app)
            .post("/api/auth")
            .send({
                username: "NonExistentUser",
                password: "123456",
            });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(false);
    });
});


describe("/api/groupRequest", function () {
    let client;
    let db;
    const url = "mongodb://localhost:27017";
    const dbName = "mydb";

    beforeEach(async function () {
        client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
    });

    afterEach(async function () {
        const groupRequestsCollection = db.collection("groupRequests");
        const groupsCollection = db.collection("groups");

        // Clean up collections after each test
        await groupRequestsCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await client.close();
    });

    it("should submit a join group request successfully", async function () {
        const groupsCollection = db.collection("groups");
        const groupId = "1"; // Test with group ID '1'

        // Insert a sample group into the collection
        await groupsCollection.insertOne({
            id: parseInt(groupId),
            name: "Sample Group",
            banned: [],
        });

        const res = await chai
            .request(app)
            .post("/api/groupRequest")
            .send({ username: "Katie", groupId: groupId });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(true);
    });

    it("should return error when missing username or groupId", async function () {
        const res = await chai
            .request(app)
            .post("/api/groupRequest")
            .send({ username: "Katie" }); // Missing groupId

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing username or groupId");
    });

    it("should return error when group is not found", async function () {
        const res = await chai
            .request(app)
            .post("/api/groupRequest")
            .send({ username: "Katie", groupId: "999" }); // Non-existent groupId

        res.should.have.status(404);
        res.body.should.have.property("error").eql("Group not found");
    });

    it("should return error when user is banned from the group", async function () {
        const groupsCollection = db.collection("groups");
        const groupId = "1";

        // Insert a group with a banned user
        await groupsCollection.insertOne({
            id: parseInt(groupId),
            name: "Sample Group",
            banned: ["Katie"],
        });

        const res = await chai
            .request(app)
            .post("/api/groupRequest")
            .send({ username: "Katie", groupId: groupId });

        res.should.have.status(403);
        res.body.should.have.property("error").eql("You are banned from this group");
    });

});


describe("/api/getGroups", function () {
    let client;
    let db;
    const url = "mongodb://localhost:27017";
    const dbName = "mydb";

    beforeEach(async function () {
        client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
    });

    afterEach(async function () {
        const usersCollection = db.collection("users");
        const groupsCollection = db.collection("groups");

        // Clean up collections after each test
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await client.close();
    });

    it("should return the groups the user is part of (not banned)", async function () {
        const usersCollection = db.collection("users");
        const groupsCollection = db.collection("groups");

        const username = "Katie";

        // Insert a sample user with groups
        await usersCollection.insertOne({
            username,
            groups: ["1", "2"],
        });

        // Insert two groups, one of which bans the user
        await groupsCollection.insertMany([
            { id: 1, name: "Group 1", banned: [] },
            { id: 2, name: "Group 2", banned: ["Katie"] },
        ]);

        const res = await chai
            .request(app)
            .post("/api/getGroups")
            .send({ username });

        res.should.have.status(200);
        res.body.should.have.property("groups").eql(['1']); // Only Group 1 should be returned
    });

    it("should return an empty list when the user has no groups", async function () {
        const usersCollection = db.collection("users");

        const username = "JohnDoe";

        // Insert a user with no groups
        await usersCollection.insertOne({ username, groups: [] });

        const res = await chai
            .request(app)
            .post("/api/getGroups")
            .send({ username });

        res.should.have.status(200);
        res.body.should.have.property("groups").eql([]); // No groups should be returned
    });

    it("should return an error when missing username", async function () {
        const res = await chai
            .request(app)
            .post("/api/getGroups")
            .send({}); // Missing username

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing username");
    });

    it("should return an empty list when the user is not found", async function () {
        const res = await chai
            .request(app)
            .post("/api/getGroups")
            .send({ username: "NonExistentUser" });

        res.should.have.status(200);
        res.body.should.have.property("groups").eql([]); // User does not exist, so no groups
    });
});





describe("/api/get-group-channels", function () {
    let client;
    let db;
    const url = "mongodb://localhost:27017";
    const dbName = "mydb";

    beforeEach(async function () {
        client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
    });

    afterEach(async function () {
        const groupsCollection = db.collection("groups");
        const channelsCollection = db.collection("channels");

        // Clean up collections after each test
        await groupsCollection.deleteMany({});
        await channelsCollection.deleteMany({});
        await client.close();
    });

    it("should return allowed channels and group members", async function () {
        const groupsCollection = db.collection("groups");
        const channelsCollection = db.collection("channels");

        const groupId = 1;
        const username = "Katie";

        // Insert a sample group with channels and members
        await groupsCollection.insertOne({
            id: groupId,
            channels: ["Channel 1", "Channel 2"],
            members: ["Katie", "John"],
        });

        // Insert sample channels
        await channelsCollection.insertMany([
            {
                name: "Channel 1",
                groupId: String(groupId),
                members: ["Katie"],
                banned: [],
            },
            {
                name: "Channel 2",
                groupId: String(groupId),
                members: ["John"],
                banned: ["Katie"], // Katie is banned from this channel
            },
        ]);

        const res = await chai
            .request(app)
            .post("/api/getChannels")
            .send({ groupId, username });

        res.should.have.status(200);
        res.body.should.have.property("channels").eql([
            { _id: res.body.channels[0]._id, name: "Channel 1" }, // Only Channel 1 should be returned
        ]);
        res.body.should.have.property("members").eql(["Katie", "John"]);
    });

    it("should return an error when missing groupId or username", async function () {
        const res = await chai
            .request(app)
            .post("/api/getChannels")
            .send({}); // Missing groupId and username

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing groupId or username");
    });

    it("should return an error when group is not found", async function () {
        const res = await chai
            .request(app)
            .post("/api/getChannels")
            .send({ groupId: 999, username: "Katie" });

        res.should.have.status(404);
        res.body.should.have.property("error").eql("Group not found");
    });

    it("should not return banned channels for the user", async function () {
        const groupsCollection = db.collection("groups");
        const channelsCollection = db.collection("channels");

        const groupId = 1;
        const username = "Katie";

        // Insert a sample group with channels and members
        await groupsCollection.insertOne({
            id: groupId,
            channels: ["Channel 1", "Channel 2"],
            members: ["Katie", "John"],
        });

        // Insert sample channels
        await channelsCollection.insertMany([
            {
                name: "Channel 1",
                groupId: String(groupId),
                members: ["Katie"],
                banned: [],
            },
            {
                name: "Channel 2",
                groupId: String(groupId),
                members: ["Katie"],
                banned: ["Katie"], // Katie is banned from this channel
            },
        ]);

        const res = await chai
            .request(app)
            .post("/api/getChannels")
            .send({ groupId, username });

        res.should.have.status(200);
        res.body.should.have.property("channels").eql([
            { _id: res.body.channels[0]._id, name: "Channel 1" }, // Channel 2 should not be included
        ]);
    });

    it("should return an empty channels list if the user is not a member of any channel", async function () {
        const groupsCollection = db.collection("groups");
        const channelsCollection = db.collection("channels");

        const groupId = 1;
        const username = "Katie";

        // Insert a sample group with no channels that Katie is a member of
        await groupsCollection.insertOne({
            id: groupId,
            channels: ["Channel 1", "Channel 2"],
            members: ["Katie", "John"],
        });

        // Insert sample channels that Katie is not a member of
        await channelsCollection.insertMany([
            {
                name: "Channel 1",
                groupId: String(groupId),
                members: ["John"],
                banned: [],
            },
            {
                name: "Channel 2",
                groupId: String(groupId),
                members: ["John"],
                banned: [],
            },
        ]);

        const res = await chai
            .request(app)
            .post("/api/getChannels")
            .send({ groupId, username });

        res.should.have.status(200);
        res.body.should.have.property("channels").eql([]); // No channels for Katie
    });
});





describe("POST /api/getGroupRequests", () => {
  let client;
  const url = "mongodb://localhost:27017";
  const dbName = "mydb";

  before(async () => {
    // Connect to the database before tests
    client = new MongoClient(url);
    await client.connect();
  });

  after(async () => {
    // Clean up test data and close the connection
    const db = client.db(dbName);
    const groupRequestsCollection = db.collection("groupRequests");

    // Remove test group requests
    await groupRequestsCollection.deleteMany({});
    await client.close();
  });

  it("should return an error if groupId is missing", (done) => {
    chai.request(app)
      .post("/api/getGroupRequests")
      .send({})
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing groupId in request body");
        done();
      });
  });

    it("should return an empty array if there are no requests for the group", async () => {
        const db = client.db(dbName);
        const groupRequestsCollection = db.collection("groupRequests");

        // Ensure there are no requests for this groupId
        const groupId = 123; // Test with a non-existing groupId
        await groupRequestsCollection.deleteMany({ groupId: String(groupId) });

        const res = await chai.request(app)
            .post("/api/getGroupRequests")
            .send({ groupId: groupId });

        res.should.have.status(200);
        res.body.should.have.property("response").eql([]);
    });

    it("should return the group requests for the provided groupId", async () => {
        const db = client.db(dbName);
        const groupRequestsCollection = db.collection("groupRequests");

        // Insert test data
        const testGroupId = 1;
        const testRequests = [
            { groupId: String(testGroupId), username: "user1", status: "pending" }
        ];
        await groupRequestsCollection.insertMany(testRequests);

        // Make the request and wait for the response
        const res = await chai.request(app)
            .post("/api/getGroupRequests")
            .send({ groupId: testGroupId });

        // Assert the response
        res.should.have.status(200);
        res.body.should.have.property("response").with.lengthOf(1);
        res.body.response[0].should.have.property("username").eql("user1");
    });
});


describe("POST /api/getAdmin", function () {
    let client;
    const dbName = "mydb";
    const url = "mongodb://localhost:27017";

    before(async function () {
        // Connect to the database before running the tests
        client = new MongoClient(url);
        await client.connect();
    });

    after(async function () {
        // Close the database connection after the tests are done
        await client.close();
    });

    it("should return an error if groupId or username is missing", async () => {
        const res = await chai.request(app)
            .post("/api/getAdmin")
            .send({}); // Missing both fields

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing groupId or username");
    });

    it("should return isSuperAdmin = true if user is a superAdmin", async () => {
        const groupId = 1;
        const username = 'superAdmin'
        const db = client.db(dbName);
        await db.collection("groups").insertOne({
            id: groupId,
            admins: ["user1", "user2"]
        });

        await db.collection("users").insertOne({
            username: username,
            roles: ['superAdmin', 'admin']
        });

        

        const res = await chai.request(app)
            .post("/api/getAdmin")
            .send({ id: groupId, username: username });
        res.should.have.status(200);
        res.body.should.have.property("isAdmin").eql(true);
        res.body.should.have.property("isSuperAdmin").eql(true);
        await db.collection("groups").deleteMany({});
        await db.collection("users").deleteMany({});
    });

    it("should return isAdmin = false and isSuperAdmin = false if user is neither an admin nor a superAdmin", async () => {
        const groupId = 1;
        const username = "user3";

        // Insert test data
        const db = client.db(dbName);
        const groupsCollection = db.collection("groups");
        await groupsCollection.insertOne({
            id: groupId,
            admins: ["user1", "user2"]
        });

        const res = await chai.request(app)
            .post("/api/getAdmin")
            .send({ id: groupId, username });

        res.should.have.status(200);
        res.body.should.have.property("isAdmin").eql(false);
        res.body.should.have.property("isSuperAdmin").eql(false);
    });
});



describe("GET /api/getUserRequests", function () {
    let client;
    const dbName = "mydb";
    const url = "mongodb://localhost:27017";

    before(async function () {
        // Connect to the database before running the tests
        client = new MongoClient(url);
        await client.connect();
    });

    after(async function () {
        // Clean up the database and close the connection after the tests are done
        const db = client.db(dbName);
        await db.collection("accountRequests").deleteMany({});
        await client.close();
    });

    it("should return an empty array if there are no account requests", async () => {
        // Ensure the collection is empty before running the test
        const db = client.db(dbName);
        const accountRequestsCollection = db.collection("accountRequests");
        await accountRequestsCollection.deleteMany({});

        const res = await chai.request(app)
            .get("/api/getUserRequests");

        res.should.have.status(200);
        res.body.should.have.property("requests").that.is.an("array").that.is.empty;
    });

    it("should return all account requests", async () => {
        // Insert test data
        const db = client.db(dbName);
        const accountRequestsCollection = db.collection("accountRequests");

        const testRequests = [
            { username: "user1", status: "pending", email: "user1@example.com" },
            { username: "user2", status: "approved", email: "user2@example.com" }
        ];

        await accountRequestsCollection.insertMany(testRequests);

        const res = await chai.request(app)
            .get("/api/getUserRequests");

        res.should.have.status(200);
        res.body.should.have.property("requests").that.is.an("array").with.lengthOf(2);
        res.body.requests[0].should.have.property("username").eql("user1");
        res.body.requests[1].should.have.property("username").eql("user2");
    });
});



describe("POST /api/getMessages", function () {
    let client;
    let db;
    let messagesCollection;
    let usersCollection;

    before(async function () {
        // Connect to the real MongoDB database for testing
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        messagesCollection = db.collection("messages");
        usersCollection = db.collection("users");
    });
    after(async function () {
        // Clean up the database after tests
        await messagesCollection.deleteMany({});
        await usersCollection.deleteMany({});
        await client.close();
    });

    it("should return the last 5 messages with user profile images", async function () {
        // Insert test data
        const groupId = "group1";
        const channelId = "channel1";

        const mockMessages = [
            { channel: channelId, group: groupId, username: "user1", timeStamp: 100 },
            { channel: channelId, group: groupId, username: "user2", timeStamp: 99 },
            { channel: channelId, group: groupId, username: "user1", timeStamp: 98 },
            { channel: channelId, group: groupId, username: "user3", timeStamp: 97 },
            { channel: channelId, group: groupId, username: "user2", timeStamp: 96 },
        ];

        const mockUsers = [
            { username: "user1", profile: "http://localhost:3000/userImages/profile.jpg" },
            { username: "user2", profile: "http://localhost:3000/userImages/profile.jpg" },
            { username: "user3", profile: "http://localhost:3000/userImages/profile.jpg" }
        ];

        await messagesCollection.insertMany(mockMessages);
        await usersCollection.insertMany(mockUsers);

        // Mock channel and group objects
        const channel = { _id: channelId };
        const group = groupId;

        const res = await chai.request(app)
            .post("/api/getMessages")
            .send({ channel, group });

        // Check the response
        res.should.have.status(200);
        res.body.should.be.an("array").with.lengthOf(5);
        img = 'http://localhost:3000/userImages/profile.jpg';
        // Verify profile images in the response
        res.body[0].should.have.property("profileImage").eql(img);
        res.body[1].should.have.property("profileImage").eql(img);
        res.body[2].should.have.property("profileImage").eql(img);
        res.body[3].should.have.property("profileImage").eql(img);
        res.body[4].should.have.property("profileImage").eql(img);
    });
});

describe("POST /api/decline", function () {
    let client;
    let db;
    let accountRequestsCollection;
    let groupRequestsCollection;

    before(async function () {
        // Connect to the database before running tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        accountRequestsCollection = db.collection("accountRequests");
        groupRequestsCollection = db.collection("groupRequests");
    });

    after(async function () {
        // Clean up database after tests
        await accountRequestsCollection.deleteMany({});
        await groupRequestsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if username or file is missing", async function () {
        const res = await chai.request(app)
            .post("/api/decline")
            .send({}); // Missing both fields

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing username or file type");
    });

    it("should return an error if an invalid file type is specified", async function () {
        const res = await chai.request(app)
            .post("/api/decline")
            .send({ username: "user1", file: "invalidFileType" }); // Invalid file type

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Invalid file type specified");
    });

    it("should delete an account request for the given username", async function () {
        const username = "user1";

        // Insert test data
        await accountRequestsCollection.insertOne({ username: username });

        const res = await chai.request(app)
            .post("/api/decline")
            .send({ username, file: "account" });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(true);

        // Verify that the account request was deleted
        const request = await accountRequestsCollection.findOne({ username });
        chai.expect(request).to.be.null;
    });

    it("should delete a group request for the given username", async function () {
        const username = "user2";

        // Insert test data
        await groupRequestsCollection.insertOne({ username: username });

        const res = await chai.request(app)
            .post("/api/decline")
            .send({ username, file: "group" });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(true);

        // Verify that the group request was deleted
        const request = await groupRequestsCollection.findOne({ username });
        chai.expect(request).to.be.null;
    });

    it("should return an error if the request to decline does not exist", async function () {
        const username = "user3";

        // Ensure there is no request for this username in both collections
        await accountRequestsCollection.deleteMany({ username });
        await groupRequestsCollection.deleteMany({ username });

        const res = await chai.request(app)
            .post("/api/decline")
            .send({ username, file: "account" });

        res.should.have.status(404);
        res.body.should.have.property("valid").eql(false);
        res.body.should.have.property("message").eql("Request not found");
    });
});

describe("POST /api/deleteUser", function () {
    let client;
    let db;
    let usersCollection;
    let groupsCollection;
    let channelsCollection;

    before(async function () {
        // Connect to the database before tests run
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        usersCollection = db.collection("users");
        groupsCollection = db.collection("groups");
        channelsCollection = db.collection("channels");
    });

    after(async function () {
        // Cleanup the database after tests
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await channelsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if username is missing", async function () {
        const res = await chai.request(app)
            .post("/api/delete")
            .send({}); // Missing the username field

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing username");
    });

    it("should return an error if user is not found", async function () {
        const username = "nonexistentUser";

        const res = await chai.request(app)
            .post("/api/delete")
            .send({ username });

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("User not found");
    });

    it("should delete the user and remove them from all groups and channels", async function () {
        const username = "testUser";

        // Insert test data
        await usersCollection.insertOne({ username: username });
        await groupsCollection.insertOne({
            groupName: "Test Group",
            members: [username]
        });
        await channelsCollection.insertOne({
            channelName: "Test Channel",
            members: [username]
        });

        const res = await chai.request(app)
            .post("/api/delete")
            .send({ username });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);
        res.body.should.have.property("message").eql("User deleted and removed from all groups");

        // Verify the user was deleted from the users collection
        const user = await usersCollection.findOne({ username });
        chai.expect(user).to.be.null;

        // Verify the user was removed from all groups
        const group = await groupsCollection.findOne({ members: username });
        chai.expect(group).to.be.null;

        // Verify the user was removed from all channels
        const channel = await channelsCollection.findOne({ members: username });
        chai.expect(channel).to.be.null;
    });
});


describe("POST /api/createGroup", function () {
    let client;
    let db;
    let usersCollection;
    let groupsCollection;
    let channelsCollection;

    before(async function () {
        // Set up MongoDB connection before the tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        usersCollection = db.collection("users");
        groupsCollection = db.collection("groups");
        channelsCollection = db.collection("channels");
    });

    after(async function () {
        // Cleanup the database after tests
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await channelsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if channels or members are missing", async function () {
        const res = await chai.request(app)
            .post("/api/createGroup")
            .send({}); // Missing fields

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing required fields");
    });

    it("should create a new group and channel and add superAdmins", async function () {
        const channels = "Test Channel";
        const members = ["testUser", "superAdminUser"];

        // Insert a superAdmin and a regular user into the users collection
        await usersCollection.insertMany([
            { username: "testUser", roles: ["user"], groups: [] },
            { username: "superAdminUser", roles: ["superAdmin"], groups: [] }
        ]);

        const res = await chai.request(app)
            .post("/api/createGroup")
            .send({ channels, members });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(true);
        res.body.should.have.property("groupId");

        const groupId = res.body.groupId;

        // Verify the new group is created in the groups collection
        const group = await groupsCollection.findOne({ id: groupId });
        group.should.not.be.null;
        group.channels.should.include(channels);
        group.members.should.include.members(members);

        // Verify the superAdmin was added to the group
        const superAdmin = await usersCollection.findOne({ username: "superAdminUser" });
        superAdmin.groups.should.include(groupId.toString());

        // Verify the original members were added to the group
        const testUser = await usersCollection.findOne({ username: "testUser" });
        testUser.groups.should.include(groupId.toString());

        // Verify the channel is created
        const channel = await channelsCollection.findOne({ groupId: groupId.toString() });
        channel.should.not.be.null;
        channel.name.should.eql(channels);
        channel.members.should.include.members(members);
        channel.admins.should.include.members(members);

        // Verify the superAdmin is an admin in the channel
        channel.admins.should.include("superAdminUser");


    });

    it("should update superAdmins and original members' groups arrays", async function () {
        const channels = "SuperAdminGroup";
        const members = ["testUser"];

        // Insert a superAdmin and a testUser into the users collection
        await usersCollection.insertMany([
            { username: "testUser", roles: ["user"], groups: [] },
            { username: "superAdminUser", roles: ["superAdmin"], groups: [] }
        ]);

        const res = await chai.request(app)
            .post("/api/createGroup")
            .send({ channels, members });

        const groupId = res.body.groupId;

        // Check superAdmin is added to the group
        const superAdmin = await usersCollection.findOne({ username: "superAdminUser" });
        superAdmin.groups.should.include(groupId.toString());

        // Check original member is added to the group
        const testUser = await usersCollection.findOne({ username: "testUser" });
        testUser.groups.should.include(groupId.toString());
    });
});


describe("POST /api/banUser", function () {
    let client;
    let db;
    let usersCollection;
    let groupsCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        usersCollection = db.collection("users");
        groupsCollection = db.collection("groups");
    });

    after(async function () {
        // Cleanup the database after tests
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if user is not found", async function () {
        const res = await chai.request(app)
            .post("/api/ban")
            .send({ id: "nonExistentUser", currentGroup: "1" });

        res.should.have.status(404);
        res.body.should.have.property("error").eql("User not found");
    });

    it("should return an error if user is a super admin", async function () {
        const superAdmin = { username: "superAdminUser", roles: ["superAdmin"], groups: [] };
        await usersCollection.insertOne(superAdmin);

        const res = await chai.request(app)
            .post("/api/ban")
            .send({ id: "superAdminUser", currentGroup: "1" });

        res.should.have.status(403);
        res.body.should.have.property("error").eql("Cannot remove a super admin");
    });

    it("should return an error if group is not found", async function () {
        const regularUser = { username: "regularUser", roles: ["user"], groups: [] };
        await usersCollection.insertOne(regularUser);

        const res = await chai.request(app)
            .post("/api/ban")
            .send({ id: "regularUser", currentGroup: "999" }); // Group does not exist

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("Group not found");
    });

    it("should ban the user from the group and remove them from their groups", async function () {
        const user = { username: "testUser", roles: ["user"], groups: ["1"] };
        const group = { id: 1, groupName: "Test Group", members: ["testUser"], banned: [] };

        // Insert test data
        await usersCollection.insertOne(user);
        await groupsCollection.insertOne(group);

        const res = await chai.request(app)
            .post("/api/ban")
            .send({ id: "testUser", currentGroup: "1" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);

        const group1 = await groupsCollection.findOne({ id: parseInt(1) });

        if (group1 && group1.members) {
        // Check if "testUser" is not in the group's members array
        const userIndex = group1.members.indexOf("testUser");
        userIndex.should.equal(-1); // This checks that "testUser" is not found in the array
        }

        // Verify user is added to the banned list in the group
        const updatedGroup = await groupsCollection.findOne({ id: 1 });
        updatedGroup.banned.should.include("testUser");
        updatedGroup.members.should.not.include("testUser");
    });
});


describe("POST /api/leaveGroup", function () {
    let client;
    let db;
    let usersCollection;
    let groupsCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        usersCollection = db.collection("users");
        groupsCollection = db.collection("groups");
    });

    after(async function () {
        // Cleanup the database after tests
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if username or groupId is missing", async function () {
        const res = await chai.request(app)
            .post("/api/leaveGroup")
            .send({}); // Missing both fields

        res.should.have.status(400);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("Missing username or groupId");
    });

    it("should return an error if user is not found", async function () {
        const res = await chai.request(app)
            .post("/api/leaveGroup")
            .send({ name: "nonExistentUser", currentGroup: "1" });

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("User not found");
    });

    it("should return an error if an admin tries to leave the group", async function () {
        const adminUser = { username: "adminUser", roles: ["admin"], groups: ["1"] };
        await usersCollection.insertOne(adminUser);
        const group = { id: 1, groupName: "Test Group", members: ["adminUser"] };
        await groupsCollection.insertOne(group);

        const res = await chai.request(app)
            .post("/api/leaveGroup")
            .send({ name: "adminUser", currentGroup: "1" });

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("Admins cannot leave groups");
    });

    it("should return an error if group is not found", async function () {
        const user = { username: "regularUser", roles: ["user"], groups: ["1"] };
        await usersCollection.insertOne(user);

        const res = await chai.request(app)
            .post("/api/leaveGroup")
            .send({ name: "regularUser", currentGroup: "999" }); // Non-existent group

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("Group not found");
    });

    it("should successfully remove the user from the group and their groups array", async function () {
        const user = { username: "testUser", roles: ["user"], groups: [345] };
        const group = { id: 345, groupName: "TestGroup", members: ["testUser"] };

        // Insert test data
        await usersCollection.insertOne(user);
        await groupsCollection.insertOne(group);

        const res = await chai.request(app)
            .post("/api/leaveGroup")
            .send({ name: "testUser", currentGroup: "345" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);
        res.body.should.have.property("message").eql("User left successfully");

        // Verify the user is removed from the group's members
        const updatedGroup = await groupsCollection.findOne({ id: 345 });
        updatedGroup.members.should.not.include("testUser");

        // Verify the group is removed from the user's groups array
        const updatedUser = await usersCollection.findOne({ username: "testUser" });
        updatedUser.groups.should.not.include("345");
    });

    it("should return an error if the user is not a member of the group", async function () {
        const user = { username: "userNotInGroup", roles: ["user"], groups: [] };
        const group = { id: 1, groupName: "Test Group", members: [] };

        // Insert test data
        await usersCollection.insertOne(user);
        await groupsCollection.insertOne(group);

        const res = await chai.request(app)
            .post("/api/leaveGroup")
            .send({ name: "userNotInGroup", currentGroup: "1" });

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("User not found in group members");
    });
});


describe("POST /api/deleteGroups", function () {
    let client;
    let db;
    let usersCollection;
    let groupsCollection;
    let channelsCollection;
    let messagesCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        usersCollection = db.collection("users");
        groupsCollection = db.collection("groups");
        channelsCollection = db.collection("channels");
        messagesCollection = db.collection("messages");
    });

    after(async function () {
        // Cleanup the database after tests
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await channelsCollection.deleteMany({});
        await messagesCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if groupId is missing or invalid", async function () {
        const res = await chai.request(app)
            .post("/api/deleteGroups")
            .send({}); // Missing groupId

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing or invalid groupId");
    });

    it("should return an error if group is not found", async function () {
        const res = await chai.request(app)
            .post("/api/deleteGroups")
            .send({ groupId: "999" }); // Non-existent groupId

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("Group not found");
    });

    it("should successfully delete a group and related data", async function () {
        // Insert test data for the group, channels, messages, and users
        const group = { id: 1, groupName: "Test Group", members: ["testUser"] };
        const channel = { id: 1, groupId: "1", name: "Test Channel", members: ["testUser"] };
        const message = { channel: "Test Channel", group: '1', content: "Test message" };
        const user = { username: "testUser", groups: [1] };

        await groupsCollection.insertOne(group);
        await channelsCollection.insertOne(channel);
        await messagesCollection.insertOne(message);
        await usersCollection.insertOne(user);

        // Delete the group
        const res = await chai.request(app)
            .post("/api/deleteGroups")
            .send({ groupId: "1" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);

        // Verify that the group is deleted
        const deletedGroup = await groupsCollection.findOne({ id: 1 });
        chai.expect(deletedGroup).to.be.null;

        // Verify that the channel is deleted
        const deletedChannel = await channelsCollection.findOne({ groupId: "1" });
        chai.expect(deletedChannel).to.be.null;

        // Verify that the messages are deleted
        const deletedMessages = await messagesCollection.find({ group: 1 }).toArray();
        chai.expect(deletedMessages).to.have.lengthOf(0);

        // Verify that the user no longer has the group in their groups array
        const updatedUser = await usersCollection.findOne({ username: "testUser" });
        updatedUser.groups.should.not.include(1);
    });
});


describe("POST /api/addChannel", function () {
    let client;
    let db;
    let groupsCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        groupsCollection = db.collection("groups");
    });

    after(async function () {
        // Cleanup the database after tests
        await groupsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if groupId or newChannels is missing", async function () {
        // Missing groupId
        let res = await chai.request(app)
            .post("/api/addChannel")
            .send({ newChannels: ["newChannel1"] });

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing required fields");

        // Missing newChannels
        res = await chai.request(app)
            .post("/api/addChannel")
            .send({ groupId: "1" });

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing required fields");
    });

    it("should return an error if group is not found", async function () {
        const res = await chai.request(app)
            .post("/api/addChannel")
            .send({ groupId: "999", newChannels: ["newChannel1"] }); // Non-existent groupId

        res.should.have.status(404);
        res.body.should.have.property("error").eql("Group not found");
    });

    it("should successfully add new channels to a group", async function () {
        // Insert test data for a group
        const group = { id: 1, groupName: "Test Group", channels: ["existingChannel"] };
        await groupsCollection.insertOne(group);

        const newChannels = ["newChannel1", "newChannel2"];
        const res = await chai.request(app)
            .post("/api/addChannel")
            .send({ groupId: "1", newChannels });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);
        res.body.should.have.property("channels").eql([...group.channels, ...newChannels]);

        // Verify that the channels were added to the group
        const updatedGroup = await groupsCollection.findOne({ id: 1 });
        updatedGroup.channels.should.include.members(newChannels);
    });

    it("should handle the case where duplicate channels are added", async function () {
        // Insert test data with existing channels
        const group = { id: 2, groupName: "Test Group 2", channels: ["existingChannel1"] };
        await groupsCollection.insertOne(group);

        const newChannels = ["existingChannel1", "newChannel2"]; // 'existingChannel1' is a duplicate
        const res = await chai.request(app)
            .post("/api/addChannel")
            .send({ groupId: "2", newChannels });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);
        res.body.should.have.property("channels").eql(["existingChannel1", "newChannel2"]);

        // Verify that the duplicate channel was not added
        const updatedGroup = await groupsCollection.findOne({ id: 2 });
        updatedGroup.channels.should.have.members(["existingChannel1", "newChannel2"]);
    });
});


describe("POST /api/deleteChannel", function () {
    let client;
    let db;
    let groupsCollection;
    let channelsCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        groupsCollection = db.collection("groups");
        channelsCollection = db.collection("channels");
    });

    after(async function () {
        // Cleanup the database after tests
        await groupsCollection.deleteMany({});
        await channelsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if groupId or channel is missing", async function () {
        // Missing groupId
        let res = await chai.request(app)
            .post("/api/deleteChannel")
            .send({ channel: { name: "testChannel", _id: "someObjectId" } });

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing groupId or channel");

        // Missing channel
        res = await chai.request(app)
            .post("/api/deleteChannel")
            .send({ groupId: "1" });

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing groupId or channel");
    });

    it("should return an error if group or channel is not found", async function () {
        // Group and channel don't exist
        const res = await chai.request(app)
            .post("/api/deleteChannel")
            .send({ groupId: "999", channel: { name: "nonExistentChannel", _id: "60d1b1f9bdb52c3d5f4e4e2a" } });

        res.should.have.status(404);
        res.body.should.have.property("error").eql("Channel not found");
    });

    it("should delete the channel from group and channels collection", async function () {
        // Insert test data for group and channel
        const group = { id: 1, groupName: "Test Group", channels: ["testChannel"] };
        const channel = { name: "testChannel", _id: new ObjectId() };

        await groupsCollection.insertOne(group);
        await channelsCollection.insertOne(channel);

        const res = await chai.request(app)
            .post("/api/deleteChannel")
            .send({ groupId: "1", channel: { name: "testChannel", _id: new ObjectId(channel._id) } });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(true);

        // Verify that the channel is removed from the group's channels
        const updatedGroup = await groupsCollection.findOne({ id: 1 });
        updatedGroup.channels.should.not.include("testChannel");

        // Verify that the channel is deleted from the channels collection
        const deletedChannel = await channelsCollection.findOne({ _id: channel._id });
        chai.expect(deletedChannel).to.be.null;
    });
});


describe("POST /api/createChannel", function () {
    let client;
    let db;
    let groupsCollection;
    let channelsCollection;
    let usersCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        groupsCollection = db.collection("groups");
        channelsCollection = db.collection("channels");
        usersCollection = db.collection("users");

        // Clear collections before starting tests
        await groupsCollection.deleteMany({});
        await channelsCollection.deleteMany({});
        await usersCollection.deleteMany({});
    });

    after(async function () {
        // Cleanup the database after tests
        await groupsCollection.deleteMany({});
        await channelsCollection.deleteMany({});
        await usersCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if required fields are missing", async function () {
        // Missing groupId
        let res = await chai.request(app)
            .post("/api/createChannel")
            .send({ name: "testChannel", members: ["user1"] });

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing required fields");

        // Missing name
        res = await chai.request(app)
            .post("/api/createChannel")
            .send({ groupId: 1, members: ["user1"] });

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing required fields");

        // Missing members
        res = await chai.request(app)
            .post("/api/createChannel")
            .send({ groupId: 1, name: "testChannel" });

        res.should.have.status(400);
        res.body.should.have.property("error").eql("Missing required fields");
    });

    it("should return an error if the group does not exist", async function () {
        const res = await chai.request(app)
            .post("/api/createChannel")
            .send({ groupId: "999", name: "testChannel", members: ["user1"] });

        res.should.have.status(404);
        res.body.should.have.property("error").eql("Group not found");
    });

    it("should add superAdmins to the members and admins arrays", async function () {
        // Insert a test group
        const group = { id: 1, groupName: "Test Group", channels: [] };
        await groupsCollection.insertOne(group);

        // Insert a superAdmin user
        const superAdminUser = {
            username: "superAdmin",
            roles: ["superAdmin"],
            groups: ["1"]
        };
        await usersCollection.insertOne(superAdminUser);

        const res = await chai.request(app)
            .post("/api/createChannel")
            .send({ groupId: "1", name: "testChannel", members: ["superAdmin"] });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(true);

        // Verify that superAdmin is added to members and admins arrays
        const channel = await channelsCollection.findOne({ name: "testChannel" });
        channel.members.should.include("superAdmin");
        channel.admins.should.include("superAdmin");
    });

    it("should successfully create a channel and update the group", async function () {
        // Insert a test group
        const group = { id: 2, groupName: "Test Group", channels: [] };
        await groupsCollection.insertOne(group);

        const res = await chai.request(app)
            .post("/api/createChannel")
            .send({ groupId: "2", name: "testChannel", members: ["user1"] });

        res.should.have.status(200);
        res.body.should.have.property("valid").eql(true);
        res.body.should.have.property("channelId").eql("2"); 

        // Verify that the channel is added to the group's channels
        const updatedGroup = await groupsCollection.findOne({ id: 2 });
        updatedGroup.channels.should.include("testChannel");

        // Verify that the channel is created in the channels collection
        const newChannel = await channelsCollection.findOne({ groupId: "2"});
        newChannel.should.have.property("name").eql("testChannel");
        newChannel.should.have.property("members").eql(["user1"]);
    });
});



describe("POST /api/banUserChannel", function () {
    let client;
    let db;
    let usersCollection;
    let channelsCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        usersCollection = db.collection("users");
        channelsCollection = db.collection("channels");

        // Clear collections before starting tests
        await usersCollection.deleteMany({});
        await channelsCollection.deleteMany({});
    });

    after(async function () {
        // Cleanup the database after tests
        await usersCollection.deleteMany({});
        await channelsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if user or groupId is missing", async function () {
        const superAdminUser = {
            username: "1",
            roles: ["user"],
            groups: ["1"]
        };
        await usersCollection.insertOne(superAdminUser);

        let res = await chai.request(app)
            .post("/api/banUserChannel")
            .send({ user: "1", currentGroup: "1" });

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("error").eql("Channel not found for the group");

        res = await chai.request(app)
            .post("/api/banUserChannel")
            .send({ user: "user1" });

        res.should.have.status(404);
        res.body.should.have.property("error").eql("User not found");
    });

    it("should return an error if the user does not exist", async function () {
        const res = await chai.request(app)
            .post("/api/banUserChannel")
            .send({ currentGroup: "1", user: "nonExistentUser" });

        res.should.have.status(404);
        res.body.should.have.property("error").eql("User not found");
    });

    it("should return an error if the user is a superAdmin", async function () {
        // Insert superAdmin user into the database
        await usersCollection.insertOne({
            username: "superAdmin",
            roles: ["superAdmin"],
            groups: ["1"]
        });

        const res = await chai.request(app)
            .post("/api/banUserChannel")
            .send({ currentGroup: "1", user: "superAdmin" });

        res.should.have.status(403);
        res.body.should.have.property("error").eql("Cannot remove a super admin");
    });

    it("should return an error if the channel for the group does not exist", async function () {
        // Insert a normal user
        await usersCollection.insertOne({
            username: "user1",
            roles: ["user"],
            groups: ["1"]
        });

        const res = await chai.request(app)
            .post("/api/banUserChannel")
            .send({ currentGroup: "1", user: "user1" });

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("error").eql("Channel not found for the group");
    });

    it("should successfully ban a user from a channel and remove them from members", async function () {
        // Insert a test group and a channel for that group
        const group = { id: "1", groupName: "Test Group", channels: ["testChannel"] };
        const channel = {
            groupId: "1",
            name: "testChannel",
            members: ["user1", "user2"],
            banned: []
        };
        await usersCollection.insertOne({ username: "user1", roles: ["user"], groups: ["1"] });
        await usersCollection.insertOne({ username: "user2", roles: ["user"], groups: ["1"] });
        await channelsCollection.insertOne(channel);

        const res = await chai.request(app)
            .post("/api/banUserChannel")
            .send({ currentGroup: "1", user: "user1" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);

        // Verify user1 is removed from members and added to banned list
        const updatedChannel = await channelsCollection.findOne({ groupId: "1" });
        updatedChannel.members.should.not.include("user1");
        updatedChannel.banned.should.include("user1");
    });
});

describe("POST /api/kickUserChannel", function () {
    let client;
    let db;
    let usersCollection;
    let channelsCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        usersCollection = db.collection("users");
        channelsCollection = db.collection("channels");

        // Clear the collections before starting tests
        await usersCollection.deleteMany({});
        await channelsCollection.deleteMany({});
    });

    after(async function () {
        // Cleanup the database after tests
        // await usersCollection.deleteMany({});
        // await channelsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if username", async function () {
        let res = await chai.request(app)
            .post("/api/kickUserChannel")
            .send({ currentChannel: "testChannel" });
        
        res.should.have.status(404);
        res.body.should.have.property("error").eql("User not found");
    });

    it("should return an error if the user is not found", async function () {
        const res = await chai.request(app)
            .post("/api/kickUserChannel")
            .send({ username: "nonexistentUser", currentChannel: "testChannel" });
        res.should.have.status(404);
        res.body.should.have.property("error").eql("User not found");
    });

    it("should return an error if the user is a super admin", async function () {
        // Insert a super admin user
        await usersCollection.insertOne({
            username: "superAdmin",
            roles: ["superAdmin"]
        });

        const res = await chai.request(app)
            .post("/api/kickUserChannel")
            .send({ username: "superAdmin", currentChannel: "testChannel" });

        res.should.have.status(200);
        res.body.should.have.property("error").eql("cannot remove a super admin");
    });

    it("should return an error if the channel is not found", async function () {
        await usersCollection.insertOne({
            username: "user2454534",
            roles: ['user']
        });
        const res = await chai.request(app)
            .post("/api/kickUserChannel")
            .send({ username: "user2454534", currentChannel: "nonexistentChannel" });

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("Channel not found");
    });

    it("should return an error if the user is not a member of the channel", async function () {
        // Insert a channel with no members
        await usersCollection.insertOne({
            username: "user234",
            roles: ['user']
        });

        await channelsCollection.insertOne({
            name: "testChannel",
            members: ["user23"]
        });

        const res = await chai.request(app)
            .post("/api/kickUserChannel")
            .send({ username: "user234", currentChannel: "testChannel" });
        res.should.have.status(200);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("User is not a member of the channel");
    });

    it("should successfully remove the user from the channel", async function () {
        // Insert a user and a channel with the user as a member
        await usersCollection.insertOne({
            username: "user1",
            roles: []
        });

        await channelsCollection.insertOne({
            name: "testChannel2",
            members: ["user1"]
        });

        const res = await chai.request(app)
            .post("/api/kickUserChannel")
            .send({ username: "user1", currentChannel: "testChannel2" });
        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);
        res.body.should.have.property("message").eql("User removed from channel");

        // Verify that the user is removed from the channel
        const channel = await channelsCollection.findOne({ name: "testChannel2" });
        channel.members.should.not.include("user1");
    });
});


describe("POST /api/kickUserGroups", function () {
    let client;
    let db;
    let groupsCollection;
    let usersCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        groupsCollection = db.collection("groups");
        usersCollection = db.collection("users");

        // Clear the collections before starting tests
        await groupsCollection.deleteMany({});
        await usersCollection.deleteMany({});
    });

    after(async function () {
        // Cleanup the database after tests
        await groupsCollection.deleteMany({});
        await usersCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if username or groupId is missing", async function () {

        await groupsCollection.insertOne({
            id: 1,
            name: "testGroup",
            members: []
        });

        let res = await chai.request(app)
            .post("/api/kickUserGroups")
            .send({ currentGroup: "1" });

        res.should.have.status(200);
        res.body.should.have.property("message").eql("User is not a member of the group");

        res = await chai.request(app)
            .post("/api/kickUserGroups")
            .send({ id: "user1" });

        res.should.have.status(200);
        res.body.should.have.property("message").eql("Group not found");
    });

    it("should return an error if the group is not found", async function () {
        const res = await chai.request(app)
            .post("/api/kickUserGroups")
            .send({ id: "user1", currentGroup: "999" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("Group not found");
    });

    it("should return an error if the user is not a member of the group", async function () {
        // Insert a group with no members
        await groupsCollection.insertOne({
            id: 1,
            name: "testGroup",
            members: []
        });

        const res = await chai.request(app)
            .post("/api/kickUserGroups")
            .send({ id: "user1", currentGroup: "1" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("User is not a member of the group");
    });

    it("should return an error if the user is not found in the users collection", async function () {
        // Insert a group with a member
        await groupsCollection.insertOne({
            id: 1,
            name: "testGroup",
            members: ["user1"]
        });

        const res = await chai.request(app)
            .post("/api/kickUserGroups")
            .send({ id: "user2", currentGroup: "1" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("User is not a member of the group");
    });

    it("should return an error if trying to remove a super admin", async function () {
        // Insert a super admin user and a group
        await groupsCollection.deleteMany({});
        await usersCollection.insertOne({
            username: "superAdmin",
            roles: ["superAdmin"],
            groups: [1]
        });

        await groupsCollection.insertOne({
            id: 1,
            name: "testGroup",
            members: ["superAdmin"]
        });

        const res = await chai.request(app)
            .post("/api/kickUserGroups")
            .send({ id: "superAdmin", currentGroup: "1" });

        res.should.have.status(200);
        res.body.should.have.property("error").eql("Cannot remove a super admin");
    });

    it("should successfully remove a user from the group", async function () {
        // Insert a regular user and a group
        await usersCollection.insertOne({
            username: "user145",
            roles: ['user'],
            groups: [1]
        });
        await groupsCollection.deleteMany({});
        await groupsCollection.insertOne({
            id: 1,
            name: "testGroup5",
            members: ["user145"]
        });

        const res = await chai.request(app)
            .post("/api/kickUserGroups")
            .send({ id: "user145", currentGroup: "1" });
        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);

        // Verify that the user is removed from the group's members list
        const group = await groupsCollection.findOne({ id: 1 });
        group.members.should.not.include("user145");

        // Verify that the group is removed from the user's groups list
        const user = await usersCollection.findOne({ username: "user145" });
        user.groups.should.not.include(1);
    });
});

describe("POST /api/acceptGroup", function () {
    let client;
    let db;
    let usersCollection;
    let groupsCollection;
    let groupRequestsCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        usersCollection = db.collection("users");
        groupsCollection = db.collection("groups");
        groupRequestsCollection = db.collection("groupRequests");

        // Clear the collections before starting tests
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await groupRequestsCollection.deleteMany({});
    });

    after(async function () {
        // Cleanup after tests
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        // await groupRequestsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if the user is not found", async function () {
        const res = await chai.request(app)
            .post("/api/acceptGroup")
            .send({ username: "user1", groupId: 1 });

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("User not found");
    });

    it("should return an error if the group is not found", async function () {
        await usersCollection.insertOne({ username: "user1", groups: [] });

        const res = await chai.request(app)
            .post("/api/acceptGroup")
            .send({ username: "user1", groupId: 1 });

        res.should.have.status(404);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("Group not found");
    });

    it("should return a success message if the user is already in the group", async function () {
        const group = { id: 1, name: "testGroup", members: ["user1"] };
        await groupsCollection.insertOne(group);
        await usersCollection.insertOne({ username: "user1", groups: [1] });

        // User is already a member of the group
        const res = await chai.request(app)
            .post("/api/acceptGroup")
            .send({ username: "user1", groupId: 1 });

        res.should.have.status(400);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("User is already in the group");

        // Verify that no changes were made in the database
        const updatedGroup = await groupsCollection.findOne({ id: 1 });
        updatedGroup.members.should.have.length(1);
    });

    it("should successfully add a user to the group", async function () {
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await groupRequestsCollection.deleteMany({});
        const group = { id: 1, name: "testGroup", members: [] };
        const user = { username: "user1", groups: [] };
        await groupsCollection.insertOne(group);
        await usersCollection.insertOne(user);

        const res = await chai.request(app)
            .post("/api/acceptGroup")
            .send({ username: "user1", groupId: 1 });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);
        res.body.should.have.property("message").eql("User added to the group");

        // Verify that the user is added to the group's members array
        const updatedGroup = await groupsCollection.findOne({ id: 1 });
        updatedGroup.members.should.include("user1");

        // Verify that the group is added to the user's groups array
        const updatedUser = await usersCollection.findOne({ username: "user1" });
        updatedUser.groups.should.include(1);
    });
});



describe("POST /api/addSuperAdminAndUpdateGroups", function () {
    let client;
    let db;
    let usersCollection;
    let groupsCollection;
    let channelsCollection;

    before(async function () {
        // Connect to MongoDB before tests
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        db = client.db("mydb");
        usersCollection = db.collection("users");
        groupsCollection = db.collection("groups");
        channelsCollection = db.collection("channels");

        // Clear the collections before starting tests
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await channelsCollection.deleteMany({});
    });

    after(async function () {
        // Cleanup after tests
        await usersCollection.deleteMany({});
        await groupsCollection.deleteMany({});
        await channelsCollection.deleteMany({});
        await client.close();
    });

    it("should return an error if the user is not found", async function () {
        const res = await chai.request(app)
            .post("/api/promoteSuperAdmin")
            .send({ username: "user1" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(false);
        res.body.should.have.property("message").eql("User not found");
    });

    it("should add the 'superAdmin' role if the user does not already have it", async function () {
        const user = { username: "user1", roles: ["user"] };
        await usersCollection.insertOne(user);

        const group = { id: 1, name: "group1", members: [] };
        const channel = { id: 1, name: "channel1", members: [] };
        await groupsCollection.insertOne(group);
        await channelsCollection.insertOne(channel);

        const res = await chai.request(app)
            .post("/api/promoteSuperAdmin")
            .send({ username: "user1" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);
        res.body.should.have.property("message").eql("User user1 is now a superAdmin, added to all groups and channels, and their groups array has been updated.");

        // Verify the user has the 'superAdmin' role
        const updatedUser = await usersCollection.findOne({ username: "user1" });
        updatedUser.roles.should.include("superAdmin");

        // Verify that the user was added to the group and channel
        const updatedGroup = await groupsCollection.findOne({ id: 1 });
        updatedGroup.members.should.include("user1");

        const updatedChannel = await channelsCollection.findOne({ id: 1 });
        updatedChannel.members.should.include("user1");

        // Verify that the user's groups array is updated
        updatedUser.groups.should.include(1); // Group ID 1
    });

    it("should not add the 'superAdmin' role if the user already has it", async function () {
        const user = { username: "user2", roles: ["superAdmin"] };
        await usersCollection.insertOne(user);

        const group = { id: 1, name: "group1", members: [] };
        const channel = { id: 1, name: "channel1", members: [] };
        await groupsCollection.insertOne(group);
        await channelsCollection.insertOne(channel);

        const res = await chai.request(app)
            .post("/api/promoteSuperAdmin")
            .send({ username: "user2" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);
        res.body.should.have.property("message").eql("User user2 is now a superAdmin, added to all groups and channels, and their groups array has been updated.");

        // Verify that the user still has the 'superAdmin' role and wasn't added again
        const updatedUser = await usersCollection.findOne({ username: "user2" });
        updatedUser.roles.should.include("superAdmin");

        // Verify that the user was added to the group and channel
        const updatedGroup = await groupsCollection.findOne({ id: 1 });
        updatedGroup.members.should.include("user2");

        const updatedChannel = await channelsCollection.findOne({ id: 1 });
        updatedChannel.members.should.include("user2");

        // Verify that the user's groups array is updated
        updatedUser.groups.should.include(1); // Group ID 1
    });

    it("should add the user to all groups and channels", async function () {
        const user = { username: "user1", roles: [] };
        await usersCollection.insertOne(user);

        const group1 = { id: 1, name: "group1", members: [] };
        const group2 = { id: 2, name: "group2", members: [] };
        await groupsCollection.insertMany([group1, group2]);

        const channel1 = { id: 1, name: "channel1", members: [] };
        const channel2 = { id: 2, name: "channel2", members: [] };
        await channelsCollection.insertMany([channel1, channel2]);

        const res = await chai.request(app)
            .post("/api/promoteSuperAdmin")
            .send({ username: "user1" });

        res.should.have.status(200);
        res.body.should.have.property("success").eql(true);

        // Verify the user is added to all groups
        const updatedGroups = await groupsCollection.find().toArray();
        updatedGroups.forEach(group => {
            group.members.should.include("user1");
        });

        // Verify the user is added to all channels
        const updatedChannels = await channelsCollection.find().toArray();
        updatedChannels.forEach(channel => {
            channel.members.should.include("user1");
        });
    });
});