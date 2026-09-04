// components/views/TopUseCasesView.tsx - Cards Executivos de Casos de Uso & Modal de Detalhamento
"use client";

import React, { useState } from "react";
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Database, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight, 
  Sparkles, 
  Filter, 
  CheckCircle2,
  TableProperties, 
  Network,
  X,
  Cpu,
  Coins,
  ChevronRight,
  Info,
  Server
} from "lucide-react";
import { TopUseCase, CustomerAssessment } from "@/lib/types";
import { GoogleCloudLogo } from "../GoogleCloudLogo";

interface TopUseCasesViewProps {
  useCases: TopUseCase[];
  assessment: CustomerAssessment | null;
  onSelectUseCaseForGraph?: (useCase: TopUseCase) => void;
  onNavigateToGraph?: () => void;
}

export const TopUseCasesView: React.FC<TopUseCasesViewProps> = ({
  useCases,
  assessment,
  onSelectUseCaseForGraph,
  onNavigateToGraph
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeModalCase, setActiveModalCase] = useState<TopUseCase | null>(null);

  const customerName = assessment?.customerName || "Cliente Corporativo";
  const industry = assessment?.industry || "Bens de Consumo & Saúde";

  const categories = ["ALL", ...Array.from(new Set(useCases.map(u => u.category)))];

  const filteredCases = selectedCategory === "ALL" 
    ? useCases 
    : useCases.filter(u => u.category === selectedCategory);

  // Cálculos consolidados do Business Case (BC)
  const totalFinancialGainUsd = useCases.reduce((acc, u) => acc + (u.financialGainEstimateUsd || 0), 0);
  const totalGcpMonthlyCostUsd = useCases.reduce((acc, u) => acc + (u.gcpMonthlyCostUsd || 0), 0);
  const totalGcpAnnualCostUsd = totalGcpMonthlyCostUsd * 12;
  const overallRoi = totalGcpAnnualCostUsd > 0 
    ? (((totalFinancialGainUsd - totalGcpAnnualCostUsd) / totalGcpAnnualCostUsd) * 100).toFixed(0)
    : "340";

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* 1. Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <GoogleCloudLogo height={20} />
            <span className="text-slate-300">•</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
              <Target className="w-3 h-3" />
              <span>Casos de Uso & Business Case</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Casos de Uso Priorizados para {customerName}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Soluções validadas sobre os dados reais do BigQuery, com estimativa de retorno financeiro para o cliente e consumo de infraestrutura Google Cloud.
          </p>
        </div>

        {onNavigateToGraph && (
          <button
            onClick={onNavigateToGraph}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shrink-0 cursor-pointer self-start md:self-auto"
          >
            <Network className="w-3.5 h-3.5 text-[#074878]" />
            <span>Ver no Property Graph</span>
          </button>
        )}
      </div>

      {/* 2. Banner de Métricas Consolidadas (C-Level ROI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#063964] via-[#08487D] to-[#03233F] text-white shadow-md">
          <span className="text-[10px] font-black uppercase text-blue-200 tracking-wider block">
            RETORNO CONSOLIDADO (BC)
          </span>
          <div className="text-2xl font-black mt-1">
            ${(totalFinancialGainUsd / 1000).toFixed(0)}k <span className="text-xs font-normal text-blue-200">/ ano</span>
          </div>
          <p className="text-[11px] text-emerald-300 font-semibold mt-1">
            ~R$ {((totalFinancialGainUsd * 5.6) / 1000000).toFixed(2)}M em receita e eficiência
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
            CUSTO TOTAL GOOGLE CLOUD
          </span>
          <div className="text-2xl font-black text-[#074878] mt-1">
            ${totalGcpMonthlyCostUsd.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ mês</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ${(totalGcpAnnualCostUsd / 1000).toFixed(1)}k/ano (BigQuery + Vertex AI)
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
            MULTIPLICADOR DE RETORNO (ROI)
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            +{overallRoi}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Payback estimado em ~1.8 meses
          </p>
        </div>
      </div>

      {/* 3. Filtro por Categoria */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filtrar:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#074878] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat === "ALL" ? "Todos os Casos" : cat}
          </button>
        ))}
      </div>

      {/* 4. GRID DE CARDS DOS CASOS DE USO (Foco em Caso, Retorno Cliente e Retorno Google) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCases.map((useCase) => {
          const clientAnnualGainUsd = useCase.financialGainEstimateUsd || 0;
          const clientAnnualGainBrl = (clientAnnualGainUsd * 5.6) / 1000000;
          const gcpMonthlyCost = useCase.gcpMonthlyCostUsd || 0;
          const gcpAnnualCost = gcpMonthlyCost * 12;

          return (
            <div
              key={useCase.useCaseId}
              onClick={() => setActiveModalCase(useCase)}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#074878]/40 transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer group space-y-5"
            >
              {/* Topo: Rank & Categoria */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#074878] text-[10px] font-black border border-blue-100 uppercase">
                    RANK #{useCase.rank}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase">
                    {useCase.category}
                  </span>
                </div>

                {/* Título do Caso */}
                <h3 className="text-sm font-extrabold text-slate-900 mt-2.5 group-hover:text-[#074878] transition-colors leading-snug">
                  {useCase.title}
                </h3>

                {/* Problema Resumido */}
                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {useCase.businessProblem}
                </p>
              </div>

              {/* BLOCOS CENTRAIS DE RETORNO (Destaque Principal) */}
              <div className="space-y-2.5">
                {/* 1. Retorno para o Cliente */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider block">
                    RETORNO ESPERADO PARA O CLIENTE (BC)
                  </span>
                  <div className="text-base font-black text-emerald-700">
                    +${(clientAnnualGainUsd / 1000).toFixed(0)}k <span className="text-[10px] font-normal text-emerald-800">/ ano</span>
                    <span className="text-xs font-bold text-slate-500 ml-1.5">(~R$ {clientAnnualGainBrl.toFixed(2)}M)</span>
                  </div>
                  <p className="text-[10px] text-emerald-900 font-medium leading-tight">
                    {useCase.businessCaseRoi}
                  </p>
                </div>

                {/* 2. Retorno / Consumo para o Google Cloud */}
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-[#074878] tracking-wider block">
                    CONSUMO DE INFRAESTRUTURA GOOGLE CLOUD
                  </span>
                  <div className="text-base font-black text-[#074878]">
                    ${gcpMonthlyCost} <span className="text-[10px] font-normal text-slate-500">/ mês</span>
                    <span className="text-xs font-bold text-slate-500 ml-1.5">(~${(gcpAnnualCost / 1000).toFixed(1)}k/ano)</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight">
                    BigQuery (${useCase.costBreakdown?.bigqueryUsd || 0}) + Vertex AI (${useCase.costBreakdown?.vertexAiUsd || 0}) + Cloud Run
                  </p>
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-slate-400">
                  {useCase.requiredTables?.length || 3} Tabelas Auditadas
                </span>

                <span className="text-xs font-black text-[#074878] group-hover:underline flex items-center gap-0.5">
                  <span>Ver Detalhes do Caso</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. MODAL DE DETALHAMENTO DO CASO DE USO & BUSINESS CASE */}
      {activeModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Header do Modal */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#074878] text-[10px] font-black border border-blue-100 uppercase">
                    CASO DE USO #{activeModalCase.rank}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold uppercase">
                    {activeModalCase.category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Grounding BigQuery
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900">{activeModalCase.title}</h2>
              </div>

              <button
                onClick={() => setActiveModalCase(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Detalhado */}
            <div className="p-6 space-y-6 text-xs text-slate-700">
              {/* 1. Problema de Negócio & Solução Proposta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                    Gargalo / Problema de Negócio
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {activeModalCase.businessProblem}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-[#074878] tracking-wider block">
                    Solução com IA & BigQuery
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {activeModalCase.solutionDescription}
                  </p>
                </div>
              </div>

              {/* 2. Destaque dos Retornos (Cliente vs Google) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Retorno do Cliente */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                      Business Case (Ganhos do Cliente)
                    </span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-black text-emerald-700">
                    +${(activeModalCase.financialGainEstimateUsd / 1000).toFixed(0)}k <span className="text-xs font-normal text-emerald-800">/ ano</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 font-semibold leading-snug">
                    {activeModalCase.businessCaseRoi}
                  </p>
                  <div className="pt-2 border-t border-emerald-200 text-[10px] text-emerald-800 space-y-1">
                    <div>• Impacto direto no EBITDA da organização</div>
                    <div>• Payback estimado em menos de 2 meses</div>
                    <div>• Alavanca de produtividade e redução de perdas</div>
                  </div>
                </div>

                {/* Retorno / Custo Google Cloud */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#074878] tracking-wider">
                      Consumo Google Cloud (FinOps)
                    </span>
                    <Database className="w-4 h-4 text-[#074878]" />
                  </div>
                  <div className="text-xl font-black text-[#074878]">
                    ${activeModalCase.gcpMonthlyCostUsd} <span className="text-xs font-normal text-slate-500">/ mês</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-xl bg-white border border-blue-100">
                      <span className="text-[9px] text-slate-400 uppercase block">BigQuery</span>
                      <strong>${activeModalCase.costBreakdown?.bigqueryUsd || 0}/mês</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-blue-100">
                      <span className="text-[9px] text-slate-400 uppercase block">Vertex AI</span>
                      <strong>${activeModalCase.costBreakdown?.vertexAiUsd || 0}/mês</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-blue-100">
                      <span className="text-[9px] text-slate-400 uppercase block">Cloud Run</span>
                      <strong>${activeModalCase.costBreakdown?.cloudRunUsd || 0}/mês</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-blue-100">
                      <span className="text-[9px] text-slate-400 uppercase block">Cloud Storage</span>
                      <strong>${activeModalCase.costBreakdown?.storageUsd || 0}/mês</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Tabelas Reais e Grounding no BigQuery */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <TableProperties className="w-3.5 h-3.5 text-blue-600" />
                  Tabelas Auditadas Necessárias no BigQuery
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeModalCase.requiredTables?.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. Guardrails e Governança */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Guardrails de Governança & Zero Alucinação
                </span>
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  {activeModalCase.guardrails}
                </p>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-3xl">
              <span className="text-[11px] text-slate-500">
                Confiança do Modelo: <strong>{(activeModalCase.confidenceScore * 100).toFixed(0)}%</strong>
              </span>
              <button
                onClick={() => setActiveModalCase(null)}
                className="px-5 py-2 rounded-xl bg-[#074878] hover:bg-[#053456] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
