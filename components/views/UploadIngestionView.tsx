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
  ChevronRight,
  Bot,
  Database,
  Download,
  FileCode2
} from "lucide-react";
import { CustomerAssessment, TableCatalogItem } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { GoogleCloudIcon } from "../GoogleCloudLogo";

// Ícone Oficial Databricks (SVG)
export const DatabricksIcon: React.FC<{ size?: number; className?: string }> = ({ size = 22, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    style={{ width: `${size}px`, height: `${size}px` }}
    className={`shrink-0 select-none ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Databricks"
  >
    <path
      d="M.95 14.184L12 20.403l9.919-5.55v2.21L12 22.662l-10.484-5.96-.565.308v.77L12 24l11.05-6.218v-4.317l-.515-.309L12 19.118l-9.867-5.653v-2.21L12 16.805l11.05-6.218V6.32l-.515-.308L12 11.974 2.647 6.681 12 1.388l7.76 4.368.668-.411v-.566L12 0 .95 6.27v.72L12 13.207l9.919-5.55v2.26L12 15.52 1.516 9.56l-.565.308Z"
      fill="#FF3621"
    />
  </svg>
);

// Ícone Oficial Snowflake (SVG)
export const SnowflakeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 22, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    style={{ width: `${size}px`, height: `${size}px` }}
    className={`shrink-0 select-none ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Snowflake"
  >
    <path
      d="M24 3.459c0 .646-.418 1.18-1.141 1.18-.723 0-1.142-.534-1.142-1.18 0-.647.419-1.18 1.142-1.18.723 0 1.141.533 1.141 1.18zm-.228 0c0-.533-.38-.951-.913-.951s-.913.38-.913.95c0 .533.38.952.913.952.57 0 .913-.419.913-.951zm-1.37-.533h.495c.266 0 .456.152.456.38 0 .153-.076.229-.19.305l.19.266v.038h-.266l-.19-.266h-.229v.266h-.266zm.495.228h-.229v.267h.229c.114 0 .152-.038.152-.114.038-.077-.038-.153-.152-.153zM7.602 12.4c.038-.151.076-.304.076-.456 0-.114-.038-.228-.038-.342-.114-.343-.304-.647-.646-.838l-4.87-2.777c-.685-.38-1.56-.152-1.94.533-.381.685-.153 1.56.532 1.94l2.701 1.56-2.701 1.56c-.685.38-.913 1.256-.533 1.94.38.685 1.256.914 1.94.533l4.832-2.777c.343-.267.571-.533.647-.876zm1.332 2.626c-.266-.038-.57.038-.837.19l-4.832 2.777c-.685.38-.913 1.256-.532 1.94.38.686 1.255.914 1.94.533l2.701-1.56v3.12c0 .8.647 1.408 1.446 1.408.799 0 1.407-.647 1.407-1.408v-5.592c0-.761-.57-1.37-1.293-1.408zm4.946-6.088c.266.038.57-.038.837-.19l4.832-2.777c.685-.38.913-1.256.532-1.94-.38-.686-1.255-.914-1.94-.533l-2.701 1.56V1.975c0-.799-.647-1.408-1.446-1.408-.799 0-1.446.609-1.446 1.408V7.53c0 .76.609 1.37 1.332 1.407zM3.265 5.97l4.832 2.777c.266.152.533.19.837.19.723-.038 1.331-.684 1.331-1.407V1.975c0-.799-.646-1.408-1.407-1.408-.799 0-1.446.647-1.446 1.408v3.12l-2.701-1.56c-.685-.38-1.56-.152-1.94.533-.419.646-.19 1.521.494 1.902zm9.093 6.011a.412.412 0 00-.114-.266l-.57-.571a.346.346 0 00-.267-.114.412.412 0 00-.266.114l-.571.57a.411.411 0 00-.114.267c0 .076.038.19.114.267l.57.57a.345.345 0 00.267.114c.076 0 .19-.038.266-.114l.571-.57a.412.412 0 00.114-.267zm1.598.533L11.94 14.53c-.039.038-.153.114-.229.114h-.608a.411.411 0 01-.267-.114L8.82 12.514a.408.408 0 01-.076-.229v-.608c0-.076.038-.19.114-.267l2.016-2.016a.41.41 0 01.267-.114h.608a.41.41 0 01.267.114l2.016 2.016a.347.347 0 01.114.267v.608c-.076.077-.114.19-.19.229zm5.593 5.44l-4.832-2.777c-.266-.152-.57-.19-.837-.152-.723.038-1.332.684-1.332 1.408v5.554c0 .8.647 1.408 1.408 1.408.799 0 1.446-.647 1.446-1.408v-3.12l2.7 1.56c.686.38 1.561.152 1.941-.533.419-.646.19-1.521-.494-1.94zm2.549-7.533l-2.701 1.56 2.7 1.56c.686.38.914 1.256.533 1.94-.38.685-1.255.913-1.94.533l-4.832-2.778a1.644 1.644 0 01-.647-.798c-.037-.153-.076-.305-.076-.457 0-.114.039-.228.039-.342.114-.343.342-.647.646-.837l4.832-2.778c.685-.38 1.56-.152 1.94.533.457.609.19 1.484-.494 1.864"
      fill="#29B5E8"
    />
  </svg>
);

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
  const [selectedLake, setSelectedLake] = useState<"bigquery" | "databricks" | "snowflake">("bigquery");
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadNotebook = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const link = document.createElement("a");
      link.href = "/api/download-notebook?lake=" + selectedLake;
      link.setAttribute("download", "gcp_enterprise_metadata_assessment.ipynb");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (err) {
      console.error("Erro ao baixar notebook:", err);
    }
  };

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
      <div className="text-center space-y-2">
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

      {/* 3. NOVO TILE: Data Lake de Origem & Download do Script de Assessment (Notebook) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#074878]/10 text-[#074878] flex items-center justify-center font-black">
                <Database className="w-4 h-4 text-[#074878]" />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                {t("lakeSelectionTitle")}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t("lakeSelectionSub")}
            </p>
          </div>
          <span className="text-[10.5px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80 self-start sm:self-auto">
            Preparação & Extração
          </span>
        </div>

        {/* Seletor de Plataforma / Lake com Logos Oficiais (GCP, Databricks, Snowflake) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Opção 1: Google BigQuery (Logo Oficial GCP) */}
          <div
            onClick={() => setSelectedLake("bigquery")}
            className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer ${
              selectedLake === "bigquery"
                ? "border-[#074878] bg-blue-50/40 shadow-xs ring-2 ring-[#074878]/10"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
                <GoogleCloudIcon size={24} />
              </div>
              <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#074878]">
                {t("lakeBigQueryBadge")}
              </span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>{t("lakeBigQuery")}</span>
              {selectedLake === "bigquery" && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1.5 leading-relaxed">
              {t("lakeBigQueryDesc")}
            </p>
          </div>

          {/* Opção 2: Databricks (Logo Oficial Databricks) */}
          <div
            className="relative rounded-2xl p-4 border border-slate-200 bg-slate-50/60 opacity-65 cursor-not-allowed select-none"
            title="Suporte a Databricks em desenvolvimento"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
                <DatabricksIcon size={22} />
              </div>
              <span className="text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                {t("lakeComingSoon")}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-700">
              {t("lakeDatabricks")}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed">
              Unity Catalog, Delta Lake e workspaces corporativos.
            </p>
          </div>

          {/* Opção 3: Snowflake (Logo Oficial Snowflake) */}
          <div
            className="relative rounded-2xl p-4 border border-slate-200 bg-slate-50/60 opacity-65 cursor-not-allowed select-none"
            title="Suporte a Snowflake em desenvolvimento"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
                <SnowflakeIcon size={22} />
              </div>
              <span className="text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                {t("lakeComingSoon")}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-700">
              {t("lakeSnowflake")}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed">
              Snowflake Data Cloud, estágios e warehouses virtuais.
            </p>
          </div>
        </div>

        {/* Card em Destaque: Baixar o Script de Assessment (Notebook) - Perfeitamente Contido sem Estouro */}
        <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/80 via-white to-sky-50/60 p-4 sm:p-6 shadow-2xs space-y-4 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#074878] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {t("downloadScriptTitle")}
                  </h4>
                  <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    BigQuery Studio Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t("downloadScriptDesc")}
                </p>
                <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 font-medium flex-wrap">
                  <span className="inline-flex items-center gap-1 font-mono text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    gcp_enterprise_metadata_assessment.ipynb
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">Tamanho: ~152 KB</span>
                </div>
              </div>
            </div>

            {/* Botão para Baixar o Script na Máquina do Usuário - Perfeitamente Ajustado Dentro do Tile */}
            <div className="flex flex-col sm:items-end gap-1.5 shrink-0 pt-2 lg:pt-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadNotebook}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#074878] hover:bg-[#053456] active:scale-[0.98] text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>{t("downloadScriptBtn")}</span>
              </button>
              {downloadSuccess && (
                <span className="text-[10px] font-bold text-emerald-700 animate-in fade-in duration-150 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t("downloadScriptSuccess")}</span>
                </span>
              )}
            </div>
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
