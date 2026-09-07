// components/ModernTopNavbar.tsx - Barra de Navegação Superior Executiva inspirada no ModoUI
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  Target, 
  BrainCircuit, 
  Sparkles, 
  UploadCloud, 
  Search, 
  Calendar, 
  Building2, 
  ChevronDown, 
  Check, 
  Plus, 
  RefreshCw, 
  Menu, 
  X,
  Command,
  SlidersHorizontal
} from "lucide-react";
import { GoogleCloudLogo } from "./GoogleCloudLogo";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CustomerOption, formatAssessmentDate } from "./ControlTowerHeader";

export type ModernNavTab = "upload" | "decision" | "cases" | "chat";

export interface ModernTopNavbarProps {
  activeTab: ModernNavTab;
  onTabChange: (tab: ModernNavTab) => void;
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
  casesCount?: number;
}

export const ModernTopNavbar: React.FC<ModernTopNavbarProps> = ({
  activeTab,
  onTabChange,
  customerName = "Hypera Pharma",
  industry = "Farmacêutica & Saúde",
  uploadTimestamp,
  totalTables = 3293,
  docPercentage = 71.4,
  onRefresh,
  isRefreshing = false,
  onSearchSubmit,
  onNavigateToUpload,
  onSelectCustomer,
  casesCount = 6
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customersList, setCustomersList] = useState<CustomerOption[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
        console.warn("Erro ao carregar clientes na Topbar:", e);
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

  // Atalho de teclado ⌘K ou Ctrl+K para focar na busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

  // Menu superior enxuto e de alto nível (4 pilares executivos)
  const navItems = [
    {
      id: "upload" as ModernNavTab,
      label: t("tabUpload") || "Assessment de Negócio",
      icon: UploadCloud,
    },
    {
      id: "decision" as ModernNavTab,
      label: t("tabDecision") || "Visão Executiva",
      icon: LayoutDashboard,
    },
    {
      id: "cases" as ModernNavTab,
      label: t("tabCases") || "Casos de Uso",
      icon: Target,
      badge: casesCount > 0 ? `${casesCount}` : undefined,
    },
    {
      id: "chat" as ModernNavTab,
      label: t("tabChat") || "Data Agent BQ",
      icon: Sparkles,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 font-sans shadow-2xs">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-3 sm:gap-6">
          
          {/* 1. AJUSTE 2: LOGO GOOGLE CLOUD NA PARTE CLARA MAIS À ESQUERDA (SEM CONTAINER ESCURO) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <GoogleCloudLogo height={24} textColor="dark" showText={true} />
            </div>

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            <span className="hidden md:inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-[#074878] border border-blue-200/80 uppercase tracking-wider">
              Cockpit
            </span>

            {/* SELETOR INTERATIVO DE CLIENTE E ASSESSMENT (Pill Clean - visível em notebook e desktop) */}
            <div className="relative hidden lg:block ml-1" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-all text-left cursor-pointer group"
                title="Clique para trocar de assessment"
              >
                <Building2 className="w-3.5 h-3.5 text-[#074878]" />
                <span className="font-bold text-xs text-slate-800 group-hover:text-[#074878] transition-colors max-w-[130px] truncate">
                  {customerName}
                </span>
                {displayHeaderDate && (
                  <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/60 shrink-0">
                    {displayHeaderDate}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isDropdownOpen ? "rotate-180 text-[#074878]" : ""}`} />
              </button>

              {/* Dropdown Menu com Segmento, Data e Nome */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-96 bg-white rounded-3xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in duration-150 font-sans">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
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

                  <div className="max-h-72 overflow-y-auto py-1 space-y-1">
                    {filteredCustomers.length === 0 ? (
                      <div className="py-6 px-3 text-center">
                        <p className="text-xs font-bold text-slate-700">Nenhum assessment registrado</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Inicie um novo assessment de negócio para começar.
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
                              <div className="pt-2 pb-1 px-2.5 flex items-center justify-between border-t border-slate-100 first:border-0 first:pt-1">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#074878]" />
                                  {cust.industry}
                                </span>
                              </div>
                            )}

                            <button
                              onClick={() => {
                                if (onSelectCustomer) onSelectCustomer(cust);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-2xl text-left transition-colors cursor-pointer ${
                                isSelected ? "bg-blue-50/80 border border-blue-200" : "hover:bg-slate-50 border border-transparent"
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900">{cust.name}</span>
                                  {itemDate && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#074878] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/50">
                                      <Calendar className="w-2.5 h-2.5" />
                                      {itemDate}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {cust.totalTables.toLocaleString()} tabelas • {cust.docPercentage.toFixed(1)}% Doc
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-[#074878] shrink-0" />
                              )}
                            </button>
                          </React.Fragment>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. AJUSTE 1: MENU SUPERIOR COM ALTO CONTRASTE E SEM QUEBRA DE LINHA */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-full border border-slate-200 shadow-2xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#074878] text-white shadow-sm ring-1 ring-[#074878]"
                      : "text-slate-700 hover:text-slate-950 hover:bg-white/90"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#074878]"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9.5px] font-black px-2 py-0.5 rounded-full leading-none shrink-0 ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* 3. LADO DIREITO: BUSCA, IDIOMA & AVATAR */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Campo de Busca Executiva (Notebook/Desktop) */}
            <form onSubmit={handleSearch} className="relative hidden md:block w-40 xl:w-48">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-11 py-1.5 bg-slate-100 hover:bg-slate-100/90 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#074878] focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <kbd className="absolute right-2 top-1.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-semibold text-slate-400 shadow-2xs pointer-events-none flex items-center gap-0.5">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </form>

            {/* Seletor de Idioma */}
            <LanguageSelector />

            {/* Sincronização BigQuery */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title={t("syncBigQuery")}
                className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#074878]" : ""}`} />
              </button>
            )}

            {/* Avatar do Usuário / Arquiteto */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#074878] to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 cursor-default ring-2 ring-white">
              GC
            </div>

            {/* Botão Hambúrguer Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MENU MOBILE EXPANSÍVEL */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 space-y-3 animate-in slide-in-from-top duration-150">
            {/* Seletor de Cliente Interativo no Mobile */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#074878]" />
                  Assessment Ativo
                </span>
                {displayHeaderDate && (
                  <span className="text-[10px] font-bold text-[#074878] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                    {displayHeaderDate}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{customerName}</h4>
                  <p className="text-[10px] text-slate-500">{industry} • {totalTables.toLocaleString()} tabelas</p>
                </div>
                {customersList.length > 1 && (
                  <select
                    value={customersList.findIndex(c => c.name.toLowerCase() === customerName.toLowerCase())}
                    onChange={(e) => {
                      const selected = customersList[Number(e.target.value)];
                      if (selected && onSelectCustomer) {
                        onSelectCustomer(selected);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white text-[#074878]"
                  >
                    {customersList.map((c, i) => (
                      <option key={i} value={i}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Busca Mobile */}
            <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar casos de uso, tabelas..."
                className="w-full pl-8 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#074878]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            {/* Navegação Mobile */}
            <div className="grid grid-cols-1 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#074878] text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
