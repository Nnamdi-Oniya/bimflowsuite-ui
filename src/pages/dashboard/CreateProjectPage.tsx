// src/pages/dashboard/CreateProjectPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { projectService, type CreateProjectData } from "../../services/projectService";
import { authService } from "../../services/authService";
import DashboardSuccessModal from "../../components/DashboardSuccessModal";
import "../../assets/css/CreateProjectPage.css";

interface ProjectFormData extends CreateProjectData {}

const initialFormState: ProjectFormData = {
  name: "",
  description: "",
  // REMOVED: project_number - backend generates this
  phase: "concept",
  project_type: "",
  client_name: "",
  client_type: "private",
  project_scale: "medium",
  risk_classification: "medium",
  project_address: "",
  project_start_date: "",
  construction_start_date: "",
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
    // REMOVED: project_number generation - let backend handle it
    return { ...initialFormState };
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<"basic" | "client" | "schedule">("basic");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProject, setCreatedProject] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login", { state: { from: "/dashboard/projects/create" } });
    }
  }, [navigate]);

  const validateSection = (): boolean => {
    const err: Partial<Record<keyof ProjectFormData, string>> = {};

    if (currentSection === "basic") {
      if (!formData.name.trim()) err.name = "Project name is required";
      if (!formData.project_type) err.project_type = "Project type is required";
      if (formData.description.length < 20) {
        err.description = "Description must be at least 20 characters";
      }
    }

    if (currentSection === "schedule") {
      if (formData.project_start_date && formData.expected_completion_date) {
        if (new Date(formData.project_start_date) > new Date(formData.expected_completion_date)) {
          err.expected_completion_date = "Completion date must be after start date";
        }
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProjectFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    setCurrentSection("basic");
    if (!validateSection()) isValid = false;
    setCurrentSection("client");
    if (!validateSection()) isValid = false;
    setCurrentSection("schedule");
    if (!validateSection()) isValid = false;
    
    if (!isValid) {
      setCurrentSection("basic");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // IMPORTANT: Never send 'id' field - backend generates it
      // Also, don't send project_number - backend generates it
      const payload = {
        name: formData.name,
        description: formData.description,
        phase: formData.phase,
        project_type: formData.project_type,
        client_name: formData.client_name,
        client_type: formData.client_type,
        project_scale: formData.project_scale,
        risk_classification: formData.risk_classification,
        project_address: formData.project_address,
        project_start_date: formData.project_start_date 
          ? new Date(formData.project_start_date).toISOString() 
          : null,
        construction_start_date: formData.construction_start_date 
          ? new Date(formData.construction_start_date).toISOString() 
          : null,
        expected_completion_date: formData.expected_completion_date 
          ? new Date(formData.expected_completion_date).toISOString() 
          : null,
        approval_status: formData.approval_status || "pending",
      };

      const response = await projectService.createProject(payload);
      
      if (response.success && response.data) {
        // Store the ID returned from backend - NEVER generate on frontend
        setCreatedProject({
          id: response.data.id,
          name: response.data.name
        });
        setShowSuccessModal(true);
      } else {
        throw new Error(response.message || "Failed to create project");
      }
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while creating the project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate("/dashboard/projects");
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
              <p>{submitError}</p>
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
                      className="form-input"
                    />
                  </div>

                  {/* Construction Start Date */}
                  <div className="form-group">
                    <label htmlFor="construction-start-date" className="form-label">
                      Construction Start Date
                    </label>
                    <input
                      id="construction-start-date"
                      type="date"
                      name="construction_start_date"
                      value={formData.construction_start_date || ""}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  {/* Expected Completion */}
                  <div className="form-group">
                    <label htmlFor="expected-completion" className="form-label">
                      Expected Completion
                    </label>
                    <input
                      id="expected-completion"
                      type="date"
                      name="expected_completion_date"
                      value={formData.expected_completion_date || ""}
                      onChange={handleInputChange}
                      className={`form-input ${errors.expected_completion_date ? "error" : ""}`}
                    />
                    {errors.expected_completion_date && (
                      <span className="error-text">{errors.expected_completion_date}</span>
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
                    onClick={() => {
                      if (currentSection === "client") setCurrentSection("basic");
                      if (currentSection === "schedule") setCurrentSection("client");
                    }}
                  >
                    ← Previous
                  </button>
                )}
                {currentSection !== "schedule" ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (validateSection()) {
                        if (currentSection === "basic") setCurrentSection("client");
                        if (currentSection === "client") setCurrentSection("schedule");
                      }
                    }}
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
        message={`Your project "${createdProject?.name || 'New Project'}" has been created successfully.`}
        userName={createdProject?.name}
        updatedFields={['Project Details', 'Client Info', 'Schedule']}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </>
  );
}