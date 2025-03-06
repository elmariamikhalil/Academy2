import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";
import evaluationService from "../services/evaluation.service";

export const EvaluationContext = createContext();

export const EvaluationProvider = ({ children }) => {
  const { currentUser, isAdmin } = useContext(AuthContext);

  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [userEvaluations, setUserEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all evaluation templates (admin only)
  const fetchTemplates = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const response = await evaluationService.getAllTemplates();
      setTemplates(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch evaluation templates");
      setLoading(false);
    }
  };

  // Fetch a specific template by ID
  const fetchTemplateById = async (templateId) => {
    try {
      setLoading(true);
      const response = await evaluationService.getTemplateById(templateId);
      setCurrentTemplate(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to fetch template details");
      setLoading(false);
      return null;
    }
  };

  // Create a new evaluation template (admin only)
  const createTemplate = async (templateData) => {
    if (!isAdmin) return;

    try {
      const response = await evaluationService.createTemplate(templateData);
      toast.success("Evaluation template created successfully");
      await fetchTemplates(); // Refresh templates
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create template");
      return null;
    }
  };

  // Update an existing template (admin only)
  const updateTemplate = async (templateId, templateData) => {
    if (!isAdmin) return;

    try {
      await evaluationService.updateTemplate(templateId, templateData);
      toast.success("Evaluation template updated successfully");
      await fetchTemplates(); // Refresh templates
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update template");
      return false;
    }
  };

  // Delete a template (admin only)
  const deleteTemplate = async (templateId) => {
    if (!isAdmin) return;

    try {
      await evaluationService.deleteTemplate(templateId);
      toast.success("Evaluation template deleted successfully");
      setTemplates(templates.filter((template) => template.id !== templateId));
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete template");
      return false;
    }
  };

  // Submit evaluation for a user (admin only)
  const submitEvaluation = async (userId, evaluations) => {
    if (!isAdmin) return;

    try {
      await evaluationService.submitEvaluation({ userId, evaluations });
      toast.success("Evaluation submitted successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit evaluation");
      return false;
    }
  };

  // Fetch evaluations for the current user or a specific user (admin can view any user)
  const fetchUserEvaluations = async (userId = null) => {
    try {
      setLoading(true);

      let response;
      if (isAdmin && userId) {
        response = await evaluationService.getUserEvaluationsAdmin(userId);
      } else {
        response = await evaluationService.getCurrentUserEvaluations();
      }

      setUserEvaluations(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to fetch evaluations");
      setLoading(false);
      return [];
    }
  };

  // Effect to fetch templates when admin status changes
  useEffect(() => {
    if (isAdmin) {
      fetchTemplates();
    }
  }, [isAdmin]);

  // Effect to fetch user evaluations when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserEvaluations();
    } else {
      setUserEvaluations([]);
    }
  }, [currentUser]);

  // Context value
  const value = {
    templates,
    currentTemplate,
    userEvaluations,
    loading,
    error,
    fetchTemplates,
    fetchTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    submitEvaluation,
    fetchUserEvaluations,
  };

  return (
    <EvaluationContext.Provider value={value}>
      {children}
    </EvaluationContext.Provider>
  );
};

export default EvaluationContext;
