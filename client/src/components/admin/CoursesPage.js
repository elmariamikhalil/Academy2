import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import courseService from "../../services/course.service";
import CourseForm from "../../components/admin/CourseForm";
import "../../styles/admin/CoursesPage.css";

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCoursesAdmin();
      setCourses(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load courses. Please try again later.");
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsAddMode(true);
    setCurrentCourse(null);
    setShowForm(true);
  };

  const handleEditClick = (course) => {
    setIsAddMode(false);
    setCurrentCourse(course);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (isAddMode) {
        await courseService.createCourse(formData);
        toast.success("Course created successfully");
      } else {
        await courseService.updateCourse(currentCourse.id, formData);
        toast.success("Course updated successfully");
      }

      fetchCourses();
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      try {
        await courseService.deleteCourse(courseId);
        toast.success("Course deleted successfully");
        fetchCourses();
      } catch (err) {
        toast.error(err.response?.data?.message || "An error occurred");
      }
    }
  };

  const togglePublishStatus = async (course) => {
    try {
      await courseService.updateCourse(course.id, {
        is_published: !course.is_published,
      });

      toast.success(
        `Course ${
          course.is_published ? "unpublished" : "published"
        } successfully`
      );
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="admin-courses-page">
      <div className="page-header">
        <h1>Manage Courses</h1>
        <button onClick={handleAddClick} className="btn-primary">
          <i className="fas fa-plus"></i> Add New Course
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <CourseForm
          course={currentCourse}
          isAddMode={isAddMode}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
        />
      )}

      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Level</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No courses found. Click "Add New Course" to create one.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="course-cell">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="course-thumbnail"
                        />
                      )}
                      <span className="course-title">{course.title}</span>
                    </div>
                  </td>
                  <td>{course.difficulty_level}</td>
                  <td>{course.duration} min</td>
                  <td>
                    <span
                      className={`status-badge ${
                        course.is_published ? "published" : "draft"
                      }`}
                    >
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{new Date(course.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => togglePublishStatus(course)}
                        className="btn-icon"
                        title={
                          course.is_published
                            ? "Unpublish course"
                            : "Publish course"
                        }
                      >
                        <i
                          className={`fas ${
                            course.is_published ? "fa-eye-slash" : "fa-eye"
                          }`}
                        ></i>
                      </button>
                      <Link
                        to={`/admin/courses/${course.id}/content`}
                        className="btn-icon"
                        title="Manage content"
                      >
                        <i className="fas fa-list-ul"></i>
                      </Link>
                      <button
                        onClick={() => handleEditClick(course)}
                        className="btn-icon"
                        title="Edit course"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="btn-icon delete"
                        title="Delete course"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoursesPage;
