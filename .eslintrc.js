module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 13,
  },
  "no-warning-comments": [
    1,
    { terms: ["todo", "fixme", "any other term"], location: "anywhere" },
  ],
  rules: {
    location: "start",
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
  },
};
