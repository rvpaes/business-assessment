// components/ControlTowerSidebar.tsx - Sidebar Executiva Estilo Hypera Commercial Brain
"use client";

import React from "react";
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Network,
  Sparkles,
  Settings,
  ShieldCheck
} from "lucide-react";

export type NavigationTab = "decision" | "cases" | "kpis" | "graph" | "chat" | "upload";

export interface ControlTowerSidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  casesCount?: number;
}

export const ControlTowerSidebar: React.FC<ControlTowerSidebarProps> = ({
  activeTab,
  onTabChange,
  casesCount = 6
}) => {
  const navItems = [
    {
      id: "decision" as NavigationTab,
      label: "Visão Geral",
      icon: LayoutDashboard,
      badge: "MESA",
      badgeColor: "bg-[#074878] text-white",
    },
    {
      id: "cases" as NavigationTab,
      label: "Missões & Campo",
      icon: Target,
      badge: "PLANO",
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      id: "kpis" as NavigationTab,
      label: "KPIs & Simulador",
      icon: BarChart3,
      badge: "METAS",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "graph" as NavigationTab,
      label: "Property Graph GQL",
      icon: Network,
      badge: "GRAFO",
      badgeColor: "bg-violet-100 text-violet-700",
    },
    {
      id: "chat" as NavigationTab,
      label: "Assistente Inteligente",
      icon: Sparkles,
      badge: "IA",
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      id: "upload" as NavigationTab,
      label: "Configurações",
      icon: Settings,
      badge: "CONTA",
      badgeColor: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E8F1F8] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none shadow-xs z-30 font-sans">
      {/* Topo: Brand Header com Logo Oficial Estilo Hypera */}
      <div>
        <div className="px-6 py-4 border-b border-[#E8F1F8] flex flex-col justify-center min-h-[73px]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#00A3E0] flex items-center justify-center shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#00A3E0]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black tracking-tight text-[#002B49]">
                Hypera
              </span>
              <span className="text-[11px] font-normal italic text-[#00A3E0]">
                pharma
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-extrabold tracking-wider text-[#074878] uppercase">
              BUSINESS INSIGHTS & DEMANDA
            </span>
          </div>
        </div>

        {/* Itens de Navegação */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#074878] text-white shadow-sm"
                    : "text-[#5A6B7A] hover:bg-slate-50 hover:text-[#1A2733]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#5A6B7A]"}`} />
                  <span>{item.label}</span>
                </div>

                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    isActive ? "bg-white/20 text-white" : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Status Operacional */}
      <div className="p-4 border-t border-[#E8F1F8] space-y-2 bg-slate-50/50">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Status do Sistema:</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operacional
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Dados de Mercado & Vendas:</span>
          <span className="text-slate-700 font-bold">Atualizado Hoje</span>
        </div>
      </div>
    </aside>
  );
};
