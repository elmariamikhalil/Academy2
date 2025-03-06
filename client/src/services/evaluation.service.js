import api from "./api";

class EvaluationService {
  // Admin methods for templates
  getAllTemplates() {
    return api.get("/admin/evaluations/templates");
  }

  getTemplateById(templateId) {
    return api.get(`/admin/evaluations/templates/${templateId}`);
  }

  createTemplate(templateData) {
    return api.post("/admin/evaluations/templates", templateData);
  }

  updateTemplate(templateId, templateData) {
    return api.put(`/admin/evaluations/templates/${templateId}`, templateData);
  }

  deleteTemplate(templateId) {
    return api.delete(`/admin/evaluations/templates/${templateId}`);
  }

  // Admin methods for evaluations
  submitEvaluation(evaluationData) {
    return api.post("/admin/evaluations/submit", evaluationData);
  }

  getUserEvaluationsAdmin(userId) {
    return api.get(`/admin/evaluations/users/${userId}`);
  }

  // User methods
  getCurrentUserEvaluations() {
    return api.get("/user/evaluations");
  }
}

export default new EvaluationService();
