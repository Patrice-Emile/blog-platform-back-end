import postModel from "../models/Post.js";
import commentModel from "../models/Comment.js";
import auth from "../middleware/auth.js";
import errorMessages from "../util/errorMessages.js";
import roles from "../util/roles.js";
import yupSchema from "../util/yupSchema.js";

const contentsRoutes = ({ app }) => {
  //--------------------------------//
  //             POSTS              //
  //--------------------------------//

  // READ ALL POST
  // curl -X POST localhost:3000/post -H 'Content-Type: application/json' -d '{"title":"title","content":"blabla","is_published":1}' -H "authentication:"
  app.post("/post", auth, async (req, res) => {
    const {
      body: { title, content, is_published },
      user: { id, role, email, name },
    } = req;
    if (role === roles.READER) {
      res.send(errorMessages.cannotAllow);
      return;
    }
    try {
      // console.log("req.body : ", req.body);
      // console.log("req.user", req.user);

      // TODO verif champs
      await yupSchema.validate(req.body, {
        abortEarly: false,
      });

      const item = await postModel
        .query()
        .insert({ id_user: id, title, content, is_published });

      if (item.length) {
        res.send(errorMessages.cannotInsertPost);
        return;
      }
      res.send(item);
    } catch (error) {
      res.send("error: " + error);
    }
  });

  // READ ALL POSTS
  // curl -X GET localhost:3000/post
  app.get("/post", async (req, res) => {
    const item = await postModel
      .query()
      .select(
        "post.id",
        "name as author",
        "title",
        "post.created_at",
        "post.updated_at"
      )
      .innerJoin("users as u", "post.id_user", "u.id")
      .where("is_published", true)
      .where("post.deleted_at", null);
    // console.log(item);

    if (!item.length) {
      res.send(errorMessages.noPost);
      return;
    }
    res.send(item);
  });

  // READ ONE POST
  // curl -X GET localhost:3000/post/1
  app.get("/post/:id", async (req, res) => {
    const {
      params: { id },
    } = req;
    // console.log(id);
    const post = await postModel
      .query()
      .select(
        "post.id",
        "name as author",
        "title",
        "content",
        "post.created_at",
        "post.updated_at"
      )
      .innerJoin("users as u", "post.id_user", "u.id")
      .where("is_published", true)
      .where("post.deleted_at", null)
      .findOne({ "post.id": id });
    // console.log(post);
    if (!post) {
      res.send(errorMessages.postNotFound);
      return;
    }
    const comments = await commentModel
      .query()
      .select(
        "comment.id",
        "name as author",
        "content",
        "comment.created_at",
        "comment.updated_at"
      )
      .innerJoin("users as u", "comment.id_user", "u.id")
      .where({ "comment.id_post": id })
      .where("comment.deleted_at", null);
    // console.log(comments);

    const item = {
      post,
      comments,
    };
    res.send(item);
  });

  // UPDATE ONE POST
  // curl -X PUT localhost:3000/post/22 -H 'Content-Type: application/json' -d '{"title":"super title","content":"super blabla","is_published":0}' -H "authentication:"
  app.put("/post/:id_post", auth, async (req, res) => {
    const {
      params: { id_post },
      body: { title, content, is_published },
      user: { id, role, email, name },
    } = req;

    if (role === roles.READER) {
      res.send(errorMessages.cannotAllow);
      return;
    }
    try {
      const data = {
        title,
        content,
        is_published,
      };
      await yupSchema.validate(data, {
        abortEarly: false,
      });

      const item = await postModel.query().where({ id: id_post, id_user: id });
      // const item = await postModel.query();
      if (!item.length) {
        res.send(errorMessages.postNotFound);
        return;
      }

      const updatedItem = await postModel.query().patchAndFetchById(id_post, {
        title: title,
        content: content,
        is_published: is_published,
        updated_at: new Date(Date.now()).toUTCString(),
      });
      res.send(updatedItem);
    } catch (error) {
      res.send("error: " + error);
    }
  });

  // DELETE ONE POST
  // curl -X DELETE localhost:3000/post/2
  app.delete("/post/:id_post", auth, async (req, res) => {
    const {
      params: { id_post },
      user: { id, role, email, name },
    } = req;

    if (role === roles.READER) {
      res.send(errorMessages.cannotAllow);
      return;
    }
    const item = await postModel.query().where({ id: id_post, id_user: id });

    if (!item.length || role !== roles.ADMIN) {
      res.send(errorMessages.postNotFound);
      return;
    }

    await postModel.query().deleteById(id_post);
    res.send("[" + id_post + "] " + errorMessages.postDeleted);
  });

  //-------------------------------//
  //           COMMENTS            //
  //-------------------------------//

  // POST ONE COMMENT
  // curl -X POST localhost:3000/post/1/comments -H 'Content-Type: application/json' -d '{"content":"test comment"}' -H "authentication:"
  app.post("/post/:id_post/comments", auth, async (req, res) => {
    const {
      params: { id_post },
      body: { content },
      user: { id, role, email, name },
    } = req;

    try {
      await yupSchema.validate(req.body, {
        abortEarly: false,
      });

      const post = await postModel.query().findById(id_post);
      if (!post) {
        res.send(errorMessages.postNotFound);
        return;
      }
      const item = await commentModel
        .query()
        .insert({ id_user: id, id_post: id_post, content });

      if (item.length) {
        res.send(errorMessages.cannotInsertPost);
        return;
      }
      res.send(item);
    } catch (error) {
      res.send("error: " + error);
    }
  });

  // UPDATE ONE COMMENT
  // curl -X PUT localhost:3000/post/1/comments/1 -H 'Content-Type: application/json' -d '{"content":"super blabla"}' -H "authentication:"
  app.put("/post/:id_post/comments/:id_comment", auth, async (req, res) => {
    const {
      params: { id_post, id_comment },
      body: { content },
      user: { id, role, email, name },
    } = req;

    // try {

    await yupSchema.validate(
      {
        content,
      },
      {
        abortEarly: false,
      }
    );

    const post = await postModel.query().findById(id_post);
    // console.log(post);

    if (!post) {
      res.send(errorMessages.postNotFound);
      return;
    }
    const comment = await commentModel
      .query()
      .findOne({ id: id_comment, id_user: id, id_post });
    // console.log(comment);
    if (!comment) {
      res.send(errorMessages.commentNotFound);
      return;
    }

    const updatedItem = await commentModel
      .query()
      .patchAndFetchById(id_comment, {
        content: content,
        updated_at: new Date(Date.now()).toUTCString(),
      });
    res.send(updatedItem);
    // } catch (error) {
    //   res.send("error: " + error);
    // }
  });

  // DELETE ONE COMMENT
  // curl -X DELETE localhost:3000/post/1/comments/3  -H "authentication:"
  app.delete("/post/:id_post/comments/:id_comment", auth, async (req, res) => {
    const {
      params: { id_post, id_comment },
      user: { id, role, email, name },
    } = req;

    const item = await commentModel
      .query()
      .findOne({ id: id_comment, id_post, id_user: id });

    if (!item) {
      res.send(errorMessages.commentNotFound);
      return;
    }

    await commentModel.query().deleteById(id_comment);
    res.send("[" + id_comment + "] " + errorMessages.commentDeleted);
  });
};

export default contentsRoutes;
