const { body, param, query } = require("express-validator");

const validateId = (field = "id") => {
  return param(field).isMongoId().withMessage("Invalid " + field + ": must be a valid MongoDB ObjectId");
};

const validatePagination = () => {
  return [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100").toInt(),
  ];
};

const validateEmail = (field = "email") => {
  return body(field).isEmail().withMessage("Please provide a valid email address").normalizeEmail();
};

module.exports = { validateId, validatePagination, validateEmail };