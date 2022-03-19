import usersModel from "../models/Users.js";
import roleModel from "../models/Role.js";
import hashPassword from "../hashPassword.js";
import auth from "../middleware/auth.js";
import errorMessages from "../util/errorMessages.js";
import yupSchema from "../util/yupSchema.js";
import jsonwebtoken from "jsonwebtoken";

const sessionRoutes = ({ app }) => {
  // POST SIGN UP
  // curl -X POST localhost:3000/sign-up -H 'Content-Type: application/json' -d '{"email":"toto@toto.com","password":"123456Az$"}'
  app.post("/sign-up", async (req, res, next) => {
    const {
      body: { email, password },
    } = req;

    const basicRole = "READER";

    try {
      const createUser = {
        email,
        password,
      };
      await yupSchema.validate(
        { email: email, password: password },
        {
          abortEarly: false,
        }
      );

      const userRole = await roleModel
        .query()
        .select("id")
        .where({ name: basicRole })
        .first();

      if (!userRole.id) {
        const error = new Error(errorMessages.roleNotFound);
        res.status(403);
        throw error;
      }

      const user = await usersModel.query().where({ email });
      if (user.length) {
        const error = new Error(errorMessages.emailInUse);
        res.status(403);
        throw error;
      }

      const [hash, salt] = hashPassword(password);

      const newUser = await usersModel.query().insert({
        email: email,
        name: "The best " + basicRole,
        id_role: userRole.id,
        password_hash: hash,
        password_salt: salt,
      });

      // console.log(newUser);

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
            },
          },
        },
        process.env.JWT_SECRET,
        { expiresIn: "2 days" }
      );
      // console.log("jwt: " + jwt);
      res.send(jwt);
    } catch (error) {
      res.send("error: " + error);
    }
  });

  // POST SIGN IN
  // curl -X POST localhost:3000/sign-in -H 'Content-Type: application/json' -d '{"email":"toto@toto.com","password":"123456Az$"}'
  app.post("/sign-in", async (req, res, next) => {
    const {
      body: { email, password },
    } = req;

    try {
      const user = await usersModel.query().findOne({ email });
      // console.log(user);
      // console.log(user.password_hash);
      // console.log(user.password_salt);

      if (!user) {
        const error = new Error(errorMessages.invalidLogin);
        res.status(403);
        throw error;
      }

      const [hash] = hashPassword(password, user.password_salt);

      // console.log("hash : ", hash);
      // console.log("u.hash : ", user.password_hash);
      // console.log("u.salt : ", user.password_salt);

      if (hash !== user.password_hash) {
        const error = new Error(errorMessages.invalidLogin);
        res.status(403);
        throw error;
      }

      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const token = await jsonwebtoken.sign(
        { payload: { user: payload } },
        process.env.JWT_SECRET,
        {
          expiresIn: "2 days",
        }
      );
      res.json(token);
    } catch (error) {
      next(error);
    }
  });

  // GET SESSIOn
  // curl -X GET localhost:3000/session -H "authentication:"
  app.get("/session", auth, (req, res) => {
    res.send("Bienvenue mon Sauce !");
  });
};

export default sessionRoutes;
