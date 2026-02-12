// src/pages/dashboard/ProfilePage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { profileService } from "../../services/profileService";
import DashboardSuccessModal from "../../components/DashboardSuccessModal";
import "../../assets/css/ProfilePage.css";

const DashboardProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [updatedFieldsList, setUpdatedFieldsList] = useState<string[]>([]);
  
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    location: "",
    company: "",
    job_title: "",
    profile_picture: "",
    date_joined: "",
  });
  
  const [tempData, setTempData] = useState(userData);

  // Load user data from context
  useEffect(() => {
    if (user) {
      const formattedData = {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        location: user.location || "",
        company: user.company || "",
        job_title: user.job_title || "",
        profile_picture: user.profile_picture || "",
        date_joined: formatDate(user.date_joined),
      };
      setUserData(formattedData);
      setTempData(formattedData);
    }
  }, [user]);

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long'
      });
    } catch {
      return 'Unknown';
    }
  };

  // Get user full name
  const getFullName = (): string => {
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    if (userData.first_name) {
      return userData.first_name;
    }
    if (userData.last_name) {
      return userData.last_name;
    }
    return user?.username || "User";
  };

  // Get user role
  const getUserRole = (): string => {
    if (user?.is_staff) return "Administrator";
    return "Member";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare data for update
      const updateData: Partial<typeof userData> = {};
      const changedFields: string[] = [];
      
      if (tempData.first_name !== userData.first_name) {
        updateData.first_name = tempData.first_name;
        changedFields.push('first_name');
      }
      if (tempData.last_name !== userData.last_name) {
        updateData.last_name = tempData.last_name;
        changedFields.push('last_name');
      }
      if (tempData.phone_number !== userData.phone_number) {
        updateData.phone_number = tempData.phone_number;
        changedFields.push('phone_number');
      }
      if (tempData.location !== userData.location) {
        updateData.location = tempData.location;
        changedFields.push('location');
      }
      if (tempData.company !== userData.company) {
        updateData.company = tempData.company;
        changedFields.push('company');
      }
      if (tempData.job_title !== userData.job_title) {
        updateData.job_title = tempData.job_title;
        changedFields.push('job_title');
      }

      // Only call API if there are changes
      if (Object.keys(updateData).length > 0) {
        const response = await profileService.updateProfile(updateData);
        
        if (response.success && response.data) {
          setUserData(tempData);
          await refreshUser();
          
          // Show success modal
          setSuccessModalTitle('Profile Updated! 🎉');
          setSuccessModalMessage('Your profile information has been saved successfully.');
          setUpdatedFieldsList(changedFields);
          setShowSuccessModal(true);
        } else {
          setError(response.message || "Failed to update profile");
        }
      } else {
        // No changes made
        setSuccessModalTitle('No Changes');
        setSuccessModalMessage('No changes were made to your profile.');
        setUpdatedFieldsList([]);
        setShowSuccessModal(true);
      }
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempData(userData);
    setIsEditing(false);
    setError(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await profileService.uploadAvatar(file);
      
      if (response.success && response.data) {
        const profilePicture = response.data.profile_picture || '';
        setTempData((prev) => ({ ...prev, profile_picture: profilePicture }));
        setUserData((prev) => ({ ...prev, profile_picture: profilePicture }));
        await refreshUser();
        
        // Show success modal for avatar
        setSuccessModalTitle('Photo Updated! 📸');
        setSuccessModalMessage('Your profile picture has been updated successfully.');
        setUpdatedFieldsList(['profile_picture']);
        setShowSuccessModal(true);
      } else {
        setError(response.message || "Failed to upload image");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while uploading");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await profileService.removeAvatar();
      
      if (response.success) {
        setTempData((prev) => ({ ...prev, profile_picture: '' }));
        setUserData((prev) => ({ ...prev, profile_picture: '' }));
        await refreshUser();
        
        // Show success modal for avatar removal
        setSuccessModalTitle('Photo Removed 🗑️');
        setSuccessModalMessage('Your profile picture has been removed successfully.');
        setUpdatedFieldsList([]);
        setShowSuccessModal(true);
      } else {
        setError(response.message || "Failed to remove image");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while removing image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Get avatar URL
  const getAvatarUrl = (): string => {
    if (tempData.profile_picture && !tempData.profile_picture.includes('placeholder')) {
      if (tempData.profile_picture.startsWith('http')) {
        return tempData.profile_picture;
      }
      return tempData.profile_picture;
    }
    
    // Fallback to UI Avatar with orange theme
    const name = getFullName();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F8780F&color=FFFFFF&bold=true&length=2&size=120`;
  };

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          {/* Header */}
          <div className="profile-header">
            <h1 className="profile-title">My Profile</h1>
            <div className="profile-actions">
              {!isEditing ? (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V11M18.364 5.63604C18.6074 5.39262 18.8978 5.23032 19.2001 5.14912C19.5024 5.06792 19.813 5.07766 20.1084 5.17578C20.4038 5.2739 20.679 5.45513 20.9261 5.70224C21.1732 5.94935 21.3544 6.22454 21.4525 6.51988C21.5507 6.81522 21.5604 7.12585 21.4792 7.42811C21.398 7.73037 21.2357 8.02081 20.9923 8.26423L12 17.256V18H10V15.744L18.364 7.364L18.364 5.63604Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    className="btn-save" 
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    className="btn-cancel" 
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Avatar Section - WITH ALL ICONS PRESERVED */}
          <div className="profile-avatar-section">
            <div className="avatar-upload">
              <img 
                src={getAvatarUrl()} 
                alt={getFullName()} 
                className="avatar-large"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getFullName())}&background=F8780F&color=FFFFFF&bold=true&length=2&size=120`;
                }}
              />
              {isEditing && (
                <div className="avatar-edit-controls">
                  {/* Camera Icon - Upload */}
                  <label htmlFor="avatar-upload" className="avatar-edit-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                      style={{ display: "none" }}
                    />
                  </label>
                  
                  {/* Trash Icon - Remove - Only show if profile picture exists */}
                  {tempData.profile_picture && (
                    <button 
                      className="avatar-remove-btn"
                      onClick={handleRemoveAvatar}
                      disabled={isUploading}
                      title="Remove profile picture"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6H5H21" strokeLinecap="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"/>
                      </svg>
                    </button>
                  )}
                  
                  {/* Uploading Status */}
                  {isUploading && <span className="upload-status">Uploading...</span>}
                </div>
              )}
            </div>
            <div className="avatar-info">
              <h2 className="avatar-name">{getFullName()}</h2>
              <p className="avatar-role">{getUserRole()}</p>
              {userData.company && (
                <p className="avatar-company">{userData.company}</p>
              )}
              {userData.job_title && (
                <p className="avatar-job-title">{userData.job_title}</p>
              )}
            </div>
          </div>

          {/* Main Profile Details */}
          <div className="profile-details">
            <div className="detail-card">
              <h3 className="detail-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Personal Information
              </h3>
              <div className="detail-grid">
                <div className="detail-field">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={tempData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="First name"
                    className={`input-field ${isEditing ? 'editable' : ''}`}
                  />
                </div>
                <div className="detail-field">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={tempData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Last name"
                    className={`input-field ${isEditing ? 'editable' : ''}`}
                  />
                </div>
                <div className="detail-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={tempData.email}
                    disabled={true}
                    className="input-field"
                  />
                </div>
                <div className="detail-field">
                  <label htmlFor="phone_number">Phone Number</label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={tempData.phone_number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Phone number"
                    className={`input-field ${isEditing ? 'editable' : ''}`}
                  />
                </div>
                <div className="detail-field">
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={tempData.company}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Company name"
                    className={`input-field ${isEditing ? 'editable' : ''}`}
                  />
                </div>
                <div className="detail-field">
                  <label htmlFor="job_title">Job Title</label>
                  <input
                    id="job_title"
                    name="job_title"
                    type="text"
                    value={tempData.job_title}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Job title"
                    className={`input-field ${isEditing ? 'editable' : ''}`}
                  />
                </div>
                <div className="detail-field">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={tempData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className={`input-field ${isEditing ? 'editable' : ''}`}
                  />
                </div>
                <div className="detail-field">
                  <label>Member Since</label>
                  <input
                    type="text"
                    value={userData.date_joined}
                    disabled
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="detail-card">
              <h3 className="detail-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 7H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Account Settings
              </h3>
              <div className="account-actions">
                <Link to="/dashboard/settings" className="action-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15A7.5 7.5 0 0 0 12 4.6M12 19.4A7.5 7.5 0 0 0 19.4 12M12 4.6V19.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Manage Settings
                </Link>
                <Link to="/dashboard/billing" className="action-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="7" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M22.28 15.7A3.78 3.78 0 0 1 19 16.5C17.28 16.5 15.8 15.08 15.8 13.5S17.28 10.5 19 10.5C20.18 10.5 21.28 11.34 21.72 12.62L22.62 12L22.28 15.7Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Billing & Subscription
                </Link>
                <button className="action-link danger" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 4 20.5304 4 20V4C4 3.46957 4.46957 3 5 3H9M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <DashboardSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successModalTitle}
        message={successModalMessage}
        userName={getFullName()}
        updatedFields={updatedFieldsList}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </>
  );
};

export default DashboardProfile;