import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { CourseContext } from "../../context/CourseContext";
import "../../styles/user/LearningPage.css";

const LearningPage = () => {
  const { enrolledCourses, fetchEnrolledCourses, loading } =
    useContext(CourseContext);

  const [activeTab, setActiveTab] = useState("inProgress");
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      filterCourses(activeTab);
    }
  }, [enrolledCourses, activeTab]);

  const filterCourses = (tab) => {
    let filtered = [];

    switch (tab) {
      case "inProgress":
        filtered = enrolledCourses.filter(
          (enrollment) => enrollment.progress > 0 && !enrollment.completed
        );
        break;
      case "notStarted":
        filtered = enrolledCourses.filter(
          (enrollment) => enrollment.progress === 0
        );
        break;
      case "completed":
        filtered = enrolledCourses.filter((enrollment) => enrollment.completed);
        break;
      default:
        filtered = enrolledCourses;
    }

    setFilteredCourses(filtered);
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="learning-page">
      <div className="learning-container">
        <h1>My Learning</h1>

        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "inProgress" ? "active" : ""}`}
              onClick={() => setActiveTab("inProgress")}
            >
              In Progress
            </button>
            <button
              className={`tab ${activeTab === "notStarted" ? "active" : ""}`}
              onClick={() => setActiveTab("notStarted")}
            >
              Not Started
            </button>
            <button
              className={`tab ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="no-courses">
            <p>You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="no-courses">
            <p>No courses in this category.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((enrollment) => (
              <div key={enrollment.id} className="course-card">
                <div className="course-thumbnail">
                  {enrollment.course.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                    />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <i className="fas fa-book-open"></i>
                    </div>
                  )}
                </div>

                <div className="course-content">
                  <h3 className="course-title">{enrollment.course.title}</h3>

                  <div className="progress-container">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {enrollment.progress}% complete
                    </div>
                  </div>

                  <div className="course-meta">
                    <div className="meta-item">
                      <i className="fas fa-layer-group"></i>
                      <span>{enrollment.course.difficulty_level}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>
                        {new Date(
                          enrollment.enrollment_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/learning/${enrollment.course.id}`}
                    className="continue-btn"
                  >
                    {enrollment.progress === 0
                      ? "Start Learning"
                      : enrollment.completed
                      ? "Review Course"
                      : "Continue Learning"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPage;
