// components/views/NeuroDebateView.tsx - Painel do Debate Multi-Agente NC-MAD
"use client";

import React, { useState } from "react";
import { 
  BrainCircuit, Sparkles, Scale, ShieldCheck, Play, 
  RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Eye
} from "lucide-react";
import { CustomerAssessment, TableCatalogItem, NeuroDebateTurn, TopUseCase, SalienceItem, AuditTarget } from "@/lib/types";

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
  const [activeTab, setActiveTab] = useState<"turns" | "salience" | "audit">("turns");
  const [expandedTurnId, setExpandedTurnId] = useState<string | null>(null);

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

  const personas = [
    {
      role: "DMN_Explorer",
      name: "Dr. Leonardo Cruz",
      title: "Chief Innovation Strategist (DMN)",
      badge: "Ideação Divergente",
      icon: Sparkles,
      color: "border-purple-500/40 bg-purple-500/5 text-purple-600 dark:text-purple-400"
    },
    {
      role: "SN_Arbiter",
      name: "Beatriz Alvarenga",
      title: "CDAO & Salience Arbiter (SN)",
      badge: "Filtro de Saliência & Rota",
      icon: Scale,
      color: "border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400"
    },
    {
      role: "CEN_Executive_Engineer",
      name: "Marcos Mendonça",
      title: "Cloud Architect & FinOps (CEN)",
      badge: "Escrutínio Formal & FinOps",
      icon: ShieldCheck,
      color: "border-blue-500/40 bg-blue-500/5 text-blue-600 dark:text-blue-400"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
            Neuro-Cognitive Multi-Agent Debate (NC-MAD)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Debate dialético baseado no modelo neurobiológico de Tripla Rede (DMN, SN e CEN) acionado pelo modelo{" "}
            <strong className="text-indigo-600 dark:text-indigo-400">Gemini 3.8 Flash</strong> para priorização formal dos Top 6 casos de uso.
          </p>
        </div>

        <button
          onClick={startDebate}
          disabled={isRunning || !assessment}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Debatendo em Tempo Real...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              {turns.length > 0 ? "Re-executar Debate NC-MAD" : "Iniciar Debate Multi-Agente"}
            </>
          )}
        </button>
      </div>

      {currentStatus && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-2">
          {isRunning && <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />}
          <span>{currentStatus}</span>
        </div>
      )}

      {/* 2. Grid das Personas do Debate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personas.map(p => {
          const Icon = p.icon;
          return (
            <div
              key={p.role}
              className={`p-5 rounded-2xl border ${p.color} transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {p.badge}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{p.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.title}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Navegação entre Abas do Debate */}
      {turns.length > 0 && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("turns")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "turns"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Transcrição do Debate ({turns.length} Turnos)
            </button>
            <button
              onClick={() => setActiveTab("salience")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "salience"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Matriz de Saliência SN ({salienceMatrix.length})
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "audit"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Alvos de Auditoria CEN ({auditTargets.length})
            </button>
          </div>

          {/* Conteúdo Aba: Turnos do Debate */}
          {activeTab === "turns" && (
            <div className="space-y-4">
              {turns.map(turn => {
                const isExpanded = expandedTurnId === turn.turnId;
                return (
                  <div
                    key={turn.turnId}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {turn.phase === "DMN_GENERATION"
                            ? "🧠 DMN: Ideação"
                            : turn.phase === "SN_SALIENCE_FILTER"
                            ? "⚖️ SN: Filtragem"
                            : "🛡️ CEN: Veredito"}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {turn.agentName}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(turn.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Raciocínio Interno (Thinking Process do Gemini 3.8 Flash) */}
                    {turn.thoughtLog && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 italic">
                        <strong>Raciocínio Interno do Agente:</strong> {turn.thoughtLog}
                      </div>
                    )}

                    {/* Texto de Saída */}
                    <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                      {isExpanded ? turn.outputText : turn.outputText.slice(0, 450) + (turn.outputText.length > 450 ? "..." : "")}
                    </div>

                    {turn.outputText.length > 450 && (
                      <button
                        onClick={() => setExpandedTurnId(isExpanded ? null : turn.turnId)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isExpanded ? "Recolher visualização" : "Ver transcrição completa"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Conteúdo Aba: Matriz de Saliência */}
          {activeTab === "salience" && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Proposta</th>
                    <th className="p-3.5">Viabilidade Stack</th>
                    <th className="p-3.5">Balanço Exploração</th>
                    <th className="p-3.5">Complexidade</th>
                    <th className="p-3.5">Risco Operacional</th>
                    <th className="p-3.5">Status SN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {salienceMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {item.title} ({item.proposalId})
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {item.stackFeasibility}/10
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {item.exploreExploitRatio}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          item.implementationComplexity === "BAIXA"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.implementationComplexity === "MEDIA"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {item.implementationComplexity}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          item.operationalRisk === "BAIXO"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {item.operationalRisk}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {item.selected ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovada Top 6
                          </span>
                        ) : (
                          <span className="text-slate-400">Arquivada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Conteúdo Aba: Alvos de Auditoria */}
          {activeTab === "audit" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditTargets.map((target, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-amber-600 font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      {target.targetId} • {target.proposalId}
                    </span>
                    <span className="text-slate-400">Escrutínio Formal CEN</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {target.description}
                  </h4>
                  <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <strong className="text-emerald-600">Mitigação Validada:</strong> {target.mitigation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botão de Navegação para os Casos de Uso */}
          {topUseCases.length > 0 && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={onNavigateToCases}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all"
              >
                <span>Ver Top 6 Casos de Uso Aprovados ({topUseCases.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
