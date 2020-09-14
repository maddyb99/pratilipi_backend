import * as express from "express";
import { db } from "./main";
// import { admin } from 'firebase-admin/lib/database';
// import * from admin
// import { apiKey } from './main';

class User {
  constructor(
    public name: String = "",
    public mobile: number = 0,
    public uid: string = "",
    public profilePic: String = ""
  ) {}
}

const userReqValidator = (arr: any[], target: any[]) =>
  arr.every((v) => target.includes(v)) && !("uid" in arr);
const userCollection = "Users";
const userKeys = Object.keys(new User());
const userModule = express();
// const request = require('request-promise');

// Add new user
userModule.post("/", async (req, res) => {
  //   const exist = await db.collection(userCollection).doc(req.body["uid"]);
  //   if (exist === true) {
  //     res.status(403).send(`Forbidden! User already exists`);
  //     return;
  //   }
  try {
    // Manual body serialization
    // TODO: Do something about this
    const user: User = {
      name: req.body["name"],
      mobile: Number(req.body["mobile"]),
      uid: req.body["uid"],
      profilePic: req.body["profilePic"],
    };
    const newDoc = await db
      .collection(userCollection)
      .doc(user.uid)
      .create(user);
    res.status(201).send(`Created a new user: ${newDoc}`);
  } catch (error) {
    res
      .status(400)
      .send(`User should only contains firstName, lastName and email!`);
  }
});

// Update new user
userModule.patch("/:userId", async (req, res) => {
  const reqKeys = Object.keys(req.body);
  if (!userReqValidator(reqKeys, userKeys)) {
    res.status(400).send("Invalid request body!");
    return;
  }
  if (req.body["uid"] !== req.params.userId) {
    res.status(403).send("Forbidden request!");
    return;
  }

  const updatedDoc = await db
    .collection(userCollection)
    .doc(req.params.userId)
    .set(req.body);
  res.status(204).send(`Update a new user: ${updatedDoc}`);
});

// View a user
userModule.get("/:userId", async (req, res) => {
  db.collection(userCollection)
    .doc(req.params.userId)
    .get()
    .then((doc) => res.status(200).send(doc))
    .catch((error) => res.status(400).send(`Cannot get user: ${error}`));
});

// View all users
// userModule.get("/", (req, res) => {
//   firebaseHelper.firestore
//     .backup(db, userCollection)
//     .then((data:any) => {
//       const _data = Object(data)[userCollection];
//       return res.status(200).send(Object.keys(_data).map((key) => _data[key]));
//     })
//     .catch((error) => res.status(400).send(`Cannot get users: ${error}`));
// });

// Delete a user
userModule.delete("/:userId", async (req, res) => {
  db.collection(userCollection)
    .doc(req.params.userId)
    .delete()
    .then((deletedUser) =>
      res.status(204).send(`User is deleted: ${deletedUser}`)
    )
    .catch((error) => res.status(400).send(`Error: ${error}`));
});

export { userModule };
