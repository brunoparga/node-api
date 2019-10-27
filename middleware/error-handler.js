/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }] */
/* eslint no-console: ["error", { allow: ["error"] }] */
module.exports = (error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  res.status(status).json({ message: error.message });
};
