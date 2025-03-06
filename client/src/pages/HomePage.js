import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../services/course.service';
import '../styles/HomePage.css';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await courseService.getFeaturedCourses();
        setFeaturedCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured courses:', error);
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Marabes Academy</h1>
          <p>Expand your knowledge with our curated courses</p>
          <Link to="/courses" className="cta-button">
            Explore Courses
          </Link>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="featured-courses">
        <h2>Featured Courses</h2>
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="courses-grid">
            {featuredCourses.map((course) => (
              <div key={course.id} className="course-card">
                <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <span className="course-level">{course.difficulty_level}</span>
                    <span className="course-duration">{course.duration} min</span>
                  </div>
                  <Link to={`/courses/${course.id}`} className="view-course-btn">
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Marabes Academy?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-graduation-cap feature-icon"></i>
            <h3>Expert Instructors</h3>
            <p>Learn from industry experts and experienced professionals</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-laptop-code feature-icon"></i>
            <h3>Diverse Content</h3>
            <p>Access a variety of learning resources including videos and text</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-certificate feature-icon"></i>
            <h3>Certification</h3>
            <p>Earn certificates upon completion of courses</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-clock feature-icon"></i>
            <h3>Self-Paced Learning</h3>
            <p>Learn at your own pace and on your own schedule</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;