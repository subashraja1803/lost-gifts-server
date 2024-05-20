const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().alphanum().max(30).required(),
  password: Joi.string().required(),
  email: Joi.string().required().email({ minDomainSegments: 2 }),
  fullName: Joi.string().max(50).required(),
});

const checkUsernameSchema = Joi.object({
  username: Joi.string().max(30).required(),
});

module.exports = {
  registerSchema,
  checkUsernameSchema,
};
