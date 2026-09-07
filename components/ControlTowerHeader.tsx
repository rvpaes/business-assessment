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
  Sparkles,
  Calendar
} from "lucide-react";
import { GoogleCloudLogo } from "./GoogleCloudLogo";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CustomerAssessment } from "@/lib/types";

export interface CustomerOption {
  id: string;
  assessmentId?: string;
  customerId?: string;
  name: string;
  industry: string;
  totalTables: number;
  totalColumns: number;
  docPercentage: number;
  uploadTimestamp: string;
  formattedDate?: string;
  gcsArchiveUri?: string;
}

export interface ControlTowerHeaderProps {
  customerName?: string;
  industry?: string;
  uploadTimestamp?: string;
  totalTables?: number;
  docPercentage?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSearchSubmit?: (query: string) => void;
  onNavigateToUpload?: () => void;
  onSelectCustomer?: (customer: CustomerOption) => void;
}

export function formatAssessmentDate(timestampStr?: string): string {
  if (!timestampStr) return "";
  try {
    let date: Date;
    const num = Number(timestampStr);
    if (!isNaN(num) && num > 1000000000) {
      date = new Date(num > 100000000000 ? num : num * 1000);
    } else {
      date = new Date(timestampStr);
    }
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    return "";
  }
}

export const ControlTowerHeader: React.FC<ControlTowerHeaderProps> = ({
  customerName = "Hypera Pharma",
  industry = "Farmacêutica & Saúde",
  uploadTimestamp,
  totalTables = 3293,
  docPercentage = 71.4,
  onRefresh,
  isRefreshing = false,
  onSearchSubmit,
  onNavigateToUpload,
  onSelectCustomer
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customersList, setCustomersList] = useState<CustomerOption[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Busca lista de assessments/clientes disponíveis na API
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
  }, [customerName, uploadTimestamp]);

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
    c.industry.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (c.formattedDate && c.formattedDate.toLowerCase().includes(filterQuery.toLowerCase())) ||
    (c.uploadTimestamp && c.uploadTimestamp.includes(filterQuery))
  );

  const displayHeaderDate = formatAssessmentDate(uploadTimestamp);

  return (
    <header className="bg-white border-b border-[#E8F1F8] px-6 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-2xs gap-4 font-sans">
      {/* 1. SELETOR INTERATIVO DE CLIENTE & ASSESSMENT COM DATA */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 p-1.5 -ml-1.5 rounded-2xl hover:bg-slate-50 transition-all text-left group cursor-pointer border border-transparent hover:border-slate-200"
          title="Clique para selecionar ou trocar de assessment"
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
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
              {displayHeaderDate && (
                <span className="inline-flex items-center gap-1 text-[#074878] font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 shrink-0">
                  <Calendar className="w-2.5 h-2.5" />
                  {displayHeaderDate}
                </span>
              )}
              <span className="truncate">
                {totalTables > 0 ? `${totalTables.toLocaleString()} ${t("auditedTables")} • ${docPercentage.toFixed(1)}% ${t("documented")}` : t("waitingZipIngestion")}
              </span>
            </div>
          </div>
        </button>

        {/* Dropdown Menu de Assessments / Clientes */}
        {isDropdownOpen && (
          <div className="absolute left-0 top-full mt-2 w-88 sm:w-[420px] bg-white rounded-3xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in duration-150">
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  {t("selectedCustomerTitle")} ({filteredCustomers.length})
                </span>
                <span className="text-[9px] font-semibold text-slate-400">
                  Segmento • Data • Nome
                </span>
              </div>
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Filtrar por nome, segmento ou data..."
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:border-[#074878]"
                onClick={e => e.stopPropagation()}
              />
            </div>

            {/* Lista Ordenada por Segmento, Data e Nome */}
            <div className="max-h-72 overflow-y-auto py-1 space-y-1">
              {filteredCustomers.length === 0 ? (
                <div className="py-6 px-3 text-center">
                  <p className="text-xs font-bold text-slate-700">Nenhum assessment registrado</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Faça o upload de um arquivo ZIP para iniciar um novo assessment.
                  </p>
                </div>
              ) : (
                filteredCustomers.map((cust, idx) => {
                const isSelected = cust.name.toLowerCase() === customerName.toLowerCase() && 
                  (!uploadTimestamp || cust.uploadTimestamp === uploadTimestamp);
                const showSegmentHeader = idx === 0 || cust.industry.toLowerCase() !== filteredCustomers[idx - 1].industry.toLowerCase();
                const itemDate = cust.formattedDate || formatAssessmentDate(cust.uploadTimestamp);

                return (
                  <React.Fragment key={cust.id || `${cust.name}_${idx}`}>
                    {showSegmentHeader && (
                      <div className="pt-2.5 pb-1 px-2.5 flex items-center justify-between border-t border-slate-100 first:border-0 first:pt-1">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#074878]" />
                          {cust.industry}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (onSelectCustomer) {
                          onSelectCustomer(cust);
                        }
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-colors cursor-pointer ${
                        isSelected ? "bg-blue-50/80 border border-blue-200" : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{cust.name}</span>
                          {itemDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#074878] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/50">
                              <Calendar className="w-2.5 h-2.5" />
                              {itemDate}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>
                            {cust.totalTables.toLocaleString()} {t("tables")} • {cust.docPercentage.toFixed(1)}% Doc
                          </span>
                          {cust.assessmentId && (
                            <span className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]">
                              {cust.assessmentId}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#074878] shrink-0" />
                      )}
                    </button>
                  </React.Fragment>
                );
              }))}
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
                <span>{t("ingestNew")}</span>
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
          placeholder={t("searchPlaceholder")}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#074878] focus:ring-2 focus:ring-blue-500/10 transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </form>

      {/* 3. Lado Direito: Seletor de Idioma, Status BigQuery & Perfil */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Seletor Executivo de Idioma (pt-BR, en-US, es-ES) */}
        <LanguageSelector />

        {/* Status Sincronizado do BigQuery */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t("groundingActive")}</span>
        </div>

        {/* Sincronização manual */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title={t("syncBigQuery")}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#074878]" : ""}`} />
          </button>
        )}

        {/* Perfil do Arquiteto/Avaliador */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#074878] text-white flex items-center justify-center font-black text-xs shadow-xs">
            GC
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-extrabold text-xs text-slate-900 leading-tight">
              {t("architectRole")}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {t("assessmentSubtitle")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
