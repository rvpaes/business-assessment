// lib/types.ts - Modelos de Dados Centrais do Business Assessment

export interface Customer {
  id: string;
  name: string;
  industry: string;
  createdAt: string;
  lastAssessmentId?: string;
  gcsFolderUri?: string;
}

export interface CustomerAssessment {
  assessmentId: string;
  customerId: string;
  customerName: string;
  industry: string;
  websiteUrl?: string;
  additionalInfo?: string;
  uploadTimestamp: string;
  totalDatasets: number;
  totalTables: number;
  totalViews: number;
  totalColumns: number;
  documentedColumns: number;
  docPercentage: number;
  dataplexScansCount: number;
  propertyGraphsCount: number;
  dataAgentsCount: number;
  gcsArchiveUri: string;
  summaryMarkdown: string;
}

export interface TableCatalogItem {
  tableKey: string; // project.dataset.table
  assessmentId: string;
  projectId: string;
  datasetId: string;
  tableName: string;
  tableType: string;
  tableDescription: string;
  columnCount: number;
  documentedColumns: number;
  estimatedRows: number;
  estimatedBytes: number;
  dataplexProfileScanActive: boolean;
}

export interface TopUseCase {
  useCaseId: string;
  assessmentId: string;
  rank: number; // 1 to 6
  title: string;
  category: string; // "Causal AI & Uplift", "Next-Best-Action", "Supply Chain & S&OP", "FinOps & Cost", "Customer Churn & LTV", "Fraud & Governance"
  businessProblem: string;
  solutionDescription: string;
  businessCaseRoi: string; // e.g. "ROI de 380% em 12 meses; ganho estimado de R$ 4,8M/ano"
  financialGainEstimateUsd: number;
  gcpMonthlyCostUsd: number;
  costBreakdown: {
    bigqueryUsd: number;
    vertexAiUsd: number;
    cloudRunUsd: number;
    storageUsd: number;
  };
  requiredTables: string[];
  requiredColumns: string[];
  guardrails: string;
  confidenceScore: number;
  status: "VALIDATED" | "PROPOSED" | "UNDER_REVIEW";
}

export interface SalienceItem {
  proposalId: string;
  title: string;
  stackFeasibility: number; // 0 to 10
  exploreExploitRatio: string; // "Equilibrado", "Alto Risco / Alta Inovação", "Otimização Estrita"
  implementationComplexity: "BAIXA" | "MEDIA" | "ALTA";
  operationalRisk: "BAIXO" | "MEDIO" | "CRITICO";
  selected: boolean;
}

export interface AuditTarget {
  targetId: string;
  proposalId: string;
  description: string;
  mitigation: string;
}

export interface NeuroDebateTurn {
  turnId: string;
  assessmentId: string;
  cycle: number;
  phase: "DMN_GENERATION" | "SN_SALIENCE_FILTER" | "CEN_EXECUTIVE_VALIDATION";
  agentRole: "DMN_Explorer" | "SN_Arbiter" | "CEN_Executive_Engineer";
  agentName: string;
  avatarUrl?: string;
  thoughtLog: string;
  outputText: string;
  salienceMatrix?: SalienceItem[];
  auditTargets?: AuditTarget[];
  verdict?: "APPROVED" | "REVISE" | "CONVERGED";
  timestamp: string;
}

export type PropertyGraphNodeType = 
  | "Customer" 
  | "Assessment" 
  | "Dataset" 
  | "Table" 
  | "TableCatalog" 
  | "UseCase" 
  | "AgentPersona" 
  | "PersonaDebate" 
  | "GcpService" 
  | "StrategicGoal" 
  | "ModernizationAction";

export interface PropertyGraphNode {
  id: string;
  nodeType: PropertyGraphNodeType;
  name: string;
  category: string;
  properties: Record<string, any>;
}

export type PropertyGraphEdgeType = 
  | "OWNS" 
  | "EXTRACTED_FROM" 
  | "FEEDS_USE_CASE" 
  | "DEBATED_BY" 
  | "GOVERNS"
  | "STRATEGIC_GOAL"
  | "VALIDATED_BY"
  | "BENEFITS"
  | "CONSUMES_GCP_SERVICE"
  | "TARGETS_GOAL"
  | "RECOMMENDS_ACTION"
  | "GOVERNED_BY"
  | "HAS_ASSESSMENT"
  | "AUDITS_TABLE"
  | "EMPOWERS_USE_CASE"
  | "VALIDATED_USE_CASE"
  | "INVESTS_IN"
  | "ACHIEVES_GOAL"
  | string;

export interface PropertyGraphEdge {
  edgeId: string;
  sourceId: string;
  destinationId: string;
  edgeType: PropertyGraphEdgeType;
  weight: number;
  properties: Record<string, any>;
}

export interface PropertyGraphData {
  nodes: PropertyGraphNode[];
  edges: PropertyGraphEdge[];
}

// =========================================================================
// Tipos para os 5 Agentes Executivos ADK & Mesa Redonda (persona_adk.pdf)
// =========================================================================
export type ExecutiveRole = "CEO" | "CTO" | "CFO" | "CMO" | "MODERATOR";

export interface ExecutivePersonaInfo {
  role: ExecutiveRole;
  title: string;
  subtitle: string;
  focusArea: string;
  avatarIcon: string;
  themeColor: string;
}

export interface ExecutiveStructuredSections {
  strategicThesis?: string;
  executionFrictions?: string;
  googleCloudQuestions?: string[];
  technicalDiagnosisFinOps?: string;
  riskMatrixSecurity?: string;
  financialModelEbitda?: string;
  budgetaryCaveats?: string;
  commercialMetricsImpact?: string;
  marketFrictions?: string;
  executiveConsensus?: string;
}

export interface ExecutiveRoundTableTurn {
  turnId: string;
  role: ExecutiveRole;
  agentName: string;
  title: string;
  round: number; // 1: Abertura, 2: Pareceres Individuais, 3: Debate Cruzado, 4: Síntese e Consenso
  phaseName: string;
  content: string;
  verdict?: string; // e.g. "APROVADO", "VIÁVEL COM RESTRIÇÕES ARQUITETURAIS", etc.
  structuredSections?: ExecutiveStructuredSections;
  thoughtLog?: string;
  timestamp: string;
}

export interface ExecutiveRoundTableResult {
  caseId: string;
  caseTitle: string;
  customerName: string;
  industry: string;
  turns: ExecutiveRoundTableTurn[];
  summary: {
    overallVerdict: string;
    alignmentScore: number;
    keyAgreements: string[];
    criticalContentions: string[];
    gcpSabatinaChecklist: {
      fromRole: ExecutiveRole;
      category: string;
      question: string;
    }[];
    actionPlan: string[];
  };
}

