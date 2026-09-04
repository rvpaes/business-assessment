// components/ControlTowerHeader.tsx - Cabeçalho Executivo C-Level
"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Database, ShieldCheck, HardDrive, RefreshCw } from "lucide-react";

interface ControlTowerHeaderProps {
  customerName: string;
  industry?: string;
  totalTables?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ControlTowerHeader: React.FC<ControlTowerHeaderProps> = ({
  customerName,
  industry,
  totalTables,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Lado Esquerdo: Logo Oficial Google Cloud + Título Executivo */}
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-28 sm:w-36 flex items-center justify-center">
            <Image
              src="https://logos-world.net/wp-content/uploads/2021/02/Google-Cloud-Logo.png"
              alt="Google Cloud Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Business Assessment Cockpit
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  v3.8 Enterprise
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {customerName ? (
                <span>
                  Cliente Ativo: <strong className="text-slate-800 dark:text-slate-200">{customerName}</strong>
                  {industry && <span className="text-slate-400"> • {industry}</span>}
                  {totalTables !== undefined && <span className="text-slate-400"> ({totalTables} tabelas auditadas)</span>}
                </span>
              ) : (
                "Aguardando ingestão de assessment de metadados"
              )}
            </p>
          </div>
        </div>

        {/* Lado Direito: Badges de Conexão com a Nuvem */}
        <div className="hidden md:flex items-center gap-3">
          {/* BigQuery Graph Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>BQ Graph:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">business_assessment_customer</span>
          </div>

          {/* Gemini 3.8 Flash Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-xs text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Modelo:</span>
            <span className="font-semibold">gemini-3.8-flash</span>
          </div>

          {/* GCS Bucket Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>GCS:</span>
            <span className="font-semibold">gs://dass-2026</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Atualizar dados do BigQuery"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
