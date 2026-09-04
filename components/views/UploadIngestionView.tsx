// components/views/UploadIngestionView.tsx - Ingestão, Upload e Scorecard Executivo
"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, FileArchive, CheckCircle2, AlertCircle, 
  ArrowRight, HardDrive, Database, Sparkles, Copy, ExternalLink,
  ShieldAlert, RefreshCw, Layers, Check, Building2
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
  const [customerName, setCustomerName] = useState(assessment?.customerName || "");
  const [industry, setIndustry] = useState(assessment?.industry || "Varejo & E-commerce");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedGcs, setCopiedGcs] = useState(false);
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
    setStatusMessage(`Enviando pacote para Google Cloud Storage (gs://dass-2026/business_assessment)...`);

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

      setStatusMessage("Assessment e metadados indexados com sucesso no BigQuery!");
      onAssessmentLoaded(data.assessment, data.topTablesSample || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro desconhecido durante o upload.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async () => {
    const finalCustomerName = customerName.trim() || "Empresa Modelo (Exemplo)";
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Carregando metadata_assessment_organization.zip para GCS & BigQuery...");

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
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      {/* 1. Header do Módulo */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-100 text-[#074878] text-[10px] font-black uppercase">
            Fluxo de Ingestão de Assessment
          </span>
        </div>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-1">
          <UploadCloud className="w-6 h-6 text-[#074878]" />
          Ingestão do Assessment de Metadados do Cliente
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Execute os 4 passos obrigatórios: nome do cliente, upload do arquivo ZIP, gravação no Cloud Storage (<code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono text-[#074878]">gs://dass-2026/business_assessment/datahoje_hora_nome_cliente/</code>) e análise de valor com <strong>Gemini 3.8 Flash</strong>.
        </p>
      </div>

      {/* 4 Passos Estruturados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black text-[#074878] uppercase">Passo 1</span>
          <div className="text-xs font-black text-slate-900 mt-0.5">Identificação do Cliente</div>
          <p className="text-[10px] text-slate-500 mt-1">Nome corporativo e setor de atuação para contextualizar o Gemini.</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black text-[#074878] uppercase">Passo 2</span>
          <div className="text-xs font-black text-slate-900 mt-0.5">Upload do Pacote ZIP</div>
          <p className="text-[10px] text-slate-500 mt-1">Envio do metadata_assessment_organization.zip gerado no cliente.</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black text-[#074878] uppercase">Passo 3</span>
          <div className="text-xs font-black text-slate-900 mt-0.5">GCS gs://dass-2026</div>
          <p className="text-[10px] text-slate-500 mt-1">Gravação automática na pasta versionada com data e hora.</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-black text-[#074878] uppercase">Passo 4</span>
          <div className="text-xs font-black text-slate-900 mt-0.5">Gemini 3.8 Flash + BQ</div>
          <p className="text-[10px] text-slate-500 mt-1">Geração dos Casos de Uso, Business Case ROI, FinOps e Grafo GQL.</p>
        </div>
      </div>

      {/* 2. Formulário de Ingestão */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            {/* Campo 1: Nome do Cliente e Indústria */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  1. Nome do Cliente Corporativo *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ex: Magazine Luiza, Nubank, Petrobras, Hypera Pharma, Ambev"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#074878] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Setor / Indústria do Cliente *
                </label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#074878] transition-all"
                >
                  {industriesList.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo 2: Upload de ZIP */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                2. Pacote de Metadados (.ZIP) do Cliente *
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
                className="border-2 border-dashed border-slate-300 hover:border-[#074878] rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 group"
              >
                <FileArchive className="w-9 h-9 text-slate-400 group-hover:text-[#074878] mx-auto mb-2 transition-colors" />
                <p className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : "Clique para selecionar o arquivo .ZIP do assessment"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {selectedFile
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB selecionados`
                    : "metadata_assessment_organization.zip gerado no ambiente do cliente"}
                </p>
              </div>
            </div>

            {/* Ações de Envio */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleUpload}
                disabled={isLoading || !selectedFile || !customerName.trim()}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#074878] hover:bg-[#053456] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando Ingestão...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Enviar para GCS & BigQuery</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLoadSample}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Carregar arquivo de exemplo do diretório Downloads"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Carregar Exemplo Local</span>
              </button>
            </div>

            {/* Status e Mensagens de Feedback */}
            {statusMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Painel de Status do Assessment Atual */}
        <div className="lg:col-span-6 space-y-6">
          {assessment ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#074878]">
                    Assessment Ativo
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    {assessment.customerName}
                  </h3>
                  <p className="text-xs text-slate-500">{assessment.industry}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Indexado
                </span>
              </div>

              {/* Grid de Métricas do Catálogo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Tabelas</span>
                  <div className="text-lg font-black text-[#074878] mt-0.5">
                    {assessment.totalTables.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-slate-500">Auditadas no BQ</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Colunas</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {assessment.totalColumns.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-slate-500">Mapeadas</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Documentação</span>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">
                    {assessment.docPercentage.toFixed(1)}%
                  </div>
                  <span className="text-[9px] text-slate-500">Com descrição</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Dataplex</span>
                  <div className="text-lg font-black text-blue-600 mt-0.5">
                    {assessment.dataplexScansCount || "Ativo"}
                  </div>
                  <span className="text-[9px] text-slate-500">Data Scans</span>
                </div>
              </div>

              {/* Caminho no GCS */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Caminho do Pacote no Cloud Storage (GCS)
                </span>
                <div className="flex items-center justify-between text-xs font-mono text-[#074878] break-all bg-white p-2 rounded-xl border border-slate-200">
                  <span>{assessment.gcsArchiveUri}</span>
                  <button
                    onClick={copyGcsPath}
                    className="p-1 text-slate-400 hover:text-slate-700 ml-2 shrink-0 cursor-pointer"
                    title="Copiar URI do GCS"
                  >
                    {copiedGcs ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botão de Avanço para o Debate Neurocognitivo */}
              <div className="pt-2">
                <button
                  onClick={onNavigateToDebate}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Executar Debate com Gemini 3.8 Flash (NC-MAD)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
              <Database className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Nenhum assessment carregado no momento
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Preencha o nome do cliente e envie o arquivo .ZIP ou utilize o botão de exemplo para carregar os metadados.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
