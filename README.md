# File formats:
All files are stored as JSON arrays with example below
## accountRequests.txt:
[
  {
    "username": " username ",
    "email": " email ",
    "password": " password "
  }
]
## Channels.txt:
[
  {
    "id": id,
    "groupId": “groupId “,
    "name": " name ",
    "admins": [
      "admin"
    ],
    "banned": [
      "bannedUser"
    ],
    "members": [
      "member"
    ]
  }
]

## groupRequests.txt:
[
  {
    "username": "username ",
    "groupId": "groupId",
    "status": " status ",
    "permission": "permission ",
    "need": "need”
  }
]
## Groups.txt
[
  {
    "id": id,
    "channels": [
      "channel"
    ],
    "admins": [
      "admin"
    ],
    "banned": [],
    "members": [
      " member"
    ]
  }
]


## Users.txt:
[
  {
    "id": id,
    "username": "username",
    "email": " email ",
    "password": " password ",
    "groups": [],
    "roles": [
      "user"
    ]
  }
]

# Accept group
## Method:
- HTTP POST
## Endpoint:
- /api/acceptGroup
## Parameters:
- username: string, Username of the user trying to join the group 
- groupId: string, ID of the group the user is requesting to join. This ID is passed as a string but will be parsed as an integer while searching for the group.

## Return Values:
- Internal server errors (e.g., file read/write issues or corrupted data):
    - { "error": "Internal server error (file)" }
- Error Parsing file:
    - { error: "Corrupted (file) data" }
- User not found:
    - { "error": "User not found" }
- User is banned:
    - { error: "User is banned and cannot join a group" }
- Group not found:
    - { "error": "Group not found" }
- User is already a member of the group:
    - { "error": "User is already a member of this group" }
- Failed to upload file:
    - { error: "Failed to update (filename) file" }
- On success:
    - { valid: true }
- How It Works:
1.	User Existence Check:
    - The system checks if the user exists in Users.txt. If the user does not exist, the appropriate error is returned
2.	Banned User Check:
    - If the user is found, the system then checks if the user is banned. If the user is banned, the appropriate error is returned
3.	Group Existence Check:
    - The system checks if the specified group exists in Groups.txt. If the group does not exist, the appropriate error is returned
4.	Group Membership Check:
    - The system checks if the user is already a member of the group. If the user is already a member, the appropriate error is returned
5.	Update Files
    - The user's name is added to the group's member list in Groups.txt
    - The group ID is added to the user's list of groups in Users.txt.
    - The user's group request is removed from groupRequests.txt.
6.	Return Success:
    - Once the files are updated successfully, the system returns:
      { "valid": true }.
# Accept Users:
## Method:
•	HTTP POST
## Endpoint:
•	/api/acceptUser
## Parameters:
•	username (string): The desired username for the new user.
•	email (string): The email address of the new user.
•	password (string): The password of the new user.
## Return Values:
- Internal server errors (reading file):
    - { "error": "Internal server error (file name)" }
- Error parsing file:
    - { "error": "Corrupted (file) data" }
- Request not found for user:
    - { "error": "Request not found" }
- Failed to update file:
    - { "error": "Failed to update (file name) file" }
- On success:
    - { valid: true, userId: user.id }
## How it Works:
1.	Create User Object:
    - The API receives the username, email, and password in the request body and initializes a new user object with these properties. It also has groups set as an empty array, roles as an array with an element “user”, and an ID of null
2.	Check for Existing Users:
    - The system reads the users.txt file to check if any users already exist. If there is an error reading or parsing the file, the appropriate error is returned
3.	Assign User ID:
    - The new user is assigned an ID based on the existing users in the users.txt file. If the file is empty, the new user receives an ID of 1. Otherwise, the user ID is one more than the last user's ID.
4.	Write New User to users.txt:
    - Once the user ID is assigned, the new user is added to the users.txt file.
5.	Remove User from Requests List:
    - After the user is added to users.txt, the API reads the accountRequests.txt file and searches for the corresponding request for the user. If the request is found, it is removed from the list.
6.	Update Requests File:
    - After the user request is removed, the accountRequests.txt file is updated.
7.	Return Success:
    - Once the files are updates successfully the API returns:
      { valid: true, userId: user.id }

# addChannnels:
## Method:
•	HTTP POST
## Endpoint:
•	/api/addChannel
## Parameters:
•	groupId (string): The ID of the group to which the channels should be added.
•	newChannels (string): the name of the new channel to add
Return Values:
1.	Internal server errors reading groups file:
    - { "error": "Internal server error groups" }
2.	Error parsing groups file:
    - { "error": "Corrupted groups data" }
3.	Group not found:
    - { "error": "Group not found" }
4.	Failed to update groups file:
    - { "error": "Failed to update groups" } 
5.	On Success:
    - { success: true, channels: group.channels }
## How it Works:
1.	Read groups file
    - The API reads the groups file and parses it
2.	Find the group
    - The API find the group in the parsed data
3.	Add new channel 
    - The new channel is pushed onto the groups channels array
4.	Update groups file
    - The updated groups file is written and returns
      { success: true, channels: group.channels }
# Auth:
## Method:
•	HTTP POST
## Endpoint:
•	/api/auth
## Parameters:
•	username (string): The username of the user attempting to log in.
•	password (string): The password of the user attempting to log in.
## Return values:
1.	Internal server errors reading users file: 
    - { error: "Internal server error (users)" }
2.	Error Parsing users file
    - { error: "Corrupted users data" }
3.	On Success:
-   res.json({ ...user, valid: true });
        example user: 
        {
        "id": 1,
        "username": "exampleUser",
        "email": "user@example.com",
        "groups": [],
        "roles": ["user"],
        "valid": true
        }
4.	Invalid login
    - { valid: false }
## How it works:
1.	Read users file:
    - Reads and parses the users file
2.	Check if the username and password are correct
    - Searches the users file as an array and checks if the username and password match any users
3.	Returns:
    - Either response with user data or valid = false for incorrect username or password

# banUser:
## Method:
•	HTTP POST
## Endpoint:
•	/api/ban
##Parameters:
•	id (string): The username of the user to be banned.
•	currentGroup (string): The ID of the group from which the user is to be banned.
## Return Values:
1.	Internal server errors (reading file):
    - { "error": "Internal server error (users)" }
2.	Error parsing file:
    - { "error": "Corrupted (file) data" }
3.	Group not found:
    - { "success": false, "message": "Group not found" }
4.	Super Admin cannot be banned:
    - {   "error": "cannot remove a super admin" }
5.	Failed to update file:
    - {  "error": "Failed to update (file)" }
6.	On Success:
    - {  success: true }
How it works
1.	Read users file:
Read and parse the users file
2.	Check if the user is a super admin:
Checks the users roles array for the ‘superAdmin’ role
3.	Remove group user from the group :
Find the user in the users file and removes the groupId from the users groups array 
4.	Read groups file:
Reads and parses the groups file
5.	Find and modify the group 
Find the group and remove the user from the groups members array
6.	Update files:
Write the updates data to the files
7.	Return success:
    - Return { success: true }

# BanUserChannel
## Method:
•	HTTP POST
## Endpoint:
•	/api/banUserChannel
## Parameters:
•	id (string): The username of the user to be banned from the channel.
•	currentGroup (string): The ID of the group whose channel the user is being banned from. Will be parsed as an integer when find the group
## Return Values:
1.	Internal server errors reading file:
    - {  "error": "Internal server error (file)" }
2.	Error parsing file:
    - {  "error": "Corrupted (file) data" }
3.	Channel not found for the group:
    - {  "success": false, "message": "Channel not found for the group" }
4.	Super Admin cannot be banned:
    - {  "error": "cannot remove a super admin" }
5.	Failed to update channels file:
    - {  "error": "Failed to update channels" }
6.	On Success:
    - {  success: true }

How It Works:
1.	Read users.txt:
    - Read the users.txt file and parse it
2.	Check if the user is a super admin:
    - Check the users roles array for the ‘superAdmin’ role
3.	Read channels.txt:
    - Read and parse channels.txt
4.	Find the right channel and modify it:
    - Find the right channel in the channels.txt file and remove the user from the members array
5.	Save data:
    - Update the users.txt file and the channels.txt file
6.	Return success:
    - Return: { success: true }
