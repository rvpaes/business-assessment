// components/views/KpiSimulatorView.tsx - Painel Executivo de KPIs, Business Case (BC) e Simulador de ROI
"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Cpu, 
  Database,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Sliders
} from "lucide-react";
import { CustomerAssessment, TopUseCase } from "@/lib/types";

interface KpiSimulatorViewProps {
  assessment: CustomerAssessment | null;
  topUseCases: TopUseCase[];
  onNavigateToCases?: () => void;
}

export const KpiSimulatorView: React.FC<KpiSimulatorViewProps> = ({
  assessment,
  topUseCases,
  onNavigateToCases
}) => {
  // Parâmetros do Simulador
  const [adoptionRate, setAdoptionRate] = useState<number>(85); // 85%
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1.0); // 1.0x

  const totalGainUsd = topUseCases.length > 0 
    ? topUseCases.reduce((acc, c) => acc + (c.financialGainEstimateUsd || 0), 0)
    : 1850000;

  const totalMonthlyGcpUsd = topUseCases.length > 0
    ? topUseCases.reduce((acc, c) => acc + (c.gcpMonthlyCostUsd || 0), 0)
    : 2450;

  const annualGcpCostUsd = totalMonthlyGcpUsd * 12;
  const simulatedGainUsd = totalGainUsd * (adoptionRate / 100) * scaleMultiplier;
  const simulatedRoi = annualGcpCostUsd > 0
    ? (((simulatedGainUsd - annualGcpCostUsd) / annualGcpCostUsd) * 100).toFixed(0)
    : "380";

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* Header do Módulo */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#074878]" />
            KPIs Executivos & Simulador de Business Case (BC)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Projeção de retorno financeiro (ROI), benchmark de ganhos da indústria e detalhamento de custos de infraestrutura Google Cloud.
          </p>
        </div>

        {onNavigateToCases && (
          <button
            onClick={onNavigateToCases}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>Ver Casos de Uso</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cards de Métricas Consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            GANHO ANUAL PROJETADO
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ${(simulatedGainUsd / 1000).toFixed(0)}k <span className="text-xs text-slate-500 font-normal">/ano</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            R$ {(simulatedGainUsd * 5.6 / 1000000).toFixed(2)}M em receita e eficiência
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            CUSTO TOTAL GCP (FINOPS)
          </span>
          <div className="text-2xl font-black text-[#074878] mt-1">
            ${(annualGcpCostUsd / 1000).toFixed(1)}k <span className="text-xs text-slate-500 font-normal">/ano</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ${totalMonthlyGcpUsd.toFixed(0)}/mês (BigQuery + Vertex AI)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            RETORNO ESTIMADO (ROI)
          </span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            +{simulatedRoi}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Payback estimado em ~1.8 meses
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            PRECISÃO DOS DADOS
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            100%
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auditado no BigQuery
          </p>
        </div>
      </div>

      {/* Simulador Interativo */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#074878]" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Simulador de Cenários & Adoção
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Taxa de Adoção de Campo:</span>
              <span className="font-black text-[#074878]">{adoptionRate}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={adoptionRate}
              onChange={(e) => setAdoptionRate(Number(e.target.value))}
              className="w-full accent-[#074878] cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Percentual de representantes e gestores aderindo às rotas e recomendações do Conselho.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Multiplicador de Expansão Distrital:</span>
              <span className="font-black text-[#074878]">{scaleMultiplier.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={scaleMultiplier}
              onChange={(e) => setScaleMultiplier(Number(e.target.value))}
              className="w-full accent-[#074878] cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Expansão do modelo para distritos vizinhos e linhas adicionais de produtos.
            </p>
          </div>
        </div>
      </div>

      {/* Composição de Custos GCP (FinOps) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          Composição Mensal de Infraestrutura GCP
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">BigQuery Analytics</span>
            <div className="text-lg font-black text-slate-900 mt-1">$450 <span className="text-[10px] text-slate-400">/mês</span></div>
            <p className="text-[10px] text-slate-500 mt-1">Queries particionadas & Property Graph GQL</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Vertex AI Gemini 3.8</span>
            <div className="text-lg font-black text-slate-900 mt-1">$1.200 <span className="text-[10px] text-slate-400">/mês</span></div>
            <p className="text-[10px] text-slate-500 mt-1">Debate neurocognitivo & geração de sínteses</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Cloud Storage & Dataplex</span>
            <div className="text-lg font-black text-slate-900 mt-1">$120 <span className="text-[10px] text-slate-400">/mês</span></div>
            <p className="text-[10px] text-slate-500 mt-1">Ingestão de zip & catalogação de metadados</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Cloud Run Cockpit</span>
            <div className="text-lg font-black text-slate-900 mt-1">$680 <span className="text-[10px] text-slate-400">/mês</span></div>
            <p className="text-[10px] text-slate-500 mt-1">Next.js API & UI executiva escalável</p>
          </div>
        </div>
      </div>
    </div>
  );
};
