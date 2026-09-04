// components/ControlTowerSidebar.tsx - Sidebar Executiva de Business Assessment
"use client";

import React from "react";
import {
  UploadCloud,
  LayoutDashboard,
  Target,
  Network,
  Sparkles,
  Database
} from "lucide-react";
import { GoogleCloudLogo } from "./GoogleCloudLogo";

export type NavigationTab = "upload" | "decision" | "cases" | "graph" | "chat";

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
      id: "upload" as NavigationTab,
      label: "Ingestão & Metadados",
      icon: UploadCloud,
      badge: "INÍCIO",
      badgeColor: "bg-blue-100 text-[#074878]",
    },
    {
      id: "decision" as NavigationTab,
      label: "Agent Intelligence",
      icon: LayoutDashboard,
      badge: "MESA",
      badgeColor: "bg-[#074878] text-white",
    },
    {
      id: "cases" as NavigationTab,
      label: "Casos de Uso & BC",
      icon: Target,
      badge: "CASES",
      badgeColor: "bg-purple-100 text-purple-700",
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
      label: "Data Agent Conversacional",
      icon: Sparkles,
      badge: "IA",
      badgeColor: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E8F1F8] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none shadow-xs z-30 font-sans">
      {/* Topo: Brand Header Executivo Google Cloud Business Assessment */}
      <div>
        <div className="px-5 py-4 border-b border-[#E8F1F8] flex flex-col justify-center min-h-[73px]">
          <div className="flex items-center gap-2">
            <GoogleCloudLogo height={28} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[8.5px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-[#074878] border border-blue-100 uppercase tracking-wider">
              BUSINESS ASSESSMENT COCKPIT
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

      {/* Rodapé da Sidebar: Status da Stack de Dados */}
      <div className="p-4 border-t border-[#E8F1F8] space-y-2 bg-slate-50/50">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">BigQuery & Storage:</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Conectado
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Motor Cognitivo:</span>
          <span className="text-[#074878] font-bold">Gemini 3.8 Flash</span>
        </div>
      </div>
    </aside>
  );
};
