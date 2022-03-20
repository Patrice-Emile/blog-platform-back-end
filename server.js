import express from "express";
import { Model } from "objection";
import knexfile from "./knexfile.js";
import knex from "knex";
import cors from "cors";
import sessionRoutes from "./src/routes/session.js";
import usersRoutes from "./src/routes/users.js";
import contentsRoutes from "./src/routes/contents.js";

const app = express();
const db = knex(knexfile);
const port = process.env.PORT;

Model.knex(db);

app.use(express.json());
app.use(cors());

sessionRoutes({ app });
usersRoutes({ app });
contentsRoutes({ app });

app.delete("/test/:id_post", async (req, res) => {
  const {
    params: { id_post },
  } = req;
  await postModel.query().deleteById(id_post);
  res.send("[" + id_post + "] " + errorMessages.postDeleted);
});

app.listen(port, () => console.log(`😋 Listening on :${port}`));
