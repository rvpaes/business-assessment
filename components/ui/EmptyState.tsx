// components/ui/EmptyState.tsx - Componente visual para estado vazio elegante
import React from "react";
import { FolderSearch, Sparkles, Database } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: "search" | "ai" | "database";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = "search"
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "ai":
        return <Sparkles className="w-10 h-10 text-blue-500" />;
      case "database":
        return <Database className="w-10 h-10 text-indigo-500" />;
      default:
        return <FolderSearch className="w-10 h-10 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mb-4 ring-8 ring-blue-50/50 dark:ring-blue-950/20">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
