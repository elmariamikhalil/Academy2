import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import userService from "../../services/user.service";
import "../../styles/user/ProfilePage.css";

const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await userService.updateProfile(formData);
      updateUserProfile({
        ...currentUser,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      toast.success("Profile updated successfully");
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully");
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!imageFile) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", imageFile);

      await userService.uploadProfileImage(formData);

      toast.success("Profile image uploaded successfully");
      setLoading(false);

      // Reset image state
      setImageFile(null);

      // Refresh user profile to get the new image URL
      // This depends on your implementation of refreshing the user data
    } catch (err) {
      toast.error("Failed to upload image");
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-image-container">
              {currentUser.profile_image ? (
                <img
                  src={currentUser.profile_image}
                  alt={`${currentUser.firstName} ${currentUser.lastName}`}
                  className="profile-image"
                />
              ) : (
                <div className="profile-image-placeholder">
                  {currentUser.firstName && currentUser.lastName
                    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
                    : currentUser.username
                    ? currentUser.username[0].toUpperCase()
                    : "U"}
                </div>
              )}

              <form onSubmit={handleImageUpload} className="image-upload-form">
                <div className="file-input-container">
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="profile-image" className="file-input-label">
                    Choose Image
                  </label>
                </div>

                {imagePreview && (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Uploading..." : "Upload Image"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="profile-info">
              <div className="info-item">
                <span className="label">Username:</span>
                <span className="value">{currentUser.username}</span>
              </div>

              <div className="info-item">
                <span className="label">Role:</span>
                <span className="value">{currentUser.role}</span>
              </div>

              <div className="info-item">
                <span className="label">Member Since:</span>
                <span className="value">
                  {new Date(currentUser.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-section">
              <h2>Personal Information</h2>

              <form onSubmit={handleProfileUpdate}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            <div className="profile-section">
              <h2>Change Password</h2>

              <form onSubmit={handlePasswordUpdate}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
