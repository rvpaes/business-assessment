// components/views/NeuroDebateView.tsx - Painel do Debate Multi-Agente NC-MAD
"use client";

import React, { useState } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  Scale, 
  ShieldCheck, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Eye,
  TrendingUp,
  Database,
  ChevronDown,
  ChevronUp,
  Check,
  Target
} from "lucide-react";
import { CustomerAssessment, TableCatalogItem, NeuroDebateTurn, TopUseCase, SalienceItem, AuditTarget } from "@/lib/types";
import { formatCurrencyUsd } from "@/lib/utils/formatters";

interface NeuroDebateViewProps {
  assessment: CustomerAssessment | null;
  tables: TableCatalogItem[];
  turns: NeuroDebateTurn[];
  topUseCases: TopUseCase[];
  salienceMatrix: SalienceItem[];
  auditTargets: AuditTarget[];
  onDebateComplete: (data: {
    turns: NeuroDebateTurn[];
    topUseCases: TopUseCase[];
    salienceMatrix: SalienceItem[];
    auditTargets: AuditTarget[];
  }) => void;
  onNavigateToCases: () => void;
  autoStart?: boolean;
}

// Formatador elegante de texto executivo com substituição de markdown cru por elementos visuais
function renderFormattedExecutiveText(rawText: string) {
  // Sanitização de nomes humanos residuais
  const text = (rawText || "")
    .replace(/Dr\.\s*Leonardo Cruz/gi, "Agente de Ideação & Inovação")
    .replace(/Beatriz Alvarenga/gi, "Agente de Saliência & Governança")
    .replace(/Marcos Mendonça/gi, "Agente Executivo & FinOps");

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentProposal: {
    id: string;
    title: string;
    category?: string;
    hypothesis?: string;
    tables?: string[];
    otherLines: string[];
  } | null = null;

  const flushProposal = (idx: number) => {
    if (!currentProposal) return;
    elements.push(
      <div 
        key={`prop_${currentProposal.id}_${idx}`}
        className="my-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-200 transition-all space-y-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#074878] border border-blue-200/80 text-[10px] font-black uppercase tracking-wider">
              {currentProposal.id}
            </span>
            <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
              {currentProposal.title}
            </h5>
          </div>
          {currentProposal.category && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {currentProposal.category}
            </span>
          )}
        </div>

        {currentProposal.hypothesis && (
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong className="text-slate-900 font-bold">Hipótese de Valor:</strong> {currentProposal.hypothesis}
          </p>
        )}

        {currentProposal.tables && currentProposal.tables.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Database className="w-3 h-3 text-[#074878]" />
              Tabelas Requeridas:
            </span>
            {currentProposal.tables.map((t, ti) => (
              <span 
                key={ti}
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200/80"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {currentProposal.otherLines.length > 0 && (
          <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
            {currentProposal.otherLines.map((ol, oli) => (
              <p key={oli}>{ol}</p>
            ))}
          </div>
        )}
      </div>
    );
    currentProposal = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 1. Destaque para a Premissa Econômica Mandatória
    if (line.includes("Premissa Econômica Mandatória") || line.includes("Premissa Mandatória")) {
      flushProposal(i);
      const cleanPremise = line
        .replace(/\*\*/g, "")
        .replace(/Premissa Econômica Mandatória:?/i, "")
        .trim();

      elements.push(
        <div key={`premise_${i}`} className="my-3 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
              Premissa Econômica Mandatória (ROI Superavitário)
            </span>
            <p className="text-xs font-bold text-emerald-950 mt-0.5 leading-relaxed">
              {cleanPremise || "O Retorno Financeiro Estimado para o Negócio supera substancialmente os Custos de Consumo GCP em todos os casos."}
            </p>
          </div>
        </div>
      );
      continue;
    }

    // 2. Título de Proposta (### PROP-01 ou PROP-1:)
    const propMatch = line.match(/^#{1,4}\s*(PROP-\d+):?\s*(.*)$/i) || line.match(/^(PROP-\d+):?\s*(.*)$/i);
    if (propMatch) {
      flushProposal(i);
      currentProposal = {
        id: propMatch[1].toUpperCase(),
        title: propMatch[2].replace(/\*\*/g, "").trim(),
        otherLines: []
      };
      continue;
    }

    // Se estivermos dentro de uma proposta, captura os atributos
    if (currentProposal) {
      if (line.toLowerCase().includes("categoria")) {
        currentProposal.category = line.replace(/.*categoria.*?:/i, "").replace(/\*\*/g, "").trim();
        continue;
      }
      if (line.toLowerCase().includes("hipótese") || line.toLowerCase().includes("valor")) {
        currentProposal.hypothesis = line.replace(/.*hipótese.*?:/i, "").replace(/\*\*/g, "").trim();
        continue;
      }
      if (line.toLowerCase().includes("tabela")) {
        const rawTables = line.replace(/.*tabela.*?:/i, "").replace(/[`*]/g, "").trim();
        currentProposal.tables = rawTables.split(/[,;]/).map(t => t.trim()).filter(Boolean);
        continue;
      }
      currentProposal.otherLines.push(line.replace(/\*\*/g, ""));
      continue;
    }

    // 3. Eixos Estratégicos (## Eixo 1: Rota...)
    if (line.startsWith("##") || line.startsWith("# ")) {
      flushProposal(i);
      const cleanHeader = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
      elements.push(
        <div key={`head_${i}`} className="pt-4 pb-1 border-t border-slate-100 flex items-center gap-2 first:border-0 first:pt-1">
          <span className="w-2 h-2 rounded-full bg-[#074878]" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            {cleanHeader}
          </h4>
        </div>
      );
      continue;
    }

    // 4. Divisores
    if (line === "---" || line === "***") {
      flushProposal(i);
      elements.push(<hr key={`hr_${i}`} className="border-slate-100 my-2" />);
      continue;
    }

    // 5. Parágrafo comum formatado
    const cleanLine = line.replace(/\*\*(.*?)\*\*/g, "$1");
    elements.push(
      <p key={`p_${i}`} className="text-xs text-slate-700 leading-relaxed">
        {cleanLine}
      </p>
    );
  }

  flushProposal(lines.length);
  return <div className="space-y-2">{elements}</div>;
}

export const NeuroDebateView: React.FC<NeuroDebateViewProps> = ({
  assessment,
  tables,
  turns,
  topUseCases,
  salienceMatrix,
  auditTargets,
  onDebateComplete,
  onNavigateToCases,
  autoStart
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"turns" | "salience" | "audit" | "cases">("turns");

  // Auto-disparo do debate quando solicitado na ingestão
  React.useEffect(() => {
    if (autoStart && assessment && !isRunning && turns.length === 0) {
      startDebate();
    }
  }, [autoStart, assessment]);

  const startDebate = async () => {
    if (!assessment) return;
    setIsRunning(true);
    setCurrentStatus("Orquestrando Tripla Rede Neurocognitiva (DMN ➔ SN ➔ CEN) com Gemini 3.8 Flash...");

    try {
      const res = await fetch("/api/neuro-debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment,
          tables
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro no debate multi-agente.");
      }

      onDebateComplete({
        turns: data.turns || [],
        topUseCases: data.topUseCases || [],
        salienceMatrix: data.salienceMatrix || [],
        auditTargets: data.auditTargets || []
      });

      setCurrentStatus("✅ Debate concluído e Top 6 Casos de Uso consolidados com sucesso!");
    } catch (err: any) {
      setCurrentStatus(`❌ Erro no debate: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Nomenclatura dos 3 Agentes de IA sem nomes humanos fictícios
  const personas = [
    {
      role: "DMN_Explorer",
      phaseNumber: "FASE 1",
      name: "Agente de Ideação & Inovação",
      title: "Exploração Generativa de Casos de Uso (DMN)",
      badge: "IDEAÇÃO DIVERGENTE",
      icon: Sparkles,
      iconBg: "bg-purple-50 text-purple-700 border-purple-200",
      cardBorder: "border-purple-200/80 hover:border-purple-300",
      tagColor: "bg-purple-50 text-purple-800 border-purple-200",
      focusDescription: "Mapeamento lateral livre de oportunidades de IA, Causal AI e novas frentes analíticas."
    },
    {
      role: "SN_Arbiter",
      phaseNumber: "FASE 2",
      name: "Agente de Saliência & Governança",
      title: "Auditoria de Viabilidade & Filtragem de Risco (SN)",
      badge: "FILTRO DE SALIÊNCIA & ROTA",
      icon: Scale,
      iconBg: "bg-amber-50 text-amber-700 border-amber-200",
      cardBorder: "border-amber-200/80 hover:border-amber-300",
      tagColor: "bg-amber-50 text-amber-800 border-amber-200",
      focusDescription: "Auditoria de tabelas no BigQuery, conformidade no Knowledge Catalog e teste de estresse."
    },
    {
      role: "CEN_Executive_Engineer",
      phaseNumber: "FASE 3",
      name: "Agente Executivo & FinOps",
      title: "Validação Formal & Modelagem Google Cloud (CEN)",
      badge: "ESCRUTÍNIO FORMAL & FINOPS",
      icon: ShieldCheck,
      iconBg: "bg-blue-50 text-[#074878] border-blue-200",
      cardBorder: "border-blue-200/80 hover:border-blue-300",
      tagColor: "bg-blue-50 text-[#074878] border-blue-200",
      focusDescription: "Garantia irrefutável de ROI superavitário (ganho > custo GCP) e consolidação do Top 6."
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Header do Módulo com Identidade Visual Executiva */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#074878]" />
            <span className="text-[10px] font-black uppercase text-[#074878] tracking-wider">
              Conselho Dialético de Inteligência
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <BrainCircuit className="w-5 h-5 text-[#074878]" />
            Neuro-Cognitive Multi-Agent Debate (NC-MAD)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Debate dialético baseado no modelo neurobiológico de Tripla Rede (DMN, SN e CEN) acionado pelo{" "}
            <strong className="text-slate-800 font-bold">Gemini 3.8 Flash</strong> para priorização formal dos Top 6 casos de uso sobre dados reais auditados no BigQuery.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={startDebate}
            disabled={isRunning || !assessment}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#074878] hover:bg-[#053456] disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Debatendo em Tempo Real...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{turns.length > 0 ? "Re-executar Debate NC-MAD" : "Iniciar Debate Multi-Agente"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status da Execução */}
      {currentStatus && (
        <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/70 text-[#074878] text-xs font-medium flex items-center gap-2.5 shadow-2xs">
          {isRunning && <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-[#074878]" />}
          <span>{currentStatus}</span>
        </div>
      )}

      {/* 2. Grid dos 3 Agentes de IA - Nomes de Papéis & Foco de Atuação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personas.map(p => {
          const Icon = p.icon;
          return (
            <div
              key={p.role}
              className={`p-5 rounded-3xl border ${p.cardBorder} bg-white shadow-2xs space-y-3 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-2xl border ${p.iconBg} flex items-center justify-center font-black shadow-2xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${p.tagColor}`}>
                  {p.badge}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                  {p.phaseNumber}
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">{p.name}</h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{p.title}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                {p.focusDescription}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Banner de Conclusão com Acesso Direto aos Casos Priorizados */}
      {topUseCases.length > 0 && !isRunning && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#074878] tracking-wider">
                  Consenso Executivo Concluído
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ROI Superavitário Comprovado
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                Top 6 Casos de Uso Validados com Grounding em BigQuery
              </h4>
            </div>
          </div>

          <button
            onClick={onNavigateToCases}
            className="px-5 py-2.5 rounded-xl bg-[#074878] hover:bg-[#053456] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <span>Acessar Casos de Uso & Business Case</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Navegação entre Abas de Resultados */}
      {turns.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab("turns")}
              className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "turns"
                  ? "border-[#074878] text-[#074878]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Trilha Dialética dos Agentes ({turns.length} Fases)</span>
            </button>

            <button
              onClick={() => setActiveTab("salience")}
              className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "salience"
                  ? "border-[#074878] text-[#074878]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Matriz de Saliência & Viabilidade ({salienceMatrix.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "audit"
                  ? "border-[#074878] text-[#074878]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Alvos de Auditoria & Mitigações ({auditTargets.length})</span>
            </button>

            {topUseCases.length > 0 && (
              <button
                onClick={() => setActiveTab("cases")}
                className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "cases"
                    ? "border-[#074878] text-[#074878]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Resumo dos 6 Casos Aprovados</span>
              </button>
            )}
          </div>

          {/* =========================================================================
              ABA 1: TRILHA DIALÉTICA DOS AGENTES (RENDERIZAÇÃO ELEGANTE E EXECUTIVA)
             ========================================================================= */}
          {activeTab === "turns" && (
            <div className="space-y-5">
              {turns.map((turn, tIdx) => {
                const isDmn = turn.phase === "DMN_GENERATION";
                const isSn = turn.phase === "SN_SALIENCE_FILTER";

                const badgeBg = isDmn 
                  ? "bg-purple-50 text-purple-700 border-purple-200" 
                  : isSn 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-blue-50 text-[#074878] border-blue-200";

                const iconBoxBg = isDmn 
                  ? "bg-purple-50 text-purple-700 border-purple-200" 
                  : isSn 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-blue-50 text-[#074878] border-blue-200";

                const Icon = isDmn ? Sparkles : isSn ? Scale : ShieldCheck;

                const displayAgentName = isDmn 
                  ? "Agente de Ideação & Inovação" 
                  : isSn 
                  ? "Agente de Saliência & Governança" 
                  : "Agente Executivo & FinOps";

                const phaseTag = isDmn ? "Fase 1 • DMN" : isSn ? "Fase 2 • SN" : "Fase 3 • CEN";

                return (
                  <div
                    key={turn.turnId || tIdx}
                    className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4"
                  >
                    {/* Cabeçalho da Fase */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl border ${iconBoxBg} flex items-center justify-center font-black shadow-2xs shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                              {displayAgentName}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${badgeBg}`}>
                              {phaseTag}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block">
                            {isDmn && "Exploração Divergente de Casos de Uso & Tecnologias GCP"}
                            {isSn && "Filtro de Saliência, Eliminação de Alucinações & Governança"}
                            {!isDmn && !isSn && "Escrutínio Formal, Cálculo de ROI e Consolidação dos Top 6"}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 self-start sm:self-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                        {new Date(turn.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Raciocínio Interno (Chain-of-Thought) Retrátil e Discreto */}
                    {turn.thoughtLog && (
                      <details className="group rounded-2xl bg-slate-50/80 border border-slate-200/70 overflow-hidden text-xs">
                        <summary className="px-3.5 py-2.5 font-bold text-slate-600 cursor-pointer flex items-center justify-between hover:bg-slate-100/60 transition-colors select-none">
                          <span className="flex items-center gap-2 text-[11px]">
                            <BrainCircuit className="w-3.5 h-3.5 text-[#074878]" />
                            <span>Raciocínio Analítico Interno (Thinking CoT Gemini 3.8 Flash)</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="p-3.5 pt-2 border-t border-slate-200/50 text-slate-600 text-[11px] leading-relaxed italic bg-white/60">
                          {turn.thoughtLog}
                        </div>
                      </details>
                    )}

                    {/* Conteúdo Executivo Formatado */}
                    <div className="pt-1">
                      {renderFormattedExecutiveText(turn.outputText)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================================
              ABA 2: MATRIZ DE SALIÊNCIA SN
             ========================================================================= */}
          {activeTab === "salience" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Matriz de Saliência & Viabilidade Técnica
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Filtragem pragmática de alucinações baseada estritamente nas tabelas auditadas no BigQuery.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {salienceMatrix.filter(s => s.selected).length} Aprovadas para Priorização
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/60 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">ID & Proposta</th>
                      <th className="p-3.5">Viabilidade Stack</th>
                      <th className="p-3.5">Balanço Exploração</th>
                      <th className="p-3.5">Complexidade</th>
                      <th className="p-3.5">Risco Operacional</th>
                      <th className="p-3.5">Status SN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salienceMatrix.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                              {item.proposalId}
                            </span>
                            <span>{item.title}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-extrabold text-[#074878]">
                            {item.stackFeasibility}/10
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">
                          {item.exploreExploitRatio}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.implementationComplexity === "BAIXA"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : item.implementationComplexity === "MEDIA"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}>
                            {item.implementationComplexity}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.operationalRisk === "BAIXO"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}>
                            {item.operationalRisk}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {item.selected ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                              <Check className="w-3 h-3 text-emerald-600" /> Aprovada Top 6
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium text-[10px]">Arquivada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              ABA 3: ALVOS DE AUDITORIA CEN
             ========================================================================= */}
          {activeTab === "audit" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditTargets.map((target, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl border border-slate-200/90 bg-white shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/70 text-[10px]">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {target.targetId} • {target.proposalId}
                    </span>
                    <span className="text-slate-400 text-[10px] font-semibold uppercase">Escrutínio Formal CEN</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    {target.description}
                  </h4>
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-900 space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Mitigação Validada:
                    </span>
                    <p className="font-medium text-[11px] leading-relaxed">{target.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =========================================================================
              ABA 4: RESUMO DOS 6 CASOS APROVADOS
             ========================================================================= */}
          {activeTab === "cases" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topUseCases.map((uc, i) => {
                  const isHigh = i < 3;
                  return (
                    <div
                      key={uc.useCaseId || i}
                      className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                            isHigh ? "bg-[#074878] text-white" : "bg-slate-100 text-slate-700"
                          }`}>
                            {uc.rank}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            isHigh ? "bg-blue-50 text-[#074878] border-blue-200" : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>
                            {isHigh ? "Alto Impacto & Escala GCP" : "Impacto Relevante & Otimizado"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ROI Validado
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {uc.title}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Ganho Anual Cliente</span>
                          <span className="text-xs font-black text-emerald-700">
                            {formatCurrencyUsd(uc.financialGainEstimateUsd, { compact: true, showSign: true, decimals: 2 })}/ano
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Consumo Mensal GCP</span>
                          <span className="text-xs font-black text-[#074878]">
                            {formatCurrencyUsd(uc.gcpMonthlyCostUsd, { decimals: 2 })}/mês
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600">
                        <strong className="text-slate-800">Business Case:</strong> {uc.businessCaseRoi}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onNavigateToCases}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#074878] hover:bg-[#053456] text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <span>Ver Todos os Detalhes & Arquitetura GCP dos Casos de Uso</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

