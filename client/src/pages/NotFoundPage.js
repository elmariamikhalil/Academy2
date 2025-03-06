import React from "react";
import { Link } from "react-router-dom";
import "../styles/NotFoundPage.css";

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">
          <i className="fas fa-home"></i> Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
