import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService from '../services/course.service';
import { AuthContext } from './AuthContext';

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Methods for fetching and managing courses
  // ...
  
  return (
    <CourseContext.Provider value={/* value object */}>
      {children}
    </CourseContext.Provider>
  );
};