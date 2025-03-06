import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import courseService from "../services/course.service";
import { AuthContext } from "../context/AuthContext";
import "../styles/CourseDetailPage.css";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionContentVisible, setSectionContentVisible] = useState({});

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseResponse = await courseService.getCourseById(id);
      setCourse(courseResponse.data);

      // Fetch course sections and content
      const sectionsResponse = await courseService.getCourseSections(id);
      setSections(sectionsResponse.data);

      // Initialize section visibility state
      const initialVisibility = {};
      sectionsResponse.data.forEach((section) => {
        initialVisibility[section.id] = false;
      });
      setSectionContentVisible(initialVisibility);

      setLoading(false);
    } catch (err) {
      setError("Failed to load course details. Please try again later.");
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await courseService.enrollInCourse(id);
      toast.success("Successfully enrolled in the course!");

      // Update the course in state to reflect enrollment
      setCourse({ ...course, isEnrolled: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to enroll in the course"
      );
    }
  };

  const startLearning = () => {
    navigate(`/learning/${id}`);
  };

  const toggleSectionContent = (sectionId) => {
    setSectionContentVisible({
      ...sectionContentVisible,
      [sectionId]: !sectionContentVisible[sectionId],
    });
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case "video":
        return <i className="fas fa-play-circle"></i>;
      case "text":
        return <i className="fas fa-file-alt"></i>;
      case "quiz":
        return <i className="fas fa-question-circle"></i>;
      default:
        return <i className="fas fa-file"></i>;
    }
  };

  const calculateTotalLessons = () => {
    return sections.reduce(
      (total, section) =>
        total + (section.contentTypes ? section.contentTypes.length : 0),
      0
    );
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
    <div className="course-detail-page">
      {/* Course Header */}
      <div
        className="course-header"
        style={
          course.thumbnail
            ? { backgroundImage: `url(${course.thumbnail})` }
            : {}
        }
      >
        <div className="course-header-overlay">
          <div className="course-header-content">
            <h1 className="course-title">{course.title}</h1>

            <div className="course-meta">
              <div className="meta-item">
                <i className="fas fa-layer-group"></i>
                <span>{course.difficulty_level}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-clock"></i>
                <span>{course.duration} minutes</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-book-open"></i>
                <span>{calculateTotalLessons()} lessons</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-users"></i>
                <span>{course.enrollmentCount || 0} students</span>
              </div>
            </div>

            {isAuthenticated ? (
              course.isEnrolled ? (
                <button onClick={startLearning} className="btn-primary">
                  <i className="fas fa-play-circle"></i> Start Learning
                </button>
              ) : (
                <button onClick={handleEnroll} className="btn-primary">
                  <i className="fas fa-graduation-cap"></i> Enroll Now
                </button>
              )
            ) : (
              <Link to="/login" className="btn-primary">
                <i className="fas fa-sign-in-alt"></i> Login to Enroll
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="course-content-container">
        <div className="course-description-container">
          <h2>About This Course</h2>
          <div className="course-description">
            <p>{course.description}</p>
          </div>

          <div className="instructor-info">
            <h3>Instructor</h3>
            <div className="instructor-details">
              <div className="instructor-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="instructor-bio">
                <h4>
                  {course.creator
                    ? `${course.creator.first_name} ${course.creator.last_name}`
                    : "Unknown"}
                </h4>
                <p>Course Creator</p>
              </div>
            </div>
          </div>
        </div>

        <div className="course-curriculum">
          <h2>Course Curriculum</h2>

          {sections.length === 0 ? (
            <div className="no-content">
              <p>No content available for this course yet.</p>
            </div>
          ) : (
            <div className="curriculum-sections">
              {sections.map((section) => (
                <div key={section.id} className="curriculum-section">
                  <div
                    className="section-header"
                    onClick={() => toggleSectionContent(section.id)}
                  >
                    <div className="section-title">
                      <h3>{section.title}</h3>
                      <span className="content-count">
                        {section.contentTypes?.length || 0} lessons
                      </span>
                    </div>
                    <span className="toggle-icon">
                      <i
                        className={`fas fa-chevron-${
                          sectionContentVisible[section.id] ? "up" : "down"
                        }`}
                      ></i>
                    </span>
                  </div>

                  {sectionContentVisible[section.id] &&
                    section.contentTypes && (
                      <div className="section-content">
                        {section.contentTypes.map((content) => (
                          <div key={content.id} className="content-item">
                            <div className="content-icon">
                              {getContentIcon(content.content_type)}
                            </div>
                            <div className="content-title">{content.title}</div>
                            <div className="content-type">
                              {content.content_type}
                            </div>
                            {content.videoContent && (
                              <div className="content-duration">
                                {Math.floor(content.videoContent.duration / 60)}
                                :
                                {(content.videoContent.duration % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {!course.isEnrolled && (
            <div className="enrollment-prompt">
              {isAuthenticated ? (
                <button onClick={handleEnroll} className="btn-primary">
                  <i className="fas fa-graduation-cap"></i> Enroll Now
                </button>
              ) : (
                <Link to="/login" className="btn-primary">
                  <i className="fas fa-sign-in-alt"></i> Login to Enroll
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
