import * as express from "express";
import { db, updatedb } from "../index";

class Post {
  constructor(
    public title: String = "",
    public content: String = "",
    public author: string = "",
    public uid: string = ""
  ) {}
}

const userReqValidator = (arr: any[], target: any[]) =>
  arr.every((v) => target.includes(v)) && !("uid" in arr);
const postCollection = "Posts";
const userKeys = Object.keys(new Post());
const postModule = express();

// Add new post
postModule.post("/", async (req, res) => {
  try {
    // Manual body serialization
    // TODO: Do something about this
    const post: Post = {
      title: req.body["title"],
      content: req.body["content"],
      author: req.body["author"],
      uid: req.body["uid"],
    };
    const newDoc = await db.collection(postCollection).add(post);
    const result = await db
      .doc(`Users/${post.uid}`)
      .update({ posts: updatedb.FieldValue.arrayUnion(newDoc.id) });
    // const result2 = await db
    //   .doc(`Categories/${post.category}`)
    //   .set(
    //     { posts: updatedb.FieldValue.arrayUnion(newDoc.id) },
    //     { merge: true }
    //   );

    res.status(201).send({
      message: `Created a new post: ${newDoc.id}, Updated references:${result}`,
      docId: newDoc.id,
    });
  } catch (error) {
    res
      .status(400)
      .send(`Post should only contains firstName, lastName and location!`);
  }
});

// Update new post
postModule.patch("/:postId", async (req, res) => {
  const reqKeys = Object.keys(req.body);
  if (!userReqValidator(reqKeys, userKeys)) {
    res.status(400).send("Invalid request body!");
    return;
  }
  const updatedDoc = await db
    .collection(postCollection)
    .doc(req.params.postId)
    .update(req.body);
  res.status(204).send(`Update a new post: ${updatedDoc}`);
});

// View a post
postModule.get("/:postId", async (req, res) => {
  db.collection(postCollection)
    .doc(req.params.postId)
    .get()
    .then((doc) => res.status(200).send(doc))
    .catch((error) => res.status(400).send(`Cannot get post: ${error}`));
});

// View all posts
// postModule.get("/", (req, res) => {
//   console.log("all");
//   db.collection(postCollection).
//   firebaseHelper.firestore
//     .backup(db, postCollection)
//     .then((data) => {
//       const _data = Object(data)[postCollection];
//       return res.status(200).send(Object.keys(_data).map((key) => _data[key]));
//     })
//     .catch((error) => res.status(400).send(`Cannot get posts: ${error}`));
// });

// Delete a post
postModule.delete("/:postId", async (req, res) => {
  //   const exist = await db.collection(postCollection).
  const post = await db.collection(postCollection).doc(req.params.postId).get();
  if (post.exists) {
    const result = await db
      .doc(`Users/${post.get("uid")}`)
      .update({ posts: updatedb.FieldValue.arrayRemove(req.params.postId) });
    // const result2 = await db
    //   .doc(`Categories/${post.get("uid")}`)
    //   .update({ posts: updatedb.FieldValue.arrayRemove(req.params.postId) });
    const deletedPost = await db
      .collection(postCollection)
      .doc(post.id)
      .delete();
    res
      .status(204)
      .send(`Post is deleted: ${deletedPost}, updated references ${result} `);
  } else res.status(400).send("Post does not exist");
});

export { postModule };
