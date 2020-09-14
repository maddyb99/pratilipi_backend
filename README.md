# REST API for Pratilipi challenge

This API is hosted at [API url](https://us-central1-pratilipi.cloudfunctions.net/webAppV1/api/v1). 

It uses Firestore for storing Data, Firebase Auth for authentication and Firebase Cloud Messaging to send updates to clients.

The use of this API is restricted using an API key, the details of which are in the drive link shared with Pratilipi.

This API has several end points which are being used to perform the given task.

My laptop broke so I did not have enough time to complete the UI but the intended flow is as followed:

1. Client app uses Firebase Auth to authenticate
2. Asynchronously, client app will initialize FCM to listen for notifications
3. (Depreciated) client app will update notification token using the `/notif` endpoint
4. Client app POSTs basic user details to `/user` endpoint
5. Client app can POST, GET, PATCH, DELETE `/post` endpoint for adding/deleting/updating or viewing posts
6. On opening a post, the client will subscribe to the topic `$postId` via FCM for realtime view count updates
7. On closing the app, the client will unsubscribe from the topic `$postId` to prevent unnecessary bandwidth usage and unnecessary notifications sent from server.

The API part of this can be tested by requesting the endpoints as described below: 


## Authentication/Sign In

Authentication is being done using Firebase Auth on the client side and the User Details are then stored in the database using the following endpint

### /user

#### Post

req:
```json
header: {
  "Authorization": "<API-KEY>"
}
body: {
  "uid": "<UID from firebase auth>",
  "name": "<Name of user>",
  "mobile": "<Mobile Number>",
  "profilePic": "<Link to profile Picture>"
}
```

res:

```
201 : `Created a new user: ${user_object}`
400 : `User should only contains firstName, lastName and email!`
```

#### Delete

req:
```json
header: {
  "Authorization": "<API-KEY>"
}
params: {
  "userId": "<UID from firebase auth>"
}
```

res:

```
204 : `User is deleted: ${deletedUser}`
400 : `Error: ${error}`
```

## Posts Endpoint

This endpoint is used to add, modify, view or delete posts.

When a new user requests to view a post, all subscribers of the topic `$postId` are notified about the change in the total count and client updates the page accordingly.

### /post

#### Post

req:
```json
header: {
  "Authorization": "<API-KEY>"
}
body: {
  "uid": "<UID from firebase auth>",
  "author": "<Name of user>",
  "title": "<Title of post>",
  "content": "<Content of post>"
}
```

res:

```
201 : `Post is deleted: ${deletedPost}`
400 : `Error: ${error}`
```

#### Delete

req:
```json
header: {
  "Authorization": "<API-KEY>"
}
params: {
  "postId": "<postID from creation>"
}
```

res:

```
204 : `Created a new user: ${post_object}`
400 : `Error: ${error}`
```

## Notification Endpoint (Depreciated)

This endpoint updates the FCM Token generated for each user. This could then be used to notify a client about changes in reader count. 

This was particularly useful as I was saving the storyId currently being viewed by user and therefore only a subset of users would recieve data.
But, I stoped using selective notification as it was time intensive to check for users reading the post in favour of topics.

So, each user, when opening the post, would automatically subscribed(client side) to the topic `$postId` on opening it and any changes in that post would be sent to them(server sends). On closing the post, the user will be unsubscribed automatically(client side).
### /notif

#### Post

req:
```json
header: {
  "Authorization": "<API-KEY>"
}
body: {
  "uid": "<UID from firebase auth>",
  "token": "<notification token from fcm>"
}
```

res:

```
201 : `added a new notification token`
400 : `Error updating token!`
```
