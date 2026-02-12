// src/pages/dashboard/SettingsPage.tsx
import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Palette, Key, FileCode } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import DashboardSuccessModal from "../../components/DashboardSuccessModal";
import "../../assets/css/SettingsPage.css";

type Theme = 'light' | 'dark' | 'system';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'system';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change state - DESIGN ONLY (logic commented out)
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordChangeData>>({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [updatedFieldsList, setUpdatedFieldsList] = useState<string[]>([]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const applyTheme = (selectedTheme: Theme) => {
      const root = document.documentElement;
      
      if (selectedTheme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else if (selectedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setSuccessModalTitle('Theme Updated! 🎨');
    setSuccessModalMessage(`Your theme preference has been set to ${newTheme}.`);
    setUpdatedFieldsList(['theme_preference']);
    setShowSuccessModal(true);
  };

  // Password input handlers - DESIGN ONLY
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (passwordErrors[name as keyof PasswordChangeData]) {
      setPasswordErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setError(null);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordForm = (): boolean => {
    const errors: Partial<PasswordChangeData> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.newPassword && passwordData.currentPassword && 
        passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* 🔒 PASSWORD CHANGE LOGIC - DISABLED UNTIL BACKEND READY
   * Backend endpoint: /api/v1/auth/change-password/
   * Expected: POST request with { old_password, new_password, confirm_new_password }
   * To enable: Uncomment this function and import authService
   */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    // Show loading state
    setIsLoading(true);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      // ⚠️ BACKEND NOT READY - SHOW COMING SOON MODAL
      setSuccessModalTitle('Coming Soon! 🚧');
      setSuccessModalMessage('Password change feature will be available tomorrow. Please check back later.');
      setUpdatedFieldsList([]);
      setShowSuccessModal(true);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      setIsLoading(false);
    }, 800);
    
    /* 🔧 UNCOMMENT WHEN BACKEND IS READY
    try {
      const response = await authService.changePassword({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_new_password: passwordData.confirmPassword
      });

      if (response.success) {
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
        
        // Show success modal
        setSuccessModalTitle('Password Updated! 🔐');
        setSuccessModalMessage('Your password has been changed successfully.');
        setUpdatedFieldsList(['password']);
        setShowSuccessModal(true);
      } else {
        setError(response.message || 'Failed to update password');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while changing password');
    } finally {
      setIsLoading(false);
    }
    */
  };

  const handleSaveGeneral = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSuccessModalTitle('Settings Saved! ✅');
      setSuccessModalMessage('Your general settings have been updated successfully.');
      setUpdatedFieldsList(['language', 'notifications']);
      setShowSuccessModal(true);
      setIsLoading(false);
    }, 600);
  };

  const handleUpdateAccount = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSuccessModalTitle('Account Updated! 👤');
      setSuccessModalMessage('Your account settings have been updated successfully.');
      setUpdatedFieldsList(['account_info']);
      setShowSuccessModal(true);
      setIsLoading(false);
    }, 600);
  };

  const handleRulePackUpload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSuccessModalTitle('Coming Soon! 🚧');
      setSuccessModalMessage('Rule pack upload feature is currently in development.');
      setUpdatedFieldsList([]);
      setShowSuccessModal(true);
      setIsLoading(false);
    }, 600);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'account', label: 'Account', icon: User },
    { id: 'password', label: 'Change Password', icon: Key },
    { id: 'rules', label: 'Rule Packs', icon: FileCode },
  ];

  // Get user full name for modal
  const getFullName = (): string => {
    if (!user) return "User";
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return user.username || "User";
  };

  return (
    <>
      <div className="settings-page">
        <div className="settings-header">
          <div className="header-content">
            <h1>Settings</h1>
            <p>Manage your account, security, and preferences</p>
          </div>
        </div>

        <div className="settings-container">
          <div className="settings-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="settings-content">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="tab-panel">
                <h2>
                  <Palette size={24} />
                  General Settings
                </h2>
                <div className="setting-group">
                  <label>Theme</label>
                  <p className="setting-description">Choose your preferred theme or sync with system settings</p>
                  <div className="theme-options">
                    <button
                      className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('light')}
                      disabled={isLoading}
                    >
                      ☀️ Light
                    </button>
                    <button
                      className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('dark')}
                      disabled={isLoading}
                    >
                      🌙 Dark
                    </button>
                    <button
                      className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('system')}
                      disabled={isLoading}
                    >
                      💻 System
                    </button>
                  </div>
                </div>
                <div className="setting-group">
                  <label>Language</label>
                  <p className="setting-description">Select your preferred language</p>
                  <select defaultValue="en" disabled={isLoading}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <button 
                  className="save-btn" 
                  onClick={handleSaveGeneral}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="tab-panel">
                <h2>
                  <User size={24} />
                  Account Settings
                </h2>
                <div className="setting-group">
                  <label>Email</label>
                  <p className="setting-description">Your primary email address</p>
                  <input 
                    type="email" 
                    defaultValue={user?.email || "user@bimflow.com"} 
                    disabled={true}
                    className="input-disabled"
                  />
                  <small className="field-note">Email cannot be changed</small>
                </div>
                <div className="setting-group">
                  <label>Username</label>
                  <p className="setting-description">Your unique username</p>
                  <input 
                    type="text" 
                    defaultValue={user?.username || "username"} 
                    disabled={true}
                    className="input-disabled"
                  />
                  <small className="field-note">Username cannot be changed</small>
                </div>
                <div className="setting-group">
                  <label>Organization</label>
                  <p className="setting-description">Your company or organization name</p>
                  <input 
                    type="text" 
                    defaultValue={user?.company || "BIMFlow Solutions"} 
                    placeholder="Enter your organization name"
                    disabled={isLoading}
                  />
                </div>
                <button 
                  className="save-btn" 
                  onClick={handleUpdateAccount}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Account'}
                </button>
              </div>
            )}

            {/* Password Change Tab - DESIGN COMPLETE, LOGIC DISABLED */}
            {activeTab === 'password' && (
              <div className="tab-panel">
                <h2>
                  <Key size={24} />
                  Change Password
                </h2>
                <p className="tab-description">
                  Ensure your account is secure by using a strong password that you don't use elsewhere.
                </p>
                
                {/* Coming Soon Badge */}
                <div className="coming-soon-badge">
                  <span className="badge-icon">🚧</span>
                  <span className="badge-text">Coming Soon - Available Tomorrow</span>
                </div>
                
                {error && (
                  <div className="error-message">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handlePasswordChange}>
                  <div className="setting-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Enter your current password"
                        className={passwordErrors.currentPassword ? 'error' : ''}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('current')}
                        aria-label={showPassword.current ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showPassword.current ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <span className="field-error">{passwordErrors.currentPassword}</span>
                    )}
                  </div>

                  <div className="setting-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Enter new password"
                        className={passwordErrors.newPassword ? 'error' : ''}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('new')}
                        aria-label={showPassword.new ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showPassword.new ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    {passwordErrors.newPassword ? (
                      <span className="field-error">{passwordErrors.newPassword}</span>
                    ) : (
                      <small className="field-note">Must be at least 8 characters</small>
                    )}
                  </div>

                  <div className="setting-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Confirm your new password"
                        className={passwordErrors.confirmPassword ? 'error' : ''}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('confirm')}
                        aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showPassword.confirm ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <span className="field-error">{passwordErrors.confirmPassword}</span>
                    )}
                  </div>

                  <div className="password-requirements">
                    <h4>Password Requirements:</h4>
                    <ul>
                      <li className={passwordData.newPassword.length >= 8 ? 'met' : ''}>
                        • At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(passwordData.newPassword) ? 'met' : ''}>
                        • At least one uppercase letter
                      </li>
                      <li className={/[a-z]/.test(passwordData.newPassword) ? 'met' : ''}>
                        • At least one lowercase letter
                      </li>
                      <li className={/[0-9]/.test(passwordData.newPassword) ? 'met' : ''}>
                        • At least one number
                      </li>
                      <li className={/[!@#$%^&*]/.test(passwordData.newPassword) ? 'met' : ''}>
                        • At least one special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>

                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Rule Packs Tab */}
            {activeTab === 'rules' && (
              <div className="tab-panel">
                <h2>
                  <FileCode size={24} />
                  Custom Rule Packs
                </h2>
                <p className="tab-description">
                  Upload YAML/JSON rule packs for custom compliance checking.
                </p>
                
                {/* Coming Soon Badge */}
                <div className="coming-soon-badge">
                  <span className="badge-icon">🚧</span>
                  <span className="badge-text">Coming Soon - In Development</span>
                </div>
                
                <div className="upload-area">
                  <input type="file" accept=".yaml,.json,.yml" id="rule-upload" disabled />
                  <label htmlFor="rule-upload" className="upload-label disabled">
                    <FileCode size={32} />
                    <span>Click to upload or drag & drop</span>
                    <small>Supports .yaml, .yml and .json files</small>
                  </label>
                </div>
                
                <button 
                  className="upload-btn" 
                  onClick={handleRulePackUpload} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Upload Pack'}
                </button>
              </div>
            )}
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

export default SettingsPage;