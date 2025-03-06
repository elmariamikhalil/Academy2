import api from "./api";

class ReportService {
  // Admin reporting methods
  getEvaluationReport(templateId) {
    return api.get(`/admin/reports/evaluations/${templateId}`);
  }

  getUsersReport() {
    return api.get("/admin/reports/users");
  }

  getCoursesReport() {
    return api.get("/admin/reports/courses");
  }

  getEnrollmentReport() {
    return api.get("/admin/reports/enrollments");
  }

  getCompletionRateReport() {
    return api.get("/admin/reports/completion-rates");
  }

  exportReport(reportType, params = {}) {
    return api.get(`/admin/reports/export/${reportType}`, {
      params,
      responseType: "blob",
    });
  }
}

export default new ReportService();
