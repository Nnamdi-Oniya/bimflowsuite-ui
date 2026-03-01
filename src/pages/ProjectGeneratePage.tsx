// src/pages/ProjectGeneratePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/GenerateModelPage.css";
import generateModelHero from "../assets/images/generateModelHero.jpg";
import { apiClient } from "../services/apiClient";
import { authService } from "../services/authService";
import NewUserModal from "../components/NewUserModal";
import { saveFormData, loadFormData, clearFormData } from "../utils/formStorage";
import { bookDemoService } from "../services/bookDemoService";
import ProjectSuccessModal from "../components/ProjectSuccessModal";

interface ProjectCreateResponse {
  id: number;
  name: string;
  project_number: string;
  description: string;
  phase: string;
  project_type: string;
  client_name?: string;
  client_type?: string;
  project_scale?: string;
  risk_classification?: string;
  project_address?: string;
  project_start_date?: string;
  expected_completion_date?: string | null;
  approval_status?: string;
  organization: number;
  created_at: string;
  updated_at: string;
}

interface ProjectFormData {
  name: string;
  project_number: string;
  description: string;
  project_type: string;
  phase: string;
  client_name?: string;
  client_type?: string;
  project_scale?: "small" | "medium" | "large";
  risk_classification?: "low" | "medium" | "high" | "critical";
  project_address?: string;
  project_start_date?: string;
  expected_completion_date?: string;
  number_of_models?: number;
}

const initialFormState: ProjectFormData = {
  name: "",
  project_number: "",
  description: "",
  project_type: "",
  phase: "concept",
  client_name: "",
  client_type: "private",
  project_scale: "medium",
  risk_classification: "medium",
  project_address: "",
  project_start_date: new Date().toISOString().split('T')[0],
  expected_completion_date: "",
  number_of_models: 1,
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

const PHASE_OPTIONS = [
  { value: "concept", label: "🎨 Concept Design" },
  { value: "schematic", label: "📐 Schematic Design" },
  { value: "detailed", label: "🔧 Detailed Design" },
  { value: "construction", label: "🏗️ Construction" },
  { value: "as_built", label: "📋 As-Built" },
];

const CLIENT_TYPES = [
  { value: "private", label: "Private" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
  { value: "corporate", label: "Corporate" },
];

const PROJECT_SCALES = [
  { value: "small", label: "📏 Small (< 1,000 m²)" },
  { value: "medium", label: "📐 Medium (1,000 - 10,000 m²)" },
  { value: "large", label: "📊 Large (> 10,000 m²)" },
];

const RISK_CLASSIFICATIONS = [
  { value: "low", label: "🟢 Low" },
  { value: "medium", label: "🟡 Medium" },
  { value: "high", label: "🟠 High" },
  { value: "critical", label: "🔴 Critical" },
];

function normalizeFormData(raw: any): ProjectFormData {
  const data = { ...initialFormState, ...raw };
  
  if (data.number_of_models < 1 || data.number_of_models > 10) {
    data.number_of_models = 1;
  }
  
  if ('construction_start_date' in data) {
    delete data.construction_start_date;
  }
  
  return data as ProjectFormData;
}

export default function ProjectGeneratePage() {
  const navigate = useNavigate();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
  const [createdProjectName, setCreatedProjectName] = useState<string>("");
  const [createdProjectNumber, setCreatedProjectNumber] = useState<string>("");

  const [formData, setFormData] = useState<ProjectFormData>(() => {
    const saved = loadFormData();
    return saved ? normalizeFormData(saved) : initialFormState;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData | 'date_validation', string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const auth = authService.isAuthenticated();
      setIsAuthenticated(auth);
      let email: string | null = null;
      if (auth) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data?.email) email = res.data.email;
        } catch {}
      }
      setUserEmail(email);
      setIsCheckingAuth(false);
    };
    check();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth) saveFormData(formData);
  }, [formData, isCheckingAuth]);

  const validateDates = (): string | null => {
    const { project_start_date, expected_completion_date } = formData;
    
    if (project_start_date && expected_completion_date) {
      if (new Date(expected_completion_date) < new Date(project_start_date)) {
        return "Expected completion date cannot be before project start date";
      }
    }
    return null;
  };

  const validateForm = () => {
    const err: Partial<Record<keyof ProjectFormData | 'date_validation', string>> = {};

    if (!formData.name.trim()) err.name = "Project name is required";
    if (!formData.project_number?.trim()) err.project_number = "Project number is required";
    if (!formData.project_type) err.project_type = "Please select project type";
    if (formData.description.length < 20) err.description = "Description too short (min 20 characters)";
    if (formData.number_of_models && (formData.number_of_models < 1 || formData.number_of_models > 10)) {
      err.number_of_models = "Number of models must be between 1 and 10";
    }

    const dateError = validateDates();
    if (dateError) err.date_validation = dateError;

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (isAuthenticated) {
        const projectPayload = {
          name: formData.name.trim(),
          project_number: formData.project_number.trim(),
          description: formData.description.trim(),
          phase: formData.phase,
          project_type: formData.project_type,
          client_name: formData.client_name?.trim() || "",
          client_type: formData.client_type || "private",
          project_scale: formData.project_scale || "medium",
          risk_classification: formData.risk_classification || "medium",
          project_address: formData.project_address?.trim() || "",
          project_start_date: formData.project_start_date || new Date().toISOString().split('T')[0],
          expected_completion_date: formData.expected_completion_date || null,
          approval_status: "pending",
        };
        
        const res = await apiClient.post<ProjectCreateResponse>("/projects/create/", projectPayload);
        
        if (res.success && res.data) {
          clearFormData();
          setCreatedProjectId(res.data.id);
          setCreatedProjectName(res.data.name);
          setCreatedProjectNumber(res.data.project_number);
          setShowSuccessModal(true);
        } else {
          throw new Error(res.message || "Failed to create project");
        }
      } else {
        bookDemoService.storeProjectFormData({
          ...formData,
          numberOfModels: formData.number_of_models
        });
        setShowModal(true);
      }
    } catch (err: any) {
      setSubmitError(err?.message || "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToProjects = () => {
    setShowSuccessModal(false);
    navigate("/dashboard/projects");
  };

  const handleBookDemo = () => {
    setShowModal(false);
    navigate("/book-demo");
  };

  if (isCheckingAuth) {
    return (
      <div className="generate-model-page">
        <div className="loading-state">
          <div className="loading-spinner-large"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProjectSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 Project Created Successfully!"
        message={
          <div className="success-message">
            <p>Your project <strong>"{createdProjectName}"</strong> has been created.</p>
            {createdProjectNumber && (
              <p style={{ marginTop: '0.5rem', color: '#F8780F', fontWeight: 600 }}>
                Project Number: <strong>{createdProjectNumber}</strong>
              </p>
            )}
            <p style={{ marginTop: '0.5rem' }}>
              You are now ready to generate <strong>{formData.number_of_models}</strong> model{formData.number_of_models !== 1 ? 's' : ''}.
            </p>
          </div>
        }
        primaryAction={{
          label: "Go to Dashboard",
          onClick: handleGoToProjects
        }}
        projectId={createdProjectId || undefined}
        projectNumber={createdProjectNumber}
        numberOfModels={formData.number_of_models}
      />

      <NewUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userEmail={userEmail}
        hasExistingAccount={!!userEmail}
        onLogin={() => {
          setShowModal(false);
          sessionStorage.setItem('pending_generate_redirect', 'true');
          navigate("/login", { state: { from: "/project-generate" } });
        }}
        onBookDemo={handleBookDemo}
      />

      <div className="generate-model-page">
        <section
          className="generate-model-hero"
          style={{
            backgroundImage: `linear-gradient(rgba(78, 68, 60, 0.6), rgba(42, 36, 32, 0.6)), url(${generateModelHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="generate-model-hero__overlay"></div>
          <div className="generate-model-hero__content">
            <h1 className="generate-model-hero__title">Start Your BIM Project</h1>
            <p className="generate-model-hero__subtitle">
              Fill in the project details to get started.
            </p>
            {isAuthenticated && userEmail && (
              <div className="user-badge">
                <span className="badge-icon">👤</span>
                <span>{userEmail}</span>
              </div>
            )}
          </div>
        </section>

        <div className="generate-model-container">
          {submitError && <div className="form-error-banner">{submitError}</div>}
          {errors.date_validation && <div className="form-error-banner">{errors.date_validation}</div>}

          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">📋</span>
                Project Details
              </h3>

              <div className="form-grid">
                {/* Project Name */}
                <div className="form-group">
                  <label className="form-label required">Project Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.name ? "error" : ""}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Victoria Island Tower"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                {/* Project Number */}
                <div className="form-group">
                  <label className="form-label required">Project Number</label>
                  <input
                    type="text"
                    className={`form-input ${errors.project_number ? "error" : ""}`}
                    value={formData.project_number}
                    onChange={(e) => setFormData({ ...formData, project_number: e.target.value })}
                    placeholder="e.g. PROJ-2024-001"
                  />
                  {errors.project_number && <span className="error-text">{errors.project_number}</span>}
                </div>

                {/* Number of Models to Generate */}
                <div className="form-group">
                  <label className="form-label">Number of Models to Generate</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className={`form-input ${errors.number_of_models ? "error" : ""}`}
                    value={formData.number_of_models}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      number_of_models: Math.min(10, Math.max(1, Number(e.target.value) || 1))
                    })}
                  />
                  {errors.number_of_models && <span className="error-text">{errors.number_of_models}</span>}
                  <small className="form-note">How many models do you want to generate? (1-10)</small>
                </div>

                {/* Project Type */}
                <div className="form-group">
                  <label className="form-label required">Project Type</label>
                  <select
                    className={`form-select ${errors.project_type ? "error" : ""}`}
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
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

                {/* Phase */}
                <div className="form-group">
                  <label className="form-label">Phase</label>
                  <select
                    className="form-select"
                    value={formData.phase}
                    onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                  >
                    {PHASE_OPTIONS.map((phase) => (
                      <option key={phase.value} value={phase.value}>
                        {phase.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label className="form-label required">Description</label>
                  <textarea
                    className={`form-textarea ${errors.description ? "error" : ""}`}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project scope, size, and special requirements..."
                    rows={4}
                  />
                  <div className="character-count">{formData.description.length} / 1000</div>
                  {errors.description && <span className="error-text">{errors.description}</span>}
                </div>

                {/* Client Name */}
                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.client_name || ""}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Client name (optional)"
                  />
                </div>

                {/* Client Type */}
                <div className="form-group">
                  <label className="form-label">Client Type</label>
                  <select
                    className="form-select"
                    value={formData.client_type}
                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
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
                  <label className="form-label">Project Scale</label>
                  <select
                    className="form-select"
                    value={formData.project_scale}
                    onChange={(e) => setFormData({ ...formData, project_scale: e.target.value as any })}
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
                  <label className="form-label">Risk Classification</label>
                  <select
                    className="form-select"
                    value={formData.risk_classification}
                    onChange={(e) => setFormData({ ...formData, risk_classification: e.target.value as any })}
                  >
                    {RISK_CLASSIFICATIONS.map((risk) => (
                      <option key={risk.value} value={risk.value}>
                        {risk.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Address */}
                <div className="form-group full-width">
                  <label className="form-label">Project Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.project_address || ""}
                    onChange={(e) => setFormData({ ...formData, project_address: e.target.value })}
                    placeholder="Street address, city, country"
                  />
                </div>

                {/* Dates */}
                <div className="form-group">
                  <label className="form-label">Project Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.project_start_date || ""}
                    onChange={(e) => setFormData({ ...formData, project_start_date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Completion Date</label>
                  <input
                    type="date"
                    className={`form-input ${errors.date_validation ? "error" : ""}`}
                    value={formData.expected_completion_date || ""}
                    onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                  />
                  {errors.date_validation && (
                    <span className="error-text">{errors.date_validation}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions - Inside form but separate section with proper spacing */}
            <div className="form-actions">
              <button type="button" className="btn btn--secondary" onClick={() => navigate("/")}>
                Cancel
              </button>

              <button
                type="submit"
                className={`btn btn--primary btn--generate ${submitting ? "btn--loading" : ""}`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Processing...
                  </>
                ) : isAuthenticated ? (
                  `Create Project & Generate ${formData.number_of_models} Model${formData.number_of_models !== 1 ? 's' : ''}`
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>

          <div className="features-highlight">
            <h4>✨ What happens next? ✨</h4>
            <div className="features-grid">
              {isAuthenticated ? (
                <>
                  <div className="feature">
                    <span className="feature-icon">✅</span>
                    <div>
                      <strong>Project Created Instantly</strong>
                      <p>Your project is live with a unique ID and will generate {formData.number_of_models} model{formData.number_of_models !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🚀</span>
                    <div>
                      <strong>Models Generating Now</strong>
                      <p>Your {formData.number_of_models} model{formData.number_of_models !== 1 ? 's are' : ' is'} being processed</p>
                    </div>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📊</span>
                    <div>
                      <strong>Track Progress</strong>
                      <p>Monitor generation status in real-time from your dashboard</p>
                    </div>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📥</span>
                    <div>
                      <strong>Download Ready</strong>
                      <p>Get notified when your models are ready for download</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="feature">
                    <span className="feature-icon">💾</span>
                    <div>
                      <strong>Project Saved</strong>
                      <p>Your project to generate {formData.number_of_models} model{formData.number_of_models !== 1 ? 's' : ''} is saved</p>
                    </div>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📅</span>
                    <div>
                      <strong>Quick Demo Booking</strong>
                      <p>Book a demo in just 2 minutes to activate your project</p>
                    </div>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🤝</span>
                    <div>
                      <strong>Expert Consultation</strong>
                      <p>Our BIM experts will review your {formData.number_of_models} model requirement{formData.number_of_models !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🎁</span>
                    <div>
                      <strong>Exclusive Welcome Offer</strong>
                      <p>Get 20% off your first model generation when you sign up</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}