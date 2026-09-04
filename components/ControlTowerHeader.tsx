// components/ControlTowerHeader.tsx - Cabeçalho Executivo de Business Assessment
"use client";

import React, { useState } from "react";
import { Search, UploadCloud, RefreshCw, Database, Building2, User } from "lucide-react";

export interface ControlTowerHeaderProps {
  customerName?: string;
  industry?: string;
  totalTables?: number;
  docPercentage?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSearchSubmit?: (query: string) => void;
  onNavigateToUpload?: () => void;
}

export const ControlTowerHeader: React.FC<ControlTowerHeaderProps> = ({
  customerName = "Cliente em Análise",
  industry = "Geral",
  totalTables = 0,
  docPercentage = 0,
  onRefresh,
  isRefreshing = false,
  onSearchSubmit,
  onNavigateToUpload
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="bg-white border-b border-[#E8F1F8] px-6 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-20 shadow-2xs gap-4 font-sans">
      {/* 1. Cliente Ativo & Botão de Ingestão de Novo ZIP */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-[#074878] flex items-center justify-center font-black shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                {customerName}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                {industry}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {totalTables > 0 ? `${totalTables.toLocaleString()} Tabelas Auditadas • ${docPercentage.toFixed(1)}% Documentado` : "Aguardando Ingestão de ZIP"}
            </span>
          </div>
        </div>

        {/* Botão de Ação: Ingerir ZIP / Trocar Cliente */}
        {onNavigateToUpload && (
          <button
            onClick={onNavigateToUpload}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#074878] text-xs font-bold border border-blue-200/80 transition-all cursor-pointer shadow-2xs ml-2"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#074878]" />
            <span>+ Ingerir ZIP / Trocar Cliente</span>
          </button>
        )}
      </div>

      {/* 2. Busca Central */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xs sm:max-w-md relative hidden md:block">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar tabela, coluna, caso de uso ou métrica auditada..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#074878] focus:ring-2 focus:ring-blue-500/10 transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </form>

      {/* 3. Lado Direito: Status BigQuery & Perfil do Consultor */}
      <div className="flex items-center gap-3">
        {/* Status Sincronizado do BigQuery */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>BigQuery Grounding Ativo</span>
        </div>

        {/* Sincronização manual */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Sincronizar com BigQuery"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#074878]" : ""}`} />
          </button>
        )}

        {/* Perfil do Arquiteto/Avaliador */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#074878] text-white flex items-center justify-center font-black text-xs shadow-xs">
            GC
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-extrabold text-xs text-slate-900 leading-tight">
              Arquiteto de Dados GCP
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Data & AI Assessment
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
