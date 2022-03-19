import { pbkdf2Sync, randomBytes } from "crypto";

const hashPassword = (password, salt = randomBytes(32).toString("hex")) => [
  pbkdf2Sync(password, salt, 500, 10, "sha512").toString("hex"),
  salt,
];
export default hashPassword;
