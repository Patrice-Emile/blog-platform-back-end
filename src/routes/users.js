import usersModel from "../models/users.js";
import roleModel from "../models/role.js";
import auth from "../middleware/auth.js";
import hashPassword from "../hashPassword.js";
import errorMessages from "../util/errorMessages.js";
import yupSchema from "../util/yupSchema.js";
import roles from "../util/roles.js";

const usersRoutes = ({ app }) => {
  // READ ALL USERS
  // curl -X GET localhost:3000/users

  app.get("/role", auth, async (req, res) => {
    const item = await roleModel.query().select("id", "name");
    // const item = await usersModel.query();
    // console.log(item);

    if (!item.length) {
      res.send(errorMessages.roleNotFound);
      return;
    }
    res.send(item);
  });
  // UPDATE ONE ROLE
  // curl -X PUT localhost:3000/users/2 -H 'Content-Type: application/json' -d '{"email":"tata@tata.com","password":"123456Az$"}'
  app.put("/role/:id_user", auth, async (req, res) => {
    const {
      params: { id_user },
      body: { new_role },
      user: { id, role, email, name },
    } = req;
    if (role !== roles.ADMIN) {
      res.send(errorMessages.cannotAllow);
      return;
    }

    const item = await usersModel.query().where({ id_user });
    // const item = await usersModel.query();
    if (!item.length) {
      res.send(errorMessages.userNotFound);
      return;
    }
    const newRole = await roleModel.query().where({ name: new_role });

    if (!newRole.length) {
      res.send(errorMessages.roleNotFound);
      return;
    }

    const updatedItem = await usersModel.query().patchAndFetchById(id_user, {
      id_role: newRole.id,
    });
    res.send(updatedItem);
  });

  app.get("/users", auth, async (req, res) => {
    const item = await usersModel
      .query()
      .select(
        "users.id",
        "r.name as role",
        "users.name",
        "email",
        "active",
        "created_at",
        "updated_at"
      )
      .innerJoin("role as r", "users.id_role", "r.id")
      .where("deleted_at", null);
    // const item = await usersModel.query();
    // console.log(item);

    if (!item.length) {
      res.send(errorMessages.noUsers);
      return;
    }
    res.send(item);
  });

  // READ ONE USER
  // curl -X GET localhost:3000/users/1
  app.get("/users/:id", auth, async (req, res) => {
    const {
      params: { id },
    } = req;
    const item = await usersModel.query().where({ id });
    // const item = await usersModel.query();

    if (!item.length) {
      res.send(errorMessages.userNotFound);
      return;
    }
    res.send(item);
  });

  // UPDATE ONE USER
  // curl -X PUT localhost:3000/users/2 -H 'Content-Type: application/json' -d '{"email":"tata@tata.com","password":"123456Az$"}'
  app.put("/users/:id", auth, async (req, res) => {
    const {
      params: { id },
      body: { name, email, password },
    } = req;
    const data = {
      name,
      email,
      password,
    };
    await yupSchema.validate(data, {
      abortEarly: false,
    });
    const item = await usersModel.query().where({ id });
    // const item = await usersModel.query();
    if (!item.length) {
      res.send(errorMessages.userNotFound);
      return;
    }
    const [hash, salt] = hashPassword(password);

    const updatedItem = await usersModel.query().patchAndFetchById(id, {
      email: email,
      name: name,
      password_hash: hash,
      password_salt: salt,
      updated_at: new Date(Date.now()).toUTCString(),
    });
    res.send(updatedItem);
  });

  // DELETE ONE USER
  // curl -X DELETE localhost:3000/users/2
  app.delete("/users/:id", auth, async (req, res) => {
    const {
      params: { id },
    } = req;

    const item = await usersModel.query().where({ id });
    const name = await item.name;
    if (!item.length) {
      res.send(errorMessages.userNotFound);
      return;
    }

    await usersModel.query().deleteById(id);
    res.send("[" + id + "] " + errorMessages.userDeleted);
  });
};

export default usersRoutes;
