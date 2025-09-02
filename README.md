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
