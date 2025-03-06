import React, { useState, useEffect, useContext } from "react";
import { ReportContext } from "../../context/ReportContext";
import { EvaluationContext } from "../../context/EvaluationContext";
import "../../styles/admin/ReportsPage.css";

const AdminReportsPage = () => {
  const {
    usersReport,
    coursesReport,
    enrollmentReport,
    completionRateReport,
    evaluationReport,
    fetchDashboardData,
    fetchEnrollmentReport,
    fetchCompletionRateReport,
    fetchEvaluationReport,
    exportReport,
    loading,
  } = useContext(ReportContext);

  const { templates, fetchTemplates } = useContext(EvaluationContext);

  const [activeTab, setActiveTab] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("month");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  useEffect(() => {
    fetchDashboardData();
    fetchTemplates();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case "enrollments":
        fetchEnrollmentReport(timePeriod);
        break;
      case "completion":
        fetchCompletionRateReport();
        break;
      case "evaluations":
        if (selectedTemplateId) {
          fetchEvaluationReport(selectedTemplateId);
        }
        break;
      default:
        break;
    }
  }, [activeTab, timePeriod, selectedTemplateId]);

  const handleExport = async (reportType) => {
    let params = {};

    if (reportType === "enrollments") {
      params = { period: timePeriod };
    } else if (reportType === "evaluations" && selectedTemplateId) {
      params = { templateId: selectedTemplateId };
    }

    await exportReport(reportType, params);
  };

  if (loading && !usersReport) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="admin-reports-page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
      </div>

      <div className="reports-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "enrollments" ? "active" : ""}`}
          onClick={() => setActiveTab("enrollments")}
        >
          Enrollments
        </button>
        <button
          className={`tab-btn ${activeTab === "completion" ? "active" : ""}`}
          onClick={() => setActiveTab("completion")}
        >
          Completion Rates
        </button>
        <button
          className={`tab-btn ${activeTab === "evaluations" ? "active" : ""}`}
          onClick={() => setActiveTab("evaluations")}
        >
          Evaluations
        </button>
      </div>

      <div className="report-content">
        {/* Overview Report */}
        {activeTab === "overview" && usersReport && coursesReport && (
          <div className="overview-report">
            <div className="report-section">
              <div className="section-header">
                <h2>User Statistics</h2>
                <button
                  className="btn-outline"
                  onClick={() => handleExport("users")}
                >
                  <i className="fas fa-download"></i> Export
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-value">{usersReport.totalUsers}</div>
                  <div className="stat-subtitle">
                    ({usersReport.totalAdmins} admins)
                  </div>
                </div>

                <div className="stat-card success">
                  <div className="stat-title">Enrollments</div>
                  <div className="stat-value">
                    {usersReport.enrollmentCount}
                  </div>
                </div>

                <div className="stat-card warning">
                  <div className="stat-title">Completed Courses</div>
                  <div className="stat-value">
                    {usersReport.completedCourseCount}
                  </div>
                </div>

                <div className="stat-card danger">
                  <div className="stat-title">Completion Rate</div>
                  <div className="stat-value">
                    {Math.round(usersReport.completionRate)}%
                  </div>
                </div>
              </div>

              <div className="recent-users">
                <h3>Recent Users</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersReport.recentUsers &&
                        usersReport.recentUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{`${user.first_name} ${user.last_name}`}</td>
                            <td>{user.email}</td>
                            <td>
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="report-section">
              <div className="section-header">
                <h2>Course Statistics</h2>
                <button
                  className="btn-outline"
                  onClick={() => handleExport("courses")}
                >
                  <i className="fas fa-download"></i> Export
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-title">Total Courses</div>
                  <div className="stat-value">{coursesReport.totalCourses}</div>
                </div>

                <div className="stat-card success">
                  <div className="stat-title">Published</div>
                  <div className="stat-value">
                    {coursesReport.publishedCourses}
                  </div>
                  <div className="stat-subtitle">
                    (
                    {Math.round(
                      (coursesReport.publishedCourses /
                        coursesReport.totalCourses) *
                        100
                    )}
                    %)
                  </div>
                </div>
              </div>

              <div className="popular-courses">
                <h3>Popular Courses</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Course Title</th>
                        <th>Level</th>
                        <th>Enrollments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coursesReport.popularCourses &&
                        coursesReport.popularCourses.map((course) => (
                          <tr key={course.id}>
                            <td>{course.title}</td>
                            <td>{course.difficulty_level}</td>
                            <td>{course.enrollmentCount}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enrollments Report */}
        {activeTab === "enrollments" && (
          <div className="enrollments-report">
            <div className="report-header">
              <h2>Enrollment Report</h2>
              <div className="report-actions">
                <div className="filter-group">
                  <label htmlFor="time-period">Time Period:</label>
                  <select
                    id="time-period"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>

                <button
                  className="btn-outline"
                  onClick={() => handleExport("enrollments")}
                >
                  <i className="fas fa-download"></i> Export
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : enrollmentReport ? (
              <div className="report-data">
                <div className="report-summary">
                  <div className="stat-card primary">
                    <div className="stat-title">Total Enrollments</div>
                    <div className="stat-value">
                      {enrollmentReport.totalEnrollments}
                    </div>
                    <div className="stat-subtitle">
                      {enrollmentReport.startDate &&
                        enrollmentReport.endDate && (
                          <>
                            {new Date(
                              enrollmentReport.startDate
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              enrollmentReport.endDate
                            ).toLocaleDateString()}
                          </>
                        )}
                    </div>
                  </div>
                </div>

                <div className="report-charts">
                  <div className="chart-container">
                    <h3>Daily Enrollments</h3>
                    {/* Placeholder for chart - would use a library like Chart.js or Recharts */}
                    <div className="chart-placeholder">
                      {enrollmentReport.dailyEnrollments && (
                        <div>
                          {/* Just a simple representation, would be a proper chart in real implementation */}
                          <div className="chart-data">
                            {enrollmentReport.dailyEnrollments.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="chart-bar"
                                  style={{
                                    height: `${
                                      (item.count /
                                        Math.max(
                                          ...enrollmentReport.dailyEnrollments.map(
                                            (d) => d.count
                                          )
                                        )) *
                                      100
                                    }%`,
                                  }}
                                >
                                  <div className="bar-tooltip">
                                    {item.date}: {item.count}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                          <div className="chart-axis">
                            {enrollmentReport.dailyEnrollments
                              .slice(0, 5)
                              .map((item, index) => (
                                <div key={index} className="axis-label">
                                  {new Date(item.date).toLocaleDateString()}
                                </div>
                              ))}
                            {enrollmentReport.dailyEnrollments.length > 5 && (
                              <div className="axis-label">...</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="top-courses">
                  <h3>Top Courses by Enrollment</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Course Title</th>
                          <th>Enrollments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollmentReport.topCourses &&
                          enrollmentReport.topCourses.map((course) => (
                            <tr key={course.id}>
                              <td>{course.title}</td>
                              <td>{course.enrollmentCount}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">No enrollment data available</div>
            )}
          </div>
        )}

        {/* Completion Rate Report */}
        {activeTab === "completion" && (
          <div className="completion-report">
            <div className="report-header">
              <h2>Completion Rate Report</h2>
              <button
                className="btn-outline"
                onClick={() => handleExport("completion")}
              >
                <i className="fas fa-download"></i> Export
              </button>
            </div>

            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : completionRateReport ? (
              <div className="report-data">
                <div className="report-summary">
                  <div className="stat-card primary">
                    <div className="stat-title">Overall Completion Rate</div>
                    <div className="stat-value">
                      {Math.round(
                        completionRateReport.overallStats.overallCompletionRate
                      )}
                      %
                    </div>
                    <div className="stat-subtitle">
                      {completionRateReport.overallStats.totalCompletions} /{" "}
                      {completionRateReport.overallStats.totalEnrollments}{" "}
                      courses
                    </div>
                  </div>
                </div>

                <div className="completion-by-course">
                  <h3>Completion Rate by Course</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Course Title</th>
                          <th>Enrollments</th>
                          <th>Completions</th>
                          <th>Completion Rate</th>
                          <th>Avg. Completion Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completionRateReport.courseData &&
                          completionRateReport.courseData.map((course) => (
                            <tr key={course.id}>
                              <td>{course.title}</td>
                              <td>{course.totalEnrollments}</td>
                              <td>{course.completedEnrollments}</td>
                              <td>{Math.round(course.completionRate)}%</td>
                              <td>{course.avgCompletionDays} days</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">No completion data available</div>
            )}
          </div>
        )}

        {/* Evaluations Report */}
        {activeTab === "evaluations" && (
          <div className="evaluations-report">
            <div className="report-header">
              <h2>Evaluation Report</h2>
              <div className="report-actions">
                <div className="filter-group">
                  <label htmlFor="template-select">Evaluation Template:</label>
                  <select
                    id="template-select"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                  >
                    <option value="">Select Template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn-outline"
                  onClick={() => handleExport("evaluations")}
                  disabled={!selectedTemplateId}
                >
                  <i className="fas fa-download"></i> Export
                </button>
              </div>
            </div>

            {!selectedTemplateId ? (
              <div className="select-prompt">
                <p>Please select an evaluation template to view the report</p>
              </div>
            ) : loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : evaluationReport ? (
              <div className="report-data">
                <div className="template-info">
                  <h3>{evaluationReport.templateName}</h3>
                  {evaluationReport.templateDescription && (
                    <p>{evaluationReport.templateDescription}</p>
                  )}
                  <p>Total Evaluations: {evaluationReport.totalEvaluations}</p>
                </div>

                <div className="criteria-averages">
                  <h3>Average Scores by Criteria</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Criteria</th>
                          <th>Average Score</th>
                          <th>Evaluations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluationReport.criteriaAverages &&
                          evaluationReport.criteriaAverages.map(
                            (criteria, index) => (
                              <tr key={index}>
                                <td>{criteria.criteriaName}</td>
                                <td>{criteria.averageScore.toFixed(1)}</td>
                                <td>{criteria.evaluationCount}</td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="user-evaluations">
                  <h3>User Evaluations</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          {evaluationReport.criteria &&
                            evaluationReport.criteria.map((criteria) => (
                              <th key={criteria.id}>{criteria.name}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {evaluationReport.userEvaluations &&
                          evaluationReport.userEvaluations.map((evaluation) => (
                            <tr key={evaluation.userId}>
                              <td>
                                {evaluation.firstName} {evaluation.lastName}
                              </td>
                              {evaluationReport.criteria &&
                                evaluationReport.criteria.map((criteria) => (
                                  <td key={criteria.id}>
                                    {evaluation.criteria[criteria.id]?.score ||
                                      "N/A"}
                                  </td>
                                ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">
                No evaluation data available for the selected template
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
