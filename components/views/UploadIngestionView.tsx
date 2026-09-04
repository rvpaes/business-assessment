// components/views/UploadIngestionView.tsx - Ingestão, Upload e Scorecard Executivo
"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, FileArchive, CheckCircle2, AlertCircle, 
  ArrowRight, HardDrive, Database, Sparkles, Copy, ExternalLink,
  ShieldAlert, RefreshCw
} from "lucide-react";
import { CustomerAssessment, TableCatalogItem } from "@/lib/types";

interface UploadIngestionViewProps {
  assessment: CustomerAssessment | null;
  onAssessmentLoaded: (assessment: CustomerAssessment, tables: TableCatalogItem[]) => void;
  onNavigateToDebate: () => void;
}

export const UploadIngestionView: React.FC<UploadIngestionViewProps> = ({
  assessment,
  onAssessmentLoaded,
  onNavigateToDebate
}) => {
  const [customerName, setCustomerName] = useState(assessment?.customerName || "Hypera Pharma");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedGcs, setCopiedGcs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async () => {
    if (!customerName.trim()) {
      setErrorMessage("Por favor, informe o nome do cliente antes de enviar.");
      return;
    }
    if (!selectedFile) {
      setErrorMessage("Selecione um arquivo ZIP para realizar a ingestão.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Enviando pacote para Google Cloud Storage (gs://dass-2026/business_assessment)...");

    try {
      const formData = new FormData();
      formData.append("customerName", customerName);
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha no processamento do arquivo.");
      }

      setStatusMessage("Assessment e metadados indexados com sucesso no BigQuery!");
      onAssessmentLoaded(data.assessment, data.topTablesSample || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro desconhecido durante o upload.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Carregando metadata_assessment_organization.zip do ambiente local para GCS & BigQuery...");

    try {
      const res = await fetch("/api/sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao carregar arquivo de exemplo.");
      }

      setStatusMessage("Exemplo oficial carregado e sincronizado no BigQuery!");
      onAssessmentLoaded(data.assessment, data.topTablesSample || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao carregar o exemplo.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyGcsPath = () => {
    if (assessment?.gcsArchiveUri) {
      navigator.clipboard.writeText(assessment.gcsArchiveUri);
      setCopiedGcs(true);
      setTimeout(() => setCopiedGcs(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header do Módulo */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-blue-600" />
          Ingestão do Assessment de Metadados & Storage GCS
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Carregue o pacote ZIP gerado no ambiente do cliente. O sistema gravará o arquivo no Cloud Storage no padrão{" "}
          <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-blue-600 dark:text-blue-400">
            gs://dass-2026/business_assessment/datahoje_hora_nome_cliente/
          </code>{" "}
          e alimentará o dataset corporativo do BigQuery.
        </p>
      </div>

      {/* 2. Formulário de Ingestão */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {/* Campo 1: Nome do Cliente */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                1. Nome do Cliente Corporativo *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Ex: Hypera Pharma, RaiaDrogasil, BETs Brasil"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Campo 2: Upload de ZIP */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                2. Pacote de Metadados (.ZIP) *
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".zip"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50/30 dark:bg-slate-800/30 group"
              >
                <FileArchive className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : "Clique para selecionar o arquivo .ZIP"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedFile
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB selecionados`
                    : "Arraste ou selecione o arquivo gerado pelo assessment"}
                </p>
              </div>
            </div>

            {/* Ações de Envio */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleUpload}
                disabled={isLoading || !selectedFile}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-all"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processando Ingestão...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Fazer Upload & Processar
                  </>
                )}
              </button>

              <button
                onClick={handleLoadSample}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
                title="Carrega o arquivo Downloads/metadata_assessment_organization.zip já gerado"
              >
                ⚡ Usar ZIP Local de Exemplo
              </button>
            </div>

            {statusMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs border border-emerald-200/60 dark:border-emerald-800/60">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs border border-rose-200/60 dark:border-rose-800/60">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Scorecard do Assessment Processado */}
        <div className="lg:col-span-6">
          {assessment ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Maturidade Auditada
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {assessment.customerName}
                  </h3>
                  <p className="text-xs text-slate-500">{assessment.industry}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {assessment.docPercentage.toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-slate-400">Grounding IA</span>
                </div>
              </div>

              {/* Grid de Métricas */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Tabelas Base</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {assessment.totalTables.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Views / MVs</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {assessment.totalViews.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Colunas Totais</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {assessment.totalColumns.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Grafos GQL</div>
                  <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                    {assessment.propertyGraphsCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Data Agents</div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {assessment.dataAgentsCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Scans Dataplex</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {assessment.dataplexScansCount}
                  </div>
                </div>
              </div>

              {/* Informação do GCS */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                    Caminho no Cloud Storage:
                  </span>
                  <button
                    onClick={copyGcsPath}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedGcs ? "Copiado!" : "Copiar URI"}
                  </button>
                </div>
                <code className="block p-2 rounded bg-slate-100 dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 break-all">
                  {assessment.gcsArchiveUri}
                </code>
              </div>

              {/* Botão de Próxima Etapa */}
              <button
                onClick={onNavigateToDebate}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
              >
                <span>Avançar para o Neuro-Debate Studio (NC-MAD)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <Database className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nenhum assessment carregado
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Faça o upload do arquivo ZIP ou clique no botão rápido para carregar o exemplo local do cliente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
