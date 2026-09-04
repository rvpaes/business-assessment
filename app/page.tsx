// app/page.tsx - Painel Central do Business Assessment Cockpit
"use client";

import React, { useState, useEffect } from "react";
import { ControlTowerHeader, CustomerOption } from "@/components/ControlTowerHeader";
import { ControlTowerSidebar, NavigationTab } from "@/components/ControlTowerSidebar";
import { UploadIngestionView } from "@/components/views/UploadIngestionView";
import { ExecutiveDecisionView } from "@/components/views/ExecutiveDecisionView";
import { TopUseCasesView } from "@/components/views/TopUseCasesView";
import { BigQueryGraphView } from "@/components/views/BigQueryGraphView";
import { IntelligentChatView } from "@/components/views/IntelligentChatView";
import { NeuroDebateView } from "@/components/views/NeuroDebateView";
import { 
  CustomerAssessment, 
  TableCatalogItem, 
  TopUseCase, 
  NeuroDebateTurn, 
  SalienceItem, 
  AuditTarget 
} from "@/lib/types";

// Dados iniciais enriquecidos para o assessment de demonstração
const defaultAssessment: CustomerAssessment = {
  assessmentId: "asm_demo_20260904",
  customerId: "cust_demo_corporate",
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
  summaryMarkdown: `# Assessment Executivo de Dados
Patrimônio de dados auditado com 3.293 tabelas no Google BigQuery, governança Dataplex e grafo de conhecimento relacional.`
};

const defaultTopUseCases: TopUseCase[] = [
  {
    useCaseId: "uc_01_uplift_mdv",
    assessmentId: "asm_demo_20260904",
    rank: 1,
    title: "Otimização Preditiva de Rotas de Campo & Demanda Causal",
    category: "Causal AI & Uplift",
    businessProblem: "Dispersão de roteiro operacional das equipes em campo gerando ociosidade em setores com alto potencial de receita não atendido.",
    solutionDescription: "Modelo causal que cruza o histórico de atendimentos e movimentações com a densidade de demanda gravitacional no BigQuery, gerando roteiros otimizados.",
    businessCaseRoi: "ROI de 340% em 12 meses; elevação de +R$ 2.68M no faturamento anual.",
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
    guardrails: "Auditoria contínua; mascaramento dinâmico de dados sensíveis (Data Masking) em conformidade com LGPD.",
    confidenceScore: 0.94,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_02_gravitacao_huff",
    assessmentId: "asm_demo_20260904",
    rank: 2,
    title: "Mapeamento Gravitacional de Consumo (Modelo Huff) em PDVs",
    category: "Marketing Analytics",
    businessProblem: "Falta de correlação precisa entre os pontos prescritores/decisores e os 447 pontos de venda satélites onde ocorre a compra final.",
    solutionDescription: "Algoritmo geoespacial do BigQuery Geo conectando pontos de demanda em raio de 800m aos pontos de venda para abastecimento preventivo.",
    businessCaseRoi: "ROI de 410%; redução de 38% na perda de demanda por indisponibilidade local.",
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
    guardrails: "Zero alucinação em estoques; se a query retornar 0 rows, o sistema afirma ausência de dados para o critério.",
    confidenceScore: 0.96,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_03_anti_ruptura",
    assessmentId: "asm_demo_20260904",
    rank: 3,
    title: "Prevenção Ativa de Ruptura em Canais de Distribuição",
    category: "Supply Chain & S&OP",
    businessProblem: "Ruptura intermitente de produtos líderes nos canais regionais, neutralizando o esforço promocional e comercial da equipe.",
    solutionDescription: "Detecção preditiva no BigQuery de desbalanceamento de estoque em trânsito e acionamento preventivo de reposição.",
    businessCaseRoi: "Recuperação de R$ 2.1M em vendas perdidas; índice de ruptura mantido abaixo de 0.6%.",
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
    guardrails: "Alertas idempotentes enviados aos canais; execuções repetidas não duplicam pedidos no ERP.",
    confidenceScore: 0.92,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_04_omnichannel_crm",
    assessmentId: "asm_demo_20260904",
    rank: 4,
    title: "Ativação Omnichannel Personalizada Pós-Contato",
    category: "Next-Best-Action",
    businessProblem: "Queda expressiva de engajamento do cliente 7 dias após a interação presencial da equipe.",
    solutionDescription: "Disparo automatizado de conteúdos técnicos aprovados via WhatsApp Business e canais digitais com taxa de abertura de 68%.",
    businessCaseRoi: "Aumento de 8.3% no recall contínuo sustentado ao longo de 90 dias.",
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
    guardrails: "Opt-in obrigatório e auditado em Dataplex; zero envio sem consentimento prévio registrado.",
    confidenceScore: 0.91,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_05_finops_sku",
    assessmentId: "asm_demo_20260904",
    rank: 5,
    title: "Otimização de Margem de Contribuição & Mix de Produtos",
    category: "FinOps & Cost",
    businessProblem: "Alocação homogênea de investimento promocional e amostras entre produtos com margens financeiras díspares.",
    solutionDescription: "Priorização algorítmica de incentivos nos produtos com margem de contribuição líquida superior a 40%.",
    businessCaseRoi: "Ganho de +4.2 pontos percentuais na margem média da carteira de produtos.",
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
    guardrails: "Queries SQL estritamente otimizadas com partições por ano e mês de fechamento contábil.",
    confidenceScore: 0.95,
    status: "VALIDATED"
  },
  {
    useCaseId: "uc_06_data_agent_genie",
    assessmentId: "asm_demo_20260904",
    rank: 6,
    title: "Data Agent Conversacional BigQuery com Grounding em Grafo",
    category: "GenAI & Data Agents",
    businessProblem: "Lentidão para lideranças obterem relatórios ad-hoc de vendas e operações.",
    solutionDescription: "BigQuery Conversational Data Agent baseado em Gemini 3.8 Flash conectado ao Property Graph para responder perguntas de negócio em segundos.",
    businessCaseRoi: "Redução de 85% no tempo de resposta analítica; autosserviço com zero alucinação.",
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
  // Ajuste 1: A tela "Ingestão & Metadados" é a PRIMEIRA tela por padrão!
  const [activeTab, setActiveTab] = useState<NavigationTab>("upload");
  const [assessment, setAssessment] = useState<CustomerAssessment | null>(defaultAssessment);
  const [tables, setTables] = useState<TableCatalogItem[]>([]);
  const [turns, setTurns] = useState<NeuroDebateTurn[]>([]);
  const [topUseCases, setTopUseCases] = useState<TopUseCase[]>(defaultTopUseCases);
  const [salienceMatrix, setSalienceMatrix] = useState<SalienceItem[]>([]);
  const [auditTargets, setAuditTargets] = useState<AuditTarget[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLiveDebateView, setShowLiveDebateView] = useState(false);
  const [autoStartDebate, setAutoStartDebate] = useState(false);

  // Carrega tabelas do BigQuery caso disponíveis
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch("/api/bigquery/graph");
        const json = await res.json();
        if (json.topTablesSample && json.topTablesSample.length > 0) {
          setTables(json.topTablesSample);
        }
      } catch (err) {
        console.warn("Notice: Base de metadados pronta.", err);
      }
    }
    loadInitialData();
  }, []);

  const handleAssessmentLoaded = (loadedAssessment: CustomerAssessment, loadedTables: TableCatalogItem[]) => {
    setAssessment(loadedAssessment);
    setTables(loadedTables);
    // Limpa dados de debate anterior para o novo cliente
    setTurns([]);
    setTopUseCases([]);
    setSalienceMatrix([]);
    setAuditTargets([]);
    // Ajuste 1: Abre direto na tela de debate executando automaticamente
    setAutoStartDebate(true);
    setShowLiveDebateView(true);
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
    setAutoStartDebate(false);
    // Permanece na tela de debate para que o usuário veja a transcrição completa e os botões de ação
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

  const handleSelectCustomer = (cust: CustomerOption) => {
    setAssessment((prev) => ({
      ...(prev || defaultAssessment),
      customerName: cust.name,
      industry: cust.industry,
      totalTables: cust.totalTables,
      totalColumns: cust.totalColumns,
      docPercentage: cust.docPercentage,
      gcsArchiveUri: cust.gcsArchiveUri || prev?.gcsArchiveUri || ""
    }));
    setShowLiveDebateView(false);
    setActiveTab("decision");
  };

  return (
    <div className="min-h-screen flex bg-[#F0F4F8] text-slate-900 font-sans antialiased">
      {/* 1. Sidebar Fixa à Esquerda */}
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
          onSelectCustomer={handleSelectCustomer}
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
                  ← Voltar para Agent Intelligence
                </button>
              </div>
              <NeuroDebateView
                assessment={assessment || defaultAssessment}
                tables={tables}
                turns={turns}
                topUseCases={topUseCases}
                salienceMatrix={salienceMatrix}
                auditTargets={auditTargets}
                autoStart={autoStartDebate}
                onDebateComplete={handleDebateComplete}
                onNavigateToCases={() => {
                  setShowLiveDebateView(false);
                  setActiveTab("cases");
                }}
              />
            </div>
          ) : (
            <>
              {/* Ajuste 1: Aba "upload" (Ingestão & Metadados) é a inicial */}
              {activeTab === "upload" && (
                <UploadIngestionView
                  assessment={assessment}
                  onAssessmentLoaded={handleAssessmentLoaded}
                  onNavigateToDashboard={() => setActiveTab("decision")}
                  onNavigateToCases={() => setActiveTab("cases")}
                />
              )}

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

              {/* Ajuste 4: Aba "cases" com Cards e Modal de Detalhamento */}
              {activeTab === "cases" && (
                <TopUseCasesView
                  useCases={topUseCases}
                  assessment={assessment}
                  onNavigateToGraph={() => setActiveTab("graph")}
                />
              )}

              {activeTab === "graph" && (
                <BigQueryGraphView />
              )}

              {activeTab === "chat" && (
                <IntelligentChatView assessment={assessment} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
