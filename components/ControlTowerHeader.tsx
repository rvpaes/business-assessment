// components/ControlTowerHeader.tsx - Cabeçalho Executivo Ultra-Clean
"use client";

import React, { useState } from "react";
import { Search, LogOut, Sparkles, RefreshCw } from "lucide-react";

export interface ControlTowerHeaderProps {
  customerName?: string;
  industry?: string;
  totalTables?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSearchSubmit?: (query: string) => void;
}

export const ControlTowerHeader: React.FC<ControlTowerHeaderProps> = ({
  customerName = "Hypera Pharma",
  industry = "Farmacêutica & Saúde",
  totalTables = 3293,
  onRefresh,
  isRefreshing = false,
  onSearchSubmit
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="bg-white border-b border-[#E8F1F8] px-6 sm:px-10 py-3 flex items-center justify-between sticky top-0 z-20 shadow-2xs gap-4 font-sans">
      {/* 1. Busca Central Estilo Hypera */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar produto, médico, representante ou cliente..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#074878] focus:ring-2 focus:ring-blue-500/10 transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </form>

      {/* 2. Lado Direito: Status Sincronizado + Perfil Executivo */}
      <div className="flex items-center gap-4">
        {/* Status Sincronizado */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Agenda & Visitas Sincronizadas</span>
        </div>

        {/* Botão de Atualização Opcional */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Sincronizar dados BigQuery"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#074878]" : ""}`} />
          </button>
        )}

        {/* Perfil Executivo (Adriana Barberi Ferreira) */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-black text-xs shadow-xs">
            AD
          </div>
          <div className="hidden md:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-slate-900">
                ADRIANA BARBERI FERREIRA
              </span>
              <span className="px-1.5 py-0.2 bg-[#074878] text-white text-[9px] font-bold rounded uppercase">
                GD
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Distrito 102010000 - FEMME
            </span>
          </div>
          <button
            title="Alternar Perfil"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
