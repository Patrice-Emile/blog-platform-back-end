import yup from "yup";

const schema = yup.object().shape({
  name: yup.string().trim().min(2),
  email: yup.string().trim().email(),
  password: yup
    .string()
    .min(8)
    .max(200)
    .matches(/[^A-Za-z0-9]/, "password must contain a special character")
    .matches(/[A-Z]/, "password must contain an uppercase letter")
    .matches(/[a-z]/, "password must contain a lowercase letter")
    .matches(/[0-9]/, "password must contain a number"),
  content: yup.string().trim(),
  is_published: yup.boolean(),
});
export default schema;
