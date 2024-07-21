const VALIDATORS = require("../constants/validators");

const joiValidator = (req, res, next) => {
  const validationSchema = VALIDATORS[req.url];
  const validationResult = validationSchema.validate(req.body);
  if (!validationResult.error) {
    next();
  } else {
    res.status(500).send({
      status: "not ok",
      error: validationResult?.error,
      message: "Invalid Payload",
    });
  }
};

module.exports = {
  joiValidator,
};
