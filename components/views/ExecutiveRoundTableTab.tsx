// components/views/ExecutiveRoundTableTab.tsx - Interface Executiva da Mesa Redonda dos 5 ADKs
"use client";

import React, { useState } from "react";
import { 
  Crown, 
  Cpu, 
  Landmark, 
  TrendingUp, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Copy, 
  Check, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  Clock,
  ArrowRight,
  Workflow
} from "lucide-react";
import { 
  TopUseCase, 
  CustomerAssessment, 
  ExecutiveRole, 
  ExecutiveRoundTableResult, 
  ExecutiveRoundTableTurn 
} from "@/lib/types";
import { EXECUTIVE_PERSONAS } from "@/lib/constants/executive-personas";
import { GoogleCloudLogo } from "../GoogleCloudLogo";

interface ExecutiveRoundTableTabProps {
  useCase: TopUseCase;
  assessment: CustomerAssessment;
}

export const ExecutiveRoundTableTab: React.FC<ExecutiveRoundTableTabProps> = ({
  useCase,
  assessment
}) => {
  const [roundTableResult, setRoundTableResult] = useState<ExecutiveRoundTableResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [copiedAta, setCopiedAta] = useState(false);
  const [copiedSabatina, setCopiedSabatina] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  const handleStartRoundTable = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/use-cases/roundtable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assessment,
          useCase
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.result) {
        setRoundTableResult(data.result);
      } else {
        throw new Error("Resposta inválida da API da Mesa Redonda.");
      }
    } catch (err: any) {
      console.error("Erro ao iniciar Mesa Redonda Executiva:", err);
      setErrorMessage(err.message || "Falha na orquestração dos 5 Agentes ADK.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleThought = (turnId: string) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [turnId]: !prev[turnId]
    }));
  };

  const copyAtaToClipboard = () => {
    if (!roundTableResult) return;
    const textLines = [
      `# ATA DA MESA REDONDA EXECUTIVA - CONSELHO DE ADMINISTRAÇÃO`,
      `Cliente: ${assessment.customerName} | Indústria: ${assessment.industry}`,
      `Caso de Uso: ${useCase.title} (${useCase.category})`,
      `Data: ${new Date().toLocaleDateString("pt-BR")}`,
      `Modelo de IA: Gemini 3.8 Flash (Agent Development Kit - ADK)`,
      `\n======================================================`,
      `VEREDITO GERAL DO BOARD: ${roundTableResult.summary.overallVerdict}`,
      `Taxa de Alinhamento: ${roundTableResult.summary.alignmentScore}%`,
      `\n--- ACORDOS PRINCIPAIS ---`,
      ...roundTableResult.summary.keyAgreements.map(a => `• ${a}`),
      `\n--- PONTOS DE ATENÇÃO & TRADE-OFFS ---`,
      ...roundTableResult.summary.criticalContentions.map(c => `• ${c}`),
      `\n--- CHECKLIST DE SABATINA PARA A GOOGLE CLOUD ---`,
      ...roundTableResult.summary.gcpSabatinaChecklist.map(s => `[${s.fromRole}] (${s.category}): ${s.question}`),
      `\n--- PLANO DE AÇÃO ---`,
      ...roundTableResult.summary.actionPlan.map((p, idx) => `${idx + 1}. ${p}`),
      `\n======================================================\n`
    ];

    navigator.clipboard.writeText(textLines.join("\n"));
    setCopiedAta(true);
    setTimeout(() => setCopiedAta(false), 2500);
  };

  const copySabatinaToClipboard = () => {
    if (!roundTableResult) return;
    const questions = roundTableResult.summary.gcpSabatinaChecklist.map(
      (s, idx) => `${idx + 1}. [${s.fromRole} - ${s.category}]: ${s.question}`
    ).join("\n\n");

    const header = `CHECKLIST DE SABATINA TÉCNICA E COMERCIAL - GOOGLE CLOUD\nCliente: ${assessment.customerName}\nCaso: ${useCase.title}\n\n`;
    navigator.clipboard.writeText(header + questions);
    setCopiedSabatina(true);
    setTimeout(() => setCopiedSabatina(false), 2500);
  };

  const filteredTurns = roundTableResult?.turns.filter(t => {
    if (selectedRoleFilter === "ALL") return true;
    return t.role === selectedRoleFilter;
  }) || [];

  const getRoleBadgeStyle = (role: ExecutiveRole) => {
    switch (role) {
      case "CEO":
        return {
          bg: "bg-slate-900 text-white border-slate-700",
          pill: "bg-slate-100 text-slate-800 border-slate-200",
          lightBg: "bg-slate-50 border-slate-200",
          iconColor: "text-amber-400"
        };
      case "CTO":
        return {
          bg: "bg-indigo-900 text-white border-indigo-700",
          pill: "bg-indigo-50 text-indigo-800 border-indigo-200",
          lightBg: "bg-indigo-50/40 border-indigo-100",
          iconColor: "text-indigo-400"
        };
      case "CFO":
        return {
          bg: "bg-emerald-900 text-white border-emerald-700",
          pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
          lightBg: "bg-emerald-50/40 border-emerald-100",
          iconColor: "text-emerald-400"
        };
      case "CMO":
        return {
          bg: "bg-amber-900 text-white border-amber-700",
          pill: "bg-amber-50 text-amber-800 border-amber-200",
          lightBg: "bg-amber-50/40 border-amber-100",
          iconColor: "text-amber-400"
        };
      case "MODERATOR":
      default:
        return {
          bg: "bg-[#074878] text-white border-blue-700",
          pill: "bg-blue-50 text-[#074878] border-blue-200",
          lightBg: "bg-blue-50/40 border-blue-100",
          iconColor: "text-blue-300"
        };
    }
  };

  const getVerdictBadge = (verdict?: string) => {
    if (!verdict) return null;
    const upper = verdict.toUpperCase();
    if (upper.includes("APROVADO") && !upper.includes("CONDICIONADO") && !upper.includes("CONDICIONANTES")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" /> {verdict}
        </span>
      );
    }
    if (upper.includes("VIÁVEL") && !upper.includes("RESTRIÇÕES")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" /> {verdict}
        </span>
      );
    }
    if (upper.includes("APOIO TOTAL")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" /> {verdict}
        </span>
      );
    }
    if (upper.includes("CONDICION") || upper.includes("RESTRIÇÕES") || upper.includes("RESSALVAS")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5" /> {verdict}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
        <ShieldAlert className="w-3.5 h-3.5" /> {verdict}
      </span>
    );
  };

  const renderPersonaIcon = (role: ExecutiveRole, className = "w-5 h-5") => {
    switch (role) {
      case "CEO":
        return <Crown className={className} />;
      case "CTO":
        return <Cpu className={className} />;
      case "CFO":
        return <Landmark className={className} />;
      case "CMO":
        return <TrendingUp className={className} />;
      case "MODERATOR":
      default:
        return <Users className={className} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. BANNER DO TOPO: APRESENTAÇÃO DOS 5 AGENTES ADK */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#07243c] via-[#074878] to-[#1e1b4b] text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <GoogleCloudLogo height={22} textColor="white" />
            <span className="text-blue-300 text-xs font-bold">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-400/20 border border-blue-300/30 text-blue-200 text-[10px] font-black uppercase tracking-wider">
              Gemini 3.8 Flash • Agent Development Kit (ADK)
            </span>
          </div>
          <div className="text-xs text-blue-200 font-medium">
            Diretrizes Documentadas: <span className="font-bold underline text-white">persona_adk.pdf</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Mesa Redonda Executiva: Conselho C-Level com 5 Agentes ADK
          </h3>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-4xl leading-relaxed mt-1.5">
            Simulação de deliberação do Conselho de Administração para <strong>{assessment.customerName}</strong>. Quatro executivos independentes (CEO, CTO, CFO, CMO) escrutinam a viabilidade estratégica, arquitetura FinOps, retorno e impacto comercial do caso <strong>&quot;{useCase.title}&quot;</strong>, orquestrados por um moderador para gerar a ata e o checklist de sabatina para o time de contas da Google Cloud.
          </p>
        </div>

        {/* Grade com os 5 Avatares dos Agentes ADK */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-blue-400/20">
          {(["CEO", "CTO", "CFO", "CMO", "MODERATOR"] as ExecutiveRole[]).map((role) => {
            const persona = EXECUTIVE_PERSONAS[role];
            return (
              <div 
                key={role}
                className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex flex-col justify-between space-y-1.5 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-200">
                    {persona.role}
                  </span>
                  <div className="p-1.5 rounded-lg bg-white/20 text-white">
                    {renderPersonaIcon(role, "w-3.5 h-3.5")}
                  </div>
                </div>
                <strong className="text-xs font-bold text-white block line-clamp-1">
                  {persona.title.split("(")[0].trim()}
                </strong>
                <p className="text-[10px] text-blue-200 line-clamp-2 leading-tight">
                  {persona.focusArea}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ESTADO INICIAL OU BOTÃO DE DISPARO */}
      {!roundTableResult && !isLoading && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#074878] flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900">
              Pronto para Convocar a Mesa Redonda Executiva
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              O caso de uso <strong>&quot;{useCase.title}&quot;</strong> será injetado no contexto dos 5 agentes executivos ADK com o modelo <strong>Gemini 3.8 Flash</strong>. Eles analisarão Enterprise Value, TCO em 12/24/36m, quotas de BigQuery, LTV/CAC e debaterão entre si para definir o veredito e as perguntas de sabatina GCP.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartRoundTable}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#074878] hover:bg-[#053456] text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>Iniciar Mesa Redonda Executiva (ADK)</span>
            </button>
          </div>

          {errorMessage && (
            <div className="max-w-md mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              <span className="font-bold">Aviso:</span> {errorMessage}
            </div>
          )}
        </div>
      )}

      {/* 3. ESTADO DE CARREGAMENTO / PROCESSAMENTO MULTI-AGENTE */}
      {isLoading && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-ping opacity-25"></div>
            <div className="w-16 h-16 rounded-full border-4 border-[#074878] border-t-transparent animate-spin flex items-center justify-center">
              <Users className="w-7 h-7 text-[#074878]" />
            </div>
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h4 className="text-base sm:text-lg font-black text-slate-900">
              Mesa Redonda Extraordinária em Andamento...
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              O <strong>Moderador ADK</strong> abriu a sessão. CEO, CTO, CFO e CMO estão processando as métricas e formulando questionamentos e pareceres através do <strong>Gemini 3.8 Flash</strong>.
            </p>
          </div>

          {/* Stepper Visual dos 4 Passos */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto text-left text-xs pt-2">
            <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#074878] font-bold">
                <Workflow className="w-3.5 h-3.5" />
                <span>1. Abertura</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Contextualização do caso e premissas de ROI.</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>2. Pareceres</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Análise individual estrita de cada C-level.</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>3. Debate Cruzado</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Confronto executivo de trade-offs.</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                <FileText className="w-3.5 h-3.5" />
                <span>4. Síntese & Sabatina</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Ata oficial e checklist para o GCP.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. RESULTADOS COMPLETOS DA MESA REDONDA */}
      {roundTableResult && !isLoading && (
        <div className="space-y-8">
          {/* Card Principal de Veredito & Ata do Board */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Ata Oficial de Deliberação
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    Concluído • 5 Agentes ADK
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Veredito do Conselho Executivo
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={copyAtaToClipboard}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  title="Copiar Ata Completa para o Clipboard"
                >
                  {copiedAta ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAta ? "Ata Copiada!" : "Copiar Ata da Reunião"}</span>
                </button>

                <button
                  onClick={handleStartRoundTable}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  title="Executar novamente a mesa redonda com o Gemini 3.8 Flash"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reabrir Sessão</span>
                </button>
              </div>
            </div>

            {/* Destaque do Veredito & Score de Alinhamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2 md:col-span-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#074878] block">
                  Decisão Colegiada Unificada
                </span>
                <div className="flex items-center gap-3">
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {roundTableResult.summary.overallVerdict}
                  </div>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed pt-1">
                  O conselho autorizou o avanço do projeto para a fase de sabatina formal com a Google Cloud, condicionando a assinatura à validação do checklist de garantias contratuais, limites de consumo FinOps e créditos de migração (PSO).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Convergência do Board
                  </span>
                  <div className="text-3xl font-black text-[#074878] tabular-nums mt-1">
                    {roundTableResult.summary.alignmentScore}%
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${roundTableResult.summary.alignmentScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Alinhamento de 4 diretorias + parecer do moderador.
                </div>
              </div>
            </div>

            {/* Grid de Acordos e Preocupações Mitigadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pontos de Convergência & Consenso</span>
                </div>
                <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                  {roundTableResult.summary.keyAgreements.map((agreement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{agreement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Condicionantes & Trade-offs Críticos</span>
                </div>
                <ul className="space-y-2 text-xs text-amber-950 font-medium">
                  {roundTableResult.summary.criticalContentions.map((contention, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{contention}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Plano de Ação Imediato */}
            {roundTableResult.summary.actionPlan?.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Próximos Passos Executivos (Roadmap Imediato)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {roundTableResult.summary.actionPlan.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-black text-[#074878] uppercase block">
                        Fase 0{idx + 1}
                      </span>
                      <p className="text-slate-800 font-medium line-clamp-3">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. CHECKLIST UNIFICADO DE SABATINA PARA A GOOGLE CLOUD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-[#074878] to-slate-900 text-white shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-400/20">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-300">
                  <HelpCircle className="w-4 h-4" />
                  <span>Playbook de Negociação & Defesa</span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-white mt-1">
                  Checklist Unificado de Sabatina para a Google Cloud
                </h4>
                <p className="text-xs text-blue-200 mt-1 max-w-2xl">
                  Perguntas mandatórias formuladas pelas 4 diretorias para apresentar ao Account Executive e Customer Engineer da GCP na próxima reunião comercial.
                </p>
              </div>

              <button
                onClick={copySabatinaToClipboard}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto border border-white/20"
                title="Copiar todas as perguntas para levar na reunião"
              >
                {copiedSabatina ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSabatina ? "Perguntas Copiadas!" : "Copiar Perguntas de Sabatina"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roundTableResult.summary.gcpSabatinaChecklist.map((item, idx) => {
                const rolePersona = EXECUTIVE_PERSONAS[item.fromRole] || EXECUTIVE_PERSONAS.MODERATOR;
                return (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-white">
                          {item.fromRole} • {item.category}
                        </span>
                        <div className="text-blue-300">
                          {renderPersonaIcon(item.fromRole, "w-3.5 h-3.5")}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-white font-medium leading-relaxed pt-1">
                        &ldquo;{item.question}&rdquo;
                      </p>
                    </div>
                    <div className="text-[10px] text-blue-200 pt-2 border-t border-white/10 flex items-center gap-1">
                      <span>Exigência formulada por:</span>
                      <strong className="text-white">{rolePersona.title}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. LINHA DO TEMPO CONVERSACIONAL (MESA REDONDA COMPLETA) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#074878]">
                  <MessageSquare className="w-4 h-4" />
                  <span>Diálogo da Mesa Redonda (Transmissão Turno a Turno)</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interações completas e debate cruzado entre os 5 Agentes ADK com Gemini 3.8 Flash
                </p>
              </div>

              {/* Filtro por Executivo */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["ALL", "MODERATOR", "CEO", "CTO", "CFO", "CMO"].map((filterRole) => (
                  <button
                    key={filterRole}
                    onClick={() => setSelectedRoleFilter(filterRole)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedRoleFilter === filterRole
                        ? "bg-[#074878] text-white shadow-2xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {filterRole === "ALL" ? "Todos os Turnos" : filterRole}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista dos Turnos Conversacionais */}
            <div className="space-y-4 pt-2">
              {filteredTurns.map((turn) => {
                const style = getRoleBadgeStyle(turn.role);
                const persona = EXECUTIVE_PERSONAS[turn.role];
                const isThoughtOpen = expandedThoughts[turn.turnId];

                return (
                  <div
                    key={turn.turnId}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all ${style.lightBg}`}
                  >
                    {/* Cabeçalho da Fala */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${style.bg}`}>
                          {renderPersonaIcon(turn.role, "w-5 h-5")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm sm:text-base font-black text-slate-900">
                              {persona.title}
                            </h5>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${style.pill}`}>
                              Rodada {turn.round}: {turn.phaseName}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {turn.title}
                          </span>
                        </div>
                      </div>

                      {/* Veredito Individual se houver */}
                      <div className="self-start sm:self-auto">
                        {getVerdictBadge(turn.verdict)}
                      </div>
                    </div>

                    {/* Conteúdo da Mensagem */}
                    <div className="pt-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line space-y-3">
                      {turn.content}
                    </div>

                    {/* Seções Estruturadas (se disponíveis) */}
                    {turn.structuredSections && (
                      <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {turn.structuredSections.strategicThesis && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Tese Estratégica</span>
                            <p className="text-slate-800 font-medium mt-0.5">{turn.structuredSections.strategicThesis}</p>
                          </div>
                        )}
                        {turn.structuredSections.technicalDiagnosisFinOps && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Diagnóstico FinOps</span>
                            <p className="text-slate-800 font-medium mt-0.5">{turn.structuredSections.technicalDiagnosisFinOps}</p>
                          </div>
                        )}
                        {turn.structuredSections.financialModelEbitda && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Modelo Financeiro & EBITDA</span>
                            <p className="text-slate-800 font-medium mt-0.5">{turn.structuredSections.financialModelEbitda}</p>
                          </div>
                        )}
                        {turn.structuredSections.commercialMetricsImpact && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Métricas Comerciais (CAC/LTV)</span>
                            <p className="text-slate-800 font-medium mt-0.5">{turn.structuredSections.commercialMetricsImpact}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Perguntas de Sabatina da Google Cloud deste Turno */}
                    {turn.structuredSections?.googleCloudQuestions && turn.structuredSections.googleCloudQuestions.length > 0 && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-[#074878] tracking-wider block">
                          Sabatina Técnica/Comercial para a Google Cloud:
                        </span>
                        <ul className="space-y-1 text-slate-800 font-medium">
                          {turn.structuredSections.googleCloudQuestions.map((q, qIdx) => (
                            <li key={qIdx} className="flex items-start gap-1.5">
                              <span className="text-[#074878] font-bold">•</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Raciocínio Interno (Chain-of-Thought) Colapsável */}
                    {turn.thoughtLog && (
                      <div className="mt-3 pt-2">
                        <button
                          onClick={() => toggleThought(turn.turnId)}
                          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>{isThoughtOpen ? "Ocultar Raciocínio do Gemini 3.8 Flash" : "Ver Raciocínio Interno do Gemini 3.8 Flash"}</span>
                          {isThoughtOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {isThoughtOpen && (
                          <div className="mt-2 p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-purple-900 font-mono leading-relaxed">
                            {turn.thoughtLog}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
