const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      error: extractedErrors[0]?.message || 'Validation error',
      code: 'VALIDATION_ERROR',
      errors: extractedErrors,
    });
  }
  next();
};

module.exports = validateRequest;
