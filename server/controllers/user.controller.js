const db = require("../models");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const User = db.users;
const Course = db.courses;
const Enrollment = db.enrollments;

// Get current user profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update current user profile
exports.updateCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update user fields
    await user.update({
      first_name: req.body.firstName || user.first_name,
      last_name: req.body.lastName || user.last_name,
      email: req.body.email || user.email,
    });

    // Return updated user without password
    const updatedUser = await User.findByPk(req.userId, {
      attributes: { exclude: ["password"] },
    });

    res.status(200).send({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .send({ message: "Current password and new password are required" });
    }

    // Get user with password
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Verify current password
    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Current password is incorrect" });
    }

    // Update password
    await user.update({
      password: bcrypt.hashSync(newPassword, 8),
    });

    res.status(200).send({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    // Get user
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Delete old profile image if exists
    if (user.profile_image) {
      const oldImagePath = path.join(__dirname, "..", user.profile_image);
      // Check if file exists before trying to delete
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user profile image
    const imageUrl = `/uploads/user-${user.id}/${req.file.filename}`;
    await user.update({ profile_image: imageUrl });

    res.status(200).send({
      message: "Profile image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get user learning dashboard data
exports.getLearningDashboard = async (req, res) => {
  try {
    // Get user enrollments with courses
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Course,
          where: { is_published: true },
        },
      ],
      order: [["enrollment_date", "DESC"]],
    });

    // Get in-progress courses (progress > 0 but not completed)
    const inProgressCourses = enrollments.filter(
      (enrollment) => enrollment.progress > 0 && !enrollment.completed
    );

    // Get completed courses
    const completedCourses = enrollments.filter(
      (enrollment) => enrollment.completed
    );

    // Get newly enrolled courses (progress = 0)
    const newCourses = enrollments.filter(
      (enrollment) => enrollment.progress === 0
    );

    res.status(200).send({
      inProgressCourses,
      completedCourses,
      newCourses,
      totalEnrolled: enrollments.length,
      totalCompleted: completedCourses.length,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Admin Controllers

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]],
    });

    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Get user enrollments
    const enrollments = await Enrollment.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Course,
          attributes: ["id", "title", "thumbnail"],
        },
      ],
    });

    // Return user with enrollments
    res.status(200).send({
      ...user.toJSON(),
      enrollments,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update user fields
    await user.update({
      first_name: req.body.firstName || user.first_name,
      last_name: req.body.lastName || user.last_name,
      email: req.body.email || user.email,
      role: req.body.role || user.role,
    });

    res.status(200).send({
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Don't allow deleting your own account
    if (parseInt(userId) === req.userId) {
      return res
        .status(400)
        .send({ message: "You cannot delete your own account" });
    }

    // Delete user (will cascade delete enrollments, progress, evaluations)
    await user.destroy();

    res.status(200).send({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res.status(400).send({ message: "New password is required" });
    }

    // Check if user exists
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update password
    await user.update({
      password: bcrypt.hashSync(newPassword, 8),
    });

    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
