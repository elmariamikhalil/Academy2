import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import reportService from "../../services/report.service";
import "../../styles/admin/DashboardPage.css";

const AdminDashboardPage = () => {
  const [usersData, setUsersData] = useState(null);
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch users report
        const usersResponse = await reportService.getUsersReport();
        setUsersData(usersResponse.data);

        // Fetch courses report
        const coursesResponse = await reportService.getCoursesReport();
        setCoursesData(coursesResponse.data);

        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{usersData?.totalUsers || 0}</div>
          <div className="stat-subtitle">
            ({usersData?.totalAdmins || 0} admins)
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-title">Total Courses</div>
          <div className="stat-value">{coursesData?.totalCourses || 0}</div>
          <div className="stat-subtitle">
            ({coursesData?.publishedCourses || 0} published)
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-title">Enrollments</div>
          <div className="stat-value">{usersData?.enrollmentCount || 0}</div>
          <div className="stat-subtitle">
            ({usersData?.completedCourseCount || 0} completed)
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-title">Completion Rate</div>
          <div className="stat-value">
            {usersData ? `${Math.round(usersData.completionRate)}%` : "0%"}
          </div>
          <div className="stat-subtitle">overall</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-row">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Recent Users</h2>
            <Link to="/admin/users" className="view-all-link">
              View All
            </Link>
          </div>

          <div className="activity-list">
            {usersData?.recentUsers && usersData.recentUsers.length > 0 ? (
              usersData.recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="activity-item">
                  <div className="activity-icon user">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      {user.first_name} {user.last_name} ({user.username})
                    </div>
                    <div className="activity-meta">
                      <span>{user.email}</span>
                      <span>
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent users</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Popular Courses</h2>
            <Link to="/admin/courses" className="view-all-link">
              View All
            </Link>
          </div>

          <div className="activity-list">
            {coursesData?.popularCourses &&
            coursesData.popularCourses.length > 0 ? (
              coursesData.popularCourses.map((course) => (
                <div key={course.id} className="activity-item">
                  <div className="activity-icon course">
                    <i className="fas fa-book"></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{course.title}</div>
                    <div className="activity-meta">
                      <span>{course.enrollmentCount} enrollments</span>
                      <span>{course.difficultyLevel}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No popular courses</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
