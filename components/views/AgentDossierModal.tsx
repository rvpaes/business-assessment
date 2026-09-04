// components/views/AgentDossierModal.tsx - Dossiê Analítico com BigQuery e ISO GQL
"use client";

import React from "react";
import { X, Database, Terminal, ShieldCheck, TrendingUp, CheckCircle2, Layers } from "lucide-react";

export interface AgentModalData {
  agentName: string;
  agentRole: string;
  badge: string;
  badgeColor?: string;
  avatarLetter: string;
  avatarBg: string;
  latencyMs?: number;
  sugestaoAcao: string;
  racionalPorQue: string;
  targetDirectiveTitle: string;
  targetDirectiveBadge: string;
  targetCards: { title: string; value: string; subValue: string; badgeText: string }[];
  bqMetrics: { label: string; value: string; trend?: string; subtext?: string }[];
  sqlQuery: string;
}

interface AgentDossierModalProps {
  data: AgentModalData | null;
  onClose: () => void;
}

export const AgentDossierModal: React.FC<AgentDossierModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header do Dossiê */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${data.avatarBg} text-white flex items-center justify-center font-black text-sm shadow-xs`}>
              {data.avatarLetter}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">{data.agentName}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#074878] text-white">
                  {data.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500">{data.agentRole} • Latência BQ: {data.latencyMs || 140}ms</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Racional Estratégico */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#074878]">
              {data.targetDirectiveTitle} • {data.targetDirectiveBadge}
            </span>
            <p className="text-xs font-bold text-slate-900">{data.sugestaoAcao}</p>
            <p className="text-[11px] text-slate-600">
              <strong>Racional do Grafo:</strong> {data.racionalPorQue}
            </p>
          </div>

          {/* Target Cards */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Direcionamento de Metas & Indicadores de Impacto
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.targetCards.map((tc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{tc.title}</span>
                  <div className="text-base font-black text-[#074878] mt-0.5">{tc.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{tc.subValue}</div>
                  <span className="inline-block mt-1 text-[8px] font-extrabold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                    {tc.badgeText}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas do BigQuery */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Métricas Auditadas no BigQuery
            </span>
            <div className="grid grid-cols-2 gap-2">
              {data.bqMetrics.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50/60 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">{m.label}</div>
                    {m.subtext && <div className="text-[10px] text-slate-400">{m.subtext}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-[#074878]">{m.value}</div>
                    {m.trend && <div className="text-[9px] font-bold text-emerald-600">{m.trend}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Query GQL */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-violet-600" />
              Consulta ISO GQL / BigQuery Property Graph
            </span>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {data.sqlQuery}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-3xl">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% Auditável no BigQuery Property Graph
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#074878] hover:bg-[#053456] text-white font-bold text-xs shadow-xs transition-colors"
          >
            Fechar Dossiê
          </button>
        </div>
      </div>
    </div>
  );
};
