import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { EvaluationContext } from "../../context/EvaluationContext";
import userService from "../../services/user.service";
import "../../styles/admin/EvaluationsPage.css";

const AdminEvaluationsPage = () => {
  const {
    templates,
    fetchTemplates,
    fetchTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    submitEvaluation,
    loading,
  } = useContext(EvaluationContext);

  const [users, setUsers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [evaluationData, setEvaluationData] = useState([]);
  const [templateFormData, setTemplateFormData] = useState({
    title: "",
    description: "",
    criteria: [{ name: "", min_score: 0, max_score: 100, scoreRanges: [] }],
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
      setUsersLoading(false);
    } catch (err) {
      toast.error("Failed to load users");
      setUsersLoading(false);
    }
  };

  const handleSelectTemplate = async (templateId) => {
    const template = await fetchTemplateById(templateId);
    setSelectedTemplate(template);
  };

  const handleTemplateFormChange = (e) => {
    const { name, value } = e.target;
    setTemplateFormData({
      ...templateFormData,
      [name]: value,
    });
  };

  const handleCriteriaChange = (index, field, value) => {
    const updatedCriteria = [...templateFormData.criteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: value,
    };

    setTemplateFormData({
      ...templateFormData,
      criteria: updatedCriteria,
    });
  };

  const handleAddCriteria = () => {
    setTemplateFormData({
      ...templateFormData,
      criteria: [
        ...templateFormData.criteria,
        { name: "", min_score: 0, max_score: 100, scoreRanges: [] },
      ],
    });
  };

  const handleRemoveCriteria = (index) => {
    const updatedCriteria = [...templateFormData.criteria];
    updatedCriteria.splice(index, 1);

    setTemplateFormData({
      ...templateFormData,
      criteria: updatedCriteria,
    });
  };

  const handleAddScoreRange = (criteriaIndex) => {
    const updatedCriteria = [...templateFormData.criteria];
    const currentRanges = updatedCriteria[criteriaIndex].scoreRanges || [];

    updatedCriteria[criteriaIndex] = {
      ...updatedCriteria[criteriaIndex],
      scoreRanges: [
        ...currentRanges,
        { min_value: 0, max_value: 0, label: "" },
      ],
    };

    setTemplateFormData({
      ...templateFormData,
      criteria: updatedCriteria,
    });
  };

  const handleScoreRangeChange = (criteriaIndex, rangeIndex, field, value) => {
    const updatedCriteria = [...templateFormData.criteria];
    const currentRanges = [...updatedCriteria[criteriaIndex].scoreRanges];

    currentRanges[rangeIndex] = {
      ...currentRanges[rangeIndex],
      [field]:
        field === "min_value" || field === "max_value"
          ? parseInt(value)
          : value,
    };

    updatedCriteria[criteriaIndex] = {
      ...updatedCriteria[criteriaIndex],
      scoreRanges: currentRanges,
    };

    setTemplateFormData({
      ...templateFormData,
      criteria: updatedCriteria,
    });
  };

  const handleRemoveScoreRange = (criteriaIndex, rangeIndex) => {
    const updatedCriteria = [...templateFormData.criteria];
    const currentRanges = [...updatedCriteria[criteriaIndex].scoreRanges];

    currentRanges.splice(rangeIndex, 1);

    updatedCriteria[criteriaIndex] = {
      ...updatedCriteria[criteriaIndex],
      scoreRanges: currentRanges,
    };

    setTemplateFormData({
      ...templateFormData,
      criteria: updatedCriteria,
    });
  };

  const handleSubmitTemplate = async (e) => {
    e.preventDefault();

    try {
      await createTemplate(templateFormData);
      resetTemplateForm();
      setShowCreateModal(false);
    } catch (err) {
      toast.error("Failed to create evaluation template");
    }
  };

  const resetTemplateForm = () => {
    setTemplateFormData({
      title: "",
      description: "",
      criteria: [{ name: "", min_score: 0, max_score: 100, scoreRanges: [] }],
    });
    setCurrentStep(1);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this evaluation template?"
      )
    ) {
      try {
        await deleteTemplate(templateId);
        if (selectedTemplate && selectedTemplate.id === templateId) {
          setSelectedTemplate(null);
        }
      } catch (err) {
        toast.error("Failed to delete template");
      }
    }
  };

  const handleUserSelect = (userId) => {
    const user = users.find((u) => u.id === parseInt(userId));
    setSelectedUser(user);

    // Initialize evaluation data based on selected template
    if (selectedTemplate && selectedTemplate.criteria) {
      const initialEvalData = selectedTemplate.criteria.map((criteria) => ({
        criteriaId: criteria.id,
        score: criteria.min_score,
        comments: "",
      }));

      setEvaluationData(initialEvalData);
    }
  };

  const handleEvaluationChange = (index, field, value) => {
    const updatedEvaluation = [...evaluationData];
    updatedEvaluation[index] = {
      ...updatedEvaluation[index],
      [field]: field === "score" ? parseInt(value) : value,
    };

    setEvaluationData(updatedEvaluation);
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    try {
      await submitEvaluation(selectedUser.id, evaluationData);
      setEvaluationData([]);
      setSelectedUser(null);
      setShowEvaluateModal(false);
    } catch (err) {
      toast.error("Failed to submit evaluation");
    }
  };

  if (loading && usersLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="admin-evaluations-page">
      <div className="page-header">
        <h1>Evaluations Management</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus"></i> Create Template
        </button>
      </div>

      <div className="evaluations-container">
        <div className="templates-sidebar">
          <h2>Evaluation Templates</h2>

          {templates.length === 0 ? (
            <div className="no-templates">
              <p>No templates available.</p>
              <p>Create a template to get started.</p>
            </div>
          ) : (
            <ul className="templates-list">
              {templates.map((template) => (
                <li
                  key={template.id}
                  className={`template-item ${
                    selectedTemplate?.id === template.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <div className="template-info">
                    <h3>{template.title}</h3>
                    <p className="template-meta">
                      {template.criteria?.length || 0} criteria
                    </p>
                  </div>
                  <div className="template-actions">
                    <button
                      className="btn-icon delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      title="Delete Template"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="template-details">
          {selectedTemplate ? (
            <>
              <div className="template-header">
                <div className="template-title">
                  <h2>{selectedTemplate.title}</h2>
                  {selectedTemplate.description && (
                    <p className="template-description">
                      {selectedTemplate.description}
                    </p>
                  )}
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setShowEvaluateModal(true)}
                  disabled={
                    !selectedTemplate.criteria ||
                    selectedTemplate.criteria.length === 0
                  }
                >
                  Start Evaluation
                </button>
              </div>

              <div className="template-criteria">
                <h3>Criteria</h3>

                {selectedTemplate.criteria &&
                selectedTemplate.criteria.length > 0 ? (
                  <div className="criteria-list">
                    {selectedTemplate.criteria.map((criteria) => (
                      <div key={criteria.id} className="criteria-item">
                        <div className="criteria-header">
                          <h4>{criteria.name}</h4>
                          <div className="criteria-score-range">
                            Score range: {criteria.min_score} -{" "}
                            {criteria.max_score}
                          </div>
                        </div>

                        {criteria.scoreRanges &&
                          criteria.scoreRanges.length > 0 && (
                            <div className="score-ranges">
                              <h5>Score Interpretations</h5>
                              <ul className="ranges-list">
                                {criteria.scoreRanges.map((range) => (
                                  <li key={range.id} className="range-item">
                                    <span className="range-values">
                                      {range.min_value} - {range.max_value}:
                                    </span>
                                    <span className="range-label">
                                      {range.label}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-criteria">
                    <p>No criteria defined for this template.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-template-selected">
              <p>Select a template from the sidebar or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h2>Create Evaluation Template</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowCreateModal(false);
                  resetTemplateForm();
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="step-indicator">
                <div className={`step ${currentStep === 1 ? "active" : ""}`}>
                  1. Basic Information
                </div>
                <div className={`step ${currentStep === 2 ? "active" : ""}`}>
                  2. Define Criteria
                </div>
                <div className={`step ${currentStep === 3 ? "active" : ""}`}>
                  3. Score Ranges
                </div>
              </div>

              <form onSubmit={handleSubmitTemplate}>
                {currentStep === 1 && (
                  <div className="step-content">
                    <div className="form-group">
                      <label htmlFor="title">Template Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={templateFormData.title}
                        onChange={handleTemplateFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">
                        Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={templateFormData.description}
                        onChange={handleTemplateFormChange}
                        rows="4"
                      ></textarea>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="step-content">
                    <h3>Evaluation Criteria</h3>

                    {templateFormData.criteria.map((criteria, index) => (
                      <div key={index} className="criteria-form">
                        <div className="criteria-header">
                          <h4>Criteria {index + 1}</h4>
                          {templateFormData.criteria.length > 1 && (
                            <button
                              type="button"
                              className="btn-icon delete"
                              onClick={() => handleRemoveCriteria(index)}
                              title="Remove Criteria"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Criteria Name</label>
                          <input
                            type="text"
                            value={criteria.name}
                            onChange={(e) =>
                              handleCriteriaChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Minimum Score</label>
                            <input
                              type="number"
                              value={criteria.min_score}
                              onChange={(e) =>
                                handleCriteriaChange(
                                  index,
                                  "min_score",
                                  parseInt(e.target.value)
                                )
                              }
                              min="0"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>Maximum Score</label>
                            <input
                              type="number"
                              value={criteria.max_score}
                              onChange={(e) =>
                                handleCriteriaChange(
                                  index,
                                  "max_score",
                                  parseInt(e.target.value)
                                )
                              }
                              min="1"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleAddCriteria}
                    >
                      <i className="fas fa-plus"></i> Add Another Criteria
                    </button>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="step-content">
                    <h3>Score Interpretations</h3>
                    <p>
                      Define score ranges and their interpretations for each
                      criteria.
                    </p>

                    {templateFormData.criteria.map(
                      (criteria, criteriaIndex) => (
                        <div key={criteriaIndex} className="score-ranges-form">
                          <h4>{criteria.name}</h4>
                          <p>
                            Score range: {criteria.min_score} -{" "}
                            {criteria.max_score}
                          </p>

                          {criteria.scoreRanges &&
                            criteria.scoreRanges.map((range, rangeIndex) => (
                              <div key={rangeIndex} className="range-form">
                                <div className="form-row">
                                  <div className="form-group">
                                    <label>Min Value</label>
                                    <input
                                      type="number"
                                      value={range.min_value}
                                      onChange={(e) =>
                                        handleScoreRangeChange(
                                          criteriaIndex,
                                          rangeIndex,
                                          "min_value",
                                          e.target.value
                                        )
                                      }
                                      min={criteria.min_score}
                                      max={criteria.max_score}
                                      required
                                    />
                                  </div>

                                  <div className="form-group">
                                    <label>Max Value</label>
                                    <input
                                      type="number"
                                      value={range.max_value}
                                      onChange={(e) =>
                                        handleScoreRangeChange(
                                          criteriaIndex,
                                          rangeIndex,
                                          "max_value",
                                          e.target.value
                                        )
                                      }
                                      min={criteria.min_score}
                                      max={criteria.max_score}
                                      required
                                    />
                                  </div>

                                  <div className="form-group">
                                    <label>Label</label>
                                    <input
                                      type="text"
                                      value={range.label}
                                      onChange={(e) =>
                                        handleScoreRangeChange(
                                          criteriaIndex,
                                          rangeIndex,
                                          "label",
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g. Poor, Fair, Good, Excellent"
                                      required
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    className="btn-icon delete"
                                    onClick={() =>
                                      handleRemoveScoreRange(
                                        criteriaIndex,
                                        rangeIndex
                                      )
                                    }
                                    title="Remove Range"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              </div>
                            ))}

                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => handleAddScoreRange(criteriaIndex)}
                          >
                            <i className="fas fa-plus"></i> Add Score Range
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                <div className="form-actions">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Previous
                    </button>
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Next
                    </button>
                  ) : (
                    <button type="submit" className="btn-primary">
                      Create Template
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Evaluate User Modal */}
      {showEvaluateModal && selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h2>Evaluate User: {selectedTemplate.title}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowEvaluateModal(false);
                  setSelectedUser(null);
                  setEvaluationData([]);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="user-select">Select User to Evaluate</label>
                <select
                  id="user-select"
                  value={selectedUser?.id || ""}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <form onSubmit={handleSubmitEvaluation}>
                  <div className="evaluation-form">
                    {selectedTemplate.criteria &&
                      selectedTemplate.criteria.map((criteria, index) => (
                        <div key={criteria.id} className="criteria-evaluation">
                          <h3>{criteria.name}</h3>

                          <div className="form-group">
                            <label>
                              Score ({criteria.min_score} - {criteria.max_score}
                              )
                            </label>
                            <input
                              type="range"
                              min={criteria.min_score}
                              max={criteria.max_score}
                              value={
                                evaluationData[index]?.score ||
                                criteria.min_score
                              }
                              onChange={(e) =>
                                handleEvaluationChange(
                                  index,
                                  "score",
                                  e.target.value
                                )
                              }
                            />
                            <div className="range-value">
                              {evaluationData[index]?.score ||
                                criteria.min_score}
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Comments</label>
                            <textarea
                              value={evaluationData[index]?.comments || ""}
                              onChange={(e) =>
                                handleEvaluationChange(
                                  index,
                                  "comments",
                                  e.target.value
                                )
                              }
                              rows="3"
                            ></textarea>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      Submit Evaluation
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setShowEvaluateModal(false);
                        setSelectedUser(null);
                        setEvaluationData([]);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvaluationsPage;
