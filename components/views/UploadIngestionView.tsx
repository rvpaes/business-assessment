// components/views/UploadIngestionView.tsx - Ingestão Minimalista & Acolhedora de Assessment
"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileArchive, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Building2,
  Check,
  Copy,
  Layers,
  Database,
  ChevronRight
} from "lucide-react";
import { CustomerAssessment, TableCatalogItem } from "@/lib/types";

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
  const [customerName, setCustomerName] = useState(assessment?.customerName || "");
  const [industry, setIndustry] = useState(assessment?.industry || "Varejo & E-commerce");
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
    "Outro Segmento"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".zip")) {
        setErrorMessage("Por favor, selecione um arquivo no formato .zip.");
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
        setErrorMessage("Por favor, selecione um arquivo no formato .zip.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  const handleUpload = async () => {
    if (!customerName.trim()) {
      setErrorMessage("Por favor, informe o nome do cliente antes de prosseguir.");
      return;
    }
    if (!selectedFile) {
      setErrorMessage("Por favor, adicione o arquivo .ZIP de metadados.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Salvando no Google Cloud Storage e indexando no BigQuery...");

    try {
      const formData = new FormData();
      formData.append("customerName", customerName.trim());
      formData.append("industry", industry);
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha no processamento do arquivo.");
      }

      setStatusMessage("Assessment e metadados indexados com sucesso!");
      onAssessmentLoaded(data.assessment, data.topTablesSample || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro durante o upload do pacote.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async () => {
    const finalCustomerName = customerName.trim() || "Empresa Modelo (Exemplo)";
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Carregando pacote de exemplo para Cloud Storage & BigQuery...");

    try {
      const res = await fetch("/api/sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customerName: finalCustomerName,
          industry: industry
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao carregar arquivo de exemplo.");
      }

      setStatusMessage("Demonstração carregada com sucesso!");
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#074878] text-[11px] font-black uppercase tracking-wider">
          <Database className="w-3.5 h-3.5" />
          <span>Google Cloud Business Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Inicie o Assessment de Negócio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Informe os dados da empresa e faça o upload do arquivo <code className="text-[#074878] font-bold">.ZIP</code> de metadados para calcular os Casos de Uso com Gemini 3.8 Flash e gerar o Grafo BigQuery.
        </p>
      </div>

      {/* 2. Card Principal de Ingestão (Clean & Intuitivo) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Passo 1: Informações do Cliente */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#074878] text-white text-[11px] font-black flex items-center justify-center">
              1
            </span>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Quem é o cliente?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Nome da Empresa / Cliente *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Nubank, Ambev, Magazine Luiza"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#074878]/20 focus:border-[#074878] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Setor de Atuação *
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#074878]/20 focus:border-[#074878] transition-all cursor-pointer"
              >
                {industriesList.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Passo 2: Dropzone de Arquivo ZIP */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#074878] text-white text-[11px] font-black flex items-center justify-center">
              2
            </span>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Arquivo de Metadados (.ZIP)
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
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Clique para substituir o arquivo
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
                    Arraste o arquivo <span className="font-extrabold text-[#074878]">.ZIP</span> aqui ou clique para buscar
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Pacote gerado pelo extrator no ambiente do cliente (ex: metadata_assessment_organization.zip)
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
                <span>Processando com Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <span>Iniciar Assessment com Gemini 3.8 Flash</span>
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
              <span>Experimentar com pacote de exemplo (1 clique)</span>
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
                Assessment Atualmente Carregado
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
                Indexado no BigQuery
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Tabelas</span>
              <div className="text-base font-black text-[#074878] mt-0.5">
                {assessment.totalTables.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Colunas</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {assessment.totalColumns.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Documentação</span>
              <div className="text-base font-black text-emerald-600 mt-0.5">
                {assessment.docPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#074878] hover:bg-[#053456] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Acessar Mesa de Decisão (Visão Geral)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {onNavigateToCases && (
              <button
                onClick={onNavigateToCases}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver Casos de Uso & Retorno (BC)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
