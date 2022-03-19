import jsonwebtoken from "jsonwebtoken";
import UsersModel from "../models/Users.js";
import errorMessages from "../util/errorMessages.js";

const { JsonWebTokenError } = jsonwebtoken;

const auth = async (req, res, next) => {
  const {
    headers: { authentication },
  } = req;
  try {
    const {
      payload: {
        user: { id, email, name },
      },
    } = jsonwebtoken.verify(authentication, process.env.JWT_SECRET);

    const user = await UsersModel.query()
      .select("users.id", "r.name as role", "users.name", "email", "active")
      .innerJoin("role as r", "users.id_role", "r.id")
      .where("deleted_at", null)
      .findOne({ email, "users.name": name, "users.id": id });

    if (!user.active) {
      const error = new Error(errorMessages.enableConnection);
      res.status(403);
      throw error;
    }

    // console.log("path", req.route.path);
    // console.log("methods", req.method);
    req.user = user;

    next();
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      res.status(401).send({ error: "Mauvais token" });
      return;
    }

    res.status(500).send({
      error: "Je ne sais pas non plus ce qu'il c'est passé mon reuf !",
    });
  }
};

export default auth;
