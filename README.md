# Collection Formats:
All files are stored as JSON arrays with example below
## accountRequests Collection:

-   "_id": mongoId,
-   "username": " username ",
-   "email": " email ",
-   "password": " password "

## Channels Collection:

-   "_id": mongoId,
-   "id": id,
-   "groupId": “groupId “,
-   "name": " name ",
-   "admins": [
        "admin"
    ],
-   "banned": [
        "bannedUser"
    ],
-   "members": [
       "member"
    ]


## groupRequests Collection:
-   "_id": mongoId
-   "username": "username ",
-   "groupId": "groupId",
-   "status": " status ",
-   "permission": "permission ",
-   "need": "need”

## Groups Collection

-   "_id": mongoId
-   "id": id,
-   "channels": [
        "channel"
    ],
-   "admins": [
        "admin"
    ],
-   "banned": [],
-   "members": [
        " member"
    ]



## Users Collection:

-   "_id": mongoId,
-   "username": "username",
-   "profile": "url to profile img",
-   "email": " email ",
-   "password": " password ",
-   "groups": [],
-   "roles": [
       "user"
    ]

## Messages Collection:
-   "_id": mongoId,
-   "username": "username",
-   "msg": "msg",
-   "image": "image",
-   "channel": "channel",
-   "group": "groupId",
-   "timeStamp": "time message was sent"


# Accept group
## Method:
- HTTP POST
## Endpoint:
- /api/acceptGroup
## Parameters:
- username: string, Username of the user trying to join the group 
- groupId: string, ID of the group the user is requesting to join. This ID is passed as a string but will be parsed as an integer while searching for the group.

## Return Values:
- Internal server errors:
    - { "error": "Internal server error" }
- Group not found:
    - { "success": false, "message": "Group not found" }
- User is already a member of the group:
    - { "success": false, "message": "User is already in the group" }
- Failed to update the user:
    - { "success": false, "message": "Failed to update the user" }
- Failed to update the group:
    - { "success": false, "message": "Failed to update the group" }
- On success:
    - { "success": true, "message": "User added to the group" }
## How It Works:
Adds a user to a group by verifying the user and group exist, preventing duplicate membership, updating both user and group records, and removing any related join requests from the groupRequests collection.


# Accept Users:
## Method:
-	HTTP POST
## Endpoint:
-	/api/acceptUser
## Parameters:
-	username (string): The desired username for the new user.
-	email (string): The email address of the new user.
-	password (string): The password of the new user.
## Return Values:
-   User already exists:
    -   { "success": false, "message": "User already exists" }
-   No pending account request found:
    -   { "success": false, "message": "No account request found for this user" }
-   On successful registration:
    -   { "success": true, "message": "User successfully registered", "userId": "<insertedId>" }
-   Internal server error:
    -   { "error": "Internal server error" }
## How it Works:
Checks if the user already exists; if not, verifies there is a pending account request for the username. If such a request exists, deletes it and inserts the new user record with default roles and profile image. Returns appropriate success or error messages.

# addChannnels:
## Method:
- HTTP POST
## Endpoint:
- /api/addChannel
## Parameters:
- groupId (string): The ID of the group to which the channels should be added.
- newChannels (string): the name of the new channel to add
## Return Values:
-   Missing fields:
    -   { "error": "Missing required fields" }
-   Group not found:
    -   { "error": "Group not found" }
-   On success:
    -   { "success": true, "channels": ["channel1", "channel2", ...] }
-   Internal server error:
    -   { "error": "Internal server error" }
## How it Works:
Accepts a group ID and a list (or single) channel(s), verifies the group exists, then merges the new channels into the group's existing channel list while preventing duplicates, and updates the group document in the database.

# Auth:
## Method:
- HTTP POST
## Endpoint:
- /api/auth
## Parameters:
-	username (string): The username of the user attempting to log in.
-	password (string): The password of the user attempting to log in.
## Return values:
-	Successful login (user found):
    -	{
        "id": "...",
        "username": "...",
        "email": "...",
        "groups": [...],
        "roles": [...],
        "valid": true
        }
-	Invalid login (user not found or wrong credentials):
    -	{ "valid": false }

-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works:
Checks the MongoDB users collection for a user matching the provided username and password, returns the user details without the password on success, or a valid: false response if no match is found.

# banUser:
## Method:
-	HTTP POST
## Endpoint:
-	/api/ban
## Parameters:
-	id (string): The username of the user to be banned.
-	currentGroup (string): The ID of the group from which the user is to be banned.
## Return Values:
-	Success:
    -	{ "success": true }
-	User not found:
    -	{ "error": "User not found" }
-	Group not found:
    -	{ "success": false, "message": "Group not found" }
-	Attempt to ban super admin:
    -	{ "error": "Cannot remove a super admin" }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works
Validates that the user exists and is not a super admin, removes the specified group from the user’s groups array, removes the user from the group’s members array, adds the user to the group’s banned array, and returns a success status.

# BanUserChannel
## Method:
-	HTTP POST
## Endpoint:
-	/api/banUserChannel
## Parameters:
-	id (string): The username of the user to be banned from the channel.
-	currentGroup (string): The ID of the group whose channel the user is being banned from. Will be parsed as an integer when find the group
## Return Values:
-	Success:
    -	{ "success": true }
-	User not found:
    -	{ "error": "User not found" }
-	Channel not found for the group:
    -	{ "success": false, "error": "Channel not found for the group" }
-	Attempt to ban super admin:
    -	{ "error": "Cannot remove a super admin" }
-	Internal server error:
    -	{ "error": "Internal server error" }

## How It Works:
Verifies the user exists and is not a super admin, finds the channel by group ID, removes the user from the channel’s members array if present, adds the user to the banned array without duplicates, and returns a success response.

# Create channel:
## Method:
-	HTTP POST
## Endpoint:
-	/api/createChannel
## Parameters:
-	groupId (string): The ID of the group where the channel will be created.
-	name (string): The name of the new channel.
-	members (string): the username of the user creating the channel
## Return Values:
-	Success:
    -	{ "valid": true, "channelId": "newChannelId" }
-	Missing required fields:
    -	{ "error": "Missing required fields" }
-	Group not found:
    -	{ "error": "Group not found" }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How It Works:
The endpoint verifies the group exists, includes any super admins of the group automatically as both members and admins of the new channel, assigns a new unique channel ID, inserts the new channel into the database with members and admins, and adds the channel name to the group’s channel list.

# Create Groups:
## Method:
-	HTTP POST
## Endpoint:
-	/api/createGroup
## Parameters:
-	groupId (string): The ID of the group being created (auto-generated).
-	channels (string): An array of channels for the group (at least one channel should be specified).
-	members (array of strings): An array containing the username of the group creator (the first user will be the admin and only member at first).
## Return Values:
-	Success:
    -	{ "valid": true, "groupId": <newGroupId> }
-	Missing required fields:
    -	{ "error": "Missing required fields" }
-	Internal server error:
    -	{ "error": "Internal server error" }
	
## How It Works:
Creates a new group with a unique numeric ID and adds the specified members as both group members and admins, automatically including all superAdmins as members and admins. Updates all involved users’ group memberships accordingly. Then, creates an initial channel linked to the new group, initializing it with the same members and admins.

# Create Group Join Request;
## Method:
-	HTTP POST
## Endpoint:
-	/api/createGroupJoinRequest
## Parameters:
-	username (string): The username of the user requesting to join a group.
-	groupId (string): The ID of the group the user wants to join.
## Return Values:
-	Missing fields:
    -	{ "error": "Missing username or groupId" }
-	Group not found:
    -	{ "error": "Group not found" }
-	User banned from the group:
    -	{ "error": "You are banned from this group" }
-	User already a member:
    -	{ "error": "You are already in this group" }
-	Request already pending:
    -	{ "valid": false, "message": "Request already pending" }
-	Success:
    -	{ "valid": true }
-	Internal server error:
    -	{ "error": "Internal server error" }

## How It Works:
Validates the input, checks if the group exists, ensures the user is neither banned nor already a member, then inserts a new pending join request for the group if none already exists.

# Create User Request:
## Method:
-	HTTP POST
## Endpoint:
-	/api/create
## Parameters:
-	username (string): The username of the user requesting to register.
-	email (string): The email address of the user requesting to register.
-	password (string): The password of the user requesting to register.
## Return Values:
-	Missing fields:
    -	{ "valid": false, "error": "Missing username, email, or password" }
-	Username already exists:
    -	{ "valid": false, "message": "Username already exists" }
-	Registration request already submitted:
    -	{ "valid": false, "message": "Registration request already submitted" }
-	Success:
    -	{ "valid": true }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How It Works:
Validates that all required fields are provided, checks if the username is already taken or if a registration request is pending, and if not, saves the new registration request for approval.

# Decline
## Method:
-	HTTP POST
## Endpoint:
-	/api/decline
## Parameters:
-	username (string): The username of the user whose request is being declined.
-	file (string): Specifies whether the request is related to a group (groupRequests) or account (accountRequests).
## Return Values:
-	Missing parameters:
    -	{ "error": "Missing username or file type" }
-	Invalid file type:
    -	{ "error": "Invalid file type specified" }
-	Request not found:
    -	{ "valid": false, "message": "Request not found" }
-	Success:
    -	{ "valid": true }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How It Works:
Removes a pending user request from either the accountRequests or groupRequests collection based on the specified file type, effectively declining the user’s request.

# Delete Channel:
## Method:
-	HTTP POST
## Endpoint:
-	/api/deleteChannel
## Parameters:
-	groupId (string): The ID of the group from which the channel is being deleted.
-	channel (string): The name or ID of the channel to be deleted.
## Return Values:
-	Missing parameters:
    -	{ "error": "Missing groupId or channel" }
-	Group not found:
    -	{ "error": "Group not found" }
-	Channel not found:
    -	{ "error": "Channel not found" }
-	Success:
    -	{ "valid": true }
-	Internal server error:
    -	{ "error": "Internal server error" }

## How it works:
Removes the channel name from the group’s channels array and deletes the channel document from the channels collection by its _id, ensuring the channel is fully removed from both group and channels collections.

# Delete Groups:
## Method:
-	HTTP POST
## Endpoint:
-	/api/deleteGroups
## Parameters:
-	groupId (string): The ID of the group to be deleted.
## Return Values:
-	Missing or invalid groupId:
    -	{ "error": "Missing or invalid groupId" }
-	Group not found:
    -	{ "success": false, "message": "Group not found" }
-	Success:
    -	{ "success": true }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works:
Deletes the group document by its ID, removes all channels and messages associated with the group, and updates all users to remove the group from their membership lists, ensuring complete cleanup of the group and all related data.

# Delete User:
## Method:
-	HTTP POST
## Endpoint:
-	/api/delete
## Parameters:
-	username (string): The username of the user to be deleted.
## Return Values:
-	Missing username:
    -	{ "error": "Missing username" }
-	User not found:
    -	{ "success": false, "message": "User not found" }
-	Success:
    -	{ "success": true, "message": "User deleted and removed from all groups" }
-	Internal server error:
    -	{ "error": "Internal server error" }

## How it Works:
Deletes the user document from the users collection, then removes the username from all members arrays in both groups and channels collections to ensure the user is fully removed from the system.

# editProfile:
## Method:
-	HTTP POST
## Endpoint:
-	/api/editProfile
## Parameters:
-	img (string): The filename of the new profile image.
-	username (string): The username of the user whose profile image is being updated.
## Return Values:
-	Missing parameters:
    -	{ "error": "No Image or Username" }
-	Success:
    -	{ "success": true, "message": "Profile Image Updated" }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How It works:
Updates the specified user’s profile image URL in the users collection, linking it to the new image filename provided.


# getAdmin:
## Method:
-	HTTP POST
## Endpoint:
-	/api/getAdmin
## Parameters:
-	id (string): The ID of the group.
-	username (string): The username of the user whose admin status is being checked.
## Return Values:
-	Missing parameters:
    -	{ "error": "Missing groupId or username" }
-	Success:
    -	{ "isAdmin": true|false, "isSuperAdmin": true|false }
-	Internal server error:
    -	{ "error": "Internal server error" }

## How It works:
Checks if the specified user is an admin of the given group by verifying if the username exists in the group's admins array. Then, it checks if the user has the role superAdmin in the users collection. Returns the combined admin and superAdmin status as boolean flags.

# getChannels
## Method:
-	HTTP POST
## Endpoint:
-	/api/getChannels
## Parameters:
-	id (string): The ID of the group whose channels are being checked.
-	username (string): The username of the user whose allowed channels are being fetched.
## Return Values:
-	Missing parameters:
    -	{ "error": "Missing groupId or username" }
-	Group not found:
    -	{ "error": "Group not found" }
-	Success:
    -	{ "channels": [ { "_id": "mongoId", "name": "name" }, ... ], "members": ["member1", "member2", ...] }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How It Works:
The endpoint first finds the group document by the provided groupId. If the group exists, it retrieves the list of channel names associated with that group. Next, it queries the channels collection to find channels that belong to the group and match the group's channel names. It then filters these channels to include only those where the specified user is a member and is not banned. Finally, it returns the filtered list of allowed channels with their _id and name, along with the list of members belonging to the group.

# GetGroupRequests:
## Method:
-	HTTP POST
## Endpoint:
-	/api/getGroupRequests
## Parameters:
-	groupId (string): The ID of the group for which the requests are being fetched.
## Return Values:
-	Missing parameters:
    -	{ "error": "Missing groupId in request body" }
-	Success:
    -	{ "response": [ array of group request objects ] }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works:
The endpoint first validates that a groupId is provided in the request body. It then connects to the MongoDB database and queries the groupRequests collection for all requests matching the provided groupId (stored as a string). The resulting array of request documents is returned in the response under the response key. If any errors occur during the process, a 500 status with an error message is returned.

# GetGroups
## Method:
-	HTTP POST
## Endpoint:
-	/api/getGroups
## Parameters:
-	username (string): The username of the user whose groups are being retrieved.
## Return Values:
-	Missing parameters:
    -	{ "error": "Missing username" }
-	Success:
    -	{ "groups": [ "groupId1", "groupId2", ... ] }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works:
The endpoint first checks that the username parameter is provided in the request body. It then connects to the database and looks up the user document in the users collection. From the user document, it retrieves the list of groups the user belongs to. For each group, it queries the groups collection to verify that the user is not banned from that group. Only groups where the user is not banned are included in the response. The filtered list of group IDs is returned as the groups array in the response.


# getRecentMessages:
## Method:
-   HTTP POST
## Endpoint:
-   /api/getRecentMessages
## Parameters:
-   channel (object): The channel object containing at least the _id field representing the channel ID.
-   group (string): The ID of the group associated with the messages.
## Return Values:
-   Missing or invalid parameters:

    -   { "error": "Missing or invalid channel or group" }
-   Success:
    -   [
        {
            "_id": "mongoId",
            "channel": "channelId",
            "group": "groupId",
            "username": "username",
            "msg": "text",
            "timeStamp": "timestamp",
            "profileImage": "profile_image_url_or_null"
        },
        ...
        ]
-   Internal server error:
    -   { "error": "Internal server error" } (response status 500)
## How It Works:
The endpoint connects to the database and retrieves the last 5 messages for the provided channel._id and group ID, sorted by timestamp in descending order. It extracts the unique usernames from these messages and queries the users collection to fetch their profile images. The messages are then augmented with the corresponding user’s profile image (or null if none exists) before being returned in the response.

# Get User Requests:
## Method:
-	HTTP GET
## Endpoint:
-	/api/getRequests
## Parameters:
-	None (Data is fetched from the file accountRequests.txt).
## Return Values:
-	Success:
    -	{ "requests": [ /* array of account request objects */ ] }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works:
The endpoint connects to the MongoDB database and queries the accountRequests collection to retrieve all stored account request documents. These requests are returned as an array under the requests key in the JSON response. If any error occurs during the process, a 500 status code is returned with an appropriate error message.


# Join Channels:
## Method:
-	HTTP POST
## Endpoint:
-	/api/joinChannel
## Parameters:
-	username (string): The username of the user attempting to join the channel.
-	newChannel (string): The name of the channel the user is attempting to join.
## Return Values:
-	User is valid to join the channel:
    -	{ "valid": true }
-	User is not allowed to join the channel (e.g., user is banned or the channel doesn't exist):
    -	{ "valid": false }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works:
The endpoint checks whether the username and newChannel object are provided in the request body. It connects to the MongoDB database and looks for the specified channel in the channels collection using the channel’s _id. If the channel is found, it checks whether the user is banned from the channel. If the user is not banned, the endpoint verifies if the user is already a member of the channel. If not, the user is added to the channel’s members list, and the channel document is updated in the database. Finally, the endpoint responds with a valid status indicating whether the user was successfully added to the channel.


# Kick user channel:
## Method:
-	HTTP POST
## Endpoint:
-	/api/kickUserChannel
## Parameters:
-	id (string): The username of the user being removed from the channel.
-	currentChannel (string): The name of the channel from which the user will be removed.
## Return Values:
-	User not found:
    -	{ "error": "User not found" }
-	Success (user removed):
    -	{ "success": true, "message": "User removed from channel" }
-	Cannot remove a super admin:
    -	{ "error": "cannot remove a super admin" }
-	Channel not found:
    -	{ "success": false, "message": "Channel not found" }
-	User is not a member of the channel:
    -	{ "success": false, "message": "User is not a member of the channel" }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works:
The endpoint first checks if the username and currentChannel parameters are provided. It then connects to the MongoDB database and queries the users collection to fetch the user document corresponding to the provided username. If the user is a superAdmin, they cannot be removed from the channel, and an error message is returned. The endpoint then fetches the channel document using the currentChannel name. If the channel exists, it checks whether the user is a member of the channel. If the user is found in the channel’s members list, they are removed, and the channel document is updated in the database. Finally, the response indicates whether the operation was successful, with a message explaining the result.

# Kick the user from a group:
## Method:
-	HTTP POST
## Endpoint:
-	/api/kickUserGroups
## Parameters:
-	id (string): The username of the user being removed from the group.
-	currentGroup (string): The ID of the group from which the user will be removed.
## Return Values:
-	Success (user removed):
    -	{ "success": true }
-	Group not found:
    -	{ "success": false, "message": "Group not found" }
-	User is not a member of the group:
    -	{ "success": false, "message": "User is not a member of the group" }
-	User not found in users collection:
    -	{ "success": false, "message": "User not found in users collection" }
-	Cannot remove a super admin:
    -	{ "error": "Cannot remove a super admin" }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works:
The endpoint checks if the group exists and if the user is a member. If the user is not a member, it returns an error. If the user is a super admin, they cannot be removed, and an error is returned. Otherwise, the user is removed from the group’s members and the group is removed from the user's groups. The operation is successful if no errors occur.


# Leave group:

## Method:
-	HTTP POST
## Endpoint:
-	/api/leaveGroup
## Parameters:
-	id (string): The username of the user to be banned from the group.
-	currentGroup (string): The ID of the group from which the user will be banned.
## Return Values:
-	Missing username or group ID:
    -	{ "success": false, "message": "Missing username or groupId" }
-	User not found:
    -	{ "success": false, "message": "User not found" }
-	Admins cannot leave groups:
    -	{ "success": false, "message": "Admins cannot leave groups" }
-	Group not found:
    -	{ "success": false, "message": "Group not found" }
-	User not found in group members:
    -	{ "success": false, "message": "User not found in group members" }
-	Group not found in user's groups:
    -	{ "success": false, "message": "Group not found in user's groups" }
-	Success (user successfully left the group):
    -	{ "success": true, "message": "User left successfully" }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works 
The endpoint checks if the name (username) and groupId are provided. It then connects to the database and checks if the user exists. If the user is an admin or super admin, they cannot leave the group. If the group exists, the user is removed from the group's members array and the group is removed from the user's groups array. If everything is successful, the user leaves the group, and the operation is confirmed with a success message.

# Promote user to super admin:
## Method:
-	POST
## Endpoint:
-	/api/promoteSuperAdmin
## Parameters:
-	username (string): The username of the user who will be assigned the "superAdmin" role.
## Return Values:
-	Missing username:
    -	{ "success": false, "message": "User not found" }
-	Success (User updated as super admin and added to all groups and channels):
    -	{ "success": true, "message": "User "username" is now a superAdmin, added to all groups and channels, and updated their groups array" }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works
The endpoint checks if the provided username exists. If the user is not already a super admin, they are added to the roles array with the "superAdmin" role. The user is then added to all groups and channels by updating their members array. Additionally, the user's groups array is updated with all the group IDs the user is now a part of. If successful, a success message is returned.


# Promote user:
## Method:
-	POST
## Endpoint:
-	/api/promoteUser
## Parameters:
-	id (string): The ID of the user to be promoted to admin.
-	currentGroup (string or number): The ID of the group in which the user will be promoted to admin.
## Return Values:
-	Missing group or user:
    -	{ "success": false, "message": "Group not found" }
-	User not a member of the group:
    -	{ "success": false, "message": "User is not a member of the group" }
-	User already an admin:
    -	{ "success": false, "message": "User is already an admin" }
-	Success:
    -	{ "success": true }
-	User not found in users collection:
    -	{ "success": false, "message": "User not found in users collection" }
-	Internal server error:
    -	{ "error": "Internal server error" }
## How it works:
This route promotes a user to an admin within a specified group. It first checks if the user is a member of the group. If they are not, it returns a "User is not a member" message. If the user is already an admin, it returns a "User is already an admin" message. If the user meets the conditions, the function adds the user to the admins array in the group and updates their roles array in the users collection to include "admin". If any error occurs during the process, an appropriate error message is returned.


# sendMessage:
## Method:
-   POST

## Endpoint:
-   /api/sendMessage
## Parameters:
-   msg (object): The message details. (username, msg, image)
-   channel (string): The ID of the channel where the message will be posted.
-   group (string): The group ID the channel belongs to.

## Return Values:

-   Missing or invalid channel:
    -   { "error": "Unknown Channel" }
-   Success:
    -   { "success": true, "message": "Message inserted", "data": { username:"username", "image": "image", "channel": "channel", "group": "group", "timeStamp": "current time"} }
-   Internal server error:
    -   { "error": "Internal server error" }

## How It Works:
This route sends a message to a specified channel within a group. It first checks if the channel exists; if not, an error is returned. Then, it inserts the message into the database with the sender’s username, message content, and timestamp. On success, it returns a confirmation with the message details.


# Angular Architecture:
## Components Directory (/app/components):
- /chat/
  -	chat.html: The HTML template for the chat component
  -	chat.ts: the typescript file for the logic and behaviour of the chat component
-	/create/
  -	create.html: The HTML template for the Create component.
  -	create.ts: the typescript file for the logic of the create component
-	/createGroups/
  -	createGroups.html: The HTML template for the createGroups component.
  -	createGroups.ts: the typescript file for the logic of the create component
-	/deleteUser/
  -	deleteUser.html: The HTML template for the deleteUser component.
  -	deleteUser.ts: the typescript file for the logic of the deleteUser component
-	/joinGrous/
  -	joinGrous.html: The HTML template for the joinGrous component.
  -	joinGrous.ts: the typescript file for the logic of the joinGrous component
-	/login/
  -	login.html: The HTML template for the login component.
  -	login.ts: the typescript file for the logic of the login component
-	/requests/
  -	requests.html: The HTML template for the requests component.
  -	requests.ts: the typescript file for the logic of the requests component

## Services Directory (/services)
-	/sockets/
  -	sockets.spec.ts
  -	sockets.ts
## Main Module File:
- app-module.ts: the root module where components and services are declared and imported 
- app-routing-module.ts: defines all the routes to navigate to each component
- app.ts: the typescript file for app.html
- app.html: the main html file where everything is displayed
# Angular Architecture:
## Components Directory (/app/components):
-   /chat/:
    -   chat.html: HTML template for the chat component.
    -   chat.ts: TypeScript file for the chat component's logic and behavior.
    -   chat.css: CSS file for styling the chat page.
    -   This component allows users to chat in groups and channels, join video calls, and upload images. It utilizes:
        -   Socket Service for sending messages and images.
        -   Image Upload Service to upload images and send URLs.
        -   Video Service to create a Peer object for video calls.
-   /create/:
    -  create.html: HTML template for the Create component.
    -  create.ts: TypeScript file for logic.
    -  create.spec.ts: TypeScript file for testing the Create component.
    - Allows users to create account join requests.
-   /createGroups/:
    -   createGroups.html: HTML template.
    -   createGroups.ts: TypeScript logic.
    -   createGroups.spec.ts: TypeScript file for testing the Create Group component.
    -   This admin-only component enables admins to create new groups with a base channel.
-   /deleteUser/:
    -   deleteUser.html: HTML template.
    -   deleteUser.ts: TypeScript logic.
    -   deleteUser.spec.ts: TypeScript file for testing the Delete User component.
    -   Allows regular users to delete their accounts and admins to forcefully remove users (not available to regular users).
-   /joinGroups/:
    -   joinGroups.html: HTML template.
    -   joinGroups.ts: TypeScript logic.
    -   joinGroups.spec.ts: TypeScript file for testing the Join Groups component.
    -   Enables users to request joining a group.
-   /login/:
    -   login.html: HTML template.
    -   login.ts: TypeScript logic.
    -   login.spec.ts: TypeScript file for testing the Login component.
    -   Allows users to log in using their username and password.
-   /requests/:
    -   requests.html: HTML template.
    -   requests.ts: TypeScript logic.
    -   Admin-only page for approving or denying user account creation requests and promoting users to super admin.
-   /editProfile/:
    -   editProfile.html: HTML template.
    -   editProfile.ts: TypeScript logic.
    -   editProfile.spec.ts: TypeScript file for testing the Edit Profile component.
    -   Allows users to upload a new profile picture using the Image Upload Service.
    

    
Services Directory (/services)
-   /sockets/
    -	sockets.spec.ts
    -	sockets.ts
    -   Functionality:
        -   Allows users to join and leave rooms (channels).
        -   Handles sending and saving messages.
        -   Displays messages sent to the channel (room)
        -   Facilitates users joining and leaving video calls.
-   /video/
    -   video.ts: Contains the logic for the Call service.
        -   Functionality:
            -   Peer Management: Creates and manages a peer connection using PeerJS for real-time communication.
            -   Local Stream: Captures the user's audio and video stream for use in video calls.
            -   Call Handling: Allows users to call and answer calls with a peer.
            -   Peer Communication: Establishes and maintains media connections with remote peers for video and audio communication.
            -   Call Cleanup: Handles cleaning up media connections when the call is finished.
-   /imgupload/
    -   imgupload.spec.ts: Unit tests for the ImgUpload service.
    -   imgupload.ts: Contains the logic for uploading images.
    -   Functionality:
        -   Image Upload: Sends image files (as FormData) to the server for processing and storage via an HTTP POST request to the server's /api/upload endpoint.
## Main Module File:
    - app-module.ts: the root module where components and services are declared and imported 
    - app-routing-module.ts: defines all the routes to navigate to each component
    - app.ts: the typescript file for app.html
    - app.html: the main html file where everything is displayed

## Version controll 
For version control, I used Git and GitHub, committing frequently after significant changes such as adding features or fixing bugs. Each commit included a message detailing the changes, additions, or the specific bug being addressed.

## Layout
The repo is structured as follows:

-   Assignment is the root directory, containing Cypress tests, the server, and the Angular frontend.

-   Cypress tests are located in Assignment/cypress/e2e, with support files in Assignment/cypress/e2e/support (e.g., login, logout, create group, create user).

    -   The main test is in testFile.spec.ts in Assignment/cypress/e2e to ensure tests run in the necessary order.

-   Server: The server resides in Assignment/server, with routes in Assignment/server/routes and integration tests in Assignment/server/integrationTests.

    -   The server directory also includes:

        -   Assignment/server/seeder for adding an initial superuser to the database.

        -   Assignment/server/server to start the Express server, along with the command peerjs --port 3001 --path /peerjs to run the PeerJS server for video calls.

-   Angular frontend is primarily in the src directory, housing components, models, and services:

-   Components are in Assignment/src/app/components/{component name}, each with an HTML, TS, and CSS file (for chat) and tests (spec.ts).

-   Services are under Assignment/src/app/services, containing directories for the video service (video), socket service (sockets), and image upload service (imgUpload), each with a TS file and the sockets service including a spec.ts for testing.