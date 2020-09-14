import * as express from "express";
import { db, updatedb } from "../index";

class Post {
  constructor(
    public title: String = "",
    public content: String = "",
    public author: string = "",
    public uid: string = "",
    public visitors: Array<string> = [],
    public visitCount: Number = 0
  ) { }
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
      visitors: [],
      visitCount: 0
    };
    console.log(post);
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
    console.log(error);
    res
      .status(400)
      .send(`Post should only contains firstName, lastName and location!${error}`);
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


// View all posts
postModule.get("/", async (req, res) => {
  console.log("all");
  console.log(req.params);
  // let findoc;
  // let response=undefined;
  if (req.query !== undefined && ("postId" in req.query)) {
    console.log("postId" in req.query);
    const postId: string = req.query.postId as string;
    const userId: string = req.query.userId as string;
    console.log(postId);
    await db.collection(postCollection)
      .doc(postId)
      .get()
      .then((doc) => {
        console.log("cp1");
        if (doc.get("visitors").includes(userId))
          return res.status(200).send(doc);
        else {
          console.log("cp2");
          const ans = doc.ref.update({ visitors: doc.get("visitors")[0] === undefined ? [userId] : updatedb.FieldValue.arrayUnion(userId), visitCount: updatedb.FieldValue.increment(1) });
          console.log(doc.data());
          console.log(ans)
          return res.status(200).send(doc.data());
        }
      })
      .catch((error) => res.status(400).send(`Cannot get post: ${error}`));
  }
  else {
    console.log(req.query);
    console.log(req.query !== undefined && ("postId" in req.query));
    let arr: any;
    arr = [];
    return db.collection(postCollection).get().then((snap) => {
      snap.docs.forEach((doc) => arr.push(doc.data()));
      return res.status(200).send(arr);
    });
  }
  return;
});

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
