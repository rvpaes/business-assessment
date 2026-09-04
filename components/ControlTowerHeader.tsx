// components/ControlTowerHeader.tsx - Cabeçalho com Seletor Interativo de Clientes
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  UploadCloud, 
  RefreshCw, 
  Database, 
  Building2, 
  ChevronDown, 
  Check, 
  Plus, 
  Sparkles 
} from "lucide-react";
import { GoogleCloudLogo } from "./GoogleCloudLogo";
import { CustomerAssessment } from "@/lib/types";

export interface CustomerOption {
  id: string;
  name: string;
  industry: string;
  totalTables: number;
  totalColumns: number;
  docPercentage: number;
  gcsArchiveUri?: string;
}

export interface ControlTowerHeaderProps {
  customerName?: string;
  industry?: string;
  totalTables?: number;
  docPercentage?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSearchSubmit?: (query: string) => void;
  onNavigateToUpload?: () => void;
  onSelectCustomer?: (customer: CustomerOption) => void;
}

export const ControlTowerHeader: React.FC<ControlTowerHeaderProps> = ({
  customerName = "Hypera Pharma",
  industry = "Farmacêutica & Saúde",
  totalTables = 3293,
  docPercentage = 71.4,
  onRefresh,
  isRefreshing = false,
  onSearchSubmit,
  onNavigateToUpload,
  onSelectCustomer
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customersList, setCustomersList] = useState<CustomerOption[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Busca lista de clientes disponíveis na API
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (data.customers && data.customers.length > 0) {
          setCustomersList(data.customers);
        }
      } catch (e) {
        console.warn("Erro ao buscar lista de clientes:", e);
      }
    }
    fetchCustomers();
  }, [customerName]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const filteredCustomers = customersList.filter(c =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <header className="bg-white border-b border-[#E8F1F8] px-6 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-2xs gap-4 font-sans">
      {/* 1. SELETOR INTERATIVO DE CLIENTE (Imagem 2) */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 p-1.5 -ml-1.5 rounded-2xl hover:bg-slate-50 transition-all text-left group cursor-pointer border border-transparent hover:border-slate-200"
          title="Clique para selecionar ou trocar de cliente"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-[#074878] flex items-center justify-center font-black shadow-xs shrink-0 group-hover:bg-blue-100 transition-colors">
            <Building2 className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#074878] transition-colors">
                {customerName}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                {industry}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-[#074878]" : ""}`} />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {totalTables > 0 ? `${totalTables.toLocaleString()} Tabelas Auditadas • ${docPercentage.toFixed(1)}% Documentado` : "Aguardando Ingestão de ZIP"}
            </span>
          </div>
        </button>

        {/* Dropdown Menu de Clientes */}
        {isDropdownOpen && (
          <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in duration-150">
            <div className="px-3 py-2 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Selecionar Cliente Auditado
              </span>
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Filtrar por nome ou setor..."
                className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:border-[#074878]"
                onClick={e => e.stopPropagation()}
              />
            </div>

            {/* Lista de Clientes */}
            <div className="max-h-60 overflow-y-auto py-1 space-y-1">
              {filteredCustomers.map((cust) => {
                const isSelected = cust.name.toLowerCase() === customerName.toLowerCase();
                return (
                  <button
                    key={cust.id}
                    onClick={() => {
                      if (onSelectCustomer) {
                        onSelectCustomer(cust);
                      }
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-50/80 border border-blue-200" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{cust.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded uppercase">
                          {cust.industry}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {cust.totalTables.toLocaleString()} Tabelas • {cust.docPercentage.toFixed(1)}% Doc
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#074878] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ação: Ingerir Novo Cliente */}
            <div className="pt-2 border-t border-slate-100 mt-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (onNavigateToUpload) onNavigateToUpload();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#074878] hover:bg-[#053456] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ingerir Novo Cliente (Upload ZIP)</span>
              </button>
            </div>
          </div>
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

      {/* 3. Lado Direito: Status BigQuery & Perfil */}
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

        {/* Perfil do Arquiteto/Avaliador com Google Cloud Logo */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <GoogleCloudLogo height={22} className="hidden lg:block mr-1" />
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
