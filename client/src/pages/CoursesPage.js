import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import courseService from "../services/course.service";
import { AuthContext } from "../context/AuthContext";
import "../styles/CoursesPage.css";

const CoursesPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sort options
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...courses];

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (course) => course.difficulty_level === difficultyFilter
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "difficulty") {
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        comparison =
          difficultyOrder[a.difficulty_level] -
          difficultyOrder[b.difficulty_level];
      } else if (sortBy === "duration") {
        comparison = a.duration - b.duration;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredCourses(filtered);
  }, [courses, difficultyFilter, searchQuery, sortBy, sortOrder]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      setCourses(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load courses. Please try again later.");
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseService.enrollInCourse(courseId);
      toast.success("Successfully enrolled in the course!");

      // Update the course in state to reflect enrollment
      setCourses(
        courses.map((course) =>
          course.id === courseId ? { ...course, isEnrolled: true } : course
        )
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to enroll in the course"
      );
    }
  };

  const handleDifficultyChange = (e) => {
    setDifficultyFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="courses-page">
      <section className="courses-header">
        <h1>Browse Courses</h1>
        <p>Discover our range of courses designed to help you learn and grow</p>
      </section>

      <section className="courses-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="difficulty">Difficulty:</label>
            <select
              id="difficulty"
              value={difficultyFilter}
              onChange={handleDifficultyChange}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Sort by:</label>
            <select id="sort" value={sortBy} onChange={handleSortChange}>
              <option value="title">Title</option>
              <option value="difficulty">Difficulty</option>
              <option value="duration">Duration</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={toggleSortOrder}
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              <i
                className={`fas fa-sort-${sortOrder === "asc" ? "up" : "down"}`}
              ></i>
            </button>
          </div>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      <section className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <p>No courses found matching your criteria.</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-thumbnail">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} />
                ) : (
                  <div className="placeholder-thumbnail">
                    <i className="fas fa-book-open"></i>
                  </div>
                )}
                <div className="course-badges">
                  <span
                    className={`difficulty-badge ${course.difficulty_level}`}
                  >
                    {course.difficulty_level}
                  </span>
                </div>
              </div>

              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>

                <div className="course-meta">
                  <div className="course-instructor">
                    <i className="fas fa-user"></i>
                    <span>
                      {course.creator
                        ? `${course.creator.first_name} ${course.creator.last_name}`
                        : "Unknown"}
                    </span>
                  </div>

                  <div className="course-duration">
                    <i className="fas fa-clock"></i>
                    <span>{course.duration} min</span>
                  </div>
                </div>

                <div className="course-actions">
                  {isAuthenticated ? (
                    course.isEnrolled ? (
                      <Link
                        to={`/learning/${course.id}`}
                        className="btn-secondary"
                      >
                        Continue Learning
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="btn-primary"
                      >
                        Enroll Now
                      </button>
                    )
                  ) : (
                    <Link to="/login" className="btn-primary">
                      Login to Enroll
                    </Link>
                  )}

                  <Link to={`/courses/${course.id}`} className="btn-outline">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CoursesPage;
