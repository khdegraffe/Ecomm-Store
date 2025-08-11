const { validationResult } = require("express-validator");
const productsRepo = require("../../repositories/products");

module.exports = {
  handleErrors(templateFunc) {
    return (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.send(templateFunc({ errors }));
      }

      next();
    };
  },

  handleEditErrors(templateFunc) {
    return async (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const product = await productsRepo.getOne(req.params.id);

        const formData = {
          ...product,
          ...req.body,
        };

        return res.send(
          templateFunc({
            errors: errors.mapped(),
            product: formData,
          })
        );
      }

      next();
    };
  },

  requireAuth(req, res, next) {
    if (!req.session.userId) {
      return res.redirect("/signin");
    }

    next();
  },
};
