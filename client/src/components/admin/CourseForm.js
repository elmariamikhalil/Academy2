import React, { useState, useEffect } from "react";
import "../../styles/admin/CourseForm.css";

const CourseForm = ({ course, isAddMode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    difficulty_level: "beginner",
    duration: "",
    is_published: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If editing, populate the form with course data
    if (!isAddMode && course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        thumbnail: course.thumbnail || "",
        difficulty_level: course.difficulty_level || "beginner",
        duration: course.duration || "",
        is_published: course.is_published || false,
      });
    }
  }, [course, isAddMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.duration && isNaN(parseInt(formData.duration))) {
      newErrors.duration = "Duration must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Convert duration to number
      const formattedData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
      };

      onSubmit(formattedData);
    }
  };

  return (
    <div className="course-form-container">
      <h3>{isAddMode ? "Add New Course" : "Edit Course"}</h3>
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? "error" : ""}
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={errors.description ? "error" : ""}
          ></textarea>
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail URL</label>
          <input
            type="text"
            id="thumbnail"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
          />
          {formData.thumbnail && (
            <div className="thumbnail-preview">
              <img src={formData.thumbnail} alt="Thumbnail preview" />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="difficulty_level">Difficulty Level</label>
            <select
              id="difficulty_level"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              className={errors.duration ? "error" : ""}
            />
            {errors.duration && (
              <span className="error-message">{errors.duration}</span>
            )}
          </div>
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            checked={formData.is_published}
            onChange={handleChange}
          />
          <label htmlFor="is_published">Publish Course</label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {isAddMode ? "Create Course" : "Update Course"}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
