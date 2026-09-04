// components/views/UploadIngestionView.tsx - Ingestão com Detecção de Setor por Gemini & Info Adicional
"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, 
  FileArchive, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Building2,
  Globe,
  FileText,
  Check,
  Database,
  ChevronRight,
  Bot
} from "lucide-react";
import { GoogleCloudLogo } from "../GoogleCloudLogo";
import { CustomerAssessment, TableCatalogItem } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface UploadIngestionViewProps {
  assessment: CustomerAssessment | null;
  onAssessmentLoaded: (assessment: CustomerAssessment, tables: TableCatalogItem[]) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToCases?: () => void;
}

export const UploadIngestionView: React.FC<UploadIngestionViewProps> = ({
  assessment,
  onAssessmentLoaded,
  onNavigateToDashboard,
  onNavigateToCases
}) => {
  const { t } = useLanguage();
  const [customerName, setCustomerName] = useState(assessment?.customerName || "");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState(assessment?.industry || "Varejo & E-commerce");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isDetectingSector, setIsDetectingSector] = useState(false);
  const [sectorDetectedByAi, setSectorDetectedByAi] = useState(false);
  const [sectorRationale, setSectorRationale] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const industriesList = [
    "Varejo & E-commerce",
    "Financeiro & Fintech",
    "Farmacêutica & Saúde",
    "Bens de Consumo & CPG",
    "Manufatura & Indústria",
    "Logística & Supply Chain",
    "Telecom & Mídia",
    "Tecnologia & SaaS",
    "Energia & Utilities",
    "Educação & Serviços",
    "iGaming & Apostas Regulamentadas",
    "Outro Segmento"
  ];

  // Identificação automática de setor com Gemini 3.8 Flash
  const handleDetectIndustry = async (nameOverride?: string, urlOverride?: string) => {
    const targetName = nameOverride !== undefined ? nameOverride : customerName;
    const targetUrl = urlOverride !== undefined ? urlOverride : websiteUrl;

    if (!targetName.trim() && !targetUrl.trim()) return;

    setIsDetectingSector(true);
    try {
      const res = await fetch("/api/identify-sector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: targetName.trim(),
          websiteUrl: targetUrl.trim(),
          additionalInfo: additionalInfo.trim()
        })
      });
      const data = await res.json();
      if (data.industry) {
        setIndustry(data.industry);
        setSectorDetectedByAi(true);
        if (data.rationale) {
          setSectorRationale(data.rationale);
        }
      }
    } catch (e) {
      console.warn("Falha ao detectar setor automaticamente:", e);
    } finally {
      setIsDetectingSector(false);
    }
  };

  // Auto-detecção dinâmica ao digitar Nome da Empresa ou URL (Debounce de 500ms)
  useEffect(() => {
    const trimmedName = customerName.trim();
    const trimmedUrl = websiteUrl.trim();

    // Dispara a busca inteligente se houver nome ou URL
    if (trimmedName.length < 2 && trimmedUrl.length < 5) return;

    const timer = setTimeout(() => {
      handleDetectIndustry(trimmedName, trimmedUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [customerName, websiteUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".zip")) {
        setErrorMessage(t("errZipOnly"));
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith(".zip")) {
        setErrorMessage(t("errZipOnly"));
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  const handleUpload = async () => {
    if (!customerName.trim()) {
      setErrorMessage(t("errClientRequired"));
      return;
    }
    if (!selectedFile) {
      setErrorMessage(t("errZipRequired"));
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage(t("msgSavingGcsBq"));

    try {
      const formData = new FormData();
      formData.append("customerName", customerName.trim());
      formData.append("websiteUrl", websiteUrl.trim());
      formData.append("industry", industry);
      formData.append("additionalInfo", additionalInfo.trim());
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha no processamento do arquivo.");
      }

      setStatusMessage(t("msgAssessmentSuccess"));
      onAssessmentLoaded(data.assessment, data.topTablesSample || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro durante o upload do pacote.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async () => {
    const finalCustomerName = customerName.trim() || "Hypera Pharma";
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage(t("msgLoadingSample"));

    try {
      const res = await fetch("/api/sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customerName: finalCustomerName,
          websiteUrl: websiteUrl,
          industry: industry,
          additionalInfo: additionalInfo
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao carregar arquivo de exemplo.");
      }

      setStatusMessage(t("msgSampleSuccess"));
      onAssessmentLoaded(data.assessment, data.topTablesSample || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao carregar o exemplo local.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200 font-sans py-4">
      {/* 1. Header Minimalista & Direto */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <GoogleCloudLogo height={34} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#074878] text-[11px] font-black uppercase tracking-wider">
          <Database className="w-3.5 h-3.5" />
          <span>Google Cloud Business Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t("startBusinessAssessmentTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          {t("startBusinessAssessmentSub")}
        </p>
      </div>

      {/* 2. Card Principal de Ingestão */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Passo 1: Informações do Cliente */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#074878] text-white text-[11px] font-black flex items-center justify-center">
                1
              </span>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
                {t("whoIsCustomer")}
              </h2>
            </div>

            {/* Indicador de Identificação de Setor por IA */}
            {isDetectingSector && (
              <span className="text-[10px] font-bold text-[#074878] flex items-center gap-1.5 animate-pulse bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                <RefreshCw className="w-3 h-3 animate-spin text-[#074878]" />
                {t("analyzingIndustryAI")}
              </span>
            )}
            {sectorDetectedByAi && !isDetectingSector && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{t("identifiedIndustry")} <strong className="font-extrabold">{industry}</strong></span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome da Empresa */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {t("companyNameLabel")}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setSectorDetectedByAi(false);
                }}
                onBlur={() => handleDetectIndustry()}
                placeholder={t("companyPlaceholder")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#074878]/20 focus:border-[#074878] transition-all"
              />
            </div>

            {/* URL / Site do Cliente (Ajuste 1) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                {t("customerWebsiteLabel")}
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value);
                  setSectorDetectedByAi(false);
                }}
                onBlur={() => handleDetectIndustry()}
                placeholder={t("websiteUrlPlaceholder")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#074878]/20 focus:border-[#074878] transition-all"
              />
            </div>
          </div>

          {/* Setor de Atuação (Auto-detectado pelo Gemini - Ajuste 2) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-600">
                {t("industryLabel")}
              </label>
              <button
                type="button"
                onClick={() => handleDetectIndustry()}
                disabled={isDetectingSector || (!customerName && !websiteUrl)}
                className="text-[10px] font-bold text-[#074878] hover:underline inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {isDetectingSector ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>{t("identifyingIndustry")}</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3" />
                    <span>{t("reclassifyWithAI")}</span>
                  </>
                )}
              </button>
            </div>
            <select
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setSectorDetectedByAi(false);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#074878]/20 focus:border-[#074878] transition-all cursor-pointer"
            >
              {industriesList.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Informações Adicionais do Cliente (Textarea Opcional - Ajuste 3) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              {t("strategicInfoLabel")}
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
              placeholder={t("strategicInfoPlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#074878]/20 focus:border-[#074878] transition-all resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {t("strategicInfoHelp")}
            </p>
          </div>
        </div>

        {/* Passo 2: Dropzone de Arquivo ZIP */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#074878] text-white text-[11px] font-black flex items-center justify-center">
              2
            </span>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {t("metadataZipTitle")}
            </h2>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".zip"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
              isDragging
                ? "border-[#074878] bg-blue-50/60 scale-[0.99]"
                : selectedFile
                ? "border-emerald-300 bg-emerald-50/30"
                : "border-slate-200 hover:border-[#074878] hover:bg-slate-50/60 bg-slate-50/30"
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2 animate-in fade-in duration-150">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {t("clickToReplace")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#074878] flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {t("dragZipTitle")}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t("dragZipDesc")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleUpload}
            disabled={isLoading || !selectedFile || !customerName.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#074878] hover:bg-[#053456] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t("processingGemini")}</span>
              </>
            ) : (
              <>
                <span>{t("startAssessmentBtn")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={handleLoadSample}
              disabled={isLoading}
              className="text-xs font-bold text-[#074878] hover:text-blue-800 hover:underline inline-flex items-center gap-1.5 cursor-pointer transition-colors py-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("trySamplePackage")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Card de Cliente Ativo (se já houver assessment carregado) */}
      {assessment && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-[#074878] tracking-wider block">
                {t("currentAssessmentLoaded")}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-base font-extrabold text-slate-900">{assessment.customerName}</h3>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                  {assessment.industry}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {t("indexedInBigQuery")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{t("tables")}</span>
              <div className="text-base font-black text-[#074878] mt-0.5">
                {assessment.totalTables.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{t("columns")}</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {assessment.totalColumns.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{t("documentation")}</span>
              <div className="text-base font-black text-emerald-600 mt-0.5">
                {assessment.docPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Ajuste 5: Visão Geral renomeada para Agent Intelligence */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#074878] hover:bg-[#053456] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t("accessIntelligence")}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {onNavigateToCases && (
              <button
                onClick={onNavigateToCases}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t("viewUseCasesRoi")}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
