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

import { getCustomerUseCases } from "@/lib/data/customer-usecases-catalog";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const defaultTopUseCases: TopUseCase[] = getCustomerUseCases("Hypera Pharma");

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
    const newCases = getCustomerUseCases(cust.name);
    setTopUseCases(newCases);
    setShowLiveDebateView(false);
    setActiveTab("decision");
  };

  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}
