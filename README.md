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
## How It Works:
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
## How it works
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

## How It Works:
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
# Create channel:
## Method:
•	HTTP POST
## Endpoint:
•	/api/createChannel
## Parameters:
•	groupId (string): The ID of the group where the channel will be created.
•	name (string): The name of the new channel.
•	members (string): the username of the user creating the channel
Return Values:
1.	Missing required fields (groupId, name, members):
    - {  "error": "Missing required fields: groupId, name, members" }
2.	Internal server errors (reading groups file):
    - {  "error": "Internal server error (groups)" }
3.	Error parsing groups file:
    - {  "error": "Corrupted groups data" }
4.	Group not found:
    - {  "error": "Group not found" }
5.	Internal server errors (reading channels file):
    - {  "error": "Internal server error (channels)" }
6.	Error parsing channels file:
    - {  "error": "Corrupted channels data" }
7.	Failed to write channels file:
    - {  "error": "Failed to write channels file" }
On Success:
    - {  valid: true, channelId: channelData.id }
## How It Works:
1.	Make the channels object:
    - Create a json object called channelData that contains a base id of 0 the given groupId, the given channel name, an array for admins that starts with the creator of the channel, an empty array for banned members, and a members array with the creator as the channel member.
2.	Read the groups file 
    - Read and parse the groups.txt file
3.	Check if the group exists
    - Check the groups file for the group we are trying to add the channel to
4.	Read the channels file 
    - Read and parse the channels file
5.	Find the highest ID in the channels file
    - Search the channels file for the channel with the highest ID then set that id +1 as the new channels id
6.	Add the channel
    - Add the channel to the channels file
7.	Return Success:
    - {  valid: true, channelId: channelData.id }

# Create Groups:
## Method:
•	HTTP POST
## Endpoint:
•	/api/createGroup
## Parameters:
•	groupId (string): The ID of the group being created (auto-generated).
•	channels (string): An array of channels for the group (at least one channel should be specified).
•	members (array of strings): An array containing the username of the group creator (the first user will be the admin and only member at first).
## Return Values:
1.	Error reading file:
    - {  "error": "Internal server error (file)" }
2.	Corrupted file:
    - {  "error": "Corrupted (file) data" }
3.	Failed to write to file:
    - {  "error": "Failed to write (file) file" }
4.	User not found in users.txt:
    - {  "success": false, "message": "User not found" }
On Success:
    - {  valid: true, groupId: groupData.id }
	
## How It Works:
1.	Creates a groupData object:
    - Creates a groupData object with a base id of 0 a base channel array with the channel passed to it as an element, makes an admin array with the creator as its element same with a members array, and a banned array that is empty
2.	Reads groups file
    - Reads and parses the groups file
3.	Find the new groupId
    - Finds the highest group id and adds 1 for the new group is
4.	Updates groups file
    - Updates changes to the groups file
5.	Reads users file
    - Read and parses the user file
6.	Finds the user 
    - Find the user in the file
7.	Updates user file 
    - Updates the user file to include the creator as a member of the group
8.	Repeats create channel API
    - Creates the base channel given the new channel name and new group Id. The same as what the createChannels API does
9.	Returns Success:
    - Returns: { valid: true, groupId: groupData.id }
# Create Group Join Request;
## Method:
•	HTTP POST
## Endpoint:
•	/api/createGroupJoinRequest
## Parameters:
•	username (string): The username of the user requesting to join a group.
•	groupId (string): The ID of the group the user wants to join.
## Return Values:
1.	Error reading file:
    - {  "error": "Internal server error (file)" }
2.	Corrupted file:
    - {  "error": "Corrupted (file) data" }
3.	Error writing to file:
    - {  "error": "Failed to update (file) file" }
4.	Request already exists:
    - {  valid: false}

5.	On Success: 
    - {  valid: true }

## How It Works:
1.	Create user object
    - Creates a user object with username and the passed username, groupId as the passed groupID, status as “pending”, permission as “user” and the need as “Join Permission” 
2.	Read requests file
    - Reads and parses the request file
3.	Checks the request already exists
    - Checks if the user is already in the group by checking the username against the members array of the group
4.	Updates file
    - Updates the request file with the request

# Create User Request:
## Method:
•	HTTP POST
## Endpoint:
•	/api/create
## Parameters:
•	username (string): The username of the user requesting to register.
•	email (string): The email address of the user requesting to register.
•	password (string): The password of the user requesting to register.
## Return Values:
Error Scenarios:
1.	Error reading file:
    - {  "error": "Internal server error (file)" }
2.	Corrupted file:
    - {  "error": "Corrupted (file) data" }
3.	Error reading file:
    - {  "error": "Internal server error (file)" }
4.	If the username exists:
    - {  valid: false }
5.	If the username is already requested:
    - {  valid: false }
6.	On Success:
    - {  valid: true }
## How It Works:
1.	Crates user object
    - Creates a user object with a null id, username as the passed username, email as the passed email, password as the passed password, roles as an empty array, and groups as an empty array
2.	Reads the users file
    - Reads and parses the users file
3.	Checks if the username exists
    - Checks if the username exists in users file and returns { valid: false } if it is
4.	Find the highest user id
    - Find the highest id in the users file the update the currently null id
5.	Creates request object
    - Creates a request object with username, email, and password as the passed values
6.	Read request file
    - Reads and parses the request file
7.	Check if the username is already requested
    - Checks if the username is already in the requests file and returns { valid: false } if it is
8.	Update requests file
    - Updates the requests file
9.	On success:
    - { valid: true }

# Decline
## Method:
•	HTTP POST
## Endpoint:
•	/api/decline
## Parameters:
•	username (string): The username of the user whose request is being declined.
•	file (string): Specifies whether the request is related to a group (groupRequests) or account (accountRequests).
## Return Values:
1.	Error reading request file:
    - {  "error": "Internal server error (requests)" }
2.	Corrupted requests data (unable to parse file):
    - {  "error": "Corrupted requests data" }
3.	Error writing to request file:
    - {  "error": "Failed to update requests file" }
## How It Works:
1.	create user object:
    - creates a user object with username and file as keys with the values of the same name being passed to the API
2.	read request file
    - reads and parses the request file
3.	finds the request in the request file
    - Searches the requests file until the username matches and removes it from the file
4.	updates the request file
    - write the updates to requested the file

# Delete Channel:

## Method:
•	HTTP POST
## Endpoint:
•	/api/deleteChannel
## Parameters:
•	groupId (string): The ID of the group from which the channel is being deleted.
•	channel (string): The name or ID of the channel to be deleted.
## Return Values:
1.	Error reading the file:
    - {  "error": "Internal server error (file)" }
2.	Corrupted file data:
    - {  "error": "Corrupted (file) data" }
3.	Group not found:
    - {  "error": "Group not found" }
4.	Error writing to the groups file:
    - {  "error": "Failed to update groups" }
5.	Channel not found in channels file:
    - {  "error": "Channel not found" }
6.	On success:
    - {  valid: true }

## How it works:
1.	Reads the groups file:
    - Reads and parses the groups file
2.	Checks the group exists:
    - Checks the groups file for the groupId
3.	Removes the channel
    - Removes the channel from the groups channels array
4.	Updates the groups file
    - Saves the changes to the groups channels array to the groups file
5.	Reads the channels file
    - Reads and parses the channels file
6.	Find the channel 
    - Finds the channel in the channels file
7.	Deletes the channel
    - Removes the channel from the file
8.	Updates the channels file
    - Updates the channels file with the missing channel

# Delete Groups:
## Method:
•	HTTP POST
## Endpoint:
•	/api/deleteGroups
## Parameters:
•	groupId (string): The ID of the group to be deleted.
## Return Values:
1.	Error reading the file:
    - {  "error": "Internal server error (file)" }
2.	Corrupted file data 
    - {  "error": "Corrupted (file) data" }
3.	Group not found:
    - {  "success": false, "message": "Group not found" }
4.	Error writing to the file:
    - {  "error": "Failed to update (file) " }
5.	On Success:
    - {  success: true }
## How it works:
1.	Reads the groups file
    - Reads and parses the groups file
2.	Finds the group 
    - Find the group in the groups file
3.	Removes the group
    - Removes the group from the groups file
4.	Update the groups file
    - Updates the new groups file
5.	Read the channels file
    - Reads and parses the channels file
6.	Remove the channels
    - Searches the channels file for all channels related to the group and deletes them
7.	Update the channels file
    - Save the new channels file
8.	Read the users file
    - Reads and parses the users file
9.	Remove the group for all users in the group
    - Remove the group from the groups array from all users in the group
10.	 Return success:
    - { success: true }

# Delete User:
## Method:
•	HTTP POST
## Endpoint:
•	/api/delete
## Parameters:
•	username (string): The username of the user to be deleted.
## Return Values:
1.	Error reading the file:
    - {  "error": "Internal server error (file)" }
2.	Corrupted file data:
    - {  "error": "Corrupted (file) data" }
3.	User not found:
    - {  "success": false, "message": "User not found" }
4.	Error writing to the file:
    - {  "error": "Failed to update (file)" }
5.	On success:
    - {  "error": "Failed to update users.txt" }
## How it Works:
1.	Read users file
    - Read and parse the users file
2.	Finds the user and removes
    - Finds the user index in the users file and removes them
3.	Reads the groups file 
    - Read and parse the groups file
4.	Remove user from groups they are in
    - Checks all groups in the groups file and removes the user from the members array of each group
5.	Update users file 
    - Update the new users file
6.	Update groups file
    - Update the new groups file

# getAdmin:
## Method:
•	HTTP POST
## Endpoint:
•	/api/getAdmin
## Parameters:
•	id (string): The ID of the group.
•	username (string): The username of the user whose admin status is being checked.
## Return Values:
1.	Error reading the file:
    - {  "error": "Internal server error (file)" }
2.	Corrupted file data:
    - {  "error": "Corrupted (file) data" }
3.	On success:
    - {  isAdmin, isSuperAdmin }

## How It works:
1.	Read groups 
    - Read and parse the group file
2.	Instantiate variables
    - Instantiate the isAdmin and isSuperAdmin variables
3.	Check if the use is a group admin
    - Find the group and check the groups admins array for the username if it is found set isAdmin to true
4.	Read users file 
    - Read and parse the users file
5.	Check if the user is a super admin
    - Find the user and check if the users roles array includes ‘superAdmin’ if it does set isSuperAdmin to true
6.	On Success:
    - return: { isAdmin, isSuperAdmin }

# getChannels
## Method:
•	HTTP POST
## Endpoint:
•	/api/getChannels
## Parameters:
•	id (string): The ID of the group whose channels are being checked.
•	username (string): The username of the user whose allowed channels are being fetched.
Return Values:
1.	Error reading the file:
    - {  "error": "Internal server error (file)" }
2.	Corrupted file data:
    - {  "error": "Corrupted (file) data" }
3.	On Success:
## How It Works:
1.	Read groups file 
    - Read and parse the groups file
2.	Find the group
    - Find the group and gets is members and channels
3.	Read the channels file
    - Read and parse the channels file
4.	Find channels in channel file
    - For all channels in the groups channels array find them in the channels file
5.	Check if banned
    - Check if the user is banned from the current channel if they are add them to the banned channels array
6.	Add the channel
    - Check if the user is a member of the channel and not banned if they aren’t banned and are a member add the channel to the allowed channel array.
7.	On success
    - Return: { channels: allowedChannels, members }

# GetGroupRequests:
## Method:
•	HTTP POST
## Endpoint:
•	/api/getGroupRequests
## Parameters:
•	groupId (string): The ID of the group for which the requests are being fetched.
## Return Values:
1.	Error reading the requests.txt file:
    - {  "error": "Internal server error (requests)" }
2.	Corrupted data (unable to parse requests.txt):
    - {  "error": "Corrupted requests data" }
3.	On Success: 
    - {  response: response }
## How it works:
1.	Read the requests file:
    - Read and parse the groups requests file
2.	Get all requests with the group idL
    - Get all requests from the requests file given the passed groupId
3.	On success:
    - On success return all the requests { response: response }

# GetGroups
## Method:
•	HTTP POST
## Endpoint:
•	/api/getGroups
## Parameters:
•	username (string): The username of the user whose groups are being retrieved.
## Return Values:
1.	Error reading the users.txt file:
    - {  "error": "Internal server error (users)" }
2.	Corrupted data (unable to parse users.txt):
    - {  "error": "Corrupted users data" }
3.	On Success:
    - {  groups: groups }
## How it works:
1.	Read the users file:
    - Read and parse the users file
2.	Find the user:
    - Find the user in the groups file and get its groups array
3.	On Success:
    - Return the users groups array { groups: groups }

# Get User Requests:
## Method:
•	HTTP GET
## Endpoint:
•	/api/getRequests
## Parameters:
•	None (Data is fetched from the file accountRequests.txt).
## Return Values:
1.	Error reading the accountRequests.txt file:
    - {  "error": "Internal server error (requests)" }
2.	Corrupted data (unable to parse accountRequests.txt):
    - {  "error": "Corrupted requests data" }
3.	On Success:
     - {  requests }
## How it works:
1.	Reads the request file
    - Reads the user requests file and returns it { requests }


# Join Channels:
## Method:
•	HTTP POST
## Endpoint:
•	/api/joinChannel
## Parameters:
•	username (string): The username of the user attempting to join the channel.
•	newChannel (string): The name of the channel the user is attempting to join.
## Return Values:
1.	Error Scenarios:
2.	Error reading the channels.txt file:
    - {  “error”: “Internal server error (channels)” }
3.	Error parsing the channels.txt file:
    - {  “error”: “Corrupted channels data” }
4.	Channel not found:
    - {  “valid”: false, }
5.	User is banned from the channel:
    - {  “valid”: false }
6.	Error writing to the channels.txt file:
    - {  “error”: “Failed to update channels” }
7.	On Success:
    - {  valid: true }
## How it works:
1.	Read the channels file:
    - Read and parse the channels file 
2.	Find the channel:
    - Find the channel in the channels file then check if the user is banned from the channel. If they are return the corresponding error. If they aren’t check if they are already a member of the channel if they aren’t add them to the channel. If they are return the corresponding error.
3.	Update channels file
    - Update the channels file

# Kick user channel:
## Method:
•	HTTP POST
## Endpoint:
•	/api/kickUserChannel
## Parameters:
•	id (string): The username of the user being removed from the channel.
•	currentChannel (string): The name of the channel from which the user will be removed.
## Return Values:
1.	Error reading the file:
    - {  "error": "Internal server error (file)" }
2.	Error parsing file data:
    - {  "error": "Corrupted (file) data" }
3.	Super Admin cannot be removed:
    - {  "error": "cannot remove a super admin" }
4.	Channel not found:
    - {  "success": false, "message": "Channel not found for the group" }
5.	User is not a member of the channel:
    - {  "success": false, "message": "User is not a member of the channel" }
6.	Error writing to the channels.txt file:
    - {  "error": "Failed to update channels" }
## How it works:
1.	Read the users file
    - Read and parse the users file
2.	Check if the user is a super admin
    - Find the user in the users file using id and check if their roles include ‘superAdmin’ if they do return the corresponding error
3.	Read the channels file 
    - Read and parse the channels file
4.	Find the channel
    - Find the channel in the channels file and remove the user from the channel if the channel exists and the user is a member of the channel if not return the corresponding errors
5.	Update the channels file
     - Write the updates to the channels file

# Kick the user from a group:
## Method:
•	HTTP POST
## Endpoint:
•	/api/kickUserGroups
## Parameters:
•	id (string): The username of the user being removed from the group.
•	currentGroup (string): The ID of the group from which the user will be removed.
## Return Values:
1.	Error reading file:
    - {  "error": "Internal server error (file)" }
2.	Error parsing file data:
    - {  "error": "Corrupted (file) data" }
3.	Group not found:
    - {  "success": false, "message": "Group not found" }
4.	User not found in the group's members list:
    - {  "success": false, "message": "User is not a member of the group" }
5.	Super Admin cannot be removed:
    - {  "error": "cannot remove a super admin" }
6.	User not found in the users file:
    - {  "success": false, "message": "User not found in users file" }
7.	Error writing to file:
    - {  "error": "Failed to update (file)" }
8.	On Success:
    - {  success: true }
## How it works:
1.	Read the groups file
    - Read the groups file
2.	Remove the user from the group
    - Check the group exists, check if the user is in the groups members array, if they don’t exit or aren’t a member send an error if they do remove the user from the group
3.	Read the users file
    - Read and parse the users file
4.	Check the user isn’t a super admin
    - Check the users roles array for the ‘superAdmin’ role if they are one return an error if they aren’t remove group from the users groups array
5.	Update the files
    - Write the updates to both users and groups files


# Leave group:

## Method:
•	HTTP POST
## Endpoint:
•	/api/leaveGroup
## Parameters:
•	id (string): The username of the user to be banned from the group.
•	currentGroup (string): The ID of the group from which the user will be banned.
## Return Values:
1.	Error reading the file:
    - {  "error": "Internal server error (file)" }
2.	Error parsing file data:
    - {  "error": "Corrupted (file) data" }
3.	Group not found:
    - {  "success": false, "message": "Group not found" }
4.	Error writing to the file:
    - {  "error": "Failed to update (file)" }
5.	On Success:
    - {  success: true }
## How it works 
1.	Read the groups file
    - Read and parse the groups file
2.	Check if the group exists
    - Check if the group exists if it does remove the user from the groups members array 
3.	Update the groups file
    - Update the new groups file
4.	Read the users file
    - Read and parse the users file
5.	Remove group from user
    - Remove the groupId from the users groups array
6.	Update user file
    - Write the updates to the users file

# Promote user to super admin:
## Method:
•	POST
## Endpoint:
•	/api/promoteSuperAdmin
## Parameters:
•	username (string): The username of the user who will be assigned the "superAdmin" role.
## Return Values:
1.	Error reading users.txt:
    - {  "error": "Internal server error (users)" }
2.	Error parsing users.txt:
    - {  "error": "Corrupted users data" }
3.	User not found:
    - {  "success": false, "message": "User not found in users file" }
4.	Error writing to users.txt:
    - {  "error": "Failed to update users" }
5.	On Success:
    - {  success: true }
## How it works
1.	Read the users file
    - Read and parse the users file
2.	Find the user
    - Find the user in the users file and edit their roles array to include ‘superAdmin’
3.	Update the users file
    - Write the new users file


# Promote user:
## Method:
•	POST
## Endpoint:
•	/api/promoteUser
## Parameters:
•	id (string): The ID of the user to be promoted to admin.
•	currentGroup (string or number): The ID of the group in which the user will be promoted to admin.
## Return Values:
1.	Error reading the file:
    - {  "error": "Internal server error (file)" }
2.	Error parsing file data:
    - {  "error": "Corrupted (file) data" }
3.	Group Not Found:
    - {  "success": false, "message": "Group not found" }
4.	User Not Found in Group:
    - {  "success": false, "message": "User is not a member of the group" }
5.	User Already an Admin:
    - {  "success": false, "message": "User is already an admin" }
    - {  "error": "Corrupted users data" }
6.	User Not Found in Users File:
    - {  "success": false, "message": "User not found in users file" }
7.	Error Writing to the file:
    - {  "error": "Failed to update (file)" }
8.	On Success:
    - {  success: true }
## How it works:
1.	Read the groups file
    - Read and parse the groups fie
2.	Find the group
    - Find the group in the groups file return an error if it isn’t found
3.	Promote the user
    - Add the user to the groups admins array, if the user isn’t already an admin if they are return an error
4.	Read the users file
    - Read and parse the users file
5.	Update the users roles
    - Update the users roles array to include the admin role
6.	Update both files
    - Write the updates to both files.









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

