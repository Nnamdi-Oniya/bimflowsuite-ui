// src/pages/dashboard/CreateProjectPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { projectService, type CreateProjectData } from "../../services/projectService";
import { authService } from "../../services/authService";
import DashboardSuccessModal from "../../components/DashboardSuccessModal";
import "../../assets/css/CreateProjectPage.css";

interface ProjectFormData {
  name: string;
  description: string;
  project_number: string; // User MUST provide this - required
  phase: string;
  project_type: string;
  client_name: string;
  client_type: string;
  project_scale: string;
  risk_classification: string;
  project_address: string;
  project_start_date: string;
  expected_completion_date: string;
  approval_status: string;
}

interface CreatedProject {
  id: number;
  name: string;
  project_number: string; // From backend response
}

const initialFormState: ProjectFormData = {
  name: "",
  description: "",
  project_number: "", // User must provide this
  phase: "concept",
  project_type: "",
  client_name: "",
  client_type: "private",
  project_scale: "medium",
  risk_classification: "medium",
  project_address: "",
  project_start_date: "",
  expected_completion_date: "",
  approval_status: "pending",
};

const PROJECT_TYPES = [
  { value: "IFC_BUILDING", label: "🏢 Building" },
  { value: "IFC_ROAD", label: "🛣️ Road" },
  { value: "IFC_RAILWAY", label: "🚄 Railway" },
  { value: "IFC_BRIDGE", label: "🌉 Bridge" },
  { value: "IFC_TUNNEL", label: "🚇 Tunnel" },
  { value: "IFC_MARINE_FACILITY", label: "⚓ Marine Facility" },
  { value: "IFC_FACTORY", label: "🏭 Factory" },
  { value: "IFC_PROCESS_PLANT", label: "🧪 Process Plant" },
  { value: "IFC_DISTRIBUTION_SYSTEM", label: "🔌 Distribution System" },
  { value: "IFC_SITE", label: "🌍 Site / Land Project" },
  { value: "OTHER", label: "❓ Other / Custom" },
];

const PROJECT_PHASES = [
  { value: "concept", label: "Concept" },
  { value: "schematic", label: "Schematic" },
  { value: "detailed", label: "Detailed Design" },
  { value: "as-built", label: "As-Built" },
];

const CLIENT_TYPES = [
  { value: "private", label: "Private" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
  { value: "corporate", label: "Corporate" },
];

const PROJECT_SCALES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const RISK_CLASSIFICATIONS = [
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
  { value: "critical", label: "Critical Risk" },
];

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProjectFormData>(() => {
    return { ...initialFormState };
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData | 'date_validation', string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<"basic" | "client" | "schedule">("basic");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProject, setCreatedProject] = useState<CreatedProject | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login", { state: { from: "/dashboard/projects/create" } });
    }
  }, [navigate]);

  const validateDates = (): string | null => {
    const { project_start_date, expected_completion_date } = formData;
    
    if (project_start_date && expected_completion_date) {
      const start = new Date(project_start_date);
      const end = new Date(expected_completion_date);
      
      // Reset time part to compare dates only
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      if (end < start) {
        return "Expected completion date cannot be before project start date";
      }
    }
    return null;
  };

  const validateSection = (): boolean => {
    const err: Partial<Record<keyof ProjectFormData | 'date_validation', string>> = {};

    if (currentSection === "basic") {
      // Project Name validation
      if (!formData.name.trim()) {
        err.name = "Project name is required";
      } else if (formData.name.length < 3) {
        err.name = "Project name must be at least 3 characters";
      }

      // Project Number validation - REQUIRED field
      if (!formData.project_number.trim()) {
        err.project_number = "Project number is required";
      } else if (formData.project_number.length < 3) {
        err.project_number = "Project number must be at least 3 characters";
      } else if (!/^[A-Za-z0-9-_]+$/.test(formData.project_number)) {
        err.project_number = "Project number can only contain letters, numbers, hyphens, and underscores";
      }

      // Project Type validation
      if (!formData.project_type) {
        err.project_type = "Project type is required";
      }

      // Description validation
      if (!formData.description.trim()) {
        err.description = "Project description is required";
      } else if (formData.description.length < 20) {
        err.description = "Description must be at least 20 characters";
      }
    }

    if (currentSection === "schedule") {
      // Date validation - check if completion date is after start date
      const dateError = validateDates();
      if (dateError) {
        err.date_validation = dateError;
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateAllSections = (): boolean => {
    let isValid = true;
    const allErrors: Partial<Record<keyof ProjectFormData | 'date_validation', string>> = {};

    // Validate Basic Info
    if (!formData.name.trim()) {
      allErrors.name = "Project name is required";
      isValid = false;
    } else if (formData.name.length < 3) {
      allErrors.name = "Project name must be at least 3 characters";
      isValid = false;
    }

    if (!formData.project_number.trim()) {
      allErrors.project_number = "Project number is required";
      isValid = false;
    } else if (formData.project_number.length < 3) {
      allErrors.project_number = "Project number must be at least 3 characters";
      isValid = false;
    } else if (!/^[A-Za-z0-9-_]+$/.test(formData.project_number)) {
      allErrors.project_number = "Project number can only contain letters, numbers, hyphens, and underscores";
      isValid = false;
    }

    if (!formData.project_type) {
      allErrors.project_type = "Project type is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      allErrors.description = "Project description is required";
      isValid = false;
    } else if (formData.description.length < 20) {
      allErrors.description = "Description must be at least 20 characters";
      isValid = false;
    }

    // Validate Dates
    const dateError = validateDates();
    if (dateError) {
      allErrors.date_validation = dateError;
      isValid = false;
    }

    setErrors(allErrors);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ProjectFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // Clear date validation error when dates change
    if (name === 'project_start_date' || name === 'expected_completion_date') {
      if (errors.date_validation) {
        setErrors((prev) => ({ ...prev, date_validation: undefined }));
      }
    }
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleNext = () => {
    if (validateSection()) {
      if (currentSection === "basic") setCurrentSection("client");
      if (currentSection === "client") setCurrentSection("schedule");
    }
  };

  const handlePrevious = () => {
    if (currentSection === "client") setCurrentSection("basic");
    if (currentSection === "schedule") setCurrentSection("client");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all sections before submission
    if (!validateAllSections()) {
      // Return to first section with errors
      setCurrentSection("basic");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Send ALL fields EXCEPT id (backend generates id)
      const payload: CreateProjectData = {
        name: formData.name.trim(),
        project_number: formData.project_number.trim(), // User provided - required
        description: formData.description.trim(),
        phase: formData.phase,
        project_type: formData.project_type,
        client_name: formData.client_name?.trim() || "",
        client_type: formData.client_type || "private",
        project_scale: formData.project_scale || "medium",
        risk_classification: formData.risk_classification || "medium",
        project_address: formData.project_address?.trim() || "",
        project_start_date: formData.project_start_date 
          ? new Date(formData.project_start_date).toISOString() 
          : null,
        construction_start_date: null, // Explicitly set to null as it's removed
        expected_completion_date: formData.expected_completion_date 
          ? new Date(formData.expected_completion_date).toISOString() 
          : null,
        approval_status: "pending",
      };

      console.log("Sending payload to backend:", payload); // For debugging

      const response = await projectService.createProject(payload);
      
      console.log("Create project response:", response); // For debugging
      
      if (response.success && response.data) {
        // Store the ID and project_number returned from backend
        setCreatedProject({
          id: response.data.id,
          name: response.data.name,
          project_number: response.data.project_number // Should match what user provided
        });
        setShowSuccessModal(true);
      } else {
        // Handle backend validation errors
        let errorMessage = response.message || "Failed to create project";
        
        // Check if there are field-specific errors in response.data
        if (response.data && typeof response.data === 'object') {
          const fieldErrors: string[] = [];
          Object.entries(response.data).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              fieldErrors.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              fieldErrors.push(`${field}: ${messages}`);
            }
          });
          
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n');
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("Project creation error:", err);
      
      // Extract meaningful error message
      let errorMessage = err.message || "An error occurred while creating the project";
      
      // Handle network errors
      if (err.message?.includes('Network error') || err.status === 0) {
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      }
      
      // Handle timeout errors
      if (err.code === 'TIMEOUT') {
        errorMessage = "Request timed out. Please try again.";
      }
      
      // Handle 500 errors gracefully
      if (err.status === 500 || errorMessage.includes('500')) {
        errorMessage = "Server error occurred. Our team has been notified. Please try again later.";
      }
      
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate with success state
    navigate("/dashboard/projects", { 
      state: { 
        success: true, 
        message: `Project "${createdProject?.name}" created successfully!` 
      } 
    });
  };

  return (
    <>
      <div className="create-project-page">
        <div className="create-project-container">
          <div className="create-project-header">
            <button className="back-btn" onClick={() => navigate("/dashboard/projects")}>
              <ArrowLeft size={20} />
              Back to Projects
            </button>
            <h1>Create New Project</h1>
            <p className="subtitle">Fill in the details below to create a new BIM project</p>
          </div>

          <div className="section-navigation">
            <button
              className={`section-btn ${currentSection === "basic" ? "active" : ""}`}
              onClick={() => setCurrentSection("basic")}
            >
              <span className="section-number">1</span>
              <span className="section-label">Basic Info</span>
            </button>
            <button
              className={`section-btn ${currentSection === "client" ? "active" : ""}`}
              onClick={() => setCurrentSection("client")}
            >
              <span className="section-number">2</span>
              <span className="section-label">Client Details</span>
            </button>
            <button
              className={`section-btn ${currentSection === "schedule" ? "active" : ""}`}
              onClick={() => setCurrentSection("schedule")}
            >
              <span className="section-number">3</span>
              <span className="section-label">Schedule</span>
            </button>
          </div>

          {submitError && (
            <div className="error-banner">
              <span>⚠️</span>
              <div className="error-content">
                <p>{submitError}</p>
                {submitError.includes('Server error') && (
                  <p className="error-help">Please try again in a few moments.</p>
                )}
              </div>
              <button className="close-btn" onClick={() => setSubmitError(null)}>×</button>
            </div>
          )}

          {errors.date_validation && currentSection === "schedule" && (
            <div className="error-banner">
              <span>⚠️</span>
              <div className="error-content">
                <p>{errors.date_validation}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-project-form">
            {currentSection === "basic" && (
              <div className="form-section">
                <h2 className="section-title">
                  <span className="section-icon">📋</span>
                  Project Basics
                </h2>

                <div className="form-grid">
                  {/* Project Name */}
                  <div className="form-group">
                    <label htmlFor="project-name" className="form-label required">
                      Project Name
                    </label>
                    <input
                      id="project-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? "error" : ""}`}
                      placeholder="e.g., Downtown Office Tower"
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  {/* Project Number - REQUIRED field */}
                  <div className="form-group">
                    <label htmlFor="project-number" className="form-label required">
                      Project Number
                    </label>
                    <input
                      id="project-number"
                      type="text"
                      name="project_number"
                      value={formData.project_number}
                      onChange={handleInputChange}
                      className={`form-input ${errors.project_number ? "error" : ""}`}
                      placeholder="e.g., PROJ-2024-001"
                    />
                    {errors.project_number && <span className="error-text">{errors.project_number}</span>}
                  </div>

                  {/* Project Type */}
                  <div className="form-group">
                    <label htmlFor="project-type" className="form-label required">
                      Project Type
                    </label>
                    <select
                      id="project-type"
                      name="project_type"
                      value={formData.project_type}
                      onChange={handleInputChange}
                      className={`form-select ${errors.project_type ? "error" : ""}`}
                    >
                      <option value="">Select project type</option>
                      {PROJECT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.project_type && <span className="error-text">{errors.project_type}</span>}
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label htmlFor="project-description" className="form-label required">
                      Description
                    </label>
                    <textarea
                      id="project-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`form-textarea ${errors.description ? "error" : ""}`}
                      placeholder="Describe the project scope, objectives, and key requirements..."
                      rows={5}
                    />
                    <div className="character-count">
                      {formData.description.length} / 1200
                    </div>
                    {errors.description && <span className="error-text">{errors.description}</span>}
                  </div>

                  {/* Phase */}
                  <div className="form-group">
                    <label htmlFor="project-phase" className="form-label">
                      Phase
                    </label>
                    <select
                      id="project-phase"
                      name="phase"
                      value={formData.phase}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {PROJECT_PHASES.map((phase) => (
                        <option key={phase.value} value={phase.value}>
                          {phase.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div className="form-group">
                    <label htmlFor="project-address" className="form-label">
                      Address
                    </label>
                    <input
                      id="project-address"
                      type="text"
                      name="project_address"
                      value={formData.project_address || ""}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Project location"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentSection === "client" && (
              <div className="form-section">
                <h2 className="section-title">
                  <span className="section-icon">👥</span>
                  Client & Classification
                </h2>

                <div className="form-grid">
                  {/* Client Name */}
                  <div className="form-group">
                    <label htmlFor="client-name" className="form-label">
                      Client Name
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      name="client_name"
                      value={formData.client_name || ""}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Client/owner name"
                    />
                  </div>

                  {/* Client Type */}
                  <div className="form-group">
                    <label htmlFor="client-type" className="form-label">
                      Client Type
                    </label>
                    <select
                      id="client-type"
                      name="client_type"
                      value={formData.client_type || "private"}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {CLIENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Scale */}
                  <div className="form-group">
                    <label htmlFor="project-scale" className="form-label">
                      Project Scale
                    </label>
                    <select
                      id="project-scale"
                      name="project_scale"
                      value={formData.project_scale || "medium"}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {PROJECT_SCALES.map((scale) => (
                        <option key={scale.value} value={scale.value}>
                          {scale.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Risk Classification */}
                  <div className="form-group">
                    <label htmlFor="risk-classification" className="form-label">
                      Risk Classification
                    </label>
                    <select
                      id="risk-classification"
                      name="risk_classification"
                      value={formData.risk_classification || "medium"}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {RISK_CLASSIFICATIONS.map((risk) => (
                        <option key={risk.value} value={risk.value}>
                          {risk.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentSection === "schedule" && (
              <div className="form-section">
                <h2 className="section-title">
                  <span className="section-icon">📅</span>
                  Project Schedule
                </h2>

                <div className="form-grid">
                  {/* Project Start Date */}
                  <div className="form-group">
                    <label htmlFor="project-start-date" className="form-label">
                      Project Start Date
                    </label>
                    <input
                      id="project-start-date"
                      type="date"
                      name="project_start_date"
                      value={formData.project_start_date || ""}
                      onChange={handleInputChange}
                      className={`form-input ${errors.date_validation ? "error" : ""}`}
                    />
                  </div>

                  {/* Expected Completion - REMOVED construction_start_date */}
                  <div className="form-group">
                    <label htmlFor="expected-completion" className="form-label">
                      Expected Completion Date
                    </label>
                    <input
                      id="expected-completion"
                      type="date"
                      name="expected_completion_date"
                      value={formData.expected_completion_date || ""}
                      onChange={handleInputChange}
                      className={`form-input ${errors.date_validation ? "error" : ""}`}
                    />
                    {errors.date_validation && (
                      <span className="error-text">{errors.date_validation}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/dashboard/projects")}
              >
                Cancel
              </button>
              <div className="action-group">
                {currentSection !== "basic" && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handlePrevious}
                  >
                    ← Previous
                  </button>
                )}
                {currentSection !== "schedule" ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="loading-spinner"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Create Project
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <DashboardSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Project Created Successfully! 🎉"
        message={
          <div>
            <p>Your project <strong>"{createdProject?.name}"</strong> has been created successfully.</p>
            {createdProject?.project_number && (
              <p style={{ marginTop: '0.5rem', color: '#F8780F', fontWeight: 600 }}>
                Project Number: <strong>{createdProject.project_number}</strong>
              </p>
            )}
          </div>
        }
        userName={createdProject?.name}
        updatedFields={['Project Details', 'Client Info', 'Schedule']}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </>
  );
}