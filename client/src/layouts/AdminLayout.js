import React from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import "../styles/AdminLayout.css";

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="app admin-layout">
      <Navbar />
      <div className="admin-container">
        <aside className="admin-sidebar">
          <div className="sidebar-title">Admin Dashboard</div>
          <nav className="sidebar-nav">
            <ul>
              <li>
                <Link
                  to="/admin"
                  className={isActive("/admin") ? "active" : ""}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/courses"
                  className={
                    location.pathname.includes("/admin/courses") ? "active" : ""
                  }
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className={isActive("/admin/users") ? "active" : ""}
                >
                  Users
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/evaluations"
                  className={isActive("/admin/evaluations") ? "active" : ""}
                >
                  Evaluations
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/reports"
                  className={isActive("/admin/reports") ? "active" : ""}
                >
                  Reports
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="admin-content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
