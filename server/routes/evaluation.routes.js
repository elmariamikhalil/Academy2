const { verifyToken, isAdmin } = require("../middleware/auth.middleware");
const controller = require("../controllers/evaluation.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Routes for evaluation templates
  app.get(
    "/api/admin/evaluations/templates",
    [verifyToken, isAdmin],
    controller.getAllTemplates
  );
  app.get(
    "/api/admin/evaluations/templates/:id",
    [verifyToken, isAdmin],
    controller.getTemplateById
  );
  app.post(
    "/api/admin/evaluations/templates",
    [verifyToken, isAdmin],
    controller.createTemplate
  );
  app.put(
    "/api/admin/evaluations/templates/:id",
    [verifyToken, isAdmin],
    controller.updateTemplate
  );
  app.delete(
    "/api/admin/evaluations/templates/:id",
    [verifyToken, isAdmin],
    controller.deleteTemplate
  );

  // Routes for submitting and viewing evaluations
  app.post(
    "/api/admin/evaluations/submit",
    [verifyToken, isAdmin],
    controller.submitEvaluation
  );
  app.get("/api/user/evaluations", verifyToken, controller.getUserEvaluations);
  app.get(
    "/api/admin/evaluations/users/:userId",
    [verifyToken, isAdmin],
    controller.getUserEvaluations
  );
};
