const { verifyToken, isAdmin } = require("../middleware/auth.middleware");
const controller = require("../controllers/report.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Admin dashboard reports
  app.get(
    "/api/admin/reports/users",
    [verifyToken, isAdmin],
    controller.getUsersReport
  );
  app.get(
    "/api/admin/reports/courses",
    [verifyToken, isAdmin],
    controller.getCoursesReport
  );
  app.get(
    "/api/admin/reports/evaluations/:templateId",
    [verifyToken, isAdmin],
    controller.getEvaluationReport
  );
  app.get(
    "/api/admin/reports/enrollments",
    [verifyToken, isAdmin],
    controller.getEnrollmentReport
  );
  app.get(
    "/api/admin/reports/completion-rates",
    [verifyToken, isAdmin],
    controller.getCompletionRateReport
  );

  // Report exports
  app.get(
    "/api/admin/reports/export/:reportType",
    [verifyToken, isAdmin],
    controller.exportReport
  );
};
