// components/ControlTowerSidebar.tsx - Navegação Executiva
"use client";

import React from "react";
import { UploadCloud, BrainCircuit, Target, Network, MessageSquareText, ChevronRight } from "lucide-react";

export type ActiveTab = "upload" | "debate" | "cases" | "graph" | "chat";

interface ControlTowerSidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasAssessment: boolean;
  hasUseCases: boolean;
  topCasesCount?: number;
}

export const ControlTowerSidebar: React.FC<ControlTowerSidebarProps> = ({
  activeTab,
  onSelectTab,
  hasAssessment,
  hasUseCases,
  topCasesCount = 0
}) => {
  const navItems = [
    {
      id: "upload" as ActiveTab,
      label: "Ingestão & Metadados",
      subtitle: "Upload ZIP & GCS Storage",
      icon: UploadCloud,
      badge: hasAssessment ? "Ativo" : undefined,
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
    },
    {
      id: "debate" as ActiveTab,
      label: "Neuro-Debate Studio",
      subtitle: "Tripla Rede DMN / SN / CEN",
      icon: BrainCircuit,
      badge: hasAssessment ? "Pronto" : undefined,
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
    },
    {
      id: "cases" as ActiveTab,
      label: "Top 6 Casos de Uso",
      subtitle: "Benchmarking, BC & Custos GCP",
      icon: Target,
      badge: hasUseCases ? `${topCasesCount} casos` : undefined,
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
    },
    {
      id: "graph" as ActiveTab,
      label: "Knowledge Graph (GQL)",
      subtitle: "BigQuery Property Graph",
      icon: Network,
      badge: hasUseCases ? "GQL Live" : undefined,
      badgeColor: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300"
    },
    {
      id: "chat" as ActiveTab,
      label: "Consultor Gemini 3.8",
      subtitle: "Chat Grounded & Guardrails",
      icon: MessageSquareText,
      badge: "IA",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
    }
  ];

  return (
    <nav className="flex flex-row lg:flex-col gap-2 p-2 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`group flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 whitespace-nowrap lg:whitespace-normal min-w-[200px] lg:min-w-0 ${
              isActive
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-200/80 dark:border-slate-700/80"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                  {item.subtitle}
                </div>
              </div>
            </div>
            <ChevronRight className={`hidden lg:block w-4 h-4 text-slate-300 transition-transform ${isActive ? "text-blue-600 translate-x-0.5" : "opacity-0 group-hover:opacity-100"}`} />
          </button>
        );
      })}
    </nav>
  );
};
