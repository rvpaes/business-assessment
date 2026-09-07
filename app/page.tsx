// app/page.tsx - Painel Central do Business Assessment Cockpit
"use client";

import React, { useState, useEffect } from "react";
import { CustomerOption } from "@/components/ControlTowerHeader";
import { ModernTopNavbar, ModernNavTab } from "@/components/ModernTopNavbar";
import { UploadIngestionView } from "@/components/views/UploadIngestionView";
import { ExecutiveDecisionView } from "@/components/views/ExecutiveDecisionView";
import { TopUseCasesView } from "@/components/views/TopUseCasesView";
import { BigQueryGraphView } from "@/components/views/BigQueryGraphView";
import { IntelligentChatView } from "@/components/views/IntelligentChatView";
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
Patrimônio de dados auditado com 3.293 tabelas no Google BigQuery, governança Knowledge Catalog e grafo de conhecimento relacional.`
};

import { getCustomerUseCases } from "@/lib/data/customer-usecases-catalog";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const defaultTopUseCases: TopUseCase[] = getCustomerUseCases("Hypera Pharma");

export default function HomePage() {
  // Ajuste 4: A tela "Assessment de Negócio" é a PRIMEIRA tela por padrão!
  const [activeTab, setActiveTab] = useState<ModernNavTab>("upload");
  const [assessment, setAssessment] = useState<CustomerAssessment | null>(null);
  const [tables, setTables] = useState<TableCatalogItem[]>([]);
  const [turns, setTurns] = useState<NeuroDebateTurn[]>([]);
  const [topUseCases, setTopUseCases] = useState<TopUseCase[]>([]);
  const [salienceMatrix, setSalienceMatrix] = useState<SalienceItem[]>([]);
  const [auditTargets, setAuditTargets] = useState<AuditTarget[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [decisionSubTab, setDecisionSubTab] = useState<"cockpit" | "debate">("cockpit");
  const [autoStartDebate, setAutoStartDebate] = useState(false);
  // Ajuste 3: Debate interno habilitado após assessment
  const [hasExecutedAssessment, setHasExecutedAssessment] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);

  const handleDetailCaseWithGemini = (useCase: TopUseCase) => {
    const clientReturn = useCase.businessCaseRoi || `Retorno anual de ~$${Number(useCase.financialGainEstimateUsd || 0).toLocaleString()}`;
    const gcpCost = `~$${Number((useCase.gcpMonthlyCostUsd || 0) * 12).toLocaleString()}/ano ($${Number(useCase.gcpMonthlyCostUsd || 0).toLocaleString()}/mês)`;
    
    const prompt = `Por favor, faça um detalhamento analítico aprofundado do Caso de Uso: "${useCase.title}" (${useCase.category}).

• Problema de Negócio: ${useCase.businessProblem}
• Solução Proposta: ${useCase.solutionDescription}
• Retorno Financeiro Estimado: ${clientReturn}
• Custo de Nuvem GCP Estimado: ${gcpCost}
• Tabelas Requeridas no BigQuery: ${useCase.requiredTables?.join(", ") || "N/A"}
• Guardrails & Governança: ${useCase.guardrails}

Como este caso de uso se conecta aos objetivos estratégicos de ${assessment?.customerName || "nosso cliente"}? Apresente a consulta ISO GQL ou SQL para validação no Grafo Corporativo (enterprise_business_graph), demonstre a comparação entre Retorno do Cliente vs Consumo GCP e os mecanismos de governança do Knowledge Catalog.`;

    setChatInitialPrompt(prompt);
    setActiveTab("chat");
  };

  // Carrega assessment do BigQuery caso disponível (ou inicia vazio para novo teste)
  useEffect(() => {
    async function loadInitialData() {
      try {
        const custRes = await fetch("/api/customers");
        const custJson = await custRes.json();
        if (custJson.customers && custJson.customers.length > 0) {
          const latest = custJson.customers[0];
          setAssessment({
            assessmentId: latest.assessmentId || latest.id,
            customerId: latest.customerId || latest.id,
            customerName: latest.name,
            industry: latest.industry,
            uploadTimestamp: latest.uploadTimestamp,
            totalDatasets: 24,
            totalTables: latest.totalTables,
            totalViews: 0,
            totalColumns: latest.totalColumns,
            documentedColumns: Math.round(latest.totalColumns * (latest.docPercentage / 100)),
            docPercentage: latest.docPercentage,
            gcsArchiveUri: latest.gcsArchiveUri || ""
          });
          const casesRes = await fetch(`/api/bigquery/graph?customerName=${encodeURIComponent(latest.name)}`);
          const casesJson = await casesRes.json();
          if (casesJson.topTablesSample && casesJson.topTablesSample.length > 0) {
            setTables(casesJson.topTablesSample);
          }
        }
      } catch (err) {
        console.warn("Notice: Base pronta para novo assessment.", err);
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
    setHasExecutedAssessment(true);
    setAutoStartDebate(true);
    setDecisionSubTab("debate");
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
    setAutoStartDebate(false);
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
      assessmentId: cust.assessmentId || cust.id,
      customerId: cust.customerId || prev?.customerId || cust.id,
      customerName: cust.name,
      industry: cust.industry,
      uploadTimestamp: cust.uploadTimestamp,
      totalTables: cust.totalTables,
      totalColumns: cust.totalColumns,
      docPercentage: cust.docPercentage,
      gcsArchiveUri: cust.gcsArchiveUri || prev?.gcsArchiveUri || ""
    }));
    const newCases = getCustomerUseCases(cust.name);
    setTopUseCases(newCases);
    setHasExecutedAssessment(true);
    setDecisionSubTab("cockpit");
    setActiveTab("decision");
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans antialiased flex flex-col">
        {/* Barra de Navegação Superior ModoUI */}
        <ModernTopNavbar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          customerName={assessment?.customerName || "Novo Assessment"}
          industry={assessment?.industry || "Aguardando Ingestão"}
          uploadTimestamp={assessment?.uploadTimestamp}
          totalTables={assessment?.totalTables || 0}
          docPercentage={assessment?.docPercentage || 0}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onNavigateToUpload={() => {
            setActiveTab("upload");
          }}
          onSelectCustomer={handleSelectCustomer}
          onSearchSubmit={(q) => {
            console.log("Busca executiva:", q);
          }}
          casesCount={topUseCases.length || 6}
        />

        {/* Conteúdo Principal com Largura Fluida e Generosa */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Aba Assessment de Negócio */}
          {activeTab === "upload" && (
            <UploadIngestionView
              assessment={assessment}
              onAssessmentLoaded={handleAssessmentLoaded}
              onNavigateToDashboard={() => {
                setDecisionSubTab("cockpit");
                setActiveTab("decision");
              }}
              onNavigateToCases={() => setActiveTab("cases")}
            />
          )}

          {/* Aba Visão Executiva ModoUI (Contém Sub-abas Cockpit e Debate Multi-Agente) */}
          {activeTab === "decision" && (
            <ExecutiveDecisionView
              assessment={assessment}
              topUseCases={topUseCases}
              tables={tables}
              turns={turns}
              salienceMatrix={salienceMatrix}
              auditTargets={auditTargets}
              autoStartDebate={autoStartDebate}
              onDebateComplete={handleDebateComplete}
              initialSubTab={decisionSubTab}
              onTriggerDebate={() => {
                setHasExecutedAssessment(true);
                setAutoStartDebate(true);
                setDecisionSubTab("debate");
              }}
              onNavigateToTab={(tab) => {
                if (tab === "debate") {
                  setDecisionSubTab("debate");
                  setActiveTab("decision");
                } else {
                  setActiveTab(tab as ModernNavTab);
                }
              }}
              onNavigateToUpload={() => setActiveTab("upload")}
            />
          )}

          {/* Aba Casos de Uso */}
          {activeTab === "cases" && (
            <TopUseCasesView
              useCases={topUseCases}
              assessment={assessment}
              onDetailCaseWithGemini={handleDetailCaseWithGemini}
            />
          )}

          {/* Aba Data Agent BQ */}
          {activeTab === "chat" && (
            <IntelligentChatView
              assessment={assessment}
              initialPrompt={chatInitialPrompt}
              onClearInitialPrompt={() => setChatInitialPrompt(null)}
            />
          )}
        </main>
      </div>
    </LanguageProvider>
  );
}
