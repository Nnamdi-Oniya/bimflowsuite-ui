// src/pages/dashboard/GenerateModelPage.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { generateModelService, PROJECT_TYPE_CHOICES } from "../../services/generateModelService";
import "../../assets/css/GenerateModelDash.css";

/* ── Types ── */
interface FormData {
  projectType: string;
  projectName: string;
  description: string;
  floors: string;
  area: string;
  lanes?: string;
  spanLength?: string;
  bridgeType?: string;
  roadClass?: string;
  tracks?: string;
  electrification?: boolean;
  location: string;
  budget: string;
  timeline: string;
  specialRequirements: string;
  contactEmail: string;
  clientName: string;
  projectScale: string;
  riskClassification: string;
  siteName: string;
}

interface JobState {
  ifcId: string;
  status: "pending" | "generating" | "completed" | "failed";
  downloadUrl?: string;
  errorMessage?: string;
  fileSize?: number;
  completedAt?: string;
}

/* ── Project types from backend ── */
const PROJECT_TYPES = PROJECT_TYPE_CHOICES.map(t => ({
  ...t,
  icon: t.value === "BUILDING" ? "🏢" :
        t.value === "INFRA_ROAD" ? "🛣️" :
        t.value === "INFRA_RAILWAY" ? "🚂" :
        t.value === "INFRA_BRIDGE" ? "🌉" :
        t.value === "INFRA_TUNNEL" ? "🚇" :
        t.value === "INFRA_MARINE" ? "⚓" :
        t.value === "INDUSTRIAL_FACTORY" ? "🏭" :
        t.value === "INDUSTRIAL_PLANT" ? "🏗️" :
        t.value === "INFRA_DISTRIBUTION" ? "📡" :
        t.value === "SITE" ? "🗺️" : "🔧",
  colorClass: t.value === "BUILDING" ? "type-building" :
              t.value === "INFRA_ROAD" ? "type-road" :
              t.value === "INFRA_BRIDGE" ? "type-bridge" :
              t.value === "INFRA_RAILWAY" ? "type-railway" :
              t.value === "INFRA_TUNNEL" ? "type-tunnel" : "type-default"
}));

/* ── Parse description for live model traits ── */
function parseDesc(desc: string) {
  const d = desc.toLowerCase();
  const mat =
    /glass|curtain.?wall|glazed?/.test(d) ? "glass" :
    /steel|metal/.test(d)                 ? "steel" :
    /brick|masonry/.test(d)               ? "brick" :
    /wood|timber/.test(d)                 ? "wood"  : "concrete";
  const solar  = /solar|photovoltaic|pv\s/.test(d);
  const green  = /green.?roof|garden|vegetation/.test(d);
  const sustain= /leed|breeam|net.?zero|passive|sustainable/.test(d);
  const parking= /parking|garage/.test(d);
  const pool   = /pool|swimming|infinity/.test(d);
  const spire  = /spire|antenna|tower/.test(d);

  const chips: { icon: string; text: string }[] = [];
  if (mat !== "concrete") chips.push({ icon: "🧱", text: mat.charAt(0).toUpperCase() + mat.slice(1) });
  if (solar)   chips.push({ icon: "☀️", text: "Solar" });
  if (green)   chips.push({ icon: "🌿", text: "Green roof" });
  if (sustain) chips.push({ icon: "♻️", text: "Sustainable" });
  if (parking) chips.push({ icon: "🅿️", text: "Parking" });
  if (pool)    chips.push({ icon: "🏊", text: "Pool" });
  if (spire)   chips.push({ icon: "📡", text: "Spire" });
  return { mat, solar, green, sustain, parking, pool, spire, chips };
}

/* ── Get dynamic fields based on project type ── */
const getSpecFields = (projectType: string) => {
  switch (projectType) {
    case "BUILDING":
      return {
        showFloors: true,
        showArea: true,
        showLanes: false,
        showSpanLength: false,
        showBridgeType: false,
        showRoadClass: false,
        showTracks: false,
        showElectrification: false,
        areaLabel: "Total Area (m²)",
        areaHint: "Total floor area"
      };
    case "INFRA_ROAD":
      return {
        showFloors: false,
        showArea: true,
        showLanes: true,
        showSpanLength: false,
        showBridgeType: false,
        showRoadClass: true,
        showTracks: false,
        showElectrification: false,
        areaLabel: "Road Length (km)",
        areaHint: "Length of road in kilometers"
      };
    case "INFRA_BRIDGE":
      return {
        showFloors: false,
        showArea: true,
        showLanes: true,
        showSpanLength: true,
        showBridgeType: true,
        showRoadClass: false,
        showTracks: false,
        showElectrification: false,
        areaLabel: "Total Length (m)",
        areaHint: "Total bridge length in meters"
      };
    case "INFRA_RAILWAY":
      return {
        showFloors: false,
        showArea: true,
        showLanes: false,
        showSpanLength: false,
        showBridgeType: false,
        showRoadClass: false,
        showTracks: true,
        showElectrification: true,
        areaLabel: "Line Length (km)",
        areaHint: "Total railway line length"
      };
    case "INFRA_TUNNEL":
      return {
        showFloors: false,
        showArea: true,
        showLanes: false,
        showSpanLength: true,
        showBridgeType: false,
        showRoadClass: false,
        showTracks: false,
        showElectrification: false,
        areaLabel: "Tunnel Length (m)",
        areaHint: "Total tunnel length in meters"
      };
    case "SITE":
      return {
        showFloors: false,
        showArea: true,
        showLanes: false,
        showSpanLength: false,
        showBridgeType: false,
        showRoadClass: false,
        showTracks: false,
        showElectrification: false,
        areaLabel: "Site Area (m²)",
        areaHint: "Total land area"
      };
    default:
      return {
        showFloors: true,
        showArea: true,
        showLanes: false,
        showSpanLength: false,
        showBridgeType: false,
        showRoadClass: false,
        showTracks: false,
        showElectrification: false,
        areaLabel: "Total Area (m²)",
        areaHint: "Project area"
      };
  }
};

/* ─────────────────── Main Component ─────────────────── */
const GenerateModelPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    projectType: "", projectName: "", description: "",
    floors: "8", area: "5000", lanes: "", spanLength: "", bridgeType: "", roadClass: "",
    tracks: "", electrification: false, location: "", budget: "", 
    timeline: "", specialRequirements: "", contactEmail: "",
    clientName: "", projectScale: "medium", riskClassification: "medium", siteName: "Main Site"
  });
  const [step,        setStep]       = useState(0);
  const [submitting,  setSubmitting] = useState(false);
  const [submitted,   setSubmitted]  = useState(false);
  const [jobState,    setJobState]   = useState<JobState | null>(null);
  const [error,       setError]      = useState<string | null>(null);
  const [building,    setBuilding]   = useState(false);
  const [modelReady,  setModelReady] = useState(false);
  const [pollIv, setPollIv] = useState<ReturnType<typeof setInterval> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tourMode, setTourMode] = useState(false);

  const canvasRef     = useRef<HTMLDivElement>(null);
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef   = useRef<OrbitControls | null>(null);
  const modelRef      = useRef<THREE.Group | null>(null);
  const frameRef      = useRef<number>(0);
  const growRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tourRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  const parsed = useMemo(() => parseDesc(form.description), [form.description]);
  const selType = PROJECT_TYPES.find(t => t.value === form.projectType);
  const specFields = useMemo(() => getSpecFields(form.projectType), [form.projectType]);

  /* ── Toggle Fullscreen ── */
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (canvasRef.current?.requestFullscreen) {
        canvasRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  /* ── Tour Mode ── */
  const startTour = () => {
    if (!controlsRef.current) return;
    setTourMode(true);
    controlsRef.current.autoRotate = true;
    controlsRef.current.autoRotateSpeed = 0.8;
    
    if (tourRef.current) clearInterval(tourRef.current);
    tourRef.current = setTimeout(() => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
        setTourMode(false);
      }
    }, 30000) as any;
  };

  const stopTour = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
    if (tourRef.current) {
      clearTimeout(tourRef.current);
      tourRef.current = null;
    }
    setTourMode(false);
  };

  /* ── Init Three.js once ── */
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1118);
    scene.fog = new THREE.FogExp2(0x0c1118, 0.016);
    sceneRef.current = scene;

    const w = canvasRef.current.clientWidth;
    const h = canvasRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 500);
    camera.position.set(22, 14, 28);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    if ((renderer as any).outputColorSpace !== undefined) {
      (renderer as any).outputColorSpace = "srgb";
    } else {
      (renderer as any).outputEncoding = 3001;
    }
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.7;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 8;
    controls.maxDistance = 80;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.target.set(0, 4, 0);
    controlsRef.current = controls;

    /* Lights */
    scene.add(new THREE.AmbientLight(0x182030, 3));
    const sun = new THREE.DirectionalLight(0xfffaf0, 2.5);
    sun.position.set(15, 30, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(1024);
    sun.shadow.camera.left   = -30;
    sun.shadow.camera.right  =  30;
    sun.shadow.camera.top    =  30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.camera.far    =  80;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x4060ff, 0.5);
    fill.position.set(-10, 5, 10);
    scene.add(fill);

    /* Ground */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x0d1420, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* Grid */
    scene.add(new THREE.GridHelper(60, 30, 0xf8780f, 0x1c2a3a));

    /* Particles */
    const pArr: number[] = [];
    for (let i = 0; i < 250; i++) {
      pArr.push((Math.random() - 0.5) * 60, Math.random() * 35, (Math.random() - 0.5) * 60);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.Float32BufferAttribute(pArr, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xf8780f, size: 0.1, transparent: true, opacity: 0.35
    })));

    /* Render loop */
    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    tick();

    const onResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
      const rw = canvasRef.current.clientWidth;
      const rh = canvasRef.current.clientHeight;
      cameraRef.current.aspect = rw / rh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(rw, rh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
      controls.dispose();
      renderer.dispose();
      if (canvasRef.current && renderer.domElement.parentNode === canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  /* ── Rebuild model when inputs change ── */
  const rebuildModel = useCallback((animate: boolean) => {
    if (!sceneRef.current) return;
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
    if (growRef.current) clearTimeout(growRef.current);

    const floors = Math.max(1, parseInt(form.floors) || 5);
    const area   = Math.max(100, parseFloat(form.area) || 2000);
    const type   = form.projectType;
    const accent = 0xf8780f;
    const { mat, solar, green, pool, spire } = parsed;
    const group  = new THREE.Group();

    const m = (color: number, rough = 0.55, metal = 0.1, opacity = 1) =>
      new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, transparent: opacity < 1, opacity });

    if (type === "INFRA_BRIDGE") {
      addBridge(group, m, accent);
    } else if (type === "INFRA_ROAD") {
      addRoad(group, m, accent);
    } else if (type === "INFRA_RAILWAY") {
      addRailway(group, m, accent);
    } else if (type === "INFRA_TUNNEL") {
      addTunnel(group, m, accent);
    } else {
      const flH = 3.5;
      const totH = floors * flH;
      const W = Math.sqrt(area) * 0.65;
      const D = W * 0.78;
      addBuilding(group, m, { floors, W, D, flH, totH, mat, solar, green, pool, spire, accent });
      if (controlsRef.current) controlsRef.current.target.set(0, totH / 2, 0);
    }

    if (animate) {
      group.scale.set(1, 0.001, 1);
      setBuilding(true);
      setModelReady(false);
      let t = 0;
      const grow = () => {
        t += 0.045;
        group.scale.y = Math.min(1, t * t);
        if (group.scale.y < 1) {
          growRef.current = setTimeout(grow, 16);
        } else {
          group.scale.y = 1;
          setBuilding(false);
          setModelReady(true);
        }
      };
      grow();
    } else {
      setModelReady(true);
    }

    sceneRef.current.add(group);
    modelRef.current = group;
  }, [form, parsed]);

  useEffect(() => {
    if (form.projectType) rebuildModel(true);
  }, [form.projectType]);

  useEffect(() => {
    if (form.projectType) rebuildModel(false);
  }, [form.floors, form.area, parsed.mat, parsed.solar, parsed.green, parsed.pool, parsed.spire]);

  /* ── Polling ── */
  useEffect(() => () => { if (pollIv) clearInterval(pollIv); }, [pollIv]);

  const startPolling = (id: string) => {
    if (pollIv) clearInterval(pollIv);
    const iv = setInterval(async () => {
      try {
        const res = await generateModelService.getGeneratedIFC(id);
        if (res.data) {
          setJobState({ 
            ifcId: res.data.id, 
            status: res.data.status, 
            downloadUrl: res.data.download_url ?? undefined, 
            errorMessage: res.data.error_message ?? undefined, 
            fileSize: res.data.file_size, 
            completedAt: res.data.completed_at ?? undefined 
          });
          if (res.data.status === "completed" || res.data.status === "failed") { 
            clearInterval(iv); 
            setPollIv(null); 
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
    setPollIv(iv);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(p => ({ 
      ...p, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      console.log('Submitting form data:', form);
      const result = await generateModelService.generateModel(form);
      console.log('Generation result:', result);
      setJobState({ 
        ifcId: result.ifc.id, 
        status: result.ifc.status, 
        downloadUrl: result.ifc.download_url ?? undefined, 
        errorMessage: result.ifc.error_message ?? undefined, 
        fileSize: result.ifc.file_size, 
        completedAt: result.ifc.completed_at ?? undefined 
      });
      setSubmitted(true);
      startPolling(result.ifc.id);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!jobState?.ifcId) return;
    try {
      const info = await generateModelService.getIFCDownloadInfo(jobState.ifcId);
      if (!info.data) throw new Error("No download info");
      const blob = await generateModelService.downloadIFCFile(info.data.download_url);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = info.data.filename || `${form.projectName || 'project'}.ifc`;
      document.body.appendChild(a); a.click();
      URL.revokeObjectURL(url); document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      alert("Download failed. Please try again.");
    }
  };

  const handleReset = () => {
    if (pollIv) { clearInterval(pollIv); setPollIv(null); }
    setSubmitted(false); setJobState(null); setError(null); setModelReady(false);
    setForm({ 
      projectType:"", projectName:"", description:"", floors:"8", area:"5000", 
      lanes:"", spanLength:"", bridgeType:"", roadClass:"", tracks:"", 
      electrification: false, location:"", budget:"", timeline:"", 
      specialRequirements:"", contactEmail:"", clientName:"", 
      projectScale:"medium", riskClassification:"medium", siteName:"Main Site" 
    });
    if (sceneRef.current && modelRef.current) { 
      sceneRef.current.remove(modelRef.current); 
      modelRef.current = null; 
    }
    setStep(0);
  };

  const statusMap: Record<string, { text: string; icon: string }> = {
    pending:    { text: "Queued — waiting for worker", icon: "⏳" },
    generating: { text: "Generating IFC model…",       icon: "⚙️" },
    completed:  { text: "Model ready to download!",    icon: "✅" },
    failed:     { text: jobState?.errorMessage || "Generation failed", icon: "❌" },
  };
  const si = jobState ? statusMap[jobState.status] : null;
  const canSubmit = !!(form.projectType && form.projectName && form.description.trim() && form.contactEmail);

  return (
    <div className={`generate-page ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* ─── Left: 3D Viewer ─── */}
      <aside className={`viewer-col ${isFullscreen ? 'fullscreen-viewer' : ''}`}>
        {/* Header */}
        <div className="viewer-header">
          <span className="viewer-badge">⬡ LIVE BIM PREVIEW</span>
          {selType && (
            <span className={`type-tag ${selType.colorClass}`}>
              {selType.icon} {selType.label}
            </span>
          )}
          
          {/* Viewer Controls */}
          <div className="viewer-controls">
            <button 
              onClick={toggleFullscreen} 
              className="control-btn"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? "⛶" : "⛶"}
            </button>
            <button 
              onClick={tourMode ? stopTour : startTour} 
              className={`control-btn ${tourMode ? 'tour-active' : ''}`}
              title={tourMode ? "Stop Tour" : "Start Tour"}
            >
              {tourMode ? "⏸️" : "🎬"}
            </button>
            <button 
              onClick={() => controlsRef.current?.target.set(0, 4, 0)} 
              className="control-btn"
              title="Reset View"
            >
              ⟲
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas-wrap">
          <div ref={canvasRef} className="canvas" />

          {/* Empty state */}
          {!form.projectType && (
            <div className="preview-overlay">
              <div className="placeholder-icon">◈</div>
              <p className="placeholder-title">Select a project type</p>
              <p className="placeholder-sub">Your 3D model appears here in real time</p>
            </div>
          )}

          {/* Building animation */}
          {building && (
            <div className="preview-overlay">
              <div className="spinner" />
              <p className="overlay-text">Assembling structure…</p>
            </div>
          )}

          {/* IFC generation overlay */}
          {(jobState?.status === "pending" || jobState?.status === "generating") && !building && (
            <div className="preview-overlay">
              <div className="spinner" />
              <p className="overlay-text">
                {jobState.status === "pending" ? "Queued for generation…" : "Generating IFC model…"}
              </p>
            </div>
          )}

          {/* HUD */}
          {modelReady && form.projectType && (
            <div className="hud-container">
              {form.floors && <span className="hud-chip">🏗 {form.floors} floors</span>}
              {form.area   && <span className="hud-chip">📐 {Number(form.area).toLocaleString()} m²</span>}
              {parsed.mat !== "concrete" && <span className="hud-chip">🧱 {parsed.mat}</span>}
              {parsed.solar  && <span className="hud-chip">☀️ Solar</span>}
              {parsed.green  && <span className="hud-chip">🌿 Green roof</span>}
              {parsed.pool   && <span className="hud-chip">🏊 Pool</span>}
            </div>
          )}

          <div className="compass">N</div>
        </div>

        {/* AI Detected chips */}
        <div className="insight-bar">
          <span className="insight-label">✦ AI DETECTED</span>
          {parsed.chips.length === 0
            ? <span className="insight-empty">Describe your project to see detected features</span>
            : parsed.chips.map((c, i) => (
                <span key={i} className="insight-chip">
                  {c.icon} <span className="chip-text">{c.text}</span>
                </span>
              ))
          }
        </div>
      </aside>

      {/* ─── Right: Form ─── */}
      <main className={`form-col ${isFullscreen ? 'fullscreen-form' : ''}`}>
        <div className="form-header">
          <h1 className="page-title">Generate BIM Model</h1>
          <p className="page-subtitle">Describe your project — watch it come to life in real time.</p>
        </div>

        {error && (
          <div className="error-message">⚠ {error}</div>
        )}

        {submitted ? (
          /* ── Success state ── */
          <div className="success-container">
            <div className="success-icon">⬡</div>
            <h2 className="success-title">Project submitted!</h2>
            <p className="success-message">
              IFC generation has been queued. This page polls for status every 3 seconds.
            </p>
            <div className="success-card">
              <div className="success-row">
                <span className="success-label">Project</span>
                <strong className="success-value">{form.projectName}</strong>
              </div>
              <div className="success-row">
                <span className="success-label">Type</span>
                <strong className="success-value">
                  {PROJECT_TYPES.find(t => t.value === form.projectType)?.label}
                </strong>
              </div>
              {si && (
                <div className="success-row">
                  <span className="success-label">Status</span>
                  <strong className={`success-value status-${jobState?.status}`}>
                    {si.icon} {si.text}
                  </strong>
                </div>
              )}
              {jobState?.fileSize ? (
                <div className="success-row">
                  <span className="success-label">File size</span>
                  <strong className="success-value">{(jobState.fileSize / 1024).toFixed(1)} KB</strong>
                </div>
              ) : null}
            </div>
            {jobState?.status === "completed" && (
              <button className="btn-generate" onClick={handleDownload}>
                📥 Download IFC Model
              </button>
            )}
            {(jobState?.status === "pending" || jobState?.status === "generating") && (
              <p className="polling-indicator">
                <span className="spinner-small" />
                Polling every 3 s for status updates…
              </p>
            )}
            <div className="action-group">
              <button className="btn-ghost" onClick={handleReset}>+ New Project</button>
              <button className="btn-primary" onClick={() => navigate("/dashboard")}>← Dashboard</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Step tabs */}
            <div className="step-tabs">
              {["Project Type", "Basics", "Specifications"].map((label, i) => (
                <button 
                  key={i} 
                  type="button"
                  className={`step-tab ${step === i ? 'active' : ''} ${i < step ? 'completed' : ''}`}
                  onClick={() => setStep(i)}
                >
                  <span className={`step-number ${step === i ? 'active' : ''} ${i < step ? 'completed' : ''}`}>
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span className="step-label">{label}</span>
                </button>
              ))}
            </div>

            {/* Step 0: Choose type */}
            {step === 0 && (
              <div className="fade-in">
                <p className="section-title">What are you building?</p>
                <div className="type-grid">
                  {PROJECT_TYPES.map(t => (
                    <button 
                      key={t.value} 
                      type="button"
                      className={`type-card ${form.projectType === t.value ? 'active' : ''} ${t.colorClass}`}
                      onClick={() => { setForm(p => ({ ...p, projectType: t.value })); setStep(1); }}
                    >
                      <div className="type-icon">{t.icon}</div>
                      <div className="type-name">{t.label}</div>
                      <div className="type-desc">{t.description}</div>
                      {form.projectType === t.value && (
                        <div className="type-check">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="fade-in">
                <p className="section-title">Project Basics</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Project Name <span className="required-star">*</span>
                    </label>
                    <input 
                      name="projectName" 
                      value={form.projectName} 
                      onChange={handleChange}
                      className="form-input" 
                      placeholder="e.g. Downtown Office Tower" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Contact Email <span className="required-star">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="contactEmail" 
                      value={form.contactEmail} 
                      onChange={handleChange}
                      className="form-input" 
                      placeholder="you@company.com" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Description <span className="required-star">*</span>
                    <span className="input-hint">— shapes the 3D preview live</span>
                  </label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange}
                    className="form-textarea"
                    rows={5} 
                    maxLength={600} 
                    required
                    placeholder="Try: glass curtain wall · exposed concrete · solar panels · green roof · steel frame · LEED certified · underground parking…" 
                  />
                  <div className="char-counter">
                    <div 
                      className="char-progress" 
                      style={{ width: `${(form.description.length / 600) * 100}%` }}
                    />
                    <span className="char-count">{form.description.length}/600</span>
                  </div>
                </div>

                <div className="nav-buttons">
                  <button type="button" className="btn-ghost" onClick={() => setStep(0)}>← Back</button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    disabled={!form.projectName || !form.contactEmail || !form.description.trim()}
                    onClick={() => setStep(2)}
                  >
                    Specifications →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Specs - DYNAMIC BASED ON PROJECT TYPE */}
            {step === 2 && (
              <div className="fade-in">
                <p className="section-title">Technical Specifications</p>
                <div className="form-grid">
                  
                  {/* FLOORS - only for buildings */}
                  {specFields.showFloors && (
                    <div className="form-group">
                      <label className="form-label">Number of Floors</label>
                      <input 
                        type="number" 
                        name="floors" 
                        value={form.floors} 
                        onChange={handleChange}
                        className="form-input" 
                        placeholder="e.g. 12" 
                        min="1" 
                        max="300" 
                      />
                      <span className="input-hint">Updates 3D model live ↗</span>
                    </div>
                  )}
                  
                  {/* AREA - with dynamic label */}
                  {specFields.showArea && (
                    <div className="form-group">
                      <label className="form-label">{specFields.areaLabel}</label>
                      <input 
                        type="number" 
                        name="area" 
                        value={form.area} 
                        onChange={handleChange}
                        className="form-input" 
                        placeholder="e.g. 5000" 
                        min="1" 
                      />
                      <span className="input-hint">{specFields.areaHint} ↗</span>
                    </div>
                  )}
                  
                  {/* LANES - for roads and bridges */}
                  {specFields.showLanes && (
                    <div className="form-group">
                      <label className="form-label">Number of Lanes</label>
                      <input 
                        type="number" 
                        name="lanes" 
                        value={form.lanes || ''} 
                        onChange={handleChange}
                        className="form-input" 
                        placeholder="e.g. 4" 
                        min="1" 
                        max="20" 
                      />
                      <span className="input-hint">Traffic lanes (excluding shoulders) ↗</span>
                    </div>
                  )}
                  
                  {/* SPAN LENGTH - for bridges */}
                  {specFields.showSpanLength && (
                    <div className="form-group">
                      <label className="form-label">Main Span Length (m)</label>
                      <input 
                        type="number" 
                        name="spanLength" 
                        value={form.spanLength || ''} 
                        onChange={handleChange}
                        className="form-input" 
                        placeholder="e.g. 200" 
                        min="1" 
                      />
                      <span className="input-hint">Longest span between supports ↗</span>
                    </div>
                  )}
                  
                  {/* BRIDGE TYPE - dropdown for bridges */}
                  {specFields.showBridgeType && (
                    <div className="form-group">
                      <label className="form-label">Bridge Type</label>
                      <select 
                        name="bridgeType" 
                        value={form.bridgeType || ''} 
                        onChange={handleChange} 
                        className="form-select"
                      >
                        <option value="">Select type…</option>
                        <option value="beam">Beam Bridge</option>
                        <option value="arch">Arch Bridge</option>
                        <option value="suspension">Suspension Bridge</option>
                        <option value="cable_stay">Cable-Stayed</option>
                        <option value="truss">Truss Bridge</option>
                      </select>
                    </div>
                  )}
                  
                  {/* ROAD CLASS - for roads */}
                  {specFields.showRoadClass && (
                    <div className="form-group">
                      <label className="form-label">Road Classification</label>
                      <select 
                        name="roadClass" 
                        value={form.roadClass || ''} 
                        onChange={handleChange} 
                        className="form-select"
                      >
                        <option value="">Select class…</option>
                        <option value="highway">Highway</option>
                        <option value="arterial">Arterial</option>
                        <option value="collector">Collector</option>
                        <option value="local">Local Street</option>
                      </select>
                    </div>
                  )}
                  
                  {/* TRACKS - for railways */}
                  {specFields.showTracks && (
                    <div className="form-group">
                      <label className="form-label">Number of Tracks</label>
                      <input 
                        type="number" 
                        name="tracks" 
                        value={form.tracks || ''} 
                        onChange={handleChange}
                        className="form-input" 
                        placeholder="e.g. 2" 
                        min="1" 
                        max="10" 
                      />
                    </div>
                  )}
                  
                  {/* ELECTRIFICATION - for railways */}
                  {specFields.showElectrification && (
                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                      <label className="form-label">Electrification</label>
                      <input 
                        type="checkbox" 
                        name="electrification" 
                        checked={form.electrification || false} 
                        onChange={handleChange}
                        style={{ width: '20px', height: '20px', margin: 0 }}
                      />
                    </div>
                  )}
                  
                  {/* LOCATION - always shown */}
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input 
                      name="location" 
                      value={form.location} 
                      onChange={handleChange}
                      className="form-input" 
                      placeholder="City, Country" 
                    />
                  </div>
                  
                  {/* BUDGET - always shown */}
                  <div className="form-group">
                    <label className="form-label">Estimated Budget (USD)</label>
                    <input 
                      type="number" 
                      name="budget" 
                      value={form.budget} 
                      onChange={handleChange}
                      className="form-input" 
                      placeholder="e.g. 5000000" 
                      min="0" 
                    />
                  </div>
                </div>
                
                {/* TIMELINE - always shown */}
                <div className="form-group full-width">
                  <label className="form-label">Timeline</label>
                  <select 
                    name="timeline" 
                    value={form.timeline} 
                    onChange={handleChange} 
                    className="form-select"
                  >
                    <option value="">Select…</option>
                    <option>1-3 months</option>
                    <option>3-6 months</option>
                    <option>6-12 months</option>
                    <option>12+ months</option>
                  </select>
                </div>
                
                {/* SPECIAL REQUIREMENTS - always shown */}
                <div className="form-group full-width">
                  <label className="form-label">Special Requirements</label>
                  <textarea 
                    name="specialRequirements" 
                    value={form.specialRequirements} 
                    onChange={handleChange}
                    className="form-textarea"
                    rows={3}
                    placeholder="Building codes, seismic zone, LEED target, accessibility…" 
                  />
                </div>
                
                <div className="nav-buttons">
                  <button type="button" className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button 
                    type="submit" 
                    className="btn-generate"
                    disabled={submitting || !canSubmit}
                  >
                    {submitting
                      ? <><span className="spinner-small" /> Creating…</>
                      : <>⬡ Generate IFC Model</>
                    }
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </main>
    </div>
  );
};

/* ─────────────── 3D Model Helpers ─────────────── */
type MakeMat = (c: number, r?: number, m?: number, o?: number) => THREE.MeshStandardMaterial;

function addBuilding(group: THREE.Group, m: MakeMat, o: {
  floors: number; W: number; D: number; flH: number; totH: number;
  mat: string; solar: boolean; green: boolean; pool: boolean; spire: boolean; accent: number;
}) {
  const { floors, W, D, flH, totH, mat, solar, green, pool, spire, accent } = o;

  // Foundation slab
  const found = new THREE.Mesh(new THREE.BoxGeometry(W + 2, 0.7, D + 2), m(0x2a3344, 0.9));
  found.position.y = 0.35; found.receiveShadow = true; group.add(found);

  // Facade based on material
  const facMat =
    mat === "glass"  ? m(accent, 0.05, 0.8, 0.45) :
    mat === "steel"  ? m(0x8899aa, 0.15, 0.9) :
    mat === "brick"  ? m(0xb05030, 0.88, 0.04) :
    mat === "wood"   ? m(0xa06030, 0.88, 0.04) :
                       m(0xcfd4e0, 0.62, 0.08);
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, totH, D), facMat);
  body.position.y = totH / 2 + 0.7; body.castShadow = true; body.receiveShadow = true;
  group.add(body);

  // Floor slabs
  const slabMat = m(0xffffff, 0.6, 0.04);
  for (let i = 0; i <= floors; i++) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, 0.16, D + 0.3), slabMat);
    slab.position.y = 0.7 + i * flH; slab.castShadow = true; group.add(slab);
  }

  // Corner columns
  const colMat = m(0xdde0ee, 0.38, 0.35);
  const cx = W / 2 - 0.6; const cz = D / 2 - 0.6;
  [[-cx, -cz], [-cx, cz], [cx, -cz], [cx, cz]].forEach(([x, z]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.65, totH + 0.7, 0.65), colMat);
    col.position.set(x, totH / 2 + 0.7, z); col.castShadow = true; group.add(col);
  });

  // Accent crown
  const crown = new THREE.Mesh(new THREE.BoxGeometry(W + 0.1, 0.32, D + 0.1), m(accent, 0.25, 0.72));
  crown.position.y = totH + 0.7; group.add(crown);

  // Solar panels
  if (solar) {
    const panMat = m(0x1533aa, 0.1, 0.65, 0.9);
    for (let px = -1; px <= 1; px++) {
      for (let pz = -1; pz <= 1; pz++) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(W * 0.24, 0.06, D * 0.18), panMat);
        panel.position.set(px * W * 0.3, totH + 1.1, pz * D * 0.23);
        panel.rotation.x = -0.28; group.add(panel);
      }
    }
  }

  // Green roof
  if (green) {
    const grf = new THREE.Mesh(new THREE.BoxGeometry(W * 0.88, 0.28, D * 0.88), m(0x2a7a36, 0.95));
    grf.position.y = totH + 1.0; group.add(grf);
  }

  // Pool
  if (pool) {
    const poolGeo = new THREE.BoxGeometry(W * 0.3, 0.3, D * 0.2);
    const poolMat = m(0x3399ff, 0.1, 0.1, 0.8);
    const poolMesh = new THREE.Mesh(poolGeo, poolMat);
    poolMesh.position.set(W * 0.2, totH + 1.2, D * 0.2);
    group.add(poolMesh);
  }

  // Spire
  if (spire) {
    const spireGeo = new THREE.ConeGeometry(0.8, 4, 8);
    const spireMat = m(0xcccccc, 0.3, 0.5);
    const spireMesh = new THREE.Mesh(spireGeo, spireMat);
    spireMesh.position.set(0, totH + 2.5, 0);
    group.add(spireMesh);
  }

  // Ground ring glow
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(W * 0.56, W * 0.64, 48),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; group.add(ring);
}

function addBridge(group: THREE.Group, m: MakeMat, accent: number) {
  // Deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(36, 0.9, 8), m(0x888899, 0.5, 0.3));
  deck.position.y = 7; deck.castShadow = true; group.add(deck);

  // Piers
  [-13, 0, 13].forEach(x => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(1.8, 14, 3), m(0x707080, 0.65, 0.1));
    pier.position.set(x, 0, 0); pier.castShadow = true; group.add(pier);
  });

  // Towers
  [-16, 16].forEach(x => {
    const tow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 18, 1.2), m(0xaabbcc, 0.38, 0.45));
    tow.position.set(x, 9, 0); tow.castShadow = true; group.add(tow);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.2, 4), m(accent, 0.28, 0.55));
    cap.position.set(x, 19, 0); group.add(cap);
  });

  // Cables
  [-11, -5, 5, 11].forEach(x => {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 9), m(accent, 0.18, 0.7));
    cable.position.set(x, 11, 4.5); cable.rotation.z = 0.38; group.add(cable);
  });

  // Ground ring glow
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(19, 21, 64),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.14, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; group.add(ring);
}

function addRoad(group: THREE.Group, m: MakeMat, accent: number) {
  // Road surface
  const road = new THREE.Mesh(new THREE.BoxGeometry(52, 0.22, 14), m(0x252930, 0.95));
  road.position.y = 0.11; road.receiveShadow = true; group.add(road);

  // Lane markings
  for (let x = -22; x <= 22; x += 5) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(3, 0.04, 0.22), m(0xffffff, 0.8));
    mark.position.set(x, 0.26, 0); group.add(mark);
  }

  // Kerbs
  [-7.3, 7.3].forEach(z => {
    const kerb = new THREE.Mesh(new THREE.BoxGeometry(52, 0.38, 0.5), m(0x888888, 0.7));
    kerb.position.set(0, 0.19, z); group.add(kerb);
  });

  // Street lights
  [-16, 0, 16].forEach(x => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 7), m(0x556677, 0.5, 0.5));
    pole.position.set(x, 3.5, -8.5); pole.castShadow = true; group.add(pole);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 8), m(accent, 0.08, 0.85));
    lamp.position.set(x, 7.3, -8.5); group.add(lamp);
  });

  // Ground ring glow
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(23, 25, 64),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.11, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; group.add(ring);
}

function addRailway(group: THREE.Group, m: MakeMat, accent: number) {
  // Track bed
  const bed = new THREE.Mesh(new THREE.BoxGeometry(52, 0.4, 8), m(0x333944, 0.8));
  bed.position.y = 0.2; bed.receiveShadow = true; group.add(bed);

  // Rails
  [-2.5, 2.5].forEach(z => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(52, 0.2, 0.2), m(0xcccccc, 0.3, 0.8));
    rail.position.set(0, 0.5, z); rail.castShadow = true; group.add(rail);
    
    // Sleepers
    for (let x = -24; x <= 24; x += 1.5) {
      const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 5.5), m(0x8b5a2b, 0.8));
      sleeper.position.set(x, 0.3, 0); sleeper.castShadow = true; group.add(sleeper);
    }
  });

  // Ground ring glow
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(23, 25, 64),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.11, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; group.add(ring);
}

function addTunnel(group: THREE.Group, m: MakeMat, accent: number) {
  // Tunnel entrance
  const entrance = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 10, 32, 1, true), m(0x556677, 0.7));
  entrance.rotation.z = Math.PI / 2;
  entrance.position.set(0, 5, 0);
  group.add(entrance);

  // Road inside
  const road = new THREE.Mesh(new THREE.BoxGeometry(30, 0.2, 6), m(0x333333, 0.9));
  road.position.set(0, 0.1, 0);
  road.receiveShadow = true;
  group.add(road);

  // Ground ring glow
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(6, 7, 32),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; group.add(ring);
}

export default GenerateModelPage;