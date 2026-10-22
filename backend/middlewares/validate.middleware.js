const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validate = (req, res, next) => {
  console.log("========== REQUEST ==========");
  console.log("URL:", req.originalUrl);
  console.log("Headers:", req.headers["content-type"]);
  console.log("Body:", req.body);
  console.log("=============================");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("Validation Errors:", errors.array());

    return next(
      new ApiError(
        422,
        "Validation failed",
        errors.array().map((e) => ({
          field: e.path,
          value: e.value,
          message: e.msg,
        })),
      ),
    );
  }

  next();
};

module.exports = validate;
