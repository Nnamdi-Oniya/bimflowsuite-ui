// src/App.tsx
import React, { Component, Suspense, type ReactNode, useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import "./App.css";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ServicesSection from "./components/ServicesSection";
import HowWeWorkSection from "./components/HowWeWorkSection";
import ProjectsTestimonialsSection from "./components/ProjectsTestimonialsSection";
import CTANewsSection from "./components/CTANewsSection";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth } from "./contexts/AuthContext";

// Lazy imports – public pages
const FeaturesPage = React.lazy(() => import("./pages/FeaturesPage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const FAQPage = React.lazy(() => import("./pages/FAQPage"));
const ProjectsPageLanding = React.lazy(() => import("./pages/ProjectsPage"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const SetPasswordPage = React.lazy(() => import("./pages/SetPasswordPage"));
const ProjectGeneratePage = React.lazy(() => import("./pages/ProjectGeneratePage"));
const BookDemoPage = React.lazy(() => import("./pages/BookDemoPage"));

// Dashboard lazy imports
const DashboardLayout = React.lazy(() => import("./components/DashboardLayout"));
const DashboardOverview = React.lazy(() => import("./pages/dashboard/DashboardPage"));
const DashboardProjects = React.lazy(() => import("./pages/dashboard/ProjectsPage"));
const DashboardCreateProject = React.lazy(() => import("./pages/dashboard/CreateProjectPage"));
const DashboardGenerate = React.lazy(() => import("./pages/dashboard/GenerateModelPage"));
const DashboardCompliance = React.lazy(() => import("./pages/dashboard/ComplianceChecksPage"));
const DashboardUploadIFCPage = React.lazy(() => import("./pages/dashboard/UploadIFCPage"));
const ClashDetectionPage = React.lazy(() => import("./pages/dashboard/ClashDetectionPage"));
const CostEstimationPage = React.lazy(() => import("./pages/dashboard/CostEstimationPage"));
const ProjectSchedulingPage = React.lazy(() => import("./pages/dashboard/ProjectSchedulingPage"));
const ReportsCenterPage = React.lazy(() => import("./pages/dashboard/ReportsCenterPage"));
const ScenarioManagerPage = React.lazy(() => import("./pages/dashboard/ScenarioManagerPage"));
const DashboardTemplates = React.lazy(() => import("./pages/dashboard/TemplatesPage"));
const DashboardSettings = React.lazy(() => import("./pages/dashboard/SettingsPage"));
const DashboardProfile = React.lazy(() => import("./pages/dashboard/ProfilePage"));

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center", background: "#f5f5f5", minHeight: "100vh" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Oops! Something went wrong.</h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "2rem", color: "#666" }}>
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#F8780F",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              marginTop: "1rem",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const LoadingFallback: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
      fontSize: "1.2rem",
      color: "#F8780F",
      flexDirection: "column",
      gap: "1rem",
    }}
  >
    <div
      className="loading-spinner"
      style={{
        width: "50px",
        height: "50px",
        border: "3px solid #f3f3f3",
        borderTop: "3px solid #F8780F",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <p>Loading BIMFlow Suite...</p>
  </div>
);

// ────────────────────────────────────────────────
//  FAST 404 – "Page not found" + redirect in 5 seconds
// ────────────────────────────────────────────────
const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isInsideDashboard = location.pathname.startsWith("/dashboard");

  const redirectPath = isAuthenticated && isInsideDashboard ? "/dashboard" : "/";
  const countdownSeconds = 5;

  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate(redirectPath, { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, navigate, redirectPath]);

  const showDashboardButton = isAuthenticated && isInsideDashboard;

  return (
    <div
      style={{
        padding: "4rem 1.5rem",
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <h1
        style={{
          fontSize: "6.5rem",
          fontWeight: 900,
          margin: "0 0 0.8rem",
        }}
      >
        Page not found
      </h1>

      <p style={{ fontSize: "1.15rem", marginBottom: "2.2rem" }}>
        Redirecting to the{" "}
        <strong style={{ color: "#F8780F" }}>
          {isInsideDashboard && isAuthenticated ? "dashboard" : "homepage"}
        </strong>{" "}
        in {secondsLeft} seconds...
      </p>

      <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          to="/"
          style={{
            padding: "0.85rem 2rem",
            background: "#F8780F",
            color: "white",
            borderRadius: "50px",
            textDecoration: "none",
            fontSize: "1.05rem",
            fontWeight: 600,
          }}
        >
          Go to Homepage
        </Link>

        {showDashboardButton && (
          <Link
            to="/dashboard"
            style={{
              padding: "0.85rem 2rem",
              color: "white",
              border: "2px solid white",
              borderRadius: "50px",
              textDecoration: "none",
              fontSize: "1.05rem",
              fontWeight: 500,
            }}
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const hideFooterPaths = [
    "/login",
    "/forgot-password",
    "/set-password",
    "/reset-password",
    "/book-demo",
  ];
  const hideFooter = isDashboard || hideFooterPaths.includes(location.pathname);

  return (
    <div className="app-container">
      {!isDashboard && <Header />}
      <ScrollToTop />
      <main className="main-content">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <>
                  <HeroSection />
                  <ServicesSection />
                  <HowWeWorkSection />
                  <ProjectsTestimonialsSection />
                  <CTANewsSection />
                </>
              }
            />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/projects" element={<ProjectsPageLanding />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/project-generate" element={<ProjectGeneratePage />} />
            <Route path="/book-demo" element={<BookDemoPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="projects" element={<DashboardProjects />} />
                <Route path="projects/create" element={<DashboardCreateProject />} />
                <Route path="generate" element={<DashboardGenerate />} />
                <Route path="compliance" element={<DashboardCompliance />} />
                <Route path="upload-ifc" element={<DashboardUploadIFCPage />} />
                <Route path="clash-detection" element={<ClashDetectionPage />} />
                <Route path="cost-estimation" element={<CostEstimationPage />} />
                <Route path="scheduling" element={<ProjectSchedulingPage />} />
                <Route path="reports" element={<ReportsCenterPage />} />
                <Route path="scenarios" element={<ScenarioManagerPage />} />
                <Route path="templates" element={<DashboardTemplates />} />
                <Route path="settings" element={<DashboardSettings />} />
                <Route path="profile" element={<DashboardProfile />} />
              </Route>
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;