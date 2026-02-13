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
  construction_start_date?: string | null;
  expected_completion_date?: string | null;
  approval_status?: string;
  organization: number;
  created_at: string;
  updated_at: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  project_type: string;
  phase: string;
  client_name?: string;
  client_type?: string;
  project_scale?: "small" | "medium" | "large";
  risk_classification?: "low" | "medium" | "high" | "critical";
  project_address?: string;
  project_start_date?: string;
  construction_start_date?: string;
  expected_completion_date?: string;
  site_name: string;
  latitude?: string;
  longitude?: string;
  number_of_models: number;
  lod_target: string;
  delivery_format: string;
  contact_email?: string;
}

const initialFormState: ProjectFormData = {
  name: "",
  description: "",
  project_type: "",
  phase: "concept",
  project_scale: "medium",
  risk_classification: "medium",
  site_name: "Main Site",
  number_of_models: 1,
  lod_target: "LOD300",
  delivery_format: "ifc",
  contact_email: "",
};

const PROJECT_TYPES = [
  { value: "IFC_BUILDING",          label: "🏢 Building" },
  { value: "IFC_ROAD",              label: "🛣️ Road" },
  { value: "IFC_RAILWAY",           label: "🚄 Railway" },
  { value: "IFC_BRIDGE",            label: "🌉 Bridge" },
  { value: "IFC_TUNNEL",            label: "🚇 Tunnel" },
  { value: "IFC_MARINE_FACILITY",   label: "⚓ Marine Facility" },
  { value: "IFC_FACTORY",           label: "🏭 Factory" },
  { value: "IFC_PROCESS_PLANT",     label: "🧪 Process Plant" },
  { value: "IFC_DISTRIBUTION_SYSTEM", label: "🔌 Distribution System" },
  { value: "IFC_SITE",              label: "🌍 Site / Land" },
  { value: "OTHER",                 label: "❓ Other / Custom" },
];

const LOD_LEVELS = ["LOD100", "LOD200", "LOD300", "LOD400", "LOD500"];
const DELIVERY_FORMATS = ["ifc", "rvt", "dwg", "pdf"];

function normalizeFormData(raw: any): ProjectFormData {
  const data = { ...initialFormState, ...raw };

  if (!["small", "medium", "large"].includes(data.project_scale ?? "")) {
    data.project_scale = "medium";
  }

  if (!["low", "medium", "high", "critical"].includes(data.risk_classification ?? "")) {
    data.risk_classification = "medium";
  }

  data.number_of_models = Number(data.number_of_models) || 1;
  if (data.number_of_models < 1 || data.number_of_models > 10) {
    data.number_of_models = 1;
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
  const [submissionId, setSubmissionId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>(() => {
    const saved = loadFormData();
    return saved ? normalizeFormData(saved) : initialFormState;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<"basics" | "site" | "generate">("basics");

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

  const validateSection = () => {
    const err: Partial<Record<keyof ProjectFormData, string>> = {};

    if (currentSection === "basics") {
      if (!formData.name.trim()) err.name = "Project name is required";
      if (!formData.project_type) err.project_type = "Please select project type";
      if (formData.description.length < 20) err.description = "Description too short (min 20 characters)";
    }

    if (currentSection === "generate") {
      if (formData.number_of_models < 1 || formData.number_of_models > 10)
        err.number_of_models = "Allowed range: 1–10 models";
      if (!isAuthenticated && !formData.contact_email?.trim())
        err.contact_email = "Email is required for guests";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSection()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (isAuthenticated) {
        const today = new Date().toISOString().split('T')[0];
        
        const projectPayload = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          project_number: `PRJ-${Date.now().toString(36).toUpperCase()}`,
          phase: formData.phase,
          project_type: formData.project_type,
          client_name: formData.client_name?.trim() || "",
          client_type: formData.client_type || "private",
          project_scale: formData.project_scale || "medium",
          risk_classification: formData.risk_classification || "medium",
          project_address: formData.project_address?.trim() || "",
          project_start_date: formData.project_start_date || today,
          construction_start_date: formData.construction_start_date || null,
          expected_completion_date: formData.expected_completion_date || null,
          approval_status: "pending",
        };
        
        const res = await apiClient.post<ProjectCreateResponse>("/projects/create/", projectPayload);
        
        if (res.success && res.data) {
          clearFormData();
          if (res.data.id) {
            setSubmissionId(res.data.id);
          }
          setShowSuccessModal(true);
        } else {
          throw new Error(res.message || "Failed to create project");
        }
      } else {
        const payload = {
          request_type: "general_inquiry",
          firstname: "Guest",
          lastname: "User",
          email: formData.contact_email || "",
          company_name: "BIMFlow SME",
          company_address: formData.project_address || "Not specified",
          country: "Nigeria",
          sector: "Construction",
          job_title: "Project Initiator",
          company_position: "N/A",
          phone_number: "N/A",
          additional_details: `MODEL GENERATION REQUEST: ${formData.name}\n\n${formData.description}\n\nSite: ${formData.site_name}\nModels: ${formData.number_of_models}\nLOD: ${formData.lod_target}\nFormat: ${formData.delivery_format}`,
          consent_marketing: true,
          consent_privacy: true,
          project_params: {
            name: formData.name.trim(),
            project_number: `PRJ-${Date.now().toString(36).toUpperCase()}`,
            description: formData.description.trim(),
            project_type: formData.project_type,
            phase: formData.phase,
            client_name: formData.client_name?.trim() ?? "",
            client_type: formData.client_type ?? "private",
            project_scale: formData.project_scale ?? "medium",
            risk_classification: formData.risk_classification ?? "medium",
            project_address: formData.project_address?.trim() ?? "",
            site_name: formData.site_name,
            site_address: formData.project_address?.trim() ?? "",
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            number_of_models: formData.number_of_models,
            lod_target: formData.lod_target,
            delivery_format: formData.delivery_format,
          },
        };

        bookDemoService.storeModelFormData(formData);
        bookDemoService.storeProjectParams(payload.project_params);
        
        setShowModal(true);
      }
    } catch (err: any) {
      if (err.status === 405) {
        setSubmitError("API endpoint not found. Please check the backend configuration.");
      } else if (err.status === 403) {
        setSubmitError("You don't have permission to create projects. Please contact support.");
      } else if (err.status === 401) {
        setSubmitError("Your session has expired. Please login again.");
        authService.clearAllData();
        setIsAuthenticated(false);
      } else {
        setSubmitError(err?.message || "Could not submit. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToProjects = () => {
    setShowSuccessModal(false);
    navigate("/dashboard/projects");
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
        title="Project Created Successfully!"
        message={
          <>
            <p>Your project <strong>"{formData.name}"</strong> has been created.</p>
            <p>Your model generation request has been submitted. Our team will process it and notify you when your models are ready.</p>
            {submissionId && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                Project ID: <strong>{submissionId}</strong>
              </p>
            )}
          </>
        }
        primaryAction={{
          label: "View My Projects",
          onClick: handleGoToProjects
        }}
        projectId={submissionId || undefined}
      />

      <NewUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userEmail={userEmail}
        hasExistingAccount={!!userEmail}
        onLogin={() => {
          setShowModal(false);
          sessionStorage.setItem('pending_generate_redirect', 'true');
          sessionStorage.setItem('pending_project_data', JSON.stringify(formData));
          navigate("/login", { state: { from: "/project-generate" } });
        }}
        onBookDemo={() => {
          setShowModal(false);
          navigate("/book-demo", { 
            state: { 
              fromGenerate: true,
              projectData: formData 
            } 
          });
        }}
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
            <h1 className="generate-model-hero__title">Generate Your BIM Model</h1>
            <p className="generate-model-hero__subtitle">
              Describe your project — we create compliant IFC models fast.
            </p>
            {isAuthenticated && userEmail && (
              <div className="user-badge">
                <span className="badge-icon">👤</span>
                <span>{userEmail}</span>
              </div>
            )}
          </div>
        </section>

        <div className="section-navigation">
          <div className="section-nav-container">
            <button
              className={`section-nav-btn ${currentSection === "basics" ? "active" : ""}`}
              onClick={() => setCurrentSection("basics")}
            >
              <span className="nav-number">1</span>
              <span className="nav-text">Basics</span>
            </button>
            <button
              className={`section-nav-btn ${currentSection === "site" ? "active" : ""}`}
              onClick={() => setCurrentSection("site")}
            >
              <span className="nav-number">2</span>
              <span className="nav-text">Site</span>
            </button>
            <button
              className={`section-nav-btn ${currentSection === "generate" ? "active" : ""}`}
              onClick={() => setCurrentSection("generate")}
            >
              <span className="nav-number">3</span>
              <span className="nav-text">Generate</span>
            </button>
          </div>
        </div>

        <div className="generate-model-container">
          {submitError && <div className="form-error-banner">{submitError}</div>}

          <form onSubmit={handleSubmit} className="project-form">
            {currentSection === "basics" && (
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">📋</span>
                  Project Basics
                </h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Project Name</label>
                    <input
                      className={`form-input ${errors.name ? "error" : ""}`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Victoria Island Tower"
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

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

                  <div className="form-group full-width">
                    <label className="form-label required">Description</label>
                    <textarea
                      className={`form-textarea ${errors.description ? "error" : ""}`}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Purpose, scope, size, special notes..."
                      rows={5}
                    />
                    <div className="character-count">{formData.description.length} / 1200</div>
                    {errors.description && <span className="error-text">{errors.description}</span>}
                  </div>
                </div>

                <div className="form-section-navigation">
                  <button type="button" className="btn btn--secondary" onClick={() => navigate("/")}>
                    ← Back to Home
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => {
                      if (validateSection()) {
                        setCurrentSection("site");
                      }
                    }}
                  >
                    Next: Site →
                  </button>
                </div>
              </div>
            )}

            {currentSection === "site" && (
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">📍</span>
                  Site & Location
                </h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Site Name</label>
                    <input
                      className="form-input"
                      value={formData.site_name}
                      onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                      placeholder="Main Site"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Project Address</label>
                    <input
                      className="form-input"
                      value={formData.project_address || ""}
                      onChange={(e) => setFormData({ ...formData, project_address: e.target.value })}
                      placeholder="Street, City, State"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Latitude (optional)</label>
                    <input
                      className="form-input"
                      value={formData.latitude || ""}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="e.g. 6.5244"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitude (optional)</label>
                    <input
                      className="form-input"
                      value={formData.longitude || ""}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="e.g. 3.3792"
                    />
                  </div>
                </div>

                <div className="form-section-navigation">
                  <button type="button" className="btn btn--secondary" onClick={() => setCurrentSection("basics")}>
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => {
                      if (validateSection()) {
                        setCurrentSection("generate");
                      }
                    }}
                  >
                    Next: Generate →
                  </button>
                </div>
              </div>
            )}

            {currentSection === "generate" && (
              <>
                <div className="form-section">
                  <h3 className="section-title">
                    <span className="section-icon">⚙️</span>
                    Model Generation
                  </h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Number of Models</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className={`form-input ${errors.number_of_models ? "error" : ""}`}
                        value={formData.number_of_models}
                        onChange={(e) =>
                          setFormData({ ...formData, number_of_models: Number(e.target.value) || 1 })
                        }
                      />
                      {errors.number_of_models && <span className="error-text">{errors.number_of_models}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Target LOD</label>
                      <select
                        className="form-select"
                        value={formData.lod_target}
                        onChange={(e) => setFormData({ ...formData, lod_target: e.target.value })}
                      >
                        {LOD_LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preferred Format</label>
                      <select
                        className="form-select"
                        value={formData.delivery_format}
                        onChange={(e) => setFormData({ ...formData, delivery_format: e.target.value })}
                      >
                        {DELIVERY_FORMATS.map((f) => (
                          <option key={f} value={f}>
                            {f.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📧</span>
                      Contact Email
                    </h3>
                    <div className="form-group">
                      <input
                        type="email"
                        className={`form-input ${errors.contact_email ? "error" : ""}`}
                        value={formData.contact_email || ""}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="you@company.com"
                      />
                      {errors.contact_email && <span className="error-text">{errors.contact_email}</span>}
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={() => setCurrentSection("site")}>
                    ← Back
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
                    ) : (
                      `Generate ${formData.number_of_models} Model${formData.number_of_models !== 1 ? "s" : ""}`
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="features-highlight">
            <h4>What You'll Get</h4>
            <div className="features-grid">
              <div className="feature">
                <span className="feature-icon">📐</span>
                <div>
                  <strong>IFC 4.3 Compliant</strong>
                  <p>Open BIM standard compatible with all major software</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Project + Site + Models</strong>
                  <p>Complete project structure with all components</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <div>
                  <strong>Type-Specific Metadata</strong>
                  <p>Smart parameters based on your project type</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🔧</span>
                <div>
                  <strong>Ready for Construction</strong>
                  <p>Production-ready BIM models at your specified LOD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}