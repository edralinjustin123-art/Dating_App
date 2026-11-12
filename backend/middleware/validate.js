const { badRequest } = require('../utils/errors');

function validate(schemas) {
  return (req, res, next) => {
    const validated = {};
    for (const [key, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({ field: [key, ...issue.path].join('.'), message: issue.message }));
        return next(badRequest('Please check the submitted data.', details));
      }
      validated[key] = result.data;
    }
    req.validated = validated;
    return next();
  };
}

module.exports = { validate };
