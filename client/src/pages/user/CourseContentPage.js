import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import courseService from "../../services/course.service";
import "../../styles/admin/CourseContentPage.css";

const AdminCourseContentPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [sectionFormData, setSectionFormData] = useState({
    title: "",
    description: "",
    position: "",
  });
  const [contentFormData, setContentFormData] = useState({
    title: "",
    content_type: "text",
    video_url: "",
    duration: "",
    transcript: "",
    text_content: "",
  });
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingContentId, setEditingContentId] = useState(null);

  useEffect(() => {
    fetchCourseAndContent();
  }, [courseId]);

  const fetchCourseAndContent = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseResponse = await courseService.getCourseById(courseId);
      setCourse(courseResponse.data);

      // Fetch course sections and content
      const sectionsResponse = await courseService.getCourseSections(courseId);
      setSections(sectionsResponse.data);

      setLoading(false);
    } catch (err) {
      setError("Failed to load course details. Please try again later.");
      setLoading(false);
    }
  };

  const handleSectionFormChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData({
      ...sectionFormData,
      [name]: value,
    });
  };

  const handleContentFormChange = (e) => {
    const { name, value } = e.target;
    setContentFormData({
      ...contentFormData,
      [name]: value,
    });
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSectionId) {
        // Update existing section
        await courseService.updateSection(editingSectionId, sectionFormData);
        toast.success("Section updated successfully");
      } else {
        // Create new section
        await courseService.createSection(courseId, sectionFormData);
        toast.success("Section created successfully");
      }

      // Reset form and refresh data
      setSectionFormData({
        title: "",
        description: "",
        position: "",
      });
      setShowSectionForm(false);
      setEditingSectionId(null);
      fetchCourseAndContent();
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingContentId) {
        // Update existing content
        await courseService.updateContent(editingContentId, contentFormData);
        toast.success("Content updated successfully");
      } else {
        // Create new content
        await courseService.createContent(activeSectionId, contentFormData);
        toast.success("Content created successfully");
      }

      // Reset form and refresh data
      setContentFormData({
        title: "",
        content_type: "text",
        video_url: "",
        duration: "",
        transcript: "",
        text_content: "",
      });
      setShowContentForm(false);
      setEditingContentId(null);
      fetchCourseAndContent();
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  const handleEditSection = (section) => {
    setSectionFormData({
      title: section.title,
      description: section.description || "",
      position: section.position || "",
    });
    setEditingSectionId(section.id);
    setShowSectionForm(true);
  };

  const handleEditContent = (content) => {
    let formData = {
      title: content.title,
      content_type: content.content_type,
      video_url: "",
      duration: "",
      transcript: "",
      text_content: "",
    };

    // Add type-specific content
    if (content.content_type === "video" && content.videoContent) {
      formData.video_url = content.videoContent.video_url || "";
      formData.duration = content.videoContent.duration || "";
      formData.transcript = content.videoContent.transcript || "";
    } else if (content.content_type === "text" && content.textContent) {
      formData.text_content = content.textContent.content || "";
    }

    setContentFormData(formData);
    setEditingContentId(content.id);
    setActiveSectionId(content.section_id);
    setShowContentForm(true);
  };

  const handleDeleteSection = async (sectionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this section? This will also delete all content within the section."
      )
    ) {
      try {
        await courseService.deleteSection(sectionId);
        toast.success("Section deleted successfully");
        fetchCourseAndContent();
      } catch (err) {
        toast.error(err.response?.data?.message || "An error occurred");
      }
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        await courseService.deleteContent(contentId);
        toast.success("Content deleted successfully");
        fetchCourseAndContent();
      } catch (err) {
        toast.error(err.response?.data?.message || "An error occurred");
      }
    }
  };

  const addContent = (sectionId) => {
    setActiveSectionId(sectionId);
    setShowContentForm(true);
    setEditingContentId(null);
    setContentFormData({
      title: "",
      content_type: "text",
      video_url: "",
      duration: "",
      transcript: "",
      text_content: "",
    });
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!course) {
    return <div className="error-message">Course not found</div>;
  }

  return (
    <div className="admin-course-content-page">
      <div className="page-header">
        <div className="header-left">
          <Link to="/admin/courses" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Courses
          </Link>
          <h1>Course Content: {course.title}</h1>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => {
              setShowSectionForm(true);
              setEditingSectionId(null);
              setSectionFormData({
                title: "",
                description: "",
                position: "",
              });
            }}
          >
            <i className="fas fa-plus"></i> Add Section
          </button>
        </div>
      </div>

      {/* Section Form */}
      {showSectionForm && (
        <div className="form-container">
          <h2>{editingSectionId ? "Edit Section" : "Add New Section"}</h2>
          <form onSubmit={handleSectionSubmit}>
            <div className="form-group">
              <label htmlFor="title">Section Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={sectionFormData.title}
                onChange={handleSectionFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={sectionFormData.description}
                onChange={handleSectionFormChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                type="number"
                id="position"
                name="position"
                value={sectionFormData.position}
                onChange={handleSectionFormChange}
                min="1"
              />
              <small>Leave empty for automatic positioning</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingSectionId ? "Update Section" : "Add Section"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSectionForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content Form */}
      {showContentForm && (
        <div className="form-container">
          <h2>{editingContentId ? "Edit Content" : "Add New Content"}</h2>
          <form onSubmit={handleContentSubmit}>
            <div className="form-group">
              <label htmlFor="content_title">Content Title</label>
              <input
                type="text"
                id="content_title"
                name="title"
                value={contentFormData.title}
                onChange={handleContentFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content_type">Content Type</label>
              <select
                id="content_type"
                name="content_type"
                value={contentFormData.content_type}
                onChange={handleContentFormChange}
                required
              >
                <option value="text">Text</option>
                <option value="video">Video</option>
              </select>
            </div>

            {contentFormData.content_type === "video" && (
              <>
                <div className="form-group">
                  <label htmlFor="video_url">Video URL</label>
                  <input
                    type="text"
                    id="video_url"
                    name="video_url"
                    value={contentFormData.video_url}
                    onChange={handleContentFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (seconds)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={contentFormData.duration}
                    onChange={handleContentFormChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="transcript">Transcript (Optional)</label>
                  <textarea
                    id="transcript"
                    name="transcript"
                    value={contentFormData.transcript}
                    onChange={handleContentFormChange}
                    rows="5"
                  ></textarea>
                </div>
              </>
            )}

            {contentFormData.content_type === "text" && (
              <div className="form-group">
                <label htmlFor="text_content">Content</label>
                <textarea
                  id="text_content"
                  name="text_content"
                  value={contentFormData.text_content}
                  onChange={handleContentFormChange}
                  rows="10"
                  required
                ></textarea>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingContentId ? "Update Content" : "Add Content"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowContentForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course Content Display */}
      <div className="content-container">
        {sections.length === 0 ? (
          <div className="no-content">
            <p>This course has no content yet. Add a section to get started.</p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="section-container">
              <div className="section-header">
                <div className="section-title">
                  <h2>{section.title}</h2>
                  {section.description && (
                    <p className="section-description">{section.description}</p>
                  )}
                </div>
                <div className="section-actions">
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => addContent(section.id)}
                  >
                    <i className="fas fa-plus"></i> Add Content
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleEditSection(section)}
                    title="Edit Section"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDeleteSection(section.id)}
                    title="Delete Section"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>

              <div className="content-list">
                {section.contentTypes && section.contentTypes.length > 0 ? (
                  section.contentTypes.map((content) => (
                    <div key={content.id} className="content-item">
                      <div className="content-info">
                        <div className="content-title">
                          <span className="content-type-badge">
                            {content.content_type === "video" ? (
                              <i className="fas fa-play-circle"></i>
                            ) : (
                              <i className="fas fa-file-alt"></i>
                            )}
                            {content.content_type}
                          </span>
                          {content.title}
                        </div>
                        <div className="content-meta">
                          {content.content_type === "video" &&
                            content.videoContent && (
                              <span>
                                {Math.floor(content.videoContent.duration / 60)}
                                :
                                {(content.videoContent.duration % 60)
                                  .toString()
                                  .padStart(2, "0")}{" "}
                                min
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="content-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditContent(content)}
                          title="Edit Content"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteContent(content.id)}
                          title="Delete Content"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-content">
                    <p>
                      No content in this section yet. Click "Add Content" to add
                      your first lesson.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCourseContentPage;
