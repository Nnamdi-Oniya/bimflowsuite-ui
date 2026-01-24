// src/components/DashboardSidebar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../assets/DashboardSidebar.css";

// Keep all your beautiful SVG icons exactly as they are (unchanged)
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9L12 2L21 9V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V9Z" />
    <path d="M9 22V12H15V22" />
  </svg>
);

const ProjectsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9H21" />
    <path d="M9 21V9" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" />
    <path d="M17 8L12 3L7 8" />
    <path d="M12 3V15" />
  </svg>
);

const GenerateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
    <path d="M2 17L12 22L22 17" />
    <path d="M2 12L12 17L22 12" />
  </svg>
);

const ComplianceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12L11 14L15 10" />
  </svg>
);

const ClashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8V16" />
    <path d="M8 12H16" />
  </svg>
);

const CostIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1V23" />
    <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" />
  </svg>
);

const ScheduleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" />
    <path d="M14 2V8H20" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const ScenarioIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3H21V21H3V3Z" />
    <path d="M3 9H21" />
    <path d="M9 21V9" />
    <path d="M15 21V15" />
  </svg>
);

const TemplatesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" />
    <path d="M14 2V8H20" />
  </svg>
);

const DashboardSidebar: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <HomeIcon />, link: "/dashboard" },
    { id: "projects", label: "Projects", icon: <ProjectsIcon />, link: "/dashboard/projects" },
    { id: "upload", label: "Upload & Validate", icon: <UploadIcon />, link: "/dashboard/upload-ifc" },
    { id: "generate", label: "Generate Model", icon: <GenerateIcon />, link: "/dashboard/generate" },
    { id: "compliance", label: "Compliance Checks", icon: <ComplianceIcon />, link: "/dashboard/compliance" },
    { id: "clash", label: "Clash Detection", icon: <ClashIcon />, link: "/dashboard/clash-detection" },
    { id: "cost", label: "Cost Estimation", icon: <CostIcon />, link: "/dashboard/cost-estimation" },
    { id: "schedule", label: "Project Scheduling", icon: <ScheduleIcon />, link: "/dashboard/scheduling" },
    { id: "reports", label: "Reports Center", icon: <ReportsIcon />, link: "/dashboard/reports" },
    { id: "scenarios", label: "Scenario Manager", icon: <ScenarioIcon />, link: "/dashboard/scenarios" },
    { id: "templates", label: "Templates", icon: <TemplatesIcon />, link: "/dashboard/templates" },
  ];

  const isActive = (link: string) => {
    if (link === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(link);
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onToggle} />}
      <nav className={`dashboard-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">BIMFlow Suite</h2>
          <button className="sidebar-close" onClick={onToggle} aria-label="Close sidebar">×</button>
        </div>
        <ul className="sidebar-nav">
          {sidebarItems.map(item => (
            <li key={item.id}>
              <Link
                to={item.link}
                className={`sidebar-link ${isActive(item.link) ? 'active' : ''}`}
                onClick={() => window.innerWidth <= 1024 && onToggle()}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        {/* Footer removed completely - no user info, theme, or logout */}
      </nav>
    </>
  );
};

export default DashboardSidebar;