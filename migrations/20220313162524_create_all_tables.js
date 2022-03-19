export const up = async (knex) => {
  // ROLE
  await knex.schema.createTable("role", (table) => {
    table.increments("id").primary().notNullable();

    table.string("name").notNullable();
  });

  await knex("role").insert([
    { name: "READER" },
    { name: "AUTHOR" },
    { name: "ADMIN" },
  ]);

  // USERS
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary().notNullable();
    table.integer("id_role").nullable();

    table.string("name").notNullable();
    table.string("email").notNullable().unique();

    table.string("password_hash").notNullable();
    table.string("password_salt").notNullable();

    table.date("created_at").defaultTo(new Date(Date.now()).toUTCString());
    table.date("updated_at").nullable();
    table.date("deleted_at").nullable();
    table.boolean("active").notNullable().defaultTo(1);
  });
  // POST
  await knex.schema.createTable("post", (table) => {
    table.increments("id").primary().notNullable();
    table.integer("id_user").notNullable();

    table.string("title").notNullable();
    table.text("content").notNullable();
    table.boolean("is_published").notNullable().defaultTo(1);

    table.date("created_at").defaultTo(new Date(Date.now()).toUTCString());
    table.date("updated_at").nullable();
    table.date("deleted_at").nullable();
  });
  // COMMENT
  await knex.schema.createTable("comment", (table) => {
    table.increments("id").primary().notNullable();
    table.integer("id_post").notNullable();
    table.integer("id_user").notNullable();

    table.text("content").notNullable();

    table.date("created_at").defaultTo(new Date(Date.now()).toUTCString());
    table.date("updated_at").nullable();
    table.date("deleted_at").nullable();
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable("role");
  await knex.schema.dropTable("users");
  await knex.schema.dropTable("post");
  await knex.schema.dropTable("comment");
};
