// src/pages/GenerateModelPage.tsx - COMPLETE VERSION WITH ALL REQUIREMENTS - ERROR FREE
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/GenerateModelPage.css";
import generateModelHero from "../assets/images/generateModelHero.jpg";
import { apiClient } from "../services/apiClient";
import { authService } from "../services/authService";
import NewUserModal from "../components/NewUserModal";
import { saveFormData, loadFormData, clearFormData, getProjectParams, type FormData } from "../utils/formStorage";
import { bookDemoService } from "../services/bookDemoService";

// Extended FormData interface with all fields including dynamic ones
interface ExtendedFormData {
  // Core Identifiers
  projectType?: string;
  projectCategory?: string;
  buildingType?: string;
  infrastructureType?: string;
  industrialType?: string;
  civilWorksType?: string;
  projectNumber?: string;
  projectCode?: string;
  projectScale?: "small" | "medium" | "large";
  clientType?: "private" | "corporate" | "government" | "nGO";
  clientName?: string;
  projectSponsor?: string;
  projectName?: string;
  description?: string;
  
  // Stakeholders
  architect?: string;
  structuralEngineer?: string;
  mepEngineer?: string;
  bimConsultant?: string;
  contractor?: string;
  subcontractors?: string;
  bimManager?: string;
  bimCoordinator?: string;
  
  // Status & Governance
  projectStatus?: "concept" | "feasibility" | "design" | "construction" | "handover" | "operation";
  approvalStatus?: "pending" | "approved" | "conditionallyApproved" | "rejected" | "revisionRequired";
  approvingAuthority?: string;
  approvalReference?: string;
  complianceStandards?: string[];
  riskClassification?: "low" | "medium" | "high";
  healthSafetyClassification?: string;
  
  // Location & Geospatial
  country?: string;
  stateRegion?: string;
  city?: string;
  projectAddress?: string;
  plotNumber?: string;
  latitude?: string;
  longitude?: string;
  elevation?: string;
  coordinateReferenceSystem?: string;
  topography?: "flat" | "sloped" | "undulating";
  climateZone?: string;
  floodRiskZone?: string;
  seismicZone?: string;
  location?: string;
  
  // Timeline & Phasing
  projectStartDate?: string;
  designStartDate?: string;
  designEndDate?: string;
  constructionStartDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  lodTarget?: "LOD100" | "LOD200" | "LOD300" | "LOD400" | "LOD500";
  timeline?: string;
  
  // Financial & Commercial
  estimatedCost?: string;
  approvedBudget?: string;
  currentCost?: string;
  costVariance?: string;
  contractType?: "lumpSum" | "designBuild" | "costPlus" | "other";
  paymentStructure?: string;
  currency?: string;
  procurementMethod?: string;
  budget?: string;
  
  // Specifications - Core
  floors?: string;
  area?: string;
  specialRequirements?: string;
  contactEmail?: string;
  mainSpanLength?: string;
  roadLength?: string;
  numberOfLanes?: string;
  infrastructureCapacity?: string;
  designLife?: string;
  constructionMethod?: string;
  operationalRequirements?: string;
  productionCapacity?: string;
  processType?: string;
  safetyLevel?: string;
  environmentalControls?: string;
  earthworkVolume?: string;
  soilType?: string;
  drainageRequirements?: string;
  
  // Infrastructure specific
  bridgeType?: "beam" | "arch" | "suspension" | "cableStayed" | "truss" | "movable" | "pedestrian";
  roadClassification?: "highway" | "arterial" | "collector" | "local" | "expressway" | "rural";
  
  // BIM Technical Specifications
  bimAuthoringTools?: string[];
  modelFileFormats?: string[];
  hasBEP?: boolean;
  bepVersion?: string;
  disciplineModels?: string[];
  federatedModelStatus?: "notCreated" | "inProgress" | "completed";
  clashDetectionStatus?: "notStarted" | "inProgress" | "completed" | "issuesFound";
  modelVersioning?: boolean;
  
  // Data Management
  cdePlatform?: string;
  accessLevel?: "admin" | "editor" | "viewer";
  contributors?: number;
  openIssues?: string;
  closedIssues?: string;
  rfiStatus?: string;
  changeRequests?: string;
  
  // Asset & Component Data
  manufacturer?: string;
  modelNumber?: string;
  installationDate?: string;
  warrantyPeriod?: string;
  expectedLifespan?: string;
  maintenanceRequirements?: string;
  
  // Sustainability
  energyTargets?: string;
  materialSustainability?: string;
  carbonFootprint?: string;
  spaceUtilization?: string;
  operationalEfficiency?: string;
  
  // Legal & Security
  dataOwnership?: "client" | "consultant" | "joint" | "contractor";
  dataSecurityLevel?: "low" | "medium" | "high" | "classified";
  backupPolicy?: string;
  handoverRequirements?: string;
  intellectualProperty?: string;
  
  // SME Specific
  bimMaturity?: "low" | "medium" | "high";
  staffTrainingLevel?: string;
  softwareSelection?: string[];
  simplifiedWorkflows?: boolean;
  costEfficientSoftware?: boolean;
  reducedModelComplexity?: boolean;
  scalability?: boolean;
  
  // Model Generation
  numberOfModels?: number;
  modelTypes?: string[];
  deliveryFormat?: "ifc" | "rvt" | "dwg" | "nwd" | "pdf" | "excel";
  includeQuantityTakeoff?: boolean;
  includeClashDetection?: boolean;
  includeBEP?: boolean;
  includeDrawings?: boolean;
  includeReports?: boolean;
  
  // Government Requirements
  governmentApprovals?: string[];
  environmentalClearance?: string;
  buildingPermitNumber?: string;
  occupancyCertificate?: string;
  fireSafetyCertificate?: string;
  accessibilityCompliance?: string;
  zoningApproval?: string;
  heritageClearance?: string;
  environmentalImpactAssessment?: string;
  trafficImpactAssessment?: string;
  utilityClearances?: string[];
  
  // Regulatory Compliance
  localBuildingCode?: string;
  nationalStandards?: string[];
  internationalStandards?: string[];
  isoStandards?: string[];
  industrySpecificCodes?: string[];
  qualityAssurancePlan?: string;
  inspectionRequirements?: string[];

  // Dynamic fields for different categories
  height?: string;
  occupancy?: string;
  structuralSystem?: string;
  width?: string;
  clearance?: string;
  roadWidth?: string;
  designSpeed?: string;
  railwayLength?: string;
  trackGauge?: string;
  numberOfTracks?: string;
  maxGrade?: string;
  curveRadius?: string;
  runwayLength?: string;
  runwayWidth?: string;
  terminalArea?: string;
  apronArea?: string;
  berthLength?: string;
  waterDepth?: string;
  storageArea?: string;
  craneCapacity?: string;
  plantArea?: string;
  buildingHeight?: string;
  hazardousZones?: string;
  siteArea?: string;
  excavationDepth?: string;
  slopeGradient?: string;
  drainageCapacity?: string;
}

// Helper function to convert loaded FormData to ExtendedFormData
const convertToExtendedFormData = (saved: FormData | null): ExtendedFormData => {
  if (!saved) return {};
  
  const extendedData: ExtendedFormData = {
    ...saved,
    projectScale: (saved.projectScale === "small" || saved.projectScale === "medium" || saved.projectScale === "large") 
      ? saved.projectScale as "small" | "medium" | "large" 
      : "medium",
    clientType: (saved.clientType === "private" || saved.clientType === "corporate" || saved.clientType === "government" || saved.clientType === "nGO")
      ? saved.clientType as "private" | "corporate" | "government" | "nGO"
      : "private",
    lodTarget: (saved.lodTarget === "LOD100" || saved.lodTarget === "LOD200" || saved.lodTarget === "LOD300" || saved.lodTarget === "LOD400" || saved.lodTarget === "LOD500")
      ? saved.lodTarget as "LOD100" | "LOD200" | "LOD300" | "LOD400" | "LOD500"
      : "LOD300",
    deliveryFormat: (saved.deliveryFormat === "ifc" || saved.deliveryFormat === "rvt" || saved.deliveryFormat === "dwg" || saved.deliveryFormat === "nwd" || saved.deliveryFormat === "pdf" || saved.deliveryFormat === "excel")
      ? saved.deliveryFormat as "ifc" | "rvt" | "dwg" | "nwd" | "pdf" | "excel"
      : "ifc",
  };
  
  return extendedData;
};

const GenerateModelPage: React.FC = () => {
  const navigate = useNavigate();

  // State for authentication checks
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [storedUserEmail, setStoredUserEmail] = useState<string | null>(null);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);

  // Initial form state
  const initialFormState: ExtendedFormData = {
    // Core project fields
    projectType: "",
    projectCategory: "",
    projectName: "",
    description: "",
    buildingType: "",
    infrastructureType: "",
    industrialType: "",
    civilWorksType: "",
    
    // Specifications
    floors: "",
    area: "",
    location: "",
    budget: "",
    timeline: "",
    specialRequirements: "",
    contactEmail: "",
    mainSpanLength: "",
    roadLength: "",
    numberOfLanes: "",
    
    // New fields with defaults
    projectScale: "medium",
    clientType: "private",
    projectStatus: "concept",
    approvalStatus: "pending",
    riskClassification: "medium",
    healthSafetyClassification: "standard",
    country: "",
    stateRegion: "",
    city: "",
    projectAddress: "",
    topography: "flat",
    floodRiskZone: "low",
    seismicZone: "none",
    lodTarget: "LOD300",
    contractType: "lumpSum",
    currency: "USD",
    paymentStructure: "monthly",
    procurementMethod: "traditional",
    hasBEP: false,
    federatedModelStatus: "notCreated",
    clashDetectionStatus: "notStarted",
    modelVersioning: true,
    cdePlatform: "BIM 360",
    accessLevel: "viewer",
    dataOwnership: "client",
    dataSecurityLevel: "medium",
    backupPolicy: "weekly",
    bimMaturity: "medium",
    staffTrainingLevel: "basic",
    simplifiedWorkflows: true,
    costEfficientSoftware: true,
    reducedModelComplexity: true,
    scalability: true,
    numberOfModels: 1,
    deliveryFormat: "ifc",
    includeQuantityTakeoff: true,
    includeClashDetection: false,
    includeBEP: false,
    includeDrawings: true,
    includeReports: true,
    
    // Infrastructure specific
    bridgeType: "beam",
    roadClassification: "arterial",
    infrastructureCapacity: "",
    operationalRequirements: "",
    
    // Industrial specific
    productionCapacity: "",
    processType: "continuous",
    safetyLevel: "standard",
    environmentalControls: "standard",
    
    // Civil Works specific
    earthworkVolume: "",
    soilType: "clay",
    drainageRequirements: "standard",
    
    // Government Requirements
    governmentApprovals: [],
    environmentalClearance: "notRequired",
    buildingPermitNumber: "",
    occupancyCertificate: "pending",
    fireSafetyCertificate: "pending",
    accessibilityCompliance: "yes",
    zoningApproval: "pending",
    heritageClearance: "notRequired",
    environmentalImpactAssessment: "notRequired",
    trafficImpactAssessment: "notRequired",
    utilityClearances: ["water", "electricity"],
    
    // Regulatory Compliance
    localBuildingCode: "",
    nationalStandards: ["National Building Code"],
    internationalStandards: [],
    isoStandards: ["ISO 19650"],
    industrySpecificCodes: [],
    qualityAssurancePlan: "standard",
    inspectionRequirements: ["structural", "mep"],
    
    // Arrays
    complianceStandards: ["Local Building Codes", "ISO 19650"],
    bimAuthoringTools: ["generic"],
    modelFileFormats: ["IFC"],
    disciplineModels: ["Architectural"],
    softwareSelection: ["generic"],
    modelTypes: ["Architectural"],
    
    // Additional optional fields
    projectNumber: "",
    projectCode: "",
    clientName: "",
    projectSponsor: "",
    architect: "",
    structuralEngineer: "",
    mepEngineer: "",
    bimConsultant: "",
    contractor: "",
    subcontractors: "",
    bimManager: "",
    bimCoordinator: "",
    approvalReference: "",
    plotNumber: "",
    latitude: "",
    longitude: "",
    elevation: "",
    coordinateReferenceSystem: "",
    climateZone: "",
    estimatedCost: "",
    approvedBudget: "",
    currentCost: "",
    costVariance: "",
    bepVersion: "",
    contributors: 0,
    openIssues: "",
    closedIssues: "",
    rfiStatus: "",
    changeRequests: "",
    manufacturer: "",
    modelNumber: "",
    installationDate: "",
    warrantyPeriod: "",
    expectedLifespan: "",
    maintenanceRequirements: "",
    energyTargets: "",
    materialSustainability: "",
    carbonFootprint: "",
    spaceUtilization: "",
    operationalEfficiency: "",
    handoverRequirements: "",
    intellectualProperty: "",
    designLife: "",
    constructionMethod: "",

    // Dynamic fields
    height: "",
    occupancy: "",
    structuralSystem: "",
    width: "",
    clearance: "",
    roadWidth: "",
    designSpeed: "",
    railwayLength: "",
    trackGauge: "",
    numberOfTracks: "",
    maxGrade: "",
    curveRadius: "",
    runwayLength: "",
    runwayWidth: "",
    terminalArea: "",
    apronArea: "",
    berthLength: "",
    waterDepth: "",
    storageArea: "",
    craneCapacity: "",
    plantArea: "",
    buildingHeight: "",
    hazardousZones: "",
    siteArea: "",
    excavationDepth: "",
    slopeGradient: "",
    drainageCapacity: ""
  };

  // Form state - loaded from storage if available
  const [formData, setFormData] = useState<ExtendedFormData>(() => {
    const saved = loadFormData();
    const converted = convertToExtendedFormData(saved);
    return { ...initialFormState, ...converted };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState("basics");

  // Enhanced project categories with all subcategories
  const projectCategories = [
    { 
      value: "building", 
      label: "🏗️ Building Construction", 
      description: "Residential, commercial, industrial, and institutional buildings",
      icon: "🏗️"
    },
    { 
      value: "infrastructure", 
      label: "🌉 Infrastructure", 
      description: "Bridges, roads, utilities, and public works",
      icon: "🌉"
    },
    { 
      value: "industrial", 
      label: "🏭 Industrial Plant", 
      description: "Factories, power plants, refineries, manufacturing facilities",
      icon: "🏭"
    },
    { 
      value: "civil", 
      label: "🛤️ Civil Works", 
      description: "Earthworks, site development, grading, excavation, drainage",
      icon: "🛤️"
    }
  ];

  // Building types
  const buildingTypes = [
    { value: "residential", label: "🏠 Residential", subTypes: ["Single Family", "Multi Family", "Apartment", "Condominium", "Townhouse"] },
    { value: "commercial", label: "🏢 Commercial", subTypes: ["Office Building", "Retail", "Shopping Mall", "Hotel", "Restaurant"] },
    { value: "industrial", label: "🏭 Industrial Building", subTypes: ["Warehouse", "Factory", "Manufacturing Plant", "Distribution Center"] },
    { value: "healthcare", label: "🏥 Healthcare", subTypes: ["Hospital", "Clinic", "Medical Center", "Laboratory"] },
    { value: "educational", label: "🎓 Educational", subTypes: ["School", "University", "Library", "Research Center"] },
    { value: "cultural", label: "🏛️ Cultural", subTypes: ["Museum", "Theater", "Concert Hall", "Gallery"] },
    { value: "sports", label: "⚽ Sports", subTypes: ["Stadium", "Arena", "Gymnasium", "Swimming Pool"] },
    { value: "government", label: "🏛️ Government", subTypes: ["Administrative Building", "Courthouse", "Police Station", "Post Office"] },
    { value: "religious", label: "⛪ Religious", subTypes: ["Church", "Mosque", "Temple", "Synagogue"] },
  ];

  // Infrastructure types
  const infrastructureTypes = [
    { value: "bridge", label: "🌉 Bridge", subTypes: ["Beam", "Arch", "Suspension", "Cable-stayed", "Truss", "Movable", "Pedestrian"] },
    { value: "road", label: "🛣️ Road & Highway", subTypes: ["Highway", "Arterial Road", "Collector Road", "Local Street", "Expressway", "Rural Road"] },
    { value: "tunnel", label: "🚇 Tunnel", subTypes: ["Road Tunnel", "Rail Tunnel", "Pedestrian Tunnel", "Utility Tunnel"] },
    { value: "railway", label: "🚆 Railway", subTypes: ["Railway Line", "Railway Station", "Railway Bridge", "Railway Tunnel"] },
    { value: "airport", label: "✈️ Airport", subTypes: ["Runway", "Terminal", "Control Tower", "Hangar", "Apron", "Taxiway"] },
    { value: "port", label: "⚓ Port & Harbor", subTypes: ["Container Terminal", "Bulk Terminal", "Passenger Terminal", "Breakwater", "Pier"] },
    { value: "dam", label: "💧 Dam & Reservoir", subTypes: ["Gravity Dam", "Arch Dam", "Embankment Dam", "Spillway", "Reservoir"] },
    { value: "power", label: "⚡ Power Infrastructure", subTypes: ["Power Plant", "Substation", "Transmission Line", "Wind Farm", "Solar Farm"] },
    { value: "water", label: "🚰 Water & Sewage", subTypes: ["Water Treatment Plant", "Sewage Plant", "Pumping Station", "Pipeline", "Reservoir"] },
    { value: "telecom", label: "📡 Telecom", subTypes: ["Cell Tower", "Data Center", "Fiber Network", "Satellite Station"] },
    { value: "pipeline", label: "🛢️ Pipeline", subTypes: ["Oil Pipeline", "Gas Pipeline", "Water Pipeline", "Chemical Pipeline"] },
    { value: "railwayStation", label: "🚉 Railway Station", subTypes: ["Passenger Station", "Freight Station", "Intermodal Terminal"] },
    { value: "busTerminal", label: "🚌 Bus Terminal", subTypes: ["Bus Station", "Interchange", "Depot"] },
    { value: "parking", label: "🅿️ Parking Structure", subTypes: ["Multi-level", "Underground", "Surface"] },
    { value: "retainingWall", label: "🧱 Retaining Wall", subTypes: ["Gravity", "Cantilever", "Anchored", "Sheet Pile"] },
  ];

  // Industrial types
  const industrialTypes = [
    { value: "factory", label: "🏭 Factory", subTypes: ["Assembly", "Processing", "Packaging"] },
    { value: "powerPlant", label: "⚡ Power Plant", subTypes: ["Coal", "Gas", "Nuclear", "Hydro", "Solar", "Wind"] },
    { value: "refinery", label: "🛢️ Refinery", subTypes: ["Oil", "Gas", "Petrochemical"] },
    { value: "chemical", label: "🧪 Chemical Plant", subTypes: ["Fertilizer", "Pharmaceutical", "Plastic"] },
    { value: "pharmaceutical", label: "💊 Pharmaceutical", subTypes: ["Drug Manufacturing", "Laboratory", "Packaging"] },
    { value: "foodProcessing", label: "🍎 Food Processing", subTypes: ["Beverage", "Dairy", "Meat", "Bakery"] },
    { value: "manufacturing", label: "🔧 Manufacturing", subTypes: ["Automotive", "Electronics", "Machinery", "Textile"] },
    { value: "warehouse", label: "📦 Warehouse", subTypes: ["Storage", "Distribution", "Cold Storage"] },
    { value: "distribution", label: "🚚 Distribution Center", subTypes: ["Logistics", "Fulfillment", "Cross-dock"] },
    { value: "mining", label: "⛏️ Mining", subTypes: ["Open Pit", "Underground", "Processing Plant"] },
    { value: "steelPlant", label: "🔥 Steel Plant", subTypes: ["Integrated", "Mini Mill", "Rolling Mill"] },
  ];

  // Civil Works types
  const civilWorksTypes = [
    { value: "earthworks", label: "⛰️ Earthworks", subTypes: ["Cut", "Fill", "Compaction", "Excavation"] },
    { value: "grading", label: "📐 Grading", subTypes: ["Site Grading", "Land Grading", "Finish Grading"] },
    { value: "excavation", label: "🕳️ Excavation", subTypes: ["Foundation", "Trench", "Bulk", "Rock"] },
    { value: "foundation", label: "🏗️ Foundation", subTypes: ["Shallow", "Deep", "Pile", "Raft"] },
    { value: "paving", label: "🛣️ Paving", subTypes: ["Asphalt", "Concrete", "Interlocking"] },
    { value: "landscaping", label: "🌳 Landscaping", subTypes: ["Hardscape", "Softscape", "Irrigation"] },
    { value: "drainage", label: "💧 Drainage", subTypes: ["Stormwater", "Surface", "Subsurface"] },
    { value: "erosionControl", label: "🛡️ Erosion Control", subTypes: ["Silt Fence", "Gabion", "Riprap", "Terracing"] },
    { value: "siteDevelopment", label: "🏞️ Site Development", subTypes: ["Clearing", "Grubbing", "Utility Installation"] },
    { value: "utilities", label: "🔌 Utilities", subTypes: ["Water", "Sewer", "Gas", "Electric", "Telecom"] },
    { value: "demolition", label: "💥 Demolition", subTypes: ["Building", "Bridge", "Selective", "Implosion"] },
  ];

  // Government approvals
  const governmentApprovalOptions = [
    { value: "planning_permission", label: "Planning Permission" },
    { value: "building_permit", label: "Building Permit" },
    { value: "environmental_clearance", label: "Environmental Clearance" },
    { value: "fire_safety", label: "Fire Safety Certificate" },
    { value: "occupancy_certificate", label: "Occupancy Certificate" },
    { value: "zoning_approval", label: "Zoning Approval" },
    { value: "heritage_clearance", label: "Heritage Clearance" },
    { value: "traffic_impact", label: "Traffic Impact Assessment" },
    { value: "utility_clearance", label: "Utility Clearances" },
    { value: "accessibility_compliance", label: "Accessibility Compliance" },
    { value: "health_safety", label: "Health & Safety Approval" },
    { value: "coastal_zone", label: "Coastal Zone Management" },
    { value: "forest_clearance", label: "Forest Clearance" },
    { value: "wildlife_clearance", label: "Wildlife Clearance" },
    { value: "airport_clearance", label: "Airport Authority Clearance" },
    { value: "railway_clearance", label: "Railway Safety Clearance" },
  ];

  // Utility clearances
  const utilityClearanceOptions = [
    { value: "water", label: "Water Department" },
    { value: "sewer", label: "Sewer Department" },
    { value: "electricity", label: "Electricity Board" },
    { value: "gas", label: "Gas Authority" },
    { value: "telecom", label: "Telecom Department" },
    { value: "stormwater", label: "Stormwater Drainage" },
    { value: "street_lighting", label: "Street Lighting" },
    { value: "traffic_signal", label: "Traffic Signals" },
    { value: "fire_hydrant", label: "Fire Hydrant Connection" },
  ];

  // LOD Levels
  const lodLevels = [
    { value: "LOD100", label: "LOD 100 - Concept", description: "Conceptual massing, approximate area/volume" },
    { value: "LOD200", label: "LOD 200 - Schematic", description: "Generalized systems with approximate quantities" },
    { value: "LOD300", label: "LOD 300 - Detailed Design", description: "Precise geometry with detailed components" },
    { value: "LOD400", label: "LOD 400 - Fabrication", description: "Detailed enough for fabrication and assembly" },
    { value: "LOD500", label: "LOD 500 - As-Built", description: "Field verified with operational data" },
  ];

  // Model delivery formats
  const deliveryFormats = [
    { value: "ifc", label: "IFC 4.3", description: "Industry Foundation Classes - Open BIM standard" },
    { value: "rvt", label: "RVT Format", description: "Native format for Revit" },
    { value: "dwg", label: "DWG Format", description: "CAD format for 2D drawings" },
    { value: "nwd", label: "NWD Format", description: "Coordination and review format" },
    { value: "pdf", label: "PDF Documents", description: "2D drawings and documentation" },
    { value: "excel", label: "Excel Reports", description: "Quantity takeoff and schedules" },
  ];

  // Type definition for technical specifications
  interface TechnicalSpec {
    id: keyof ExtendedFormData;
    label: string;
    type: string;
    placeholder: string;
    required?: boolean;
  }

  // Category-specific technical specifications
  const getTechnicalSpecifications = (): TechnicalSpec[] => {
    const category = formData.projectCategory;
    const typeKey = `${category}Type` as keyof ExtendedFormData;
    const type = formData[typeKey] as string;
    
    if (category === "building") {
      return [
        { id: "floors", label: "Number of Floors", type: "number", placeholder: "e.g., 10", required: true },
        { id: "area", label: "Total Area (m²)", type: "number", placeholder: "e.g., 5000", required: true },
        { id: "height", label: "Building Height (m)", type: "number", placeholder: "e.g., 45" },
        { id: "occupancy", label: "Occupancy Type", type: "text", placeholder: "e.g., Office, Residential" },
        { id: "structuralSystem", label: "Structural System", type: "text", placeholder: "e.g., Steel Frame, Concrete" },
      ];
    } else if (category === "infrastructure") {
      const specs: TechnicalSpec[] = [];
      
      if (type === "bridge") {
        specs.push(
          { id: "mainSpanLength", label: "Main Span Length (m)", type: "number", placeholder: "e.g., 150", required: true },
          { id: "bridgeType", label: "Bridge Type", type: "select", placeholder: "Select bridge type" },
          { id: "width", label: "Deck Width (m)", type: "number", placeholder: "e.g., 25" },
          { id: "clearance", label: "Vertical Clearance (m)", type: "number", placeholder: "e.g., 5.5" }
        );
      } else if (type === "road") {
        specs.push(
          { id: "roadLength", label: "Road Length (km)", type: "number", placeholder: "e.g., 5.5", required: true },
          { id: "numberOfLanes", label: "Number of Lanes", type: "number", placeholder: "e.g., 4", required: true },
          { id: "roadWidth", label: "Road Width (m)", type: "number", placeholder: "e.g., 24" },
          { id: "designSpeed", label: "Design Speed (km/h)", type: "number", placeholder: "e.g., 80" }
        );
      } else if (type === "railway") {
        specs.push(
          { id: "railwayLength", label: "Railway Length (km)", type: "number", placeholder: "e.g., 25", required: true },
          { id: "trackGauge", label: "Track Gauge (mm)", type: "text", placeholder: "e.g., 1435 (Standard)" },
          { id: "numberOfTracks", label: "Number of Tracks", type: "number", placeholder: "e.g., 2" },
          { id: "maxGrade", label: "Maximum Grade (%)", type: "number", placeholder: "e.g., 2.5" },
          { id: "curveRadius", label: "Minimum Curve Radius (m)", type: "number", placeholder: "e.g., 300" }
        );
      } else if (type === "airport") {
        specs.push(
          { id: "runwayLength", label: "Runway Length (m)", type: "number", placeholder: "e.g., 3000", required: true },
          { id: "runwayWidth", label: "Runway Width (m)", type: "number", placeholder: "e.g., 45" },
          { id: "terminalArea", label: "Terminal Area (m²)", type: "number", placeholder: "e.g., 50000" },
          { id: "apronArea", label: "Apron Area (m²)", type: "number", placeholder: "e.g., 20000" }
        );
      } else if (type === "port") {
        specs.push(
          { id: "berthLength", label: "Berth Length (m)", type: "number", placeholder: "e.g., 250", required: true },
          { id: "waterDepth", label: "Water Depth (m)", type: "number", placeholder: "e.g., 14" },
          { id: "storageArea", label: "Storage Area (m²)", type: "number", placeholder: "e.g., 100000" },
          { id: "craneCapacity", label: "Crane Capacity (tons)", type: "number", placeholder: "e.g., 50" }
        );
      }
      
      // Common infrastructure specs
      specs.push(
        { id: "designLife", label: "Design Life (years)", type: "number", placeholder: "e.g., 50" },
        { id: "constructionMethod", label: "Construction Method", type: "text", placeholder: "e.g., Precast, Cast-in-situ" },
        { id: "operationalRequirements", label: "Operational Requirements", type: "text", placeholder: "e.g., 24/7 operation" }
      );
      
      return specs;
    } else if (category === "industrial") {
      return [
        { id: "productionCapacity", label: "Production Capacity", type: "text", placeholder: "e.g., 1000 units/day, 500 tons/hour" },
        { id: "processType", label: "Process Type", type: "select", placeholder: "Select process type" },
        { id: "plantArea", label: "Plant Area (m²)", type: "number", placeholder: "e.g., 20000" },
        { id: "buildingHeight", label: "Building Height (m)", type: "number", placeholder: "e.g., 15" },
        { id: "safetyLevel", label: "Safety Level", type: "select", placeholder: "Select safety level" },
        { id: "hazardousZones", label: "Hazardous Zones", type: "text", placeholder: "e.g., ATEX Zone 1, Zone 2" }
      ];
    } else if (category === "civil") {
      return [
        { id: "earthworkVolume", label: "Earthwork Volume (m³)", type: "number", placeholder: "e.g., 10000" },
        { id: "siteArea", label: "Site Area (m²)", type: "number", placeholder: "e.g., 50000" },
        { id: "soilType", label: "Soil Type", type: "select", placeholder: "Select soil type" },
        { id: "excavationDepth", label: "Max Excavation Depth (m)", type: "number", placeholder: "e.g., 6" },
        { id: "slopeGradient", label: "Slope Gradient (H:V)", type: "text", placeholder: "e.g., 2:1" },
        { id: "drainageCapacity", label: "Drainage Capacity (m³/s)", type: "number", placeholder: "e.g., 10" }
      ];
    }
    
    return [];
  };

  // Check authentication and load saved form data
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      let userEmail = null;
      let hasAccount = false;
      
      if (authStatus) {
        try {
          const userResponse = await authService.getCurrentUser();
          if (userResponse.success && userResponse.data) {
            userEmail = userResponse.data.email;
            hasAccount = true;
          }
        } catch (error) {
          console.warn('Failed to get user data:', error);
        }
      } else {
        try {
          const userData = localStorage.getItem('user_data');
          if (userData) {
            const user = JSON.parse(userData);
            userEmail = user.email || null;
            hasAccount = true;
          }
        } catch (error) {
          console.warn('Failed to parse user data:', error);
        }
      }
      
      setStoredUserEmail(userEmail);
      setHasExistingAccount(hasAccount);
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // Save form data on change
  useEffect(() => {
    if (!isCheckingAuth) {
      const formDataToSave: FormData = {
        projectType: formData.projectType || "",
        projectName: formData.projectName || "",
        description: formData.description || "",
        floors: formData.floors || "",
        area: formData.area || "",
        location: formData.location || "",
        budget: formData.budget || "",
        timeline: formData.timeline || "",
        specialRequirements: formData.specialRequirements || "",
        contactEmail: formData.contactEmail || "",
        mainSpanLength: formData.mainSpanLength || "",
        roadLength: formData.roadLength || "",
        numberOfLanes: formData.numberOfLanes || "",
        projectCategory: formData.projectCategory || "",
        buildingType: formData.buildingType || "",
        infrastructureType: formData.infrastructureType || "",
        industrialType: formData.industrialType || "",
        civilWorksType: formData.civilWorksType || "",
        projectScale: formData.projectScale || "medium",
        clientType: formData.clientType || "private",
        lodTarget: formData.lodTarget || "LOD300",
        deliveryFormat: formData.deliveryFormat || "ifc",
        numberOfModels: formData.numberOfModels || 1
      };
      saveFormData(formDataToSave);
    }
  }, [formData, isCheckingAuth]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectCategory) {
      newErrors.projectCategory = "Please select a project category";
    }

    if (formData.projectCategory === "building" && !formData.buildingType) {
      newErrors.buildingType = "Please select a building type";
    }

    if (formData.projectCategory === "infrastructure" && !formData.infrastructureType) {
      newErrors.infrastructureType = "Please select an infrastructure type";
    }

    if (formData.projectCategory === "industrial" && !formData.industrialType) {
      newErrors.industrialType = "Please select an industrial type";
    }

    if (formData.projectCategory === "civil" && !formData.civilWorksType) {
      newErrors.civilWorksType = "Please select a civil works type";
    }

    if (!formData.projectName || !formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = "Please describe your project";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description too long (max 2000 characters)";
    }

    // Project scale validation
    if (!formData.projectScale) {
      newErrors.projectScale = "Please select project scale";
    }

    // Timeline validation
    if (!formData.timeline) {
      newErrors.timeline = "Please select project timeline";
    }

    // LOD target validation
    if (!formData.lodTarget) {
      newErrors.lodTarget = "Please select LOD target";
    }

    // If not authenticated, contact email is required
    if (!isAuthenticated && (!formData.contactEmail || !formData.contactEmail.trim())) {
      newErrors.contactEmail = "Email is required for new users";
    } else if (!isAuthenticated && formData.contactEmail && formData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        newErrors.contactEmail = "Please enter a valid email address";
      }
    }

    // Number of models validation
    if (!formData.numberOfModels || formData.numberOfModels < 1) {
      newErrors.numberOfModels = "Please specify number of models (min 1)";
    } else if (formData.numberOfModels > 20) {
      newErrors.numberOfModels = "Maximum 20 models per request";
    }

    // Category-specific validations
    if (formData.projectCategory === "building") {
      if (!formData.floors) newErrors.floors = "Number of floors is required for buildings";
      if (!formData.area) newErrors.area = "Area is required for buildings";
    }

    if (formData.projectCategory === "infrastructure" && formData.infrastructureType === "bridge") {
      if (!formData.mainSpanLength) newErrors.mainSpanLength = "Main span length is required for bridges";
    }

    if (formData.projectCategory === "infrastructure" && formData.infrastructureType === "road") {
      if (!formData.roadLength) newErrors.roadLength = "Road length is required for roads";
      if (!formData.numberOfLanes) newErrors.numberOfLanes = "Number of lanes is required for roads";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change - fixed type issues
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "number") {
      // Handle number inputs - convert to number or empty string
      const numValue = value === "" ? "" : Number(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      // For text inputs, select, etc.
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Special handler for number fields that need to be rendered as text
  const getInputValue = (fieldName: keyof ExtendedFormData): string => {
    const value = formData[fieldName];
    if (value === undefined || value === null) return "";
    if (typeof value === "number") return value.toString();
    return value;
  };

  // Special handler for select values
  const getSelectValue = (fieldName: keyof ExtendedFormData): string => {
    const value = formData[fieldName];
    if (value === undefined || value === null) return "";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return value.toString();
    return value as string;
  };

  // Handle multi-select change
  const handleMultiSelectChange = (name: keyof ExtendedFormData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = Array.isArray(prev[name]) 
        ? (prev[name] as string[])
        : [];
      
      if (checked) {
        return {
          ...prev,
          [name]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [name]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  // Clear form data completely
  const clearForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setSubmitError(null);
    clearFormData(); // Clear from storage
    setCurrentSection("basics");
  };

  // Prepare project parameters for submission
  const prepareProjectParams = () => {
    const baseParams = getProjectParams({
      projectType: formData.projectType || "",
      projectName: formData.projectName || "",
      description: formData.description || "",
      floors: formData.floors || "",
      area: formData.area || "",
      location: formData.location || "",
      budget: formData.budget || "",
      timeline: formData.timeline || "",
      specialRequirements: formData.specialRequirements || "",
      contactEmail: formData.contactEmail || "",
      mainSpanLength: formData.mainSpanLength || "",
      roadLength: formData.roadLength || "",
      numberOfLanes: formData.numberOfLanes || "",
      projectCategory: formData.projectCategory || "",
      buildingType: formData.buildingType || "",
      infrastructureType: formData.infrastructureType || "",
      industrialType: formData.industrialType || "",
      civilWorksType: formData.civilWorksType || "",
      projectScale: formData.projectScale || "medium",
      clientType: formData.clientType || "private",
      lodTarget: formData.lodTarget || "LOD300",
      deliveryFormat: formData.deliveryFormat || "ifc",
      numberOfModels: formData.numberOfModels || 1
    });
    
    // Add comprehensive framework data
    const techSpecs = getTechnicalSpecifications();
    const categorySpecificSpecs: Record<string, any> = {};
    techSpecs.forEach(spec => {
      categorySpecificSpecs[spec.id] = formData[spec.id] || "";
    });
    
    return {
      ...baseParams,
      comprehensive_framework: {
        project_scale: formData.projectScale,
        client_type: formData.clientType,
        number_of_models: formData.numberOfModels,
        lod_target: formData.lodTarget,
        delivery_format: formData.deliveryFormat,
        government_requirements: formData.governmentApprovals || [],
        regulatory_compliance: formData.complianceStandards || [],
        risk_classification: formData.riskClassification,
        project_category: formData.projectCategory,
        building_type: formData.buildingType,
        infrastructure_type: formData.infrastructureType,
        industrial_type: formData.industrialType,
        civil_works_type: formData.civilWorksType,
        category_specific_specs: categorySpecificSpecs
      }
    };
  };

  // Submit as authenticated user
  const submitAsAuthenticatedUser = async () => {
    try {
      const userResponse = await authService.getCurrentUser();
      
      if (!userResponse.success || !userResponse.data) {
        throw new Error("Failed to get user data");
      }

      const user = userResponse.data;
      const projectParams = prepareProjectParams();

      // Prepare request data
      const requestData = {
        request_type: "generate_model",
        firstname: user.first_name || "Model",
        lastname: user.last_name || "Generator",
        email: user.email,
        company_name: user.company || "BIMFlow User",
        company_address: "Not specified",
        country: formData.country || "Global",
        sector: "Construction",
        job_title: "BIM User",
        company_position: "User",
        phone_number: "+1234567890",
        additional_details: `Model generation request from ${user.first_name} ${user.last_name}\n\nProject Details:\n${formatProjectDetails(formData)}`,
        consent_marketing: true,
        consent_privacy: true,
        project_params: projectParams
      };

      // Submit via authenticated API
      const response = await apiClient.post(
        "/user/request-submission/",
        requestData
      );

      if (response.success) {
        setIsSubmitted(true);
        clearFormData();
      } else {
        throw new Error(response.message || "Submission failed");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      const errorMsg =
        err?.message ||
        err?.data?.detail ||
        err?.data?.non_field_errors?.join(", ") ||
        "Failed to submit request. Please check your connection and try again.";
      setSubmitError(errorMsg);
      throw err;
    }
  };

  // Format project details for submission
  const formatProjectDetails = (data: ExtendedFormData): string => {
    let details = "";
    
    details += `PROJECT CATEGORY: ${projectCategories.find(cat => cat.value === data.projectCategory)?.label || data.projectCategory || "Not specified"}\n`;
    
    // Add type-specific details
    if (data.buildingType) {
      details += `BUILDING TYPE: ${buildingTypes.find(type => type.value === data.buildingType)?.label || data.buildingType}\n`;
    }
    if (data.infrastructureType) {
      details += `INFRASTRUCTURE TYPE: ${infrastructureTypes.find(type => type.value === data.infrastructureType)?.label || data.infrastructureType}\n`;
      // Add infrastructure subtype
      if (data.infrastructureType === "bridge" && data.bridgeType) {
        const bridgeTypeLabels: Record<string, string> = {
          beam: "Beam Bridge",
          arch: "Arch Bridge",
          suspension: "Suspension Bridge",
          cableStayed: "Cable-stayed Bridge",
          truss: "Truss Bridge",
          movable: "Movable Bridge",
          pedestrian: "Pedestrian Bridge"
        };
        details += `BRIDGE TYPE: ${bridgeTypeLabels[data.bridgeType] || data.bridgeType}\n`;
      }
    }
    if (data.industrialType) {
      details += `INDUSTRIAL TYPE: ${industrialTypes.find(type => type.value === data.industrialType)?.label || data.industrialType}\n`;
    }
    if (data.civilWorksType) {
      details += `CIVIL WORKS TYPE: ${civilWorksTypes.find(type => type.value === data.civilWorksType)?.label || data.civilWorksType}\n`;
    }
    
    details += `PROJECT NAME: ${data.projectName || "Not specified"}\n`;
    details += `PROJECT SCALE: ${data.projectScale || "Not specified"}\n`;
    details += `CLIENT TYPE: ${data.clientType || "Not specified"}\n`;
    details += `LOCATION: ${data.location || "Not specified"}\n`;
    
    // Category-specific specifications
    const techSpecs = getTechnicalSpecifications();
    techSpecs.forEach(spec => {
      const value = data[spec.id];
      if (value) {
        details += `${spec.label.toUpperCase()}: ${value}\n`;
      }
    });
    
    details += `BUDGET: ${data.currency || "$"}${data.budget || "Not specified"}\n`;
    details += `TIMELINE: ${data.timeline || "Not specified"}\n`;
    details += `LOD TARGET: ${lodLevels.find(lod => lod.value === data.lodTarget)?.label || data.lodTarget || "Not specified"}\n`;
    details += `NUMBER OF MODELS: ${data.numberOfModels || 1}\n`;
    details += `DELIVERY FORMAT: ${deliveryFormats.find(format => format.value === data.deliveryFormat)?.label || data.deliveryFormat || "Not specified"}\n`;
    details += `RISK CLASSIFICATION: ${data.riskClassification || "Not specified"}\n`;
    details += `APPROVAL STATUS: ${data.approvalStatus || "Not specified"}\n`;
    
    if (data.governmentApprovals && data.governmentApprovals.length > 0) {
      details += `GOVERNMENT APPROVALS REQUIRED: ${data.governmentApprovals.length}\n`;
    }
    
    if (data.specialRequirements) {
      details += `\nSPECIAL REQUIREMENTS:\n${data.specialRequirements}\n`;
    }
    
    return details;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare project parameters
      const projectParams = prepareProjectParams();

      if (isAuthenticated) {
        await submitAsAuthenticatedUser();
      } else {
        // Store form data and project params for demo booking page
        bookDemoService.storeModelFormData(formData);
        bookDemoService.storeProjectParams(projectParams);
        
        // Show modal for unauthenticated users
        setShowNewUserModal(true);
      }
    } catch (err) {
      // Error already handled in individual functions
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal actions
  const handleModalAction = (action: 'login' | 'demo') => {
    setShowNewUserModal(false);
    
    if (action === 'login') {
      navigate("/login", {
        state: {
          fromGenerateModel: true,
          redirectTo: "/generate-model",
          formData: formData
        }
      });
    } else {
      navigate("/book-demo", {
        state: {
          fromGenerateModel: true,
          projectData: formData
        }
      });
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowNewUserModal(false);
  };

  // Handle new project
  const handleNewProject = () => {
    clearForm();
    setIsSubmitted(false);
  };

  // Navigation between sections
  const navigateToSection = (section: string) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="generate-model-page">
        <div className="generate-model-container">
          <div className="loading-state">
            <div className="loading-spinner-large"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="generate-model-page">
        <div className="generate-model-container">
          <div className="success-state">
            <div className="success-icon">🎉</div>
            <h1>Model Generation Request Submitted!</h1>
            <p>
              Your BIM model generation request has been received and is being processed.<br />
              You'll receive a notification when your model is ready.
            </p>

            <div className="submission-details">
              <h3>Your Project Summary</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Project Name:</span>
                  <span className="detail-value">{formData.projectName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Project Category:</span>
                  <span className="detail-value">
                    {projectCategories.find(cat => cat.value === formData.projectCategory)?.label || formData.projectCategory}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Number of Models:</span>
                  <span className="detail-value">{formData.numberOfModels}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">LOD Target:</span>
                  <span className="detail-value">
                    {lodLevels.find(lod => lod.value === formData.lodTarget)?.label || formData.lodTarget}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Delivery Format:</span>
                  <span className="detail-value">
                    {deliveryFormats.find(format => format.value === formData.deliveryFormat)?.label || formData.deliveryFormat}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-pending">Processing</span>
                </div>
              </div>
            </div>

            <div className="next-steps">
              <h3>What Happens Next?</h3>
              <div className="steps-timeline">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <strong>Analysis & Processing</strong>
                    <p>Our system analyzes your specifications and framework requirements</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <strong>Model Generation</strong>
                    <p>{formData.numberOfModels} models generated based on your specifications</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <strong>Quality Validation</strong>
                    <p>Models undergo comprehensive quality checks and validation</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <strong>Ready for Download</strong>
                    <p>You receive notification with download links for all models</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button className="btn btn--primary" onClick={handleNewProject}>
                Generate Another Model
              </button>
              <button className="btn btn--secondary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NewUserModal 
        isOpen={showNewUserModal}
        onClose={handleModalClose}
        userEmail={storedUserEmail}
        hasExistingAccount={hasExistingAccount}
        onLogin={() => handleModalAction('login')}
        onBookDemo={() => handleModalAction('demo')}
      />

      <div className="generate-model-page">
        {/* Hero Section */}
        <section
          className="generate-model-hero"
          style={{
            backgroundImage: `linear-gradient(rgba(78, 68, 60, 0.6), rgba(42, 36, 32, 0.6)), url(${generateModelHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="generate-model-hero__overlay"></div>
          <div className="generate-model-hero__content">
            <h1 className="generate-model-hero__title">Generate Your BIM Model</h1>
            <p className="generate-model-hero__subtitle">
              Describe your project and let BIMFlow Suite create compliant 3D BIM models based on comprehensive framework
            </p>
            {isAuthenticated && (
              <div className="user-badge">
                <span className="badge-icon">👤</span>
                <span>Logged in as {storedUserEmail || "User"}</span>
              </div>
            )}
          </div>
        </section>

        {/* Section Navigation */}
        <div className="section-navigation">
          <div className="section-nav-container">
            <button 
              className={`section-nav-btn ${currentSection === "basics" ? "active" : ""}`}
              onClick={() => navigateToSection("basics")}
            >
              <span className="nav-number">1</span>
              <span className="nav-text">Project Basics</span>
            </button>
            <button 
              className={`section-nav-btn ${currentSection === "specs" ? "active" : ""}`}
              onClick={() => navigateToSection("specs")}
            >
              <span className="nav-number">2</span>
              <span className="nav-text">Specifications</span>
            </button>
            <button 
              className={`section-nav-btn ${currentSection === "govt" ? "active" : ""}`}
              onClick={() => navigateToSection("govt")}
            >
              <span className="nav-number">3</span>
              <span className="nav-text">Govt & Compliance</span>
            </button>
            <button 
              className={`section-nav-btn ${currentSection === "delivery" ? "active" : ""}`}
              onClick={() => navigateToSection("delivery")}
            >
              <span className="nav-number">4</span>
              <span className="nav-text">Delivery</span>
            </button>
          </div>
        </div>

        <div className="generate-model-container">
          <div className="form-container">
            {submitError && (
              <div className="form-error-banner">
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="project-form">
              {/* Project Basics Section */}
              {currentSection === "basics" && (
                <>
                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📋</span>
                      Project Category & Type
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="projectCategory" className="form-label">
                          Project Category *
                        </label>
                        <select
                          id="projectCategory"
                          name="projectCategory"
                          value={getSelectValue("projectCategory")}
                          onChange={handleInputChange}
                          className={`form-select ${errors.projectCategory ? "error" : ""}`}
                          required
                        >
                          <option value="">Select project category</option>
                          {projectCategories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        {errors.projectCategory && <span className="error-text">{errors.projectCategory}</span>}
                        {formData.projectCategory && (
                          <div className="option-description">
                            {projectCategories.find(cat => cat.value === formData.projectCategory)?.description}
                          </div>
                        )}
                      </div>

                      {/* Building Type Selection */}
                      {formData.projectCategory === "building" && (
                        <div className="form-group">
                          <label htmlFor="buildingType" className="form-label">
                            Building Type *
                          </label>
                          <select
                            id="buildingType"
                            name="buildingType"
                            value={getSelectValue("buildingType")}
                            onChange={handleInputChange}
                            className={`form-select ${errors.buildingType ? "error" : ""}`}
                            required
                          >
                            <option value="">Select building type</option>
                            {buildingTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {errors.buildingType && <span className="error-text">{errors.buildingType}</span>}
                          {formData.buildingType && (
                            <div className="building-subtypes">
                              <label className="subtype-label">Sub-types available:</label>
                              <div className="subtype-chips">
                                {buildingTypes
                                  .find(type => type.value === formData.buildingType)
                                  ?.subTypes?.map(subType => (
                                    <span key={subType} className="subtype-chip">{subType}</span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Infrastructure Type Selection */}
                      {formData.projectCategory === "infrastructure" && (
                        <div className="form-group">
                          <label htmlFor="infrastructureType" className="form-label">
                            Infrastructure Type *
                          </label>
                          <select
                            id="infrastructureType"
                            name="infrastructureType"
                            value={getSelectValue("infrastructureType")}
                            onChange={handleInputChange}
                            className={`form-select ${errors.infrastructureType ? "error" : ""}`}
                            required
                          >
                            <option value="">Select infrastructure type</option>
                            {infrastructureTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {errors.infrastructureType && <span className="error-text">{errors.infrastructureType}</span>}
                          {formData.infrastructureType && (
                            <div className="infrastructure-subtypes">
                              <label className="subtype-label">Sub-types available:</label>
                              <div className="subtype-chips">
                                {infrastructureTypes
                                  .find(type => type.value === formData.infrastructureType)
                                  ?.subTypes?.map(subType => (
                                    <span key={subType} className="subtype-chip">{subType}</span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Industrial Type Selection */}
                      {formData.projectCategory === "industrial" && (
                        <div className="form-group">
                          <label htmlFor="industrialType" className="form-label">
                            Industrial Type *
                          </label>
                          <select
                            id="industrialType"
                            name="industrialType"
                            value={getSelectValue("industrialType")}
                            onChange={handleInputChange}
                            className={`form-select ${errors.industrialType ? "error" : ""}`}
                            required
                          >
                            <option value="">Select industrial type</option>
                            {industrialTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {errors.industrialType && <span className="error-text">{errors.industrialType}</span>}
                          {formData.industrialType && (
                            <div className="industrial-subtypes">
                              <label className="subtype-label">Sub-types available:</label>
                              <div className="subtype-chips">
                                {industrialTypes
                                  .find(type => type.value === formData.industrialType)
                                  ?.subTypes?.map(subType => (
                                    <span key={subType} className="subtype-chip">{subType}</span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Civil Works Type Selection */}
                      {formData.projectCategory === "civil" && (
                        <div className="form-group">
                          <label htmlFor="civilWorksType" className="form-label">
                            Civil Works Type *
                          </label>
                          <select
                            id="civilWorksType"
                            name="civilWorksType"
                            value={getSelectValue("civilWorksType")}
                            onChange={handleInputChange}
                            className={`form-select ${errors.civilWorksType ? "error" : ""}`}
                            required
                          >
                            <option value="">Select civil works type</option>
                            {civilWorksTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {errors.civilWorksType && <span className="error-text">{errors.civilWorksType}</span>}
                          {formData.civilWorksType && (
                            <div className="civil-subtypes">
                              <label className="subtype-label">Sub-types available:</label>
                              <div className="subtype-chips">
                                {civilWorksTypes
                                  .find(type => type.value === formData.civilWorksType)
                                  ?.subTypes?.map(subType => (
                                    <span key={subType} className="subtype-chip">{subType}</span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">🏢</span>
                      Project Identification
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="projectName" className="form-label">
                          Project Name *
                        </label>
                        <input
                          type="text"
                          id="projectName"
                          name="projectName"
                          value={getInputValue("projectName")}
                          onChange={handleInputChange}
                          className={`form-input ${errors.projectName ? "error" : ""}`}
                          placeholder="e.g., Downtown Office Tower"
                          required
                        />
                        {errors.projectName && <span className="error-text">{errors.projectName}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="projectNumber" className="form-label">
                          Project Number
                        </label>
                        <input
                          type="text"
                          id="projectNumber"
                          name="projectNumber"
                          value={getInputValue("projectNumber")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., PRJ-2024-001"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="projectScale" className="form-label">
                          Project Scale *
                        </label>
                        <select
                          id="projectScale"
                          name="projectScale"
                          value={getSelectValue("projectScale")}
                          onChange={handleInputChange}
                          className={`form-select ${errors.projectScale ? "error" : ""}`}
                          required
                        >
                          <option value="small">Small Project (Under $1M)</option>
                          <option value="medium">Medium Project ($1M - $10M)</option>
                          <option value="large">Large Project ($10M+)</option>
                        </select>
                        {errors.projectScale && <span className="error-text">{errors.projectScale}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="clientType" className="form-label">
                          Client Type
                        </label>
                        <select
                          id="clientType"
                          name="clientType"
                          value={getSelectValue("clientType")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="private">Private</option>
                          <option value="corporate">Corporate</option>
                          <option value="government">Government</option>
                          <option value="nGO">NGO</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="clientName" className="form-label">
                          Client Name
                        </label>
                        <input
                          type="text"
                          id="clientName"
                          name="clientName"
                          value={getInputValue("clientName")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., ABC Corporation"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="projectSponsor" className="form-label">
                          Project Sponsor
                        </label>
                        <input
                          type="text"
                          id="projectSponsor"
                          name="projectSponsor"
                          value={getInputValue("projectSponsor")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., XYZ Development Ltd."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📝</span>
                      Project Description
                    </h3>
                    <div className="form-group">
                      <label htmlFor="description" className="form-label">
                        Describe Your Project in Detail *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={getInputValue("description")}
                        onChange={handleInputChange}
                        className={`form-textarea ${errors.description ? "error" : ""}`}
                        placeholder="Describe your project requirements, features, and specific needs. Include design intent, functional requirements, spatial organization, and any special considerations..."
                        rows={6}
                        required
                      />
                      <div className="character-count">
                        {formData.description?.length || 0}/2000 characters
                      </div>
                      {errors.description && <span className="error-text">{errors.description}</span>}
                    </div>
                  </div>

                  <div className="form-section-navigation">
                    <button 
                      type="button" 
                      className="btn btn--secondary"
                      onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
                    >
                      ← Back to {isAuthenticated ? 'Dashboard' : 'Home'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn--primary"
                      onClick={() => navigateToSection("specs")}
                    >
                      Next: Specifications →
                    </button>
                  </div>
                </>
              )}

              {/* Specifications Section */}
              {currentSection === "specs" && (
                <>
                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📐</span>
                      Technical Specifications
                    </h3>
                    <div className="form-grid">
                      {/* Category-specific technical specifications */}
                      {getTechnicalSpecifications().map(spec => {
                        if (spec.type === "select") {
                          // Handle select inputs
                          let options: { value: string; label: string }[] = [];
                          
                          if (spec.id === "bridgeType") {
                            options = [
                              { value: "beam", label: "Beam Bridge" },
                              { value: "arch", label: "Arch Bridge" },
                              { value: "suspension", label: "Suspension Bridge" },
                              { value: "cableStayed", label: "Cable-stayed Bridge" },
                              { value: "truss", label: "Truss Bridge" },
                              { value: "movable", label: "Movable Bridge" },
                              { value: "pedestrian", label: "Pedestrian Bridge" }
                            ];
                          } else if (spec.id === "processType") {
                            options = [
                              { value: "continuous", label: "Continuous Process" },
                              { value: "batch", label: "Batch Process" },
                              { value: "discrete", label: "Discrete Manufacturing" },
                              { value: "hybrid", label: "Hybrid" }
                            ];
                          } else if (spec.id === "safetyLevel") {
                            options = [
                              { value: "standard", label: "Standard" },
                              { value: "high", label: "High Risk" },
                              { value: "hazardous", label: "Hazardous" },
                              { value: "explosive", label: "Explosive Atmosphere" }
                            ];
                          } else if (spec.id === "soilType") {
                            options = [
                              { value: "clay", label: "Clay" },
                              { value: "sand", label: "Sand" },
                              { value: "silt", label: "Silt" },
                              { value: "gravel", label: "Gravel" },
                              { value: "rock", label: "Rock" },
                              { value: "mixed", label: "Mixed" }
                            ];
                          }
                          
                          return (
                            <div key={spec.id} className="form-group">
                              <label htmlFor={spec.id} className="form-label">
                                {spec.label} {spec.required ? "*" : ""}
                              </label>
                              <select
                                id={spec.id}
                                name={spec.id}
                                value={getSelectValue(spec.id)}
                                onChange={handleInputChange}
                                className={`form-select ${errors[spec.id] ? "error" : ""}`}
                                required={spec.required}
                              >
                                <option value="">{spec.placeholder}</option>
                                {options.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              {errors[spec.id] && <span className="error-text">{errors[spec.id]}</span>}
                            </div>
                          );
                        } else {
                          // Handle text/number inputs
                          return (
                            <div key={spec.id} className="form-group">
                              <label htmlFor={spec.id} className="form-label">
                                {spec.label} {spec.required ? "*" : ""}
                              </label>
                              <input
                                type={spec.type}
                                id={spec.id}
                                name={spec.id}
                                value={getInputValue(spec.id)}
                                onChange={handleInputChange}
                                className={`form-input ${errors[spec.id] ? "error" : ""}`}
                                placeholder={spec.placeholder}
                                required={spec.required}
                                min={spec.type === "number" ? "0" : undefined}
                                step={spec.type === "number" ? "0.1" : undefined}
                              />
                              {errors[spec.id] && <span className="error-text">{errors[spec.id]}</span>}
                            </div>
                          );
                        }
                      })}

                      {/* Common Specifications */}
                      <div className="form-group">
                        <label htmlFor="location" className="form-label">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={getInputValue("location")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., New York, USA"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="designLife" className="form-label">
                          Design Life (years)
                        </label>
                        <input
                          type="number"
                          id="designLife"
                          name="designLife"
                          value={getInputValue("designLife")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., 50"
                          min="1"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="constructionMethod" className="form-label">
                          Construction Method
                        </label>
                        <input
                          type="text"
                          id="constructionMethod"
                          name="constructionMethod"
                          value={getInputValue("constructionMethod")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., Precast, Cast-in-situ"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">💰</span>
                      Financial Information
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="estimatedCost" className="form-label">
                          Estimated Cost
                        </label>
                        <input
                          type="number"
                          id="estimatedCost"
                          name="estimatedCost"
                          value={getInputValue("estimatedCost")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., 5000000"
                          min="0"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="approvedBudget" className="form-label">
                          Approved Budget
                        </label>
                        <input
                          type="number"
                          id="approvedBudget"
                          name="approvedBudget"
                          value={getInputValue("approvedBudget")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., 5500000"
                          min="0"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="currency" className="form-label">
                          Currency
                        </label>
                        <select
                          id="currency"
                          name="currency"
                          value={getSelectValue("currency")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CAD">CAD (C$)</option>
                          <option value="AUD">AUD (A$)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="CNY">CNY (¥)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="contractType" className="form-label">
                          Contract Type
                        </label>
                        <select
                          id="contractType"
                          name="contractType"
                          value={getSelectValue("contractType")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="lumpSum">Lump Sum</option>
                          <option value="designBuild">Design & Build</option>
                          <option value="costPlus">Cost Plus</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="paymentStructure" className="form-label">
                          Payment Structure
                        </label>
                        <select
                          id="paymentStructure"
                          name="paymentStructure"
                          value={getSelectValue("paymentStructure")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="milestone">Milestone-based</option>
                          <option value="progress">Progress-based</option>
                          <option value="lumpSum">Lump Sum</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="procurementMethod" className="form-label">
                          Procurement Method
                        </label>
                        <select
                          id="procurementMethod"
                          name="procurementMethod"
                          value={getSelectValue("procurementMethod")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="traditional">Traditional</option>
                          <option value="designBuild">Design-Build</option>
                          <option value="epc">EPC</option>
                          <option value="ppp">PPP</option>
                          <option value="competitive">Competitive Bidding</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">⏰</span>
                      Timeline
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="timeline" className="form-label">
                          Project Timeline *
                        </label>
                        <select
                          id="timeline"
                          name="timeline"
                          value={getSelectValue("timeline")}
                          onChange={handleInputChange}
                          className={`form-select ${errors.timeline ? "error" : ""}`}
                          required
                        >
                          <option value="">Select timeline</option>
                          <option value="1-3 months">1-3 months</option>
                          <option value="3-6 months">3-6 months</option>
                          <option value="6-12 months">6-12 months</option>
                          <option value="12+ months">12+ months</option>
                        </select>
                        {errors.timeline && <span className="error-text">{errors.timeline}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="projectStartDate" className="form-label">
                          Project Start Date
                        </label>
                        <input
                          type="date"
                          id="projectStartDate"
                          name="projectStartDate"
                          value={getInputValue("projectStartDate")}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="designStartDate" className="form-label">
                          Design Start Date
                        </label>
                        <input
                          type="date"
                          id="designStartDate"
                          name="designStartDate"
                          value={getInputValue("designStartDate")}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="constructionStartDate" className="form-label">
                          Construction Start Date
                        </label>
                        <input
                          type="date"
                          id="constructionStartDate"
                          name="constructionStartDate"
                          value={getInputValue("constructionStartDate")}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="expectedCompletionDate" className="form-label">
                          Expected Completion Date
                        </label>
                        <input
                          type="date"
                          id="expectedCompletionDate"
                          name="expectedCompletionDate"
                          value={getInputValue("expectedCompletionDate")}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">👥</span>
                      Stakeholders
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="architect" className="form-label">
                          Architect/Design Firm
                        </label>
                        <input
                          type="text"
                          id="architect"
                          name="architect"
                          value={getInputValue("architect")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., ABC Architects"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="structuralEngineer" className="form-label">
                          Structural Engineer
                        </label>
                        <input
                          type="text"
                          id="structuralEngineer"
                          name="structuralEngineer"
                          value={getInputValue("structuralEngineer")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., XYZ Engineering"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="mepEngineer" className="form-label">
                          MEP Engineer
                        </label>
                        <input
                          type="text"
                          id="mepEngineer"
                          name="mepEngineer"
                          value={getInputValue("mepEngineer")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., MEP Consultants Ltd."
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="contractor" className="form-label">
                          Main Contractor
                        </label>
                        <input
                          type="text"
                          id="contractor"
                          name="contractor"
                          value={getInputValue("contractor")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., BuildRight Construction"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="bimManager" className="form-label">
                          BIM Manager/Coordinator
                        </label>
                        <input
                          type="text"
                          id="bimManager"
                          name="bimManager"
                          value={getInputValue("bimManager")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., John Smith"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">🎯</span>
                      Special Requirements
                    </h3>
                    <div className="form-group">
                      <label htmlFor="specialRequirements" className="form-label">
                        Additional Requirements & Constraints
                      </label>
                      <textarea
                        id="specialRequirements"
                        name="specialRequirements"
                        value={getInputValue("specialRequirements")}
                        onChange={handleInputChange}
                        className="form-textarea"
                        placeholder="Any specific sustainability requirements, accessibility needs, regulatory constraints, or other special considerations..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="form-section-navigation">
                    <button 
                      type="button" 
                      className="btn btn--secondary"
                      onClick={() => navigateToSection("basics")}
                    >
                      ← Back to Basics
                    </button>
                    <button 
                      type="button" 
                      className="btn btn--primary"
                      onClick={() => navigateToSection("govt")}
                    >
                      Next: Govt & Compliance →
                    </button>
                  </div>
                </>
              )}

              {/* Government & Compliance Section */}
              {currentSection === "govt" && (
                <>
                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">🏛️</span>
                      Government Approvals & Requirements
                    </h3>
                    <div className="form-group">
                      <label className="form-label">Required Government Approvals</label>
                      <div className="checkbox-grid">
                        {governmentApprovalOptions.map(approval => (
                          <label key={approval.value} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.governmentApprovals?.includes(approval.value) || false}
                              onChange={(e) => handleMultiSelectChange("governmentApprovals", approval.value, e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span className="checkbox-text">{approval.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="buildingPermitNumber" className="form-label">
                          Building Permit Number
                        </label>
                        <input
                          type="text"
                          id="buildingPermitNumber"
                          name="buildingPermitNumber"
                          value={getInputValue("buildingPermitNumber")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., BP-2024-12345"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="environmentalClearance" className="form-label">
                          Environmental Clearance Status
                        </label>
                        <select
                          id="environmentalClearance"
                          name="environmentalClearance"
                          value={getSelectValue("environmentalClearance")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="notRequired">Not Required</option>
                          <option value="applied">Applied For</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="zoningApproval" className="form-label">
                          Zoning Approval Status
                        </label>
                        <select
                          id="zoningApproval"
                          name="zoningApproval"
                          value={getSelectValue("zoningApproval")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="conditional">Conditional</option>
                          <option value="rejected">Rejected</option>
                          <option value="notRequired">Not Required</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="fireSafetyCertificate" className="form-label">
                          Fire Safety Certificate Status
                        </label>
                        <select
                          id="fireSafetyCertificate"
                          name="fireSafetyCertificate"
                          value={getSelectValue("fireSafetyCertificate")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="inspectionScheduled">Inspection Scheduled</option>
                          <option value="notRequired">Not Required</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Utility Clearances Required</label>
                      <div className="checkbox-grid compact">
                        {utilityClearanceOptions.map(utility => (
                          <label key={utility.value} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.utilityClearances?.includes(utility.value) || false}
                              onChange={(e) => handleMultiSelectChange("utilityClearances", utility.value, e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span className="checkbox-text">{utility.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">⚖️</span>
                      Regulatory Compliance
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="localBuildingCode" className="form-label">
                          Local Building Code
                        </label>
                        <input
                          type="text"
                          id="localBuildingCode"
                          name="localBuildingCode"
                          value={getInputValue("localBuildingCode")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., International Building Code (IBC)"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="approvingAuthority" className="form-label">
                          Approving Authority
                        </label>
                        <input
                          type="text"
                          id="approvingAuthority"
                          name="approvingAuthority"
                          value={getInputValue("approvingAuthority")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., City Planning Department"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="riskClassification" className="form-label">
                          Risk Classification
                        </label>
                        <select
                          id="riskClassification"
                          name="riskClassification"
                          value={getSelectValue("riskClassification")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="low">Low Risk</option>
                          <option value="medium">Medium Risk</option>
                          <option value="high">High Risk</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="healthSafetyClassification" className="form-label">
                          Health & Safety Classification
                        </label>
                        <select
                          id="healthSafetyClassification"
                          name="healthSafetyClassification"
                          value={getSelectValue("healthSafetyClassification")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="standard">Standard</option>
                          <option value="highRisk">High Risk</option>
                          <option value="hazardous">Hazardous</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📍</span>
                      Location & Geospatial Data
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="country" className="form-label">
                          Country
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={getInputValue("country")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., United States"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="stateRegion" className="form-label">
                          State/Region
                        </label>
                        <input
                          type="text"
                          id="stateRegion"
                          name="stateRegion"
                          value={getInputValue("stateRegion")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., California"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="city" className="form-label">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={getInputValue("city")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., Los Angeles"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="projectAddress" className="form-label">
                          Project Address
                        </label>
                        <textarea
                          id="projectAddress"
                          name="projectAddress"
                          value={getInputValue("projectAddress")}
                          onChange={handleInputChange}
                          className="form-textarea"
                          placeholder="Full project address"
                          rows={3}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="latitude" className="form-label">
                          Latitude
                        </label>
                        <input
                          type="text"
                          id="latitude"
                          name="latitude"
                          value={getInputValue("latitude")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., 34.0522"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="longitude" className="form-label">
                          Longitude
                        </label>
                        <input
                          type="text"
                          id="longitude"
                          name="longitude"
                          value={getInputValue("longitude")}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g., -118.2437"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="floodRiskZone" className="form-label">
                          Flood Risk Zone
                        </label>
                        <select
                          id="floodRiskZone"
                          name="floodRiskZone"
                          value={getSelectValue("floodRiskZone")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="low">Low Risk</option>
                          <option value="medium">Medium Risk</option>
                          <option value="high">High Risk</option>
                          <option value="floodway">Floodway</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="seismicZone" className="form-label">
                          Seismic Zone
                        </label>
                        <select
                          id="seismicZone"
                          name="seismicZone"
                          value={getSelectValue("seismicZone")}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="none">None</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="veryHigh">Very High</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section-navigation">
                    <button 
                      type="button" 
                      className="btn btn--secondary"
                      onClick={() => navigateToSection("specs")}
                    >
                      ← Back to Specifications
                    </button>
                    <button 
                      type="button" 
                      className="btn btn--primary"
                      onClick={() => navigateToSection("delivery")}
                    >
                      Next: Delivery →
                    </button>
                  </div>
                </>
              )}

              {/* Delivery Section */}
              {currentSection === "delivery" && (
                <>
                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📦</span>
                      Model Generation Options
                    </h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="numberOfModels" className="form-label">
                          Number of Models to Generate *
                        </label>
                        <input
                          type="number"
                          id="numberOfModels"
                          name="numberOfModels"
                          value={getInputValue("numberOfModels")}
                          onChange={handleInputChange}
                          className={`form-input ${errors.numberOfModels ? "error" : ""}`}
                          placeholder="e.g., 3"
                          min="1"
                          max="20"
                          required
                        />
                        {errors.numberOfModels && <span className="error-text">{errors.numberOfModels}</span>}
                        <div className="form-note">
                          You can generate up to 20 models per request. Each model will be based on the specifications above.
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="lodTarget" className="form-label">
                          LOD (Level of Development) Target *
                        </label>
                        <select
                          id="lodTarget"
                          name="lodTarget"
                          value={getSelectValue("lodTarget")}
                          onChange={handleInputChange}
                          className={`form-select ${errors.lodTarget ? "error" : ""}`}
                          required
                        >
                          <option value="">Select LOD level</option>
                          {lodLevels.map(lod => (
                            <option key={lod.value} value={lod.value}>
                              {lod.label}
                            </option>
                          ))}
                        </select>
                        {errors.lodTarget && <span className="error-text">{errors.lodTarget}</span>}
                        {formData.lodTarget && (
                          <div className="option-description">
                            {lodLevels.find(lod => lod.value === formData.lodTarget)?.description}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="deliveryFormat" className="form-label">
                          Delivery Format *
                        </label>
                        <select
                          id="deliveryFormat"
                          name="deliveryFormat"
                          value={getSelectValue("deliveryFormat")}
                          onChange={handleInputChange}
                          className="form-select"
                          required
                        >
                          {deliveryFormats.map(format => (
                            <option key={format.value} value={format.value}>
                              {format.label}
                            </option>
                          ))}
                        </select>
                        {formData.deliveryFormat && (
                          <div className="option-description">
                            {deliveryFormats.find(format => format.value === formData.deliveryFormat)?.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Email for unauthenticated users */}
                  {!isAuthenticated && (
                    <div className="form-section">
                      <h3 className="section-title">
                        <span className="section-icon">📧</span>
                        Contact Information
                      </h3>
                      <div className="form-group">
                        <label htmlFor="contactEmail" className="form-label">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="contactEmail"
                          name="contactEmail"
                          value={getInputValue("contactEmail")}
                          onChange={handleInputChange}
                          className={`form-input ${errors.contactEmail ? "error" : ""}`}
                          placeholder="your.email@company.com"
                          required={!isAuthenticated}
                        />
                        {errors.contactEmail && <span className="error-text">{errors.contactEmail}</span>}
                        <div className="form-note">
                          We'll use this email to send your model generation results and updates
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-section">
                    <h3 className="section-title">
                      <span className="section-icon">📊</span>
                      Order Summary
                    </h3>
                    <div className="order-summary">
                      <div className="summary-item">
                        <span className="summary-label">Project Category:</span>
                        <span className="summary-value">
                          {projectCategories.find(cat => cat.value === formData.projectCategory)?.label || "Not selected"}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Project Type:</span>
                        <span className="summary-value">
                          {formData.buildingType 
                            ? buildingTypes.find(type => type.value === formData.buildingType)?.label
                            : formData.infrastructureType 
                              ? infrastructureTypes.find(type => type.value === formData.infrastructureType)?.label
                              : formData.industrialType
                                ? industrialTypes.find(type => type.value === formData.industrialType)?.label
                                : formData.civilWorksType
                                  ? civilWorksTypes.find(type => type.value === formData.civilWorksType)?.label
                                  : "Not selected"
                          }
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Number of Models:</span>
                        <span className="summary-value">{formData.numberOfModels || 1}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">LOD Target:</span>
                        <span className="summary-value">
                          {lodLevels.find(lod => lod.value === formData.lodTarget)?.label || "Not selected"}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Delivery Format:</span>
                        <span className="summary-value">
                          {deliveryFormats.find(format => format.value === formData.deliveryFormat)?.label || "Not selected"}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Govt Approvals:</span>
                        <span className="summary-value">
                          {formData.governmentApprovals?.length || 0} required
                        </span>
                      </div>
                      <div className="summary-item total">
                        <span className="summary-label">Estimated Processing Time:</span>
                        <span className="summary-value">
                          {formData.numberOfModels ? `${Math.max(3, formData.numberOfModels)}-${Math.max(7, formData.numberOfModels * 3)} business days` : "3-7 business days"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="form-section-navigation">
                    <button 
                      type="button" 
                      className="btn btn--secondary"
                      onClick={() => navigateToSection("govt")}
                    >
                      ← Back to Govt & Compliance
                    </button>
                    <button
                      type="submit"
                      className={`btn btn--primary btn--generate ${isSubmitting ? 'btn--loading' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="loading-spinner"></div>
                          Processing Order...
                        </>
                      ) : (
                        `Generate ${formData.numberOfModels || 1} Model${formData.numberOfModels !== 1 ? 's' : ''}`
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Features Highlight */}
            <div className="features-highlight">
              <h4>What You'll Get</h4>
              <div className="features-grid">
                <div className="feature">
                  <span className="feature-icon">📐</span>
                  <div>
                    <strong>IFC 4.3 Compliant Models</strong>
                    <p>Industry-standard BIM models ready for any software</p>
                  </div>
                </div>
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <div>
                    <strong>Automated Generation</strong>
                    <p>Smart model generation based on comprehensive framework</p>
                  </div>
                </div>
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <div>
                    <strong>Government Compliance</strong>
                    <p>All required approvals and regulatory compliance included</p>
                  </div>
                </div>
                <div className="feature">
                  <span className="feature-icon">🔧</span>
                  <div>
                    <strong>Software Agnostic</strong>
                    <p>Models compatible with all major BIM software platforms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GenerateModelPage;