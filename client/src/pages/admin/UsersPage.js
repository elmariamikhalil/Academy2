import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import userService from "../../services/user.service";
import "../../styles/admin/UsersPage.css";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load users. Please try again later.");
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUser(userId, { role: newRole });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success("User role updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await userService.deleteUser(userId);

        // Update local state
        setUsers(users.filter((user) => user.id !== userId));

        toast.success("User deleted successfully");
      } catch (err) {
        toast.error(err.response?.data?.message || "An error occurred");
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!selectedUser || !newPassword) return;

    try {
      await userService.resetUserPassword(selectedUser.id, newPassword);
      toast.success("Password reset successfully");
      setShowResetPasswordModal(false);
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowResetPasswordModal(true);
  };

  const openUserDetailsModal = async (user) => {
    try {
      const userDetails = await userService.getUserById(user.id);
      setSelectedUser(userDetails.data);
      setShowUserDetailsModal(true);
    } catch (err) {
      toast.error("Failed to load user details");
    }
  };

  const filteredUsers = users.filter((user) => {
    // Apply search filter
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Apply role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h1>Manage Users</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>

        <div className="filter-group">
          <label htmlFor="role-filter">Role:</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="username-cell">
                    <div className="user-avatar">
                      {user.profile_image ? (
                        <img src={user.profile_image} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.first_name && user.last_name
                            ? `${user.first_name[0]}${user.last_name[0]}`
                            : user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span>{user.username}</span>
                  </td>
                  <td>{`${user.first_name} ${user.last_name}`}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="role-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => openUserDetailsModal(user)}
                        title="View User Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => openResetPasswordModal(user)}
                        title="Reset Password"
                      >
                        <i className="fas fa-key"></i>
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button
                className="modal-close"
                onClick={() => setShowResetPasswordModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Reset password for <strong>{selectedUser.username}</strong>
              </p>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Reset Password
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowResetPasswordModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>User Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowUserDetailsModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="user-header">
                  <div className="user-avatar large">
                    {selectedUser.profile_image ? (
                      <img
                        src={selectedUser.profile_image}
                        alt={selectedUser.username}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {selectedUser.first_name && selectedUser.last_name
                          ? `${selectedUser.first_name[0]}${selectedUser.last_name[0]}`
                          : selectedUser.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-name">
                    <h3>{`${selectedUser.first_name} ${selectedUser.last_name}`}</h3>
                    <p className="username">@{selectedUser.username}</p>
                  </div>
                </div>

                <div className="user-info">
                  <div className="info-group">
                    <label>Email:</label>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div className="info-group">
                    <label>Role:</label>
                    <p>{selectedUser.role}</p>
                  </div>
                  <div className="info-group">
                    <label>Joined:</label>
                    <p>
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedUser.enrollments && (
                  <div className="user-enrollments">
                    <h4>Enrolled Courses</h4>
                    {selectedUser.enrollments.length === 0 ? (
                      <p>No enrolled courses</p>
                    ) : (
                      <ul className="enrollments-list">
                        {selectedUser.enrollments.map((enrollment) => (
                          <li key={enrollment.id} className="enrollment-item">
                            <div className="enrollment-info">
                              <h5>{enrollment.course.title}</h5>
                              <div className="enrollment-meta">
                                <span>
                                  <i className="fas fa-calendar-alt"></i>
                                  {new Date(
                                    enrollment.enrollment_date
                                  ).toLocaleDateString()}
                                </span>
                                <span>
                                  <i className="fas fa-chart-line"></i>
                                  {enrollment.progress}% complete
                                </span>
                                {enrollment.completed && (
                                  <span className="badge completed">
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowUserDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
