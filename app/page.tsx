// app/page.tsx - Painel Central do Business Assessment Cockpit
"use client";

import React, { useState } from "react";
import { ControlTowerHeader } from "@/components/ControlTowerHeader";
import { ControlTowerSidebar, ActiveTab } from "@/components/ControlTowerSidebar";
import { UploadIngestionView } from "@/components/views/UploadIngestionView";
import { NeuroDebateView } from "@/components/views/NeuroDebateView";
import { TopUseCasesView } from "@/components/views/TopUseCasesView";
import { BigQueryGraphView } from "@/components/views/BigQueryGraphView";
import { IntelligentChatView } from "@/components/views/IntelligentChatView";
import { EmptyState } from "@/components/ui/EmptyState";
import { CustomerAssessment, TableCatalogItem, TopUseCase, NeuroDebateTurn, SalienceItem, AuditTarget } from "@/lib/types";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");
  const [assessment, setAssessment] = useState<CustomerAssessment | null>(null);
  const [tables, setTables] = useState<TableCatalogItem[]>([]);
  const [turns, setTurns] = useState<NeuroDebateTurn[]>([]);
  const [topUseCases, setTopUseCases] = useState<TopUseCase[]>([]);
  const [salienceMatrix, setSalienceMatrix] = useState<SalienceItem[]>([]);
  const [auditTargets, setAuditTargets] = useState<AuditTarget[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAssessmentLoaded = (loadedAssessment: CustomerAssessment, loadedTables: TableCatalogItem[]) => {
    setAssessment(loadedAssessment);
    setTables(loadedTables);
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
    setActiveTab("cases");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/bigquery/graph");
      await res.json();
    } catch (e) {
      console.warn("Erro ao atualizar dados:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* 1. Header Executivo Fixo */}
      <ControlTowerHeader
        customerName={assessment?.customerName || ""}
        industry={assessment?.industry}
        totalTables={assessment?.totalTables}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Conteúdo Principal com Sidebar Responsiva */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar / Menu de Abas */}
          <div className="lg:col-span-3 sticky top-24">
            <ControlTowerSidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              hasAssessment={!!assessment}
              hasUseCases={topUseCases.length > 0}
              topCasesCount={topUseCases.length}
            />
          </div>

          {/* Área de Visualização Principal */}
          <main className="lg:col-span-9">
            {activeTab === "upload" && (
              <UploadIngestionView
                assessment={assessment}
                onAssessmentLoaded={handleAssessmentLoaded}
                onNavigateToDebate={() => setActiveTab("debate")}
              />
            )}

            {activeTab === "debate" && (
              assessment ? (
                <NeuroDebateView
                  assessment={assessment}
                  tables={tables}
                  turns={turns}
                  topUseCases={topUseCases}
                  salienceMatrix={salienceMatrix}
                  auditTargets={auditTargets}
                  onDebateComplete={handleDebateComplete}
                  onNavigateToCases={() => setActiveTab("cases")}
                />
              ) : (
                <EmptyState
                  title="Assessment ainda não carregado"
                  description="Para orquestrar o debate multi-agente NC-MAD, primeiro faça o upload do arquivo ZIP do assessment ou selecione o exemplo local."
                  actionLabel="Ir para Ingestão & Upload"
                  onAction={() => setActiveTab("upload")}
                  icon="database"
                />
              )
            )}

            {activeTab === "cases" && (
              topUseCases.length > 0 ? (
                <TopUseCasesView
                  useCases={topUseCases}
                  assessment={assessment}
                  onNavigateToGraph={() => setActiveTab("graph")}
                />
              ) : (
                <EmptyState
                  title="Nenhum Caso de Uso gerado ainda"
                  description="Execute o debate neurocognitivo das personas para priorizar os Top 6 casos de uso com cálculo de ROI e custos em GCP."
                  actionLabel={assessment ? "Iniciar Debate das Personas" : "Carregar Assessment"}
                  onAction={() => setActiveTab(assessment ? "debate" : "upload")}
                  icon="ai"
                />
              )
            )}

            {activeTab === "graph" && (
              <BigQueryGraphView />
            )}

            {activeTab === "chat" && (
              <IntelligentChatView assessment={assessment} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
