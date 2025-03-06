import React, { createContext, useState, useContext } from "react";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";
import reportService from "../services/report.service";

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const { isAdmin } = useContext(AuthContext);

  const [dashboardData, setDashboardData] = useState(null);
  const [usersReport, setUsersReport] = useState(null);
  const [coursesReport, setCoursesReport] = useState(null);
  const [enrollmentReport, setEnrollmentReport] = useState(null);
  const [completionRateReport, setCompletionRateReport] = useState(null);
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);

      // Fetch users report data
      const usersResponse = await reportService.getUsersReport();
      setUsersReport(usersResponse.data);

      // Fetch courses report data
      const coursesResponse = await reportService.getCoursesReport();
      setCoursesReport(coursesResponse.data);

      // Combine data for dashboard
      setDashboardData({
        users: usersResponse.data,
        courses: coursesResponse.data,
      });

      setLoading(false);
      return {
        users: usersResponse.data,
        courses: coursesResponse.data,
      };
    } catch (err) {
      setError("Failed to fetch dashboard data");
      setLoading(false);
      return null;
    }
  };

  // Fetch enrollment report with optional time period filter
  const fetchEnrollmentReport = async (period = "month") => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const response = await reportService.getEnrollmentReport(period);
      setEnrollmentReport(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to fetch enrollment report");
      setLoading(false);
      return null;
    }
  };

  // Fetch completion rate report
  const fetchCompletionRateReport = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const response = await reportService.getCompletionRateReport();
      setCompletionRateReport(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to fetch completion rate report");
      setLoading(false);
      return null;
    }
  };

  // Fetch evaluation report for a specific template
  const fetchEvaluationReport = async (templateId) => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const response = await reportService.getEvaluationReport(templateId);
      setEvaluationReport(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to fetch evaluation report");
      setLoading(false);
      return null;
    }
  };

  // Export a report as CSV
  const exportReport = async (reportType, params = {}) => {
    if (!isAdmin) return;

    try {
      setLoading(true);

      const response = await reportService.exportReport(reportType, params);

      // Create a blob and trigger download
      const blob = new Blob([response.data], { type: "text/csv" });
      saveAs(blob, `${reportType}_report.csv`);

      toast.success("Report exported successfully");
      setLoading(false);
      return true;
    } catch (err) {
      toast.error("Failed to export report");
      setLoading(false);
      return false;
    }
  };

  // Context value
  const value = {
    dashboardData,
    usersReport,
    coursesReport,
    enrollmentReport,
    completionRateReport,
    evaluationReport,
    loading,
    error,
    fetchDashboardData,
    fetchEnrollmentReport,
    fetchCompletionRateReport,
    fetchEvaluationReport,
    exportReport,
  };

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
};

export default ReportContext;
