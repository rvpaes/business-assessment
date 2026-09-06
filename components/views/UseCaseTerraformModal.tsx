// components/views/UseCaseTerraformModal.tsx - Modal de Visualização e Exportação de Pipelines Terraform
// Integração Multi-Motor: SQLX, Python BigFrames, PySpark Serverless e Vertex AI Gemini 3.8 Flash
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Download,
  FileCode2,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Database,
  Terminal,
  FolderArchive,
  ChevronDown,
  ChevronRight,
  Info,
  Send,
  Loader2,
  Settings2,
  Code
} from "lucide-react";
import JSZip from "jszip";
import { TopUseCase } from "@/lib/types";
import { ExtendedUseCase } from "@/lib/data/customer-usecases-catalog";
import { generateUseCaseTerraformBundle, GeneratedTerraformBundle } from "@/lib/terraform/use-case-terraform-generator";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface UseCaseTerraformModalProps {
  useCase: TopUseCase | ExtendedUseCase | null;
  customerName?: string;
  industry?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UseCaseTerraformModal: React.FC<UseCaseTerraformModalProps> = ({
  useCase,
  customerName = "Cliente Corporativo",
  industry = "Enterprise",
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [bundle, setBundle] = useState<GeneratedTerraformBundle | null>(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<"all" | "iac" | "studio" | "governance">("all");
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  
  // Refinamento com Gemini 3.8 Flash
  const [refinementPrompt, setRefinementPrompt] = useState<string>("");
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [thoughtText, setThoughtText] = useState<string | null>(null);
  const [showThoughts, setShowThoughts] = useState<boolean>(true);

  useEffect(() => {
    if (useCase && isOpen) {
      // Gera bundle local instantaneamente (Zero delay)
      const initialBundle = generateUseCaseTerraformBundle(useCase, customerName, industry);
      setBundle(initialBundle);
      setSelectedFileIdx(0);
      setThoughtText(null);
      setRefinementPrompt("");
    }
  }, [useCase, customerName, industry, isOpen]);

  if (!isOpen || !useCase || !bundle) return null;

  const filteredFiles = activeCategory === "all" 
    ? bundle.files 
    : bundle.files.filter(f => f.category === activeCategory);

  const currentFile = bundle.files[selectedFileIdx] || bundle.files[0];

  // Copiar código do arquivo ativo
  const handleCopyCode = async () => {
    if (!currentFile) return;
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  // Download individual do arquivo ativo
  const handleDownloadSingleFile = () => {
    if (!currentFile) return;
    const blob = new Blob([currentFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download de todos os arquivos em arquivo .ZIP usando JSZip
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      
      // Cria pasta do projeto no ZIP
      const rootFolder = zip.folder(`terraform-bq-studio-${useCase.useCaseId}`);
      
      bundle.files.forEach(f => {
        if (f.category === "studio" && (f.filename.endsWith(".yaml") || f.filename.endsWith(".sqlx") || f.filename.endsWith(".sql"))) {
          rootFolder?.folder("definitions")?.file(f.filename, f.content);
        } else {
          rootFolder?.file(f.filename, f.content);
        }
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `terraform-bq-studio-${useCase.useCaseId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar ZIP:", err);
    } finally {
      setIsZipping(false);
    }
  };

  // Refinamento ao vivo com Vertex AI Gemini 3.8 Flash
  const handleRefineWithGemini = async () => {
    if (!refinementPrompt.trim()) return;
    try {
      setIsRefining(true);
      const res = await fetch("/api/use-cases/terraform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useCaseId: useCase.useCaseId,
          useCaseData: useCase,
          customerName,
          industry,
          customPrompt: refinementPrompt,
          useGeminiThinking: true
        })
      });

      const data = await res.json();
      if (data.success && data.bundle) {
        setBundle(data.bundle);
        setThoughtText(data.thoughtText || "Arquitetura adaptada com sucesso via Gemini 3.8 Flash.");
        setShowThoughts(true);
      }
    } catch (err) {
      console.error("Erro ao refinar com Gemini 3.8 Flash:", err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* 1. Header do Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-900 via-[#074878] to-slate-900 text-white shrink-0">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-400/20 text-blue-200 text-[10px] font-black border border-blue-300/30 uppercase tracking-wider">
                CASO #{useCase.rank} • {useCase.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 text-[10px] font-bold uppercase flex items-center gap-1 border border-emerald-300/30">
                <Cpu className="w-3 h-3" /> Motor: {bundle.engineBreakdown.primaryEngine}
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-400/20 text-purple-200 text-[10px] font-bold uppercase flex items-center gap-1 border border-purple-300/30">
                <Sparkles className="w-3 h-3" /> Vertex AI Gemini 3.8 Flash
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              Pipeline Terraform & BigQuery Studio: <span className="text-blue-200">{useCase.title}</span>
            </h2>
            <p className="text-xs text-slate-300">
              Gerado para <strong>{customerName}</strong> ({industry}) com base nas diretrizes de <strong>/bigquery-studio-pipelines</strong>, <strong>/gcp_bq_otimization</strong> e <strong>/gcp_knowledge_catalog</strong>.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Barra de Badges de Boas Práticas & FinOps */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center gap-2 text-[11px] shrink-0">
          <span className="text-[10px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#074878]" /> Skills Ativas:
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1">
            ⚡ Particionamento Diário & Clustering x4
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1">
            🐍 BigFrames (100% Pushdown)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1">
            ⚡ PySpark Serverless Stored Proc
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1">
            📦 bigquery-workflow: preview
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1">
            🛡️ Dataplex LIGHTWEIGHT Scan
          </span>
        </div>

        {/* 3. Corpo Principal com Duas Colunas (Navegação de Arquivos + Código) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* 3.1 Painel Esquerdo: Lista de Arquivos & Categorias */}
          <div className="w-full md:w-72 border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
            {/* Filtro de Categoria */}
            <div className="p-3 border-b border-slate-200 flex gap-1">
              <button
                onClick={() => setActiveCategory("all")}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeCategory === "all" ? "bg-[#074878] text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Todos ({bundle.files.length})
              </button>
              <button
                onClick={() => setActiveCategory("iac")}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeCategory === "iac" ? "bg-[#074878] text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                IaC (.tf)
              </button>
              <button
                onClick={() => setActiveCategory("studio")}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeCategory === "studio" ? "bg-[#074878] text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Studio
              </button>
            </div>

            {/* Lista de Arquivos */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {bundle.files.map((file, idx) => {
                if (activeCategory !== "all" && file.category !== activeCategory) return null;
                const isSelected = bundle.files[selectedFileIdx]?.filename === file.filename;

                return (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-white border-2 border-[#074878] text-[#074878] font-bold shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode2 className={`w-4 h-4 shrink-0 ${
                        file.filename.endsWith(".tf") ? "text-purple-600" :
                        file.filename.endsWith(".py") ? "text-amber-600" :
                        file.filename.endsWith(".sqlx") ? "text-blue-600" :
                        file.filename.endsWith(".yaml") ? "text-emerald-600" : "text-slate-500"
                      }`} />
                      <span className="truncate">{file.filename}</span>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-[#074878] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Ações de Download do Lado Esquerdo */}
            <div className="p-3 border-t border-slate-200 space-y-2 bg-white">
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="w-full py-2.5 px-3 rounded-xl bg-[#074878] hover:bg-[#053456] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isZipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4" />}
                <span>Baixar Pacote Completo (.zip)</span>
              </button>
            </div>
          </div>

          {/* 3.2 Painel Direito: Visualizador de Código & Ações */}
          <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
            
            {/* Barra Superior do Editor */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-xs font-bold text-blue-400">
                  {currentFile.filename}
                </span>
                <span className="text-slate-500 text-[10px] hidden sm:inline">•</span>
                <span className="text-slate-400 text-[10px] truncate hidden sm:inline">
                  {currentFile.description}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copiado!" : "Copiar"}</span>
                </button>

                <button
                  onClick={handleDownloadSingleFile}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all cursor-pointer"
                  title="Baixar este arquivo"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visualizador com Números de Linha */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-[#0b1320]">
              <pre className="flex">
                {/* Linhas */}
                <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 shrink-0">
                  {currentFile.content.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Conteúdo */}
                <div className="pl-4 overflow-x-auto">
                  <code>{currentFile.content}</code>
                </div>
              </pre>
            </div>

            {/* Exibição de Raciocínio da IA (Gemini 3.8 Flash Thinking) se presente */}
            {thoughtText && (
              <div className="border-t border-slate-800 bg-slate-950/90 text-xs p-3 shrink-0">
                <button
                  onClick={() => setShowThoughts(!showThoughts)}
                  className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Raciocínio Arquitetural de Vertex AI Gemini 3.8 Flash</span>
                  </div>
                  {showThoughts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {showThoughts && (
                  <p className="mt-2 text-slate-300 text-xs leading-relaxed bg-purple-950/30 p-2.5 rounded-xl border border-purple-800/40">
                    {thoughtText}
                  </p>
                )}
              </div>
            )}

            {/* 4. Barra Inferior de Refinamento com Gemini 3.8 Flash */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isRefining) handleRefineWithGemini();
                  }}
                  placeholder="Personalizar com Gemini 3.8 Flash (ex: Adicionar particionamento horário em staging ou alertas de SLA)..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-hidden focus:border-blue-400 transition-colors"
                />
              </div>

              <button
                onClick={handleRefineWithGemini}
                disabled={isRefining || !refinementPrompt.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Refinando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Refinar com IA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
