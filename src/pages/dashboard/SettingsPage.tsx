import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Palette, Key, FileCode, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import DashboardSuccessModal from "../../components/DashboardSuccessModal";
import "../../assets/css/SettingsPage.css";

type Theme = 'light' | 'dark' | 'system';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isLongEnough: boolean;
}

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'system';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [updatedFieldsList, setUpdatedFieldsList] = useState<string[]>([]);
  const [justSubmitted, setJustSubmitted] = useState(false);

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

  useEffect(() => {
    setJustSubmitted(false);
  }, [activeTab]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setSuccessModalTitle('Theme Updated! 🎨');
    setSuccessModalMessage(`Your theme preference has been set to ${newTheme}.`);
    setUpdatedFieldsList(['theme_preference']);
    setShowSuccessModal(true);
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (passwordErrors[name as keyof PasswordChangeData]) {
      setPasswordErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    if (error) {
      setError(null);
    }
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
    } else {
      const strength = checkPasswordStrength(passwordData.newPassword);
      if (!strength.hasUpperCase || !strength.hasLowerCase || !strength.hasNumber || !strength.hasSpecial) {
        errors.newPassword = 'Password must meet all requirements below';
      }
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.changePassword({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_new_password: passwordData.confirmPassword
      });

      if (response.success) {
        await refreshUser();
        
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
        
        setShowPassword({
          current: false,
          new: false,
          confirm: false
        });
        
        setJustSubmitted(true);
        
        setSuccessModalTitle('Password Updated! 🔐');
        setSuccessModalMessage('Your password has been changed successfully.');
        setUpdatedFieldsList(['password']);
        setShowSuccessModal(true);
      } else {
        setError(response.message || 'Failed to update password');
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'An error occurred while changing password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  const getFullName = (): string => {
    if (!user) return "User";
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return user.username || "User";
  };

  const checkPasswordStrength = (password: string): PasswordStrength => {
    return {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      isLongEnough: password.length >= 8
    };
  };

  const strength = checkPasswordStrength(passwordData.newPassword);
  
  const getPasswordStrengthPercentage = (): number => {
    const requirements = [
      strength.isLongEnough,
      strength.hasUpperCase,
      strength.hasLowerCase,
      strength.hasNumber,
      strength.hasSpecial
    ];
    const metCount = requirements.filter(Boolean).length;
    return (metCount / requirements.length) * 100;
  };

  const getPasswordStrengthLabel = (): { text: string; color: string } => {
    const percentage = getPasswordStrengthPercentage();
    if (percentage === 100) return { text: 'Strong', color: '#10b981' };
    if (percentage >= 60) return { text: 'Medium', color: '#f59e0b' };
    if (percentage > 0) return { text: 'Weak', color: '#ef4444' };
    return { text: 'Enter password', color: '#6b7280' };
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
                    value={user?.email || ""} 
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
                    value={user?.username || ""} 
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
                    defaultValue={user?.company || ""} 
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

            {activeTab === 'password' && (
              <div className="tab-panel">
                <h2>
                  <Key size={24} />
                  Change Password
                </h2>
                <p className="tab-description">
                  Ensure your account is secure by using a strong password that you don't use elsewhere.
                </p>
                
                {error && (
                  <div className="error-message">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} key={justSubmitted ? 'submitted' : 'active'}>
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
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('current')}
                        aria-label={showPassword.current ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
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
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('new')}
                        aria-label={showPassword.new ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    
                    {passwordData.newPassword && (
                      <div className="password-strength-meter">
                        <div 
                          className="strength-bar"
                          style={{ 
                            width: `${getPasswordStrengthPercentage()}%`,
                            backgroundColor: getPasswordStrengthLabel().color
                          }}
                        />
                      </div>
                    )}
                    
                    {passwordErrors.newPassword ? (
                      <span className="field-error">{passwordErrors.newPassword}</span>
                    ) : (
                      passwordData.newPassword && (
                        <span className="password-strength-label" style={{ color: getPasswordStrengthLabel().color }}>
                          Password strength: {getPasswordStrengthLabel().text}
                        </span>
                      )
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
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('confirm')}
                        aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <span className="field-error">{passwordErrors.confirmPassword}</span>
                    )}
                    {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword && (
                      <span className="field-success">✓ Passwords match</span>
                    )}
                  </div>

                  <div className="password-requirements">
                    <h4>Password Requirements:</h4>
                    <ul>
                      <li className={strength.isLongEnough ? 'met' : ''}>
                        <span className="requirement-icon">{strength.isLongEnough ? '✓' : '•'}</span>
                        At least 8 characters
                      </li>
                      <li className={strength.hasUpperCase ? 'met' : ''}>
                        <span className="requirement-icon">{strength.hasUpperCase ? '✓' : '•'}</span>
                        At least one uppercase letter
                      </li>
                      <li className={strength.hasLowerCase ? 'met' : ''}>
                        <span className="requirement-icon">{strength.hasLowerCase ? '✓' : '•'}</span>
                        At least one lowercase letter
                      </li>
                      <li className={strength.hasNumber ? 'met' : ''}>
                        <span className="requirement-icon">{strength.hasNumber ? '✓' : '•'}</span>
                        At least one number
                      </li>
                      <li className={strength.hasSpecial ? 'met' : ''}>
                        <span className="requirement-icon">{strength.hasSpecial ? '✓' : '•'}</span>
                        At least one special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>

                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    {isLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="tab-panel">
                <h2>
                  <FileCode size={24} />
                  Custom Rule Packs
                </h2>
                <p className="tab-description">
                  Upload YAML/JSON rule packs for custom compliance checking.
                </p>
                
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