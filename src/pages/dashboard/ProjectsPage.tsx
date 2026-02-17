// src/pages/dashboard/ProjectsPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { projectService, type Project } from "../../services/projectService";
import ProjectModal from "../../components/ProjectModal";
import DashboardSuccessModal from "../../components/DashboardSuccessModal";
import "../../assets/css/ProjectsDash.css";

// Local thumbnail images - only use existing ones
import officeTower from "../../assets/images/office-tower.jpg";
import bridgeExpansion from "../../assets/images/bridge-expansion.jpg";
import urbanRoad from "../../assets/images/urban-road.jpg";

export interface DisplayProject extends Project {
  title: string;
  type: string;
  status: "Active" | "Completed" | "Pending Review" | "Compliance Pending" | "Draft" | "Rejected";
  compliance: string;
  budget: string;
  teamSize: number;
  lastUpdated: string;
  thumbnail: string;
  assets: string;
}

const ProjectsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProject, setSelectedProject] = useState<DisplayProject | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<DisplayProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state && (location.state as any).success) {
      setSuccessMessage((location.state as any).message);
      setShowSuccessModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const getStatusFromApproval = (approvalStatus?: string | null): "Active" | "Completed" | "Pending Review" | "Compliance Pending" | "Draft" | "Rejected" => {
    if (!approvalStatus) return "Draft";
    
    switch (approvalStatus.toLowerCase()) {
      case "approved": return "Active";
      case "pending": return "Pending Review";
      case "rejected": return "Rejected";
      case "completed": return "Completed";
      default: return "Draft";
    }
  };

  const getComplianceFromRisk = (risk?: string | null): string => {
    if (!risk) return "N/A";
    
    switch (risk.toLowerCase()) {
      case "low": return "98%";
      case "medium": return "85%";
      case "high": return "70%";
      case "critical": return "50%";
      default: return "N/A";
    }
  };

  const getBudgetDisplay = (scale?: string | null): string => {
    if (!scale) return "TBD";
    
    switch (scale.toLowerCase()) {
      case "small": return "$10M - $50M";
      case "medium": return "$50M - $150M";
      case "large": return "$150M - $500M+";
      default: return "TBD";
    }
  };

  const getTeamSize = (scale?: string | null): number => {
    if (!scale) return 5;
    
    switch (scale.toLowerCase()) {
      case "small": return 8;
      case "medium": return 15;
      case "large": return 25;
      default: return 5;
    }
  };

  const getThumbnail = (projectType?: string): string => {
    if (!projectType) return officeTower;
    
    if (projectType.includes("BRIDGE")) return bridgeExpansion;
    if (projectType.includes("ROAD")) return urbanRoad;
    
    return officeTower;
  };

  const formatProjectType = (projectType?: string): string => {
    if (!projectType) return "Building";
    return projectType.replace("IFC_", "").replace(/_/g, " ");
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return "Invalid date";
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await projectService.getProjects();
        
        if (response.success && Array.isArray(response.data)) {
          const transformedProjects: DisplayProject[] = response.data.map((proj) => ({
            ...proj,
            title: proj.name || "Untitled Project",
            type: formatProjectType(proj.project_type),
            status: getStatusFromApproval(proj.approval_status),
            compliance: getComplianceFromRisk(proj.risk_classification),
            budget: getBudgetDisplay(proj.project_scale),
            teamSize: getTeamSize(proj.project_scale),
            lastUpdated: formatDate(proj.updated_at),
            thumbnail: getThumbnail(proj.project_type),
            assets: "IFC Model + Documentation",
          }));
          
          setProjects(transformedProjects);
        } else {
          setError(response.message || "Failed to load projects");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = searchTerm === "" || 
      (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.project_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.client_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || 
      (p.project_type || "").toLowerCase().includes(filterType.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const openModal = (project: DisplayProject) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active": return "status-active";
      case "Completed": return "status-completed";
      case "Pending Review": return "status-pending-review";
      case "Compliance Pending": return "status-compliance-pending";
      case "Rejected": return "status-rejected";
      default: return "status-draft";
    }
  };

  const handleTemplateClick = (template: string) => {
    navigate("/dashboard/projects/create", { 
      state: { template } 
    });
  };

  if (loading) {
    return (
      <div className="projects-dashboard-pro">
        <div className="loading-state">
          <div className="loading-spinner-large"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="projects-dashboard-pro">
        {error && (
          <div className="error-banner">
            <AlertCircle size={24} />
            <p>{error}</p>
            <button className="close-btn" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="projects-header-pro">
          <div className="header-content">
            <h1>Projects</h1>
            <p>Manage all your BIM projects • Track compliance, cost & schedule in real-time</p>
          </div>
          <Link to="/dashboard/projects/create" className="new-project-btn-pro">
            <Plus size={24} />
            New Project
          </Link>
        </div>

        <div className="projects-controls-pro">
          <div className="search-bar-pro">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, project number, or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters-pro">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="building">Buildings</option>
              <option value="bridge">Bridges</option>
              <option value="road">Roads</option>
              <option value="railway">Railways</option>
              <option value="tunnel">Tunnels</option>
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Compliance Pending">Compliance Pending</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-pattern"></div>
            <div className="empty-icon">📁</div>
            <h3>No projects found</h3>
            <p>
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "No projects match your search criteria. Try adjusting your filters."
                : "Get started by creating your first BIM project. Choose from templates or start from scratch."}
            </p>
            <Link to="/dashboard/projects/create" className="empty-state-btn">
              <Plus size={20} />
              Create Your First Project
            </Link>
            
            {!searchTerm && filterType === "all" && filterStatus === "all" && (
              <div className="empty-state-suggestions">
                <div className="suggestions-title">Quick Start Templates</div>
                <div className="suggestions-grid">
                  <div 
                    className="suggestion-card" 
                    onClick={() => handleTemplateClick('building')}
                  >
                    <span className="suggestion-icon">🏢</span>
                    <span>Commercial Building</span>
                  </div>
                  <div 
                    className="suggestion-card" 
                    onClick={() => handleTemplateClick('bridge')}
                  >
                    <span className="suggestion-icon">🌉</span>
                    <span>Bridge Structure</span>
                  </div>
                  <div 
                    className="suggestion-card" 
                    onClick={() => handleTemplateClick('road')}
                  >
                    <span className="suggestion-icon">🛣️</span>
                    <span>Road Network</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="projects-grid-pro">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card-pro"
                onClick={() => openModal(project)}
              >
                <div className="project-thumbnail-pro">
                  <img src={project.thumbnail} alt={project.name} />
                  <div className={`status-badge-pro ${getStatusClass(project.status)}`}>
                    {project.status}
                  </div>
                  <div className="project-number-badge">
                    {project.project_number}
                  </div>
                </div>

                <div className="project-content-pro">
                  <div className="project-header-pro">
                    <h3>{project.name}</h3>
                    <span className="project-type-pro">{project.type}</span>
                  </div>

                  <div className="project-metrics-pro">
                    <div className="metric-pro">
                      <CheckCircle size={18} />
                      <span>Compliance: {project.compliance}</span>
                    </div>
                    <div className="metric-pro">
                      <DollarSign size={18} />
                      <span>{project.budget}</span>
                    </div>
                    <div className="metric-pro">
                      <Users size={18} />
                      <span>Team: {project.teamSize}</span>
                    </div>
                    <div className="metric-pro">
                      <Calendar size={18} />
                      <span>Updated: {project.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="project-additional-info">
                    {project.phase && (
                      <div className="info-chip">
                        <span>Phase: {project.phase}</span>
                      </div>
                    )}
                    {project.risk_classification && (
                      <div className="info-chip">
                        <span>Risk: {project.risk_classification}</span>
                      </div>
                    )}
                    {project.client_name && (
                      <div className="info-chip">
                        <span>Client: {project.client_name}</span>
                      </div>
                    )}
                  </div>

                  {project.description && (
                    <p className="project-desc-pro">
                      {project.description.length > 100 
                        ? `${project.description.substring(0, 100)}...` 
                        : project.description}
                    </p>
                  )}

                  {(project.project_start_date || project.expected_completion_date) && (
                    <div className="project-dates">
                      {project.project_start_date && (
                        <span className="date-badge">
                          Start: {formatDate(project.project_start_date)}
                        </span>
                      )}
                      {project.expected_completion_date && (
                        <span className="date-badge">
                          Due: {formatDate(project.expected_completion_date)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="project-actions-pro">
                    <button className="view-btn-pro">View Details →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedProject && (
          <ProjectModal
            project={selectedProject}
            mode="view"
            onClose={() => setShowModal(false)}
            onSave={() => {}}
          />
        )}
      </div>

      <DashboardSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success! 🎉"
        message={successMessage}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </>
  );
};

export default ProjectsPage;