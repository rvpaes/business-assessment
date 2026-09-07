// components/ui/ModoMicroCharts.tsx - Micro-visualizações gráficas SVG inspiradas no ModoUI
"use client";

import React from "react";
import { MoreVertical } from "lucide-react";

/**
 * 1. Gráfico de Micro-Barras Verticais Arredondadas (Estilo ModoUI)
 * Renderiza 7 a 8 barras com cantos arredondados, realçando o pico ou tendência
 */
export interface ModoBarChartProps {
  height?: number;
  highlightIndex?: number;
  highlightColor?: string; // e.g. "bg-blue-600" ou "bg-emerald-600"
  secondaryHighlightIndex?: number;
  secondaryHighlightColor?: string;
  values?: number[]; // Valores normalizados entre 15 e 100
}

export const ModoBarChart: React.FC<ModoBarChartProps> = ({
  height = 56,
  highlightIndex = 5,
  highlightColor = "bg-blue-600",
  secondaryHighlightIndex,
  secondaryHighlightColor,
  values = [28, 22, 25, 24, 45, 88, 76, 32],
}) => {
  return (
    <div className="flex items-end justify-between gap-2 w-full select-none" style={{ height: `${height}px` }}>
      {values.map((val, idx) => {
        const isHighlight = idx === highlightIndex;
        const isSecondary = secondaryHighlightIndex !== undefined && idx === secondaryHighlightIndex;
        
        let barColor = "bg-slate-100 hover:bg-slate-200";
        if (isHighlight) {
          barColor = `${highlightColor} shadow-xs`;
        } else if (isSecondary && secondaryHighlightColor) {
          barColor = secondaryHighlightColor;
        }

        return (
          <div
            key={idx}
            className="flex-1 h-full flex items-end justify-center group/bar"
          >
            <div
              className={`w-full max-w-[28px] rounded-lg transition-all duration-300 ${barColor}`}
              style={{ height: `${Math.max(16, Math.min(100, val))}%` }}
              title={`Período ${idx + 1}: ${val}%`}
            />
          </div>
        );
      })}
    </div>
  );
};

/**
 * 2. Barra de Progresso Linear Suave (Estilo ModoUI)
 */
export interface ModoProgressBarProps {
  percentage: number; // 0 a 100
  label?: string;
  sublabel?: string;
  color?: string; // e.g. "bg-blue-600"
}

export const ModoProgressBar: React.FC<ModoProgressBarProps> = ({
  percentage = 71.4,
  label = "250 Reached",
  sublabel,
  color = "bg-blue-600"
}) => {
  const safePercent = Math.max(0, Math.min(100, percentage));
  return (
    <div className="w-full space-y-2 select-none py-1">
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>{label}</span>
        {sublabel && <span className="font-bold text-slate-700">{sublabel}</span>}
      </div>
    </div>
  );
};

/**
 * 3. Micro Donut / Gauge Circular (Estilo ModoUI)
 */
export interface ModoGaugeChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string; // hex stroke
  trackColor?: string;
  centerText?: string;
  centerSubtext?: string;
}

export const ModoGaugeChart: React.FC<ModoGaugeChartProps> = ({
  percentage = 71.4,
  size = 56,
  strokeWidth = 7,
  color = "#1A73E8",
  trackColor = "#F1F5F9",
  centerText,
  centerSubtext
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.max(0, Math.min(100, percentage)) / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Trilha de Fundo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Segmento Preenchido */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>

      {(centerText || centerSubtext) && (
        <div className="flex flex-col">
          {centerText && <span className="text-xs font-black text-slate-900">{centerText}</span>}
          {centerSubtext && <span className="text-[10px] text-slate-400 font-medium">{centerSubtext}</span>}
        </div>
      )}
    </div>
  );
};

/**
 * 4. Card KPI ModoUI Completo com Topo, Meio (Gráfico) e Rodapé
 */
export interface ModoKPICardProps {
  mainValue: string;
  subValue?: string;
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  badgeColor?: string; // e.g. "border-slate-200 text-slate-600 bg-slate-50"
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onOptionsClick?: () => void;
  className?: string;
}

export const ModoKPICard: React.FC<ModoKPICardProps> = ({
  mainValue,
  subValue,
  badgeText,
  badgeIcon,
  badgeColor = "border-slate-200 text-slate-600 bg-slate-50",
  title,
  subtitle,
  children,
  onOptionsClick,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${className}`}>
      {/* Topo do Card: Número Grande + Badge + Menu 3 Pontos */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 tabular-nums">
              {mainValue}
            </div>
            {subValue && (
              <p className="text-[11px] text-slate-400 font-medium">
                {subValue}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {badgeText && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${badgeColor}`}>
                {badgeIcon}
                <span>{badgeText}</span>
              </span>
            )}
            <button
              onClick={onOptionsClick}
              className="p-1 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Mais opções"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meio: Área da Micro-Visualização Gráfica */}
        <div className="my-5 min-h-[60px] flex items-center">
          {children}
        </div>
      </div>

      {/* Rodapé: Título e Subtítulo no Estilo ModoUI */}
      <div className="pt-2 border-t border-slate-100/80">
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
          {title}
        </h4>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
