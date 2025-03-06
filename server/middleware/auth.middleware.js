const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require('../models');
const User = db.users;

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Check if user has admin role
const isAdmin = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
    return;
  }

  res.status(403).send({
    message: "Require Admin Role!"
  });
};

// Check if user is accessing their own resources or is an admin
const isOwnerOrAdmin = async (req, res, next) => {
  try {
    // If user is admin, allow access
    if (req.userRole === 'admin') {
      next();
      return;
    }

    // If user is trying to access their own resources, allow access
    if (parseInt(req.params.id) === req.userId) {
      next();
      return;
    }

    res.status(403).send({
      message: "Unauthorized access to this resource!"
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin
};