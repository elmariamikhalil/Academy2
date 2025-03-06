import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import courseService from "../services/course.service";
import { AuthContext } from "./AuthContext";

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

  // Fetch all published courses
  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      setCourses(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch courses");
      setLoading(false);
    }
  };

  // Fetch featured courses for the homepage
  const fetchFeaturedCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getFeaturedCourses();
      setFeaturedCourses(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch featured courses");
      setLoading(false);
    }
  };

  // Fetch enrolled courses for the current user
  const fetchEnrolledCourses = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const response = await courseService.getEnrolledCourses();
      setEnrolledCourses(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch enrolled courses");
      setLoading(false);
    }
  };

  // Fetch a single course by ID
  const fetchCourseById = async (courseId) => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(courseId);
      setCurrentCourse(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to fetch course details");
      setLoading(false);
      return null;
    }
  };

  // Fetch course content (sections and lessons)
  const fetchCourseContent = async (courseId) => {
    try {
      setLoading(true);
      const response = await courseService.getCourseSections(courseId);
      setCourseContent(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to fetch course content");
      setLoading(false);
      return [];
    }
  };

  // Enroll in a course
  const enrollInCourse = async (courseId) => {
    if (!currentUser) {
      navigate("/login");
      return false;
    }

    try {
      await courseService.enrollInCourse(courseId);
      await fetchEnrolledCourses(); // Refresh enrolled courses
      toast.success("Successfully enrolled in the course!");
      return true;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to enroll in the course"
      );
      return false;
    }
  };

  // Update progress for a specific content item
  const updateContentProgress = async (contentId, data) => {
    try {
      await courseService.updateContentProgress(contentId, data);
      return true;
    } catch (err) {
      console.error("Failed to update progress:", err);
      return false;
    }
  };

  // Effect to fetch enrolled courses when user changes
  useEffect(() => {
    if (currentUser) {
      fetchEnrolledCourses();
    } else {
      setEnrolledCourses([]);
    }
  }, [currentUser]);

  // Context value
  const value = {
    courses,
    enrolledCourses,
    featuredCourses,
    currentCourse,
    courseContent,
    loading,
    error,
    fetchAllCourses,
    fetchFeaturedCourses,
    fetchEnrolledCourses,
    fetchCourseById,
    fetchCourseContent,
    enrollInCourse,
    updateContentProgress,
    setCurrentCourse,
    setCourseContent,
  };

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};

export default CourseContext;
