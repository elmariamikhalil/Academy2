import React, { useState, useEffect } from 'react';
import '../../styles/admin/CourseForm.css';

const CourseForm = ({ course, isAddMode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    difficulty_level: 'beginner',
    duration: '',
    is_published: false
  });
  
  // Component implementation
  // ...
  
  return (
    <div className="course-form-container">
      {/* Component JSX */}
    </div>
  );
};

export default CourseForm;