import { ZodError } from "zod";

export const validate = (schema) => async (req, res, next) => {
  try {
    const parseBody = await schema.parseAsync(req.body);
    req.body = parseBody;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      if (error instanceof ZodError) {
        const fieldErrors = {};

        error.issues.forEach((issue) => {
          const fieldName = issue.path[0];
          fieldErrors[fieldName] = issue.message;
        });

        return next({
          status: 400,
          message: "Validation failed",
          extraDetails: fieldErrors,
        });
      }

      next(error);
    }
  }
};
