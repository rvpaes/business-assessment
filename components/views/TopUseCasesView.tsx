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
  X,
  Cpu,
  Coins,
  ChevronRight,
  Info,
  Server,
  Workflow,
  ArrowRight,
  Lock,
  FileCode,
  Bot,
  Presentation,
  Zap,
  Award,
  Check,
  Users
} from "lucide-react";
import { TopUseCase, CustomerAssessment } from "@/lib/types";
import { GoogleCloudLogo, GoogleCloudIcon } from "../GoogleCloudLogo";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getSimilarGoogleCloudCustomerStories } from "@/lib/gcp/customer-stories";
import { UseCaseTerraformModal } from "./UseCaseTerraformModal";
import { ExecutiveRoundTableTab } from "./ExecutiveRoundTableTab";
import { formatCurrencyUsd, formatCurrencyBrl, formatPercent, formatDecimal } from "@/lib/utils/formatters";

interface TopUseCasesViewProps {
  useCases: TopUseCase[];
  assessment: CustomerAssessment | null;
  onDetailCaseWithGemini?: (useCase: TopUseCase) => void;
}

export const TopUseCasesView: React.FC<TopUseCasesViewProps> = ({
  useCases,
  assessment,
  onDetailCaseWithGemini
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeModalCase, setActiveModalCase] = useState<TopUseCase | null>(null);
  const [modalTab, setModalTab] = useState<"overview" | "architecture" | "roundtable">("overview");
  const [terraformModalCase, setTerraformModalCase] = useState<TopUseCase | null>(null);

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
              <span>{t("tabCases")}</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {t("useCasesTitle")} {customerName}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {t("useCasesSubtitle")}
          </p>
        </div>
      </div>

      {/* 2. Banner de Métricas Consolidadas (ModoUI Clean Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Retorno Consolidado Cliente */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl sm:text-[28px] font-black text-slate-900 tabular-nums">
                {formatCurrencyUsd(totalFinancialGainUsd, { compact: true, showSign: true, decimals: 2 })} <span className="text-xs font-normal text-slate-400">/ ano</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                ~{formatCurrencyBrl(totalFinancialGainUsd * 5.6, { compact: true, decimals: 2 })} em receita e eficiência
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-emerald-200 text-emerald-700 bg-emerald-50">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+{overallRoi}% ROI</span>
            </span>
          </div>
          <div className="pt-3 mt-4 border-t border-slate-100">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              {t("consolidatedReturn") || "Retorno Consolidado"}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Impacto econômico validado nos {useCases.length} casos
            </p>
          </div>
        </div>

        {/* Card 2: Consumo Google Cloud */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl sm:text-[28px] font-black text-[#074878] tabular-nums">
                {formatCurrencyUsd(totalGcpMonthlyCostUsd, { decimals: 2 })} <span className="text-xs font-normal text-slate-400">/ mês</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {formatCurrencyUsd(totalGcpAnnualCostUsd, { compact: true, decimals: 2 })}/ano (BigQuery + Agent Platform)
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-blue-200 text-[#074878] bg-blue-50">
              <Zap className="w-3 h-3 text-[#074878]" />
              <span>Serverless</span>
            </span>
          </div>
          <div className="pt-3 mt-4 border-t border-slate-100">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              {t("gcpCost") || "Consumo Google Cloud"}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Infraestrutura de alta performance auto-sustentável
            </p>
          </div>
        </div>

        {/* Card 3: Payback & Multiplicador */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl sm:text-[28px] font-black text-emerald-600 tabular-nums">
                +{overallRoi}%
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Payback estimado em ~1,8 meses
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-purple-200 text-purple-700 bg-purple-50">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Fast-Track</span>
            </span>
          </div>
          <div className="pt-3 mt-4 border-t border-slate-100">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              {t("overallRoi") || "Multiplicador de Retorno"}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Para cada $1 investido em GCP, o cliente captura retorno superior
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filtro por Categoria (Segmented Control Pill ModoUI) */}
      <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200/60 shadow-inner-xs flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            {cat === "ALL" ? t("filterAll") : cat}
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
              onClick={() => {
                setActiveModalCase(useCase);
                setModalTab("overview");
              }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#074878]/40 transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer group space-y-5"
            >
              {/* Topo: Rank & Categoria */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#074878] text-[10px] font-black border border-blue-100 uppercase">
                    RANK {useCase.rank}
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
                    {formatCurrencyUsd(clientAnnualGainUsd, { compact: true, showSign: true, decimals: 2 })} <span className="text-[10px] font-normal text-emerald-800">/ ano</span>
                    <span className="text-xs font-bold text-slate-500 ml-1.5">(~{formatCurrencyBrl(clientAnnualGainUsd * 5.6, { compact: true, decimals: 2 })})</span>
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
                    {formatCurrencyUsd(gcpMonthlyCost, { decimals: 2 })} <span className="text-[10px] font-normal text-slate-500">/ mês</span>
                    <span className="text-xs font-bold text-slate-500 ml-1.5">(~{formatCurrencyUsd(gcpAnnualCost, { compact: true, decimals: 2 })}/ano)</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight">
                    BigQuery ({formatCurrencyUsd(useCase.costBreakdown?.bigqueryUsd || 0, { decimals: 2 })}) + Agent Platform ({formatCurrencyUsd(useCase.costBreakdown?.vertexAiUsd || 0, { decimals: 2 })}) + Cloud Run
                  </p>
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTerraformModalCase(useCase);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-105"
                    title="Gerar Pipeline Terraform (Multi-Engine BigQuery Studio & Knowledge Catalog)"
                  >
                    <Cpu className="w-3.5 h-3.5 text-purple-600" />
                    <span>Pipeline Terraform</span>
                  </button>

                  {onDetailCaseWithGemini && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDetailCaseWithGemini(useCase);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-105"
                      title="Detalhar case com o Gemini no BigQuery Data Agent"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Detalhar com Gemini</span>
                    </button>
                  )}
                </div>

                <span className="text-xs font-black text-[#074878] group-hover:underline flex items-center gap-0.5 shrink-0">
                  <span>Ver Detalhes</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. MODAL DE DETALHAMENTO DO CASO DE USO & BUSINESS CASE */}
      {activeModalCase && (() => {
        const similarStories = getSimilarGoogleCloudCustomerStories(activeModalCase, industry);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
            <div className="bg-white rounded-3xl max-w-5xl lg:max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
              {/* Header do Modal */}
              <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-blue-50 text-[#074878] text-xs font-black border border-blue-100 uppercase tracking-wide">
                        CASO DE USO {activeModalCase.rank}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wide">
                        {activeModalCase.category}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold uppercase flex items-center gap-1.5 tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Grounding BigQuery
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                      {activeModalCase.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setActiveModalCase(null)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-4"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Sub-abas de Navegação no Modal (Responsivas) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setModalTab("overview")}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto text-center ${
                      modalTab === "overview"
                        ? "bg-[#074878] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Target className="w-3.5 h-3.5 shrink-0" />
                    <span>Visão Geral & Retorno de Negócio (ROI)</span>
                  </button>
                  <button
                    onClick={() => setModalTab("architecture")}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto text-center ${
                      modalTab === "architecture"
                        ? "bg-[#074878] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>Arquitetura da Solução & Playbook do Vendedor</span>
                  </button>
                  <button
                    onClick={() => setModalTab("roundtable")}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto text-center ${
                      modalTab === "roundtable"
                        ? "bg-[#074878] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>Mesa Redonda Executiva (ADK Board)</span>
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-4 sm:p-6 lg:p-8 text-slate-700">
                {modalTab === "overview" && (
                  <div className="space-y-6">
                    {/* 1. Problema de Negócio & Solução Proposta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">
                          {t("bottleneckLabel")}
                        </span>
                        <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed font-medium">
                          {activeModalCase.businessProblem}
                        </p>
                      </div>

                      <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                        <span className="text-xs font-black uppercase text-[#074878] tracking-wider block">
                          {t("solutionLabel")}
                        </span>
                        <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed font-medium">
                          {activeModalCase.solutionDescription}
                        </p>
                      </div>
                    </div>

                    {/* 2. Destaque dos Retornos (Cliente vs Google) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Retorno do Cliente */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                            {t("clientGainsLabel")}
                          </span>
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                          {formatCurrencyUsd(activeModalCase.financialGainEstimateUsd, { compact: true, showSign: true, decimals: 2 })} <span className="text-sm font-normal text-emerald-800">/ ano</span>
                        </div>
                        <div className="text-xs text-emerald-900 font-bold -mt-1">
                          ({formatCurrencyUsd(activeModalCase.financialGainEstimateUsd, { decimals: 2 })}/ano • ~{formatCurrencyBrl(activeModalCase.financialGainEstimateUsd * 5.6, { compact: true, decimals: 2 })})
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-950 font-semibold leading-relaxed">
                          {activeModalCase.businessCaseRoi}
                        </p>
                        <div className="pt-3 border-t border-emerald-200 text-xs text-emerald-800 space-y-1.5 font-medium">
                          <div>• Impacto direto no EBITDA e margem de contribuição da organização</div>
                          <div>• Payback estimado em menos de 2 meses</div>
                          <div>• Alavanca comprovada de produtividade e redução de perdas</div>
                        </div>
                      </div>

                      {/* Retorno / Custo Google Cloud */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-[#074878] tracking-wider">
                            {t("gcpConsumptionLabel")}
                          </span>
                          <GoogleCloudIcon size={24} />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-[#074878]">
                          {formatCurrencyUsd(activeModalCase.gcpMonthlyCostUsd, { decimals: 2 })} <span className="text-sm font-normal text-slate-500">/ mês</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">BigQuery</span>
                            <strong className="text-sm font-extrabold text-slate-800">{formatCurrencyUsd(activeModalCase.costBreakdown?.bigqueryUsd || 0, { decimals: 2 })}/mês</strong>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Agent Platform</span>
                            <strong className="text-sm font-extrabold text-slate-800">{formatCurrencyUsd(activeModalCase.costBreakdown?.vertexAiUsd || 0, { decimals: 2 })}/mês</strong>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Cloud Run</span>
                            <strong className="text-sm font-extrabold text-slate-800">{formatCurrencyUsd(activeModalCase.costBreakdown?.cloudRunUsd || 0, { decimals: 2 })}/mês</strong>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Cloud Storage</span>
                            <strong className="text-sm font-extrabold text-slate-800">{formatCurrencyUsd(activeModalCase.costBreakdown?.storageUsd || 0, { decimals: 2 })}/mês</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Tabelas Reais e Grounding no BigQuery */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                        <TableProperties className="w-4 h-4 text-blue-600" />
                        {t("requiredTablesLabel")}
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {activeModalCase.requiredTables?.map((tName, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-800 shadow-2xs"
                          >
                            {tName}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 4. Guardrails e Governança */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                      <span className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        {t("guardrailsLabel")}
                      </span>
                      <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                        {activeModalCase.guardrails}
                      </p>
                    </div>

                    {/* 5. Casos de Sucesso Similares no Google Cloud */}
                    {similarStories.length > 0 && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white border border-blue-200/90 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <GoogleCloudLogo height={18} />
                            <span className="text-xs font-black uppercase text-[#074878] tracking-wider">
                              {t("similarCasesHeader")}
                            </span>
                          </div>
                          <a
                            href="https://cloud.google.com/customers?hl=pt-BR"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#074878] hover:underline flex items-center gap-1 shrink-0"
                          >
                            <span>cloud.google.com/customers</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <p className="text-xs sm:text-[13px] text-slate-600 leading-snug">
                          {t("similarCasesSubtitle")}{" "}
                          <a
                            href="https://cloud.google.com/customers?hl=pt-BR"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#074878] underline"
                          >
                            cloud.google.com/customers?hl=pt-BR
                          </a>:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {similarStories.map((story) => (
                            <div
                              key={story.id}
                              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#074878]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-black text-sm text-slate-900">
                                    {story.customerName}
                                  </span>
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                    {story.country}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-[#074878] mt-1 line-clamp-1">
                                  {story.headline}
                                </p>
                                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3 font-normal">
                                  {story.summary}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <div className="flex flex-wrap gap-1">
                                  {story.products.slice(0, 3).map((prod, pIdx) => (
                                    <span
                                      key={pIdx}
                                      className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-[#074878]"
                                    >
                                      {prod}
                                    </span>
                                  ))}
                                </div>
                                <a
                                  href={story.storyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-[#074878] hover:text-[#053456] shrink-0"
                                >
                                  <span>{t("readFullStory")}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* ABA 2: ARQUITETURA DA SOLUÇÃO & PLAYBOOK DO VENDEDOR GOOGLE CLOUD        */}
                {/* ========================================================================= */}
                {modalTab === "architecture" && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    {/* Banner Topo da Arquitetura */}
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-[#063964] via-[#08487D] to-[#20104e] text-white shadow-md space-y-2">
                      <div className="flex items-center gap-2">
                        <GoogleCloudLogo height={20} textColor="white" />
                        <span className="text-blue-200 text-xs font-semibold">•</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-400/20 border border-blue-300/30 text-blue-200 text-[10px] font-black uppercase tracking-wider">
                          Enterprise Reference Architecture
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black">
                        Blueprint Arquitetural: BigQuery Studio + Agent Platform Gemini 3.8 Flash + Knowledge Catalog
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-100/90 max-w-3xl leading-relaxed">
                        Desenho técnico e funcional da solução corporativa desenhado para habilitar o caso de negócio <strong>&quot;{activeModalCase.title}&quot;</strong> com pipelines multi-engine nativos, grounding analítico sem alucinação e governança automatizada.
                      </p>
                    </div>

                    {/* SEÇÃO 1: DESENHO DA SOLUÇÃO (FLUXO ARQUITETURAL VISUAL) */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#074878]">
                            <Workflow className="w-4 h-4" />
                            <span>Desenho da Solução: Fluxo Arquitetural Ponta a Ponta</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Diagrama de fluxo de dados, pipelines e inteligência para suporte à reunião com o cliente
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl shrink-0 self-start sm:self-auto">
                          6 Estágios Integrados
                        </span>
                      </div>

                      {/* Grid de 6 Estágios Arquiteturais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Estágio 1 */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#074878]/40 hover:shadow-md transition-all space-y-3 relative flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#074878] font-black text-xs flex items-center justify-center border border-blue-200">
                                1
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                Ingestão & Staging
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mt-2.5 flex items-center gap-1.5">
                              <Database className="w-4 h-4 text-blue-600 shrink-0" />
                              Fontes & Cloud Storage
                            </h4>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              Conectores contínuos para ERP (SAP/Salesforce), PDV de lojas, telemetria e bases legadas do Databricks. Ingestão via Cloud Storage (GCS) Staging + BigQuery DTS.
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                            <span className="text-[#074878] font-bold">• Destaque:</span> Zero Ingestion Delay, criptografia CMEK e isolamento por tenant.
                          </div>
                        </div>

                        {/* Estágio 2 */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#074878]/40 hover:shadow-md transition-all space-y-3 relative flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center border border-emerald-200">
                                2
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                                Gold Lakehouse
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mt-2.5 flex items-center gap-1.5">
                              <TableProperties className="w-4 h-4 text-emerald-600 shrink-0" />
                              BigQuery Curado & Otimizado
                            </h4>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              Tabelas curadas ({activeModalCase.requiredTables?.slice(0, 2).join(", ") || "gold_tables"}) com particionamento diário e clusterização por chaves analíticas.
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                            <span className="text-emerald-700 font-bold">• Destaque:</span> PKs & FKs lógicas aceleram o otimizador CBO do BigQuery.
                          </div>
                        </div>

                        {/* Estágio 3 */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#074878]/40 hover:shadow-md transition-all space-y-3 relative flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 font-black text-xs flex items-center justify-center border border-purple-200">
                                3
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                                Multi-Engine
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mt-2.5 flex items-center gap-1.5">
                              <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
                              Pipelines BigQuery Studio
                            </h4>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              Combinação sob medida: <strong>SQLX</strong> para transformações declarativas, <strong>BigFrames</strong> para Python e <strong>PySpark Serverless</strong> para data prep massivo.
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                            <span className="text-purple-700 font-bold">• Destaque:</span> Zero gerenciamento de nós de máquinas virtuais ou clusters ociosos.
                          </div>
                        </div>

                        {/* Estágio 4 */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#074878]/40 hover:shadow-md transition-all space-y-3 relative flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-200">
                                4
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                Inteligência LLM
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mt-2.5 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                              Agent Platform Gemini 3.8 Flash
                            </h4>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              Raciocínio analítico avançado e Data Agents conversacionais com grounding estrito no schema do BigQuery. Integração nativa com Agent Platform e funções BQML <code>ML.GENERATE_TEXT</code>.
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                            <span className="text-indigo-700 font-bold">• Destaque:</span> Zero alucinação — respostas ancoradas em dados reais auditados.
                          </div>
                        </div>

                        {/* Estágio 5 */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#074878]/40 hover:shadow-md transition-all space-y-3 relative flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center border border-amber-200">
                                5
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                                Governança Ativa
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mt-2.5 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                              Knowledge Catalog
                            </h4>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              Data Profile scans automáticos, Data Insights gerados por IA e mascaramento dinâmico (Policy Tags RLS/CLS) para conformidade total com a LGPD.
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                            <span className="text-amber-700 font-bold">• Destaque:</span> Linhagem ponta a ponta (Data Lineage) automática no catálogo.
                          </div>
                        </div>

                        {/* Estágio 6 */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#074878]/40 hover:shadow-md transition-all space-y-3 relative flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="w-7 h-7 rounded-xl bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center border border-teal-200">
                                6
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                                Ação Executiva
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mt-2.5 flex items-center gap-1.5">
                              <Presentation className="w-4 h-4 text-teal-600 shrink-0" />
                              Consumo & Decisão C-Level
                            </h4>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              Cockpit Executivo no Cloud Run com streaming em tempo real, dashboards Looker Studio acelerados por BI Engine e alertas operacionais via Pub/Sub.
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                            <span className="text-teal-700 font-bold">• Destaque:</span> Tomada de decisão em minutos em vez de ciclos semanais manuais.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SEÇÃO 2: PLAYBOOK DO VENDEDOR GOOGLE CLOUD (SALES PITCH C-LEVEL) */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#074878]">
                        <Presentation className="w-4 h-4" />
                        <span>Playbook do Vendedor Google Cloud: Como Apresentar ao C-Level</span>
                      </div>

                      {/* A. Comparativo As-Is (Legado / Databricks) vs To-Be (Google Cloud) */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                        <span className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                          Comparativo Estratégico: O Problema Atual vs A Solução Google Cloud
                        </span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                                <th className="py-2 pr-4">Dimensão</th>
                                <th className="py-2 pr-4 text-rose-700">Cenário Atual (Databricks / On-Premise)</th>
                                <th className="py-2 text-[#074878]">Solução Google Cloud (To-Be)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70 text-slate-700">
                              <tr>
                                <td className="py-2.5 pr-4 font-bold text-slate-900">Infraestrutura & Custo</td>
                                <td className="py-2.5 pr-4 text-slate-600">Clusters com nós ociosos, tempo de boot de 8-10 min e custo elevado de DBUs.</td>
                                <td className="py-2.5 font-bold text-emerald-700">BigQuery Studio 100% Serverless. Paga estritamente pelo uso, sem nós ociosos.</td>
                              </tr>
                              <tr>
                                <td className="py-2.5 pr-4 font-bold text-slate-900">Silos de Tecnologia</td>
                                <td className="py-2.5 pr-4 text-slate-600">Analistas em SQL isolados de cientistas de dados em notebooks Spark.</td>
                                <td className="py-2.5 font-bold text-emerald-700">Plataforma unificada: SQLX, BigFrames (Python) e PySpark no mesmo ambiente.</td>
                              </tr>
                              <tr>
                                <td className="py-2.5 pr-4 font-bold text-slate-900">Inteligência & IA</td>
                                <td className="py-2.5 pr-4 text-slate-600">Modelos genéricos sem contexto corporativo, propensos a alucinação de métricas.</td>
                                <td className="py-2.5 font-bold text-emerald-700">Gemini 3.8 Flash com grounding no Knowledge Catalog e zero alucinação.</td>
                              </tr>
                              <tr>
                                <td className="py-2.5 pr-4 font-bold text-slate-900">Governança & LGPD</td>
                                 <td className="py-2.5 pr-4 text-slate-600">Catalogação manual, lentidão em auditorias e risco de vazamento de PII.</td>
                                <td className="py-2.5 font-bold text-emerald-700">Knowledge Catalog automático com Policy Tags e mascaramento dinâmico.</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* B. Três Argumentos Matadores de Venda */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                            Argumento 1: Payback Imediato
                          </span>
                          <h5 className="text-xs font-black text-emerald-950">
                            Retorno comprovado em menos de 2 meses
                          </h5>
                          <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                            &quot;Com ganho anual projetado de {formatCurrencyUsd(activeModalCase.financialGainEstimateUsd, { compact: true, showSign: true, decimals: 2 })}/ano e custo de nuvem de apenas {formatCurrencyUsd(activeModalCase.gcpMonthlyCostUsd, { decimals: 2 })}/mês, a iniciativa se autofinancia desde o primeiro trimestre.&quot;
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                          <span className="text-[10px] font-black uppercase text-[#074878] tracking-wider block">
                            Argumento 2: Soberania & Segurança
                          </span>
                          <h5 className="text-xs font-black text-slate-900">
                            Dados protegidos dentro do perímetro BigQuery
                          </h5>
                          <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                            &quot;O Gemini 3.8 Flash na Agent Platform opera diretamente nos dados governados pelo Knowledge Catalog, sem exportar informações para terceiros nem usar os dados do cliente para treinamento de modelos.&quot;
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                          <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block">
                            Argumento 3: Agilidade Operacional
                          </span>
                          <h5 className="text-xs font-black text-purple-950">
                            De meses para semanas via Terraform
                          </h5>
                          <p className="text-[11px] text-purple-900 leading-relaxed font-medium">
                            &quot;Toda a infraestrutura de dados e IA é entregue pronta em código Terraform modular, reduzindo o tempo de implementação piloto para apenas 6 semanas.&quot;
                          </p>
                        </div>
                      </div>

                      {/* C. Consumo Mensal e ARR para o Google Cloud */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                            Composição de Consumo Google Cloud (ARR Mensal & Anual)
                          </span>
                          <span className="text-xs font-extrabold text-[#074878]">
                            Total: {formatCurrencyUsd(activeModalCase.gcpMonthlyCostUsd, { decimals: 2 })}/mês (~{formatCurrencyUsd((activeModalCase.gcpMonthlyCostUsd || 0) * 12, { compact: true, decimals: 2 })}/ano)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">BigQuery Compute & Storage</span>
                            <span className="text-sm font-black text-slate-900">{formatCurrencyUsd(activeModalCase.costBreakdown?.bigqueryUsd || 0, { decimals: 2 })}/mês</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Agent Platform Gemini 3.8 Flash</span>
                            <span className="text-sm font-black text-slate-900">{formatCurrencyUsd(activeModalCase.costBreakdown?.vertexAiUsd || 0, { decimals: 2 })}/mês</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Cloud Run Cockpit</span>
                            <span className="text-sm font-black text-slate-900">{formatCurrencyUsd(activeModalCase.costBreakdown?.cloudRunUsd || 0, { decimals: 2 })}/mês</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Cloud Storage Staging</span>
                            <span className="text-sm font-black text-slate-900">{formatCurrencyUsd(activeModalCase.costBreakdown?.storageUsd || 0, { decimals: 2 })}/mês</span>
                          </div>
                        </div>
                      </div>

                      {/* D. Cronograma Piloto Fast-Track de 6 Semanas */}
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <span className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                          Roteiro de Implementação Piloto (Fast-Track 6 Semanas)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white border border-slate-200">
                            <span className="text-[10px] font-black text-[#074878] uppercase block">Semanas 1-2</span>
                            <strong className="text-slate-900 block mt-1">Setup & Governança</strong>
                            <p className="text-[11px] text-slate-500 mt-1">Landing Zone, GCS Staging, BigQuery Gold e ativação do Knowledge Catalog.</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200">
                            <span className="text-[10px] font-black text-purple-700 uppercase block">Semanas 3-4</span>
                            <strong className="text-slate-900 block mt-1">Pipelines Multi-Engine</strong>
                            <p className="text-[11px] text-slate-500 mt-1">Transformações SQLX, BigFrames e validação de asserções de qualidade.</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200">
                            <span className="text-[10px] font-black text-indigo-700 uppercase block">Semanas 5-6</span>
                            <strong className="text-slate-900 block mt-1">Agent Platform Gemini 3.8 Flash</strong>
                            <p className="text-[11px] text-slate-500 mt-1">Configuração de Data Agents, grounding em catálogo e testes C-Level.</p>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200">
                            <span className="text-[10px] font-black text-emerald-700 uppercase block">Semana 7+</span>
                            <strong className="text-slate-900 block mt-1">Go-Live & Escala</strong>
                            <p className="text-[11px] text-slate-500 mt-1">Disponibilização no Cloud Run, alertas em tempo real e expansão de casos.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* ABA 3: MESA REDONDA EXECUTIVA (5 AGENTES ADK - PERSONA_ADK.PDF)          */}
                {/* ========================================================================= */}
                {modalTab === "roundtable" && assessment && (
                  <ExecutiveRoundTableTab
                    useCase={activeModalCase}
                    assessment={assessment}
                  />
                )}
              </div>

              {/* Rodapé do Modal (Responsivo) */}
              <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/80 rounded-b-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                  <span className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                    {t("confidenceScoreLabel")}: <strong className="text-slate-900 font-black">{formatPercent(activeModalCase.confidenceScore * 100, 1)}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setTerraformModalCase(activeModalCase);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#074878] to-purple-800 hover:from-[#053456] hover:to-purple-900 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer hover:scale-105 w-full sm:w-auto"
                  >
                    <Cpu className="w-4 h-4 shrink-0" />
                    <span>Gerar Pipeline Terraform (Multi-Engine)</span>
                  </button>
                  {onDetailCaseWithGemini && (
                    <button
                      onClick={() => {
                        const targetCase = activeModalCase;
                        setActiveModalCase(null);
                        onDetailCaseWithGemini(targetCase);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer hover:scale-105 w-full sm:w-auto"
                      title="Detalhar case com o Gemini no BigQuery Data Agent"
                    >
                      <Sparkles className="w-4 h-4 text-blue-200 shrink-0" />
                      <span>Detalhar case com o Gemini</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setActiveModalCase(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer text-center"
                >
                  {t("closeBtn")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 6. MODAL TERRAFORM MULTI-ENGINE PIPELINE */}
      <UseCaseTerraformModal
        useCase={terraformModalCase}
        customerName={customerName}
        industry={industry}
        isOpen={!!terraformModalCase}
        onClose={() => setTerraformModalCase(null)}
      />
    </div>
  );
};
