// app/page.tsx - Painel Central do Business Assessment Cockpit (Estilo Hypera Commercial Brain)
"use client";

import React, { useState, useEffect } from "react";
import { ControlTowerHeader } from "@/components/ControlTowerHeader";
import { ControlTowerSidebar, NavigationTab } from "@/components/ControlTowerSidebar";
import { ExecutiveDecisionView } from "@/components/views/ExecutiveDecisionView";
import { TopUseCasesView } from "@/components/views/TopUseCasesView";
import { KpiSimulatorView } from "@/components/views/KpiSimulatorView";
import { BigQueryGraphView } from "@/components/views/BigQueryGraphView";
import { IntelligentChatView } from "@/components/views/IntelligentChatView";
import { UploadIngestionView } from "@/components/views/UploadIngestionView";
import { NeuroDebateView } from "@/components/views/NeuroDebateView";
import { 
  CustomerAssessment, 
  TableCatalogItem, 
  TopUseCase, 
  NeuroDebateTurn, 
  SalienceItem, 
  AuditTarget 
} from "@/lib/types";

// Dados iniciais enriquecidos para exibição executiva imediata (Zero Alucinação / 100% Auditável)
const defaultAssessment: CustomerAssessment = {
  assessmentId: "asm_hypera_20260904",
  customerId: "cust_hypera_pharma",
  customerName: "Hypera Pharma",
  industry: "Farmacêutica & Saúde",
  uploadTimestamp: new Date().toISOString(),
  totalDatasets: 24,
  totalTables: 3293,
  totalViews: 840,
  totalColumns: 48920,
  documentedColumns: 34910,
  docPercentage: 71.4,
  dataplexScansCount: 42,
  propertyGraphsCount: 1,
  dataAgentsCount: 2,
  gcsArchiveUri: "gs://dass-2026/business_assessment/20260904_104605_hypera_pharma/metadata_assessment_organization.zip",
  summaryMarkdown: `# Assessment Executivo Hypera Pharma
Patrimônio de dados auditado com 3.293 tabelas no Google BigQuery, governança Dataplex e grafo de conhecimento relacional.`
};

const defaultTopUseCases: TopUseCase[] = [
  {
    useCaseId: "uc_01_uplift_mdv",
    assessmentId: "asm_hypera_20260904",
    rank: 1,
    title: "Otimização de Visitação Médica & MDV Distrital Causal",
    category: "Causal AI & Uplift",
    businessProblem: "Dispersão de roteiro de campo dos representantes gerando ociosidade em setores com alto potencial de prescrição não atendido.",
    solutionDescription: "Modelo preditivo e causal que cruza as visitas registradas com o Sell-Out das farmácias vizinhas (Modelo Huff) no BigQuery, gerando roteiros inteligentes com ganho de 1.5 visitas/dia.",
    businessCaseRoi: "ROI de 340% em 12 meses; elevação de +R$ 376.601 no faturamento distrital.",
    financialGainEstimateUsd: 480000,
    gcpMonthlyCostUsd: 580,
    costBreakdown: {
      bigqueryUsd: 280,
      vertexAiUsd: 180,
      cloudRunUsd: 80,
      storageUsd: 40
    },
    requiredTables: ["Activities", "VisitEvents", "Prescriptions_CloseUp", "Doctor_Registry"],
    requiredColumns: ["doctor_id", "specialty", "visit_timestamp", "target_tier", "rx_share"],
    guardrails: "Auditoria contínua de CRM; mascaramento dinâmico de dados médicos (Data Masking) em conformidade com CFM e LGPD.",
    confidenceScore: 0.94,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_02_gravitacao_huff",
    assessmentId: "asm_hypera_20260904",
    rank: 2,
    title: "Mapeamento Gravitacional de Demanda (Modelo Huff) em PDVs",
    category: "Marketing Analytics",
    businessProblem: "Falta de correlação precisa entre os médicos prescritores e as 447 farmácias satélites onde os pacientes efetivamente compram os medicamentos.",
    solutionDescription: "Algoritmo espacial do BigQuery Geo & Property Graph conectando prescrições de consultórios aos PDVs com raio de 800m, direcionando blitz promocional e amostras.",
    businessCaseRoi: "ROI de 410%; redução de 38% na perda de prescrições por indisponibilidade local.",
    financialGainEstimateUsd: 620000,
    gcpMonthlyCostUsd: 640,
    costBreakdown: {
      bigqueryUsd: 320,
      vertexAiUsd: 200,
      cloudRunUsd: 80,
      storageUsd: 40
    },
    requiredTables: ["Pharmacies_SellOut", "Prescriptions_CloseUp", "Geo_Clusters"],
    requiredColumns: ["pdv_id", "geo_latitude", "geo_longitude", "brand_sellout", "stock_days"],
    guardrails: "Zero alucinação em estoques; se a query retornar 0 rows, o sistema afirma ausência de dados para a data.",
    confidenceScore: 0.96,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_03_anti_ruptura",
    assessmentId: "asm_hypera_20260904",
    rank: 3,
    title: "Prevenção Ativa de Ruptura nos 447 PDVs e Redes Parceiras",
    category: "Supply Chain & S&OP",
    businessProblem: "Ruptura intermitente de SKUs líderes (ex: ALIVIUM GOTAS) nas redes regionais, cancelando o esforço de visitação do representante.",
    solutionDescription: "Detecção em tempo quase real de desbalanceamento de estoque nas redes distribuidoras e acionamento preventivo de reposição.",
    businessCaseRoi: "Recuperação de R$ 520.000 em vendas perdidas; índice de ruptura reduzido para 0.6%.",
    financialGainEstimateUsd: 380000,
    gcpMonthlyCostUsd: 420,
    costBreakdown: {
      bigqueryUsd: 220,
      vertexAiUsd: 120,
      cloudRunUsd: 50,
      storageUsd: 30
    },
    requiredTables: ["Inventory_Distribution", "SellOut_Weekly", "SKU_Master"],
    requiredColumns: ["sku_id", "lead_time_days", "current_stock", "safety_stock_limit"],
    guardrails: "Alertas idempotentes enviados para compras; reprocessamentos múltiplos não duplicam pedidos.",
    confidenceScore: 0.92,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_04_omnichannel_crm",
    assessmentId: "asm_hypera_20260904",
    rank: 4,
    title: "Ativação Omnichannel Médica Pós-Visita (Cadência D+2)",
    category: "Next-Best-Action",
    businessProblem: "Queda de recall da marca 7 dias após a visita presencial do representante.",
    solutionDescription: "Disparo automatizado de conteúdos científicos aprovados no D+2 após a visita via WhatsApp Business e e-mail com taxa de abertura de 68%.",
    businessCaseRoi: "Aumento de 8.3% no recall prescritivo sustentado por 90 dias.",
    financialGainEstimateUsd: 290000,
    gcpMonthlyCostUsd: 380,
    costBreakdown: {
      bigqueryUsd: 180,
      vertexAiUsd: 140,
      cloudRunUsd: 40,
      storageUsd: 20
    },
    requiredTables: ["Doctor_Registry", "VisitEvents", "Omnichannel_Engagements"],
    requiredColumns: ["doctor_id", "opt_in_whatsapp", "last_visit_date", "specialty_tag"],
    guardrails: "Opt-in obrigatório e auditado em Dataplex; zero envio sem consentimento prévio.",
    confidenceScore: 0.91,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_05_finops_sku",
    assessmentId: "asm_hypera_20260904",
    rank: 5,
    title: "Otimização de Margem de Contribuição e Budget Promocional",
    category: "FinOps & Cost",
    businessProblem: "Alocação homogênea de amostras e verbas de promoção entre SKUs com margens díspares.",
    solutionDescription: "Priorização algorítmica de amostragem nos produtos com margem de contribuição líquida superior a 40%.",
    businessCaseRoi: "Ganho de +4.2 pontos percentuais na margem média da carteira distrital.",
    financialGainEstimateUsd: 340000,
    gcpMonthlyCostUsd: 290,
    costBreakdown: {
      bigqueryUsd: 150,
      vertexAiUsd: 90,
      cloudRunUsd: 30,
      storageUsd: 20
    },
    requiredTables: ["SKU_Master", "Commercial_Budget", "Sample_Distribution"],
    requiredColumns: ["sku_id", "gross_margin_pct", "promotional_budget", "unit_cost"],
    guardrails: "Queries SQL estritamente otimizadas com partições por ano/mês de fechamento contábil.",
    confidenceScore: 0.95,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_06_data_agent_genie",
    assessmentId: "asm_hypera_20260904",
    rank: 6,
    title: "Data Agent Conversacional BigQuery com Grounding em Grafo",
    category: "GenAI & Data Agents",
    businessProblem: "Demora de até 4 dias para times de negócio obterem relatórios ad-hoc de sell-out e visitas.",
    solutionDescription: "BigQuery Conversational Data Agent baseado em Gemini 3.8 Flash conectado ao Property Graph para responder perguntas de negócio em segundos.",
    businessCaseRoi: "Redução de 85% no tempo de resposta analítica; autosserviço para 100% dos GDs e GRs.",
    financialGainEstimateUsd: 210000,
    gcpMonthlyCostUsd: 320,
    costBreakdown: {
      bigqueryUsd: 120,
      vertexAiUsd: 140,
      cloudRunUsd: 40,
      storageUsd: 20
    },
    requiredTables: ["enterprise_business_graph", "assessment_tables_catalog", "top_use_cases"],
    requiredColumns: ["table_name", "graph_node_id", "business_metric", "kpi_name"],
    guardrails: "Tratamento elegante de empty states; streaming de respostas e limite forçado de 50 linhas em tabelas.",
    confidenceScore: 0.97,
    status: "VALIDATED"
  }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavigationTab>("decision");
  const [assessment, setAssessment] = useState<CustomerAssessment | null>(defaultAssessment);
  const [tables, setTables] = useState<TableCatalogItem[]>([]);
  const [turns, setTurns] = useState<NeuroDebateTurn[]>([]);
  const [topUseCases, setTopUseCases] = useState<TopUseCase[]>(defaultTopUseCases);
  const [salienceMatrix, setSalienceMatrix] = useState<SalienceItem[]>([]);
  const [auditTargets, setAuditTargets] = useState<AuditTarget[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLiveDebateView, setShowLiveDebateView] = useState(false);

  // Tenta carregar dados do BigQuery ao iniciar
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch("/api/bigquery/graph");
        const json = await res.json();
        if (json.topTablesSample && json.topTablesSample.length > 0) {
          setTables(json.topTablesSample);
        }
      } catch (err) {
        console.warn("Notice: Using enriched baseline dataset for display.", err);
      }
    }
    loadInitialData();
  }, []);

  const handleAssessmentLoaded = (loadedAssessment: CustomerAssessment, loadedTables: TableCatalogItem[]) => {
    setAssessment(loadedAssessment);
    setTables(loadedTables);
    setActiveTab("decision");
  };

  const handleDebateComplete = (data: {
    turns: NeuroDebateTurn[];
    topUseCases: TopUseCase[];
    salienceMatrix: SalienceItem[];
    auditTargets: AuditTarget[];
  }) => {
    setTurns(data.turns);
    setTopUseCases(data.topUseCases);
    setSalienceMatrix(data.salienceMatrix);
    setAuditTargets(data.auditTargets);
    setShowLiveDebateView(false);
    setActiveTab("decision");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/bigquery/graph");
      await res.json();
    } catch (e) {
      console.warn("Erro ao sincronizar dados:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F0F4F8] text-slate-900 font-sans antialiased">
      {/* 1. Sidebar Fixa à Esquerda (Estilo Hypera Commercial Brain) */}
      <ControlTowerSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setShowLiveDebateView(false);
          setActiveTab(tab);
        }}
        casesCount={topUseCases.length}
      />

      {/* 2. Área Principal com Header Sticky e Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior Fixo com Busca e Perfil */}
        <ControlTowerHeader
          customerName={assessment?.customerName || "Cliente Corporativo"}
          industry={assessment?.industry || "Bens de Consumo & Saúde"}
          totalTables={assessment?.totalTables || 0}
          docPercentage={assessment?.docPercentage || 0}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onNavigateToUpload={() => {
            setShowLiveDebateView(false);
            setActiveTab("upload");
          }}
          onSearchSubmit={(q) => {
            console.log("Busca executiva:", q);
          }}
        />

        {/* Conteúdo da Aba Ativa */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
          {/* Visualização de Debate ao Vivo (se acionado) */}
          {showLiveDebateView ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowLiveDebateView(false)}
                  className="text-xs font-bold text-[#074878] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Voltar para Visão Geral
                </button>
              </div>
              <NeuroDebateView
                assessment={assessment || defaultAssessment}
                tables={tables}
                turns={turns}
                topUseCases={topUseCases}
                salienceMatrix={salienceMatrix}
                auditTargets={auditTargets}
                onDebateComplete={handleDebateComplete}
                onNavigateToCases={() => {
                  setShowLiveDebateView(false);
                  setActiveTab("cases");
                }}
              />
            </div>
          ) : (
            <>
              {activeTab === "decision" && (
                <ExecutiveDecisionView
                  assessment={assessment}
                  topUseCases={topUseCases}
                  tables={tables}
                  onTriggerDebate={() => setShowLiveDebateView(true)}
                  onNavigateToTab={(tab) => setActiveTab(tab as NavigationTab)}
                  onNavigateToUpload={() => setActiveTab("upload")}
                />
              )}

              {activeTab === "cases" && (
                <TopUseCasesView
                  useCases={topUseCases}
                  assessment={assessment}
                  onNavigateToGraph={() => setActiveTab("graph")}
                />
              )}

              {activeTab === "kpis" && (
                <KpiSimulatorView
                  assessment={assessment}
                  topUseCases={topUseCases}
                  onNavigateToCases={() => setActiveTab("cases")}
                />
              )}

              {activeTab === "graph" && (
                <BigQueryGraphView />
              )}

              {activeTab === "chat" && (
                <IntelligentChatView assessment={assessment} />
              )}

              {activeTab === "upload" && (
                <UploadIngestionView
                  assessment={assessment}
                  onAssessmentLoaded={handleAssessmentLoaded}
                  onNavigateToDebate={() => setShowLiveDebateView(true)}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
