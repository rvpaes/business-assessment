// lib/i18n/LanguageContext.tsx - Provedor de Internacionalização (i18n) para o Cockpit Executivo
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "pt-BR" | "en-US" | "es-ES";

export interface LanguageOption {
  code: Locale;
  label: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en-US", label: "English", flag: "🇺🇸" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" }
];

export const translations = {
  "pt-BR": {
    // Sidebar
    tabUpload: "Ingestão & Metadados",
    tabUploadDesc: "Upload de ZIP & Ingestão GCS",
    tabDecision: "Agent Intelligence",
    tabDecisionDesc: "Cockpit Executivo & Síntese",
    tabCases: "Casos de Uso & BC",
    tabCasesDesc: "Cards & Business Case",
    tabGraph: "Grafo de Conhecimento",
    tabGraphDesc: "BigQuery GQL & Relacionamentos",
    tabChat: "Chat Conversacional",
    tabChatDesc: "Data Agent com Grounding",
    sidebarStorage: "BigQuery & Storage:",
    sidebarConnected: "Conectado",
    sidebarCognitive: "Motor Cognitivo:",

    // Header
    selectCustomer: "Cliente Selecionado",
    selectedCustomerTitle: "Selecionar Cliente Auditado",
    searchCustomer: "Filtrar por nome ou setor...",
    ingestNew: "+ Ingerir Novo Cliente (Upload ZIP)",
    searchPlaceholder: "Buscar tabela, coluna, caso de uso ou métrica auditada...",
    groundingActive: "BigQuery Grounding Ativo",
    syncBigQuery: "Sincronizar com BigQuery",
    architectRole: "Arquiteto de Dados GCP",
    assessmentSubtitle: "Data & AI Assessment",
    language: "Idioma",
    auditedTables: "Tabelas Auditadas",
    documented: "Documentado",
    waitingZipIngestion: "Aguardando Ingestão de ZIP",

    // Ingestion Screen (UploadIngestionView)
    startBusinessAssessmentTitle: "Inicie o Assessment de Negócio",
    startBusinessAssessmentSub: "Informe os dados da empresa e faça o upload do arquivo .ZIP de metadados para calcular os Casos de Uso com Gemini 3.8 Flash e gerar o Grafo BigQuery.",
    whoIsCustomer: "Quem é o cliente?",
    analyzingIndustryAI: "Analisando setor com IA...",
    identifiedIndustry: "Identificado:",
    companyNameLabel: "Nome da Empresa / Cliente *",
    companyPlaceholder: "Ex: Nubank, Digio, Ambev, Magazine Luiza, Hypera",
    customerWebsiteLabel: "Website / URL do Cliente",
    websiteUrlPlaceholder: "Ex: https://www.cliente.com.br",
    industryLabel: "Setor / Indústria (Classificado por Gemini 3.8 Flash) *",
    reclassifyWithAI: "Reclassificar com IA",
    identifyingIndustry: "Identificando...",
    strategicInfoLabel: "Informações Estratégicas Adicionais (Opcional para o Prompt)",
    strategicInfoPlaceholder: "Ex: Foco prioritário em redução de custos de nuvem e FinOps, expansão de novos canais digitais omnichannel, conformidade estrita com LGPD e prevenção de perdas...",
    strategicInfoHelp: "Estas informações serão injetadas diretamente nas instruções do debate multi-agente NC-MAD.",
    metadataZipTitle: "Arquivo de Metadados (.ZIP)",
    dragZipTitle: "Arraste o arquivo .ZIP aqui ou clique para buscar",
    dragZipDesc: "Pacote gerado pelo extrator no ambiente do cliente (ex: metadata_assessment_organization.zip)",
    clickToReplace: "Clique para substituir o arquivo",
    startAssessmentBtn: "Iniciar Assessment com Gemini 3.8 Flash",
    processingGemini: "Processando com Gemini 3.8 Flash...",
    trySamplePackage: "Experimentar com pacote de exemplo (1 clique)",
    currentAssessmentLoaded: "Assessment Atualmente Carregado",
    indexedInBigQuery: "Indexado no BigQuery",
    tables: "Tabelas",
    columns: "Colunas",
    documentation: "Documentação",
    accessIntelligence: "Acessar Agent Intelligence",
    viewUseCasesRoi: "Ver Casos de Uso & Retorno (BC)",
    errZipOnly: "Por favor, selecione um arquivo no formato .zip.",
    errClientRequired: "Por favor, informe o nome do cliente antes de prosseguir.",
    errZipRequired: "Por favor, adicione o arquivo .ZIP de metadados.",
    msgSavingGcsBq: "Salvando no Google Cloud Storage e indexando no BigQuery...",
    msgAssessmentSuccess: "Assessment e metadados indexados com sucesso!",
    msgLoadingSample: "Carregando pacote de exemplo para Cloud Storage & BigQuery...",
    msgSampleSuccess: "Demonstração carregada com sucesso!",

    // Neuro-Debate
    debateTitle: "Neuro-Cognitive Multi-Agent Debate (NC-MAD)",
    debateSubtitle: "Debate dialético baseado no modelo neurobiológico de Tripla Rede (DMN, SN e CEN) acionado pelo modelo Gemini 3.8 Flash para priorização formal dos Top 6 casos de uso.",
    backToIntelligence: "← Voltar para Agent Intelligence",
    debatingStatus: "Debatendo em Tempo Real...",
    startDebateBtn: "Iniciar Debate Multi-Agente",
    reRunDebateBtn: "Re-executar Debate NC-MAD",
    orchestratingStatus: "Orquestrando Tripla Rede Neurocognitiva (DMN ➔ SN ➔ CEN) com Gemini 3.8 Flash...",
    tabTurns: "Transcrição do Debate",
    tabSalience: "Matriz de Saliência SN",
    tabAudit: "Alvos de Auditoria CEN",
    viewApprovedCasesBtn: "Ver Top 6 Casos de Uso Aprovados",

    // Executive Decision / Agent Intelligence
    strategicCouncil: "CONSELHO ESTRATÉGICO",
    runLiveDebate: "Executar Neuro-Debate ao Vivo",
    newZipUpload: "Novo Upload ZIP",
    decisionHeroTitle: "Agent Intelligence: Conselho Neurocognitivo & Decisão Estratégica",
    viewFullDossier: "Ver Dossiê Completo",

    // Use Cases & BC
    useCasesTitle: "Casos de Uso Priorizados para",
    useCasesSubtitle: "Soluções validadas sobre os dados reais do BigQuery, com estimativa de retorno financeiro para o cliente e consumo de infraestrutura Google Cloud.",
    viewInGraphBtn: "Ver no Property Graph",
    consolidatedReturn: "RETORNO CONSOLIDADO (BC)",
    gcpCost: "CUSTO TOTAL GOOGLE CLOUD",
    overallRoi: "ROI ESTIMADO (12M)",
    filterAll: "TODOS OS CASOS",
    financialGainLabel: "GANHO FINANCEIRO ESTIMADO",
    gcpMonthlyCostLabel: "CUSTO MENSAL GCP",
    confidenceScoreLabel: "Confiança IA",
    detailsBtn: "Ver Detalhes Técnicos & BC",
    bottleneckLabel: "Gargalo / Problema de Negócio",
    solutionLabel: "Solução com IA & BigQuery",
    clientGainsLabel: "Business Case (Ganhos do Cliente)",
    gcpConsumptionLabel: "Consumo Google Cloud (FinOps)",
    requiredTablesLabel: "Tabelas Auditadas Necessárias no BigQuery",
    guardrailsLabel: "Guardrails de Governança & Zero Alucinação",
    closeBtn: "Fechar Detalhes",
    similarCasesHeader: "Casos de Sucesso Similares no Google Cloud",
    similarCasesSubtitle: "Histórias oficiais comprovadas de clientes no mesmo setor e desafio tecnológico publicadas em",
    readFullStory: "Ver história em cloud.google.com/customers",
    productsUsed: "Produtos Google Cloud"
  },
  "en-US": {
    // Sidebar
    tabUpload: "Ingestion & Metadata",
    tabUploadDesc: "ZIP Upload & GCS Ingestion",
    tabDecision: "Agent Intelligence",
    tabDecisionDesc: "Executive Cockpit & Synthesis",
    tabCases: "Use Cases & BC",
    tabCasesDesc: "Cards & Business Case",
    tabGraph: "Knowledge Graph",
    tabGraphDesc: "BigQuery GQL & Relationships",
    tabChat: "Conversational Chat",
    tabChatDesc: "Data Agent with Grounding",
    sidebarStorage: "BigQuery & Storage:",
    sidebarConnected: "Connected",
    sidebarCognitive: "Cognitive Engine:",

    // Header
    selectCustomer: "Selected Customer",
    selectedCustomerTitle: "Select Audited Customer",
    searchCustomer: "Filter by name or industry...",
    ingestNew: "+ Ingest New Customer (Upload ZIP)",
    searchPlaceholder: "Search table, column, use case or audited metric...",
    groundingActive: "BigQuery Grounding Active",
    syncBigQuery: "Sync with BigQuery",
    architectRole: "GCP Data Architect",
    assessmentSubtitle: "Data & AI Assessment",
    language: "Language",
    auditedTables: "Audited Tables",
    documented: "Documented",
    waitingZipIngestion: "Awaiting ZIP Ingestion",

    // Ingestion Screen (UploadIngestionView)
    startBusinessAssessmentTitle: "Start Business Assessment",
    startBusinessAssessmentSub: "Provide company details and upload the metadata .ZIP file to compute Use Cases with Gemini 3.8 Flash and generate the BigQuery Graph.",
    whoIsCustomer: "Who is the customer?",
    analyzingIndustryAI: "Analyzing industry with AI...",
    identifiedIndustry: "Identified:",
    companyNameLabel: "Company / Customer Name *",
    companyPlaceholder: "E.g.: Nubank, Digio, Ambev, Magazine Luiza, Hypera",
    customerWebsiteLabel: "Customer Website / URL",
    websiteUrlPlaceholder: "E.g.: https://www.customer.com",
    industryLabel: "Industry / Sector (Classified by Gemini 3.8 Flash) *",
    reclassifyWithAI: "Reclassify with AI",
    identifyingIndustry: "Identifying...",
    strategicInfoLabel: "Additional Strategic Information (Optional for Prompt)",
    strategicInfoPlaceholder: "E.g.: Priority focus on cloud cost reduction and FinOps, expanding new omnichannel digital channels, strict regulatory compliance and inventory loss prevention...",
    strategicInfoHelp: "This information will be injected directly into the NC-MAD multi-agent debate instructions.",
    metadataZipTitle: "Metadata Archive (.ZIP)",
    dragZipTitle: "Drag .ZIP file here or click to browse",
    dragZipDesc: "Package generated by the extractor in customer environment (e.g.: metadata_assessment_organization.zip)",
    clickToReplace: "Click to replace file",
    startAssessmentBtn: "Start Assessment with Gemini 3.8 Flash",
    processingGemini: "Processing with Gemini 3.8 Flash...",
    trySamplePackage: "Try with sample package (1 click)",
    currentAssessmentLoaded: "Currently Loaded Assessment",
    indexedInBigQuery: "Indexed in BigQuery",
    tables: "Tables",
    columns: "Columns",
    documentation: "Documentation",
    accessIntelligence: "Access Agent Intelligence",
    viewUseCasesRoi: "View Use Cases & ROI (BC)",
    errZipOnly: "Please select a file in .zip format.",
    errClientRequired: "Please provide customer name before proceeding.",
    errZipRequired: "Please add the metadata .ZIP file.",
    msgSavingGcsBq: "Saving to Google Cloud Storage and indexing in BigQuery...",
    msgAssessmentSuccess: "Assessment and metadata indexed successfully!",
    msgLoadingSample: "Loading sample package to Cloud Storage & BigQuery...",
    msgSampleSuccess: "Demo loaded successfully!",

    // Neuro-Debate
    debateTitle: "Neuro-Cognitive Multi-Agent Debate (NC-MAD)",
    debateSubtitle: "Dialectical debate based on the Triple Network neurobiological model (DMN, SN and CEN) powered by Gemini 3.8 Flash for formal Top 6 use case prioritization.",
    backToIntelligence: "← Back to Agent Intelligence",
    debatingStatus: "Debating in Real Time...",
    startDebateBtn: "Start Multi-Agent Debate",
    reRunDebateBtn: "Re-run NC-MAD Debate",
    orchestratingStatus: "Orchestrating Neurocognitive Triple Network (DMN ➔ SN ➔ CEN) with Gemini 3.8 Flash...",
    tabTurns: "Debate Transcript",
    tabSalience: "SN Salience Matrix",
    tabAudit: "CEN Audit Targets",
    viewApprovedCasesBtn: "View Top 6 Approved Use Cases",

    // Executive Decision / Agent Intelligence
    strategicCouncil: "STRATEGIC COUNCIL",
    runLiveDebate: "Run Live Neuro-Debate",
    newZipUpload: "New ZIP Upload",
    decisionHeroTitle: "Agent Intelligence: Neurocognitive Council & Strategic Decision",
    viewFullDossier: "View Full Dossier",

    // Use Cases & BC
    useCasesTitle: "Prioritized Use Cases for",
    useCasesSubtitle: "Validated solutions on real BigQuery data, estimating client financial return and Google Cloud infrastructure consumption.",
    viewInGraphBtn: "View in Property Graph",
    consolidatedReturn: "CONSOLIDATED RETURN (BC)",
    gcpCost: "TOTAL GOOGLE CLOUD COST",
    overallRoi: "ESTIMATED ROI (12M)",
    filterAll: "ALL CASES",
    financialGainLabel: "ESTIMATED FINANCIAL GAIN",
    gcpMonthlyCostLabel: "MONTHLY GCP COST",
    confidenceScoreLabel: "AI Confidence",
    detailsBtn: "View Technical Details & BC",
    bottleneckLabel: "Bottleneck / Business Problem",
    solutionLabel: "Solution with AI & BigQuery",
    clientGainsLabel: "Business Case (Client Gains)",
    gcpConsumptionLabel: "Google Cloud Consumption (FinOps)",
    requiredTablesLabel: "Required Audited Tables in BigQuery",
    guardrailsLabel: "Governance & Zero Hallucination Guardrails",
    closeBtn: "Close Details",
    similarCasesHeader: "Similar Google Cloud Success Stories",
    similarCasesSubtitle: "Proven official customer success stories in the same industry and technical challenge published on",
    readFullStory: "View story on cloud.google.com/customers",
    productsUsed: "Google Cloud Products"
  },
  "es-ES": {
    // Sidebar
    tabUpload: "Ingestión y Metadatos",
    tabUploadDesc: "Carga de ZIP e Ingestión GCS",
    tabDecision: "Agent Intelligence",
    tabDecisionDesc: "Cockpit Ejecutivo y Síntesis",
    tabCases: "Casos de Uso y BC",
    tabCasesDesc: "Tarjetas y Business Case",
    tabGraph: "Grafo de Conocimiento",
    tabGraphDesc: "BigQuery GQL y Relaciones",
    tabChat: "Chat Conversacional",
    tabChatDesc: "Data Agent con Grounding",
    sidebarStorage: "BigQuery & Storage:",
    sidebarConnected: "Conectado",
    sidebarCognitive: "Motor Cognitivo:",

    // Header
    selectCustomer: "Cliente Seleccionado",
    selectedCustomerTitle: "Seleccionar Cliente Auditado",
    searchCustomer: "Filtrar por nombre o sector...",
    ingestNew: "+ Ingerir Nuevo Cliente (Carga ZIP)",
    searchPlaceholder: "Buscar tabla, columna, caso de uso o métrica...",
    groundingActive: "BigQuery Grounding Activo",
    syncBigQuery: "Sincronizar con BigQuery",
    architectRole: "Arquitecto de Datos GCP",
    assessmentSubtitle: "Data & AI Assessment",
    language: "Idioma",
    auditedTables: "Tablas Auditadas",
    documented: "Documentado",
    waitingZipIngestion: "Esperando Ingestión de ZIP",

    // Ingestion Screen (UploadIngestionView)
    startBusinessAssessmentTitle: "Inicie la Evaluación de Negocio",
    startBusinessAssessmentSub: "Ingrese los datos de la empresa y cargue el archivo .ZIP de metadatos para calcular los Casos de Uso con Gemini 3.8 Flash y generar el Grafo de BigQuery.",
    whoIsCustomer: "¿Quién es el cliente?",
    analyzingIndustryAI: "Analizando sector con IA...",
    identifiedIndustry: "Identificado:",
    companyNameLabel: "Nombre de la Empresa / Cliente *",
    companyPlaceholder: "Ej: Nubank, Digio, Ambev, Magazine Luiza, Hypera",
    customerWebsiteLabel: "Sitio Web / URL del Cliente",
    websiteUrlPlaceholder: "Ej: https://www.cliente.com",
    industryLabel: "Sector / Industria (Clasificado por Gemini 3.8 Flash) *",
    reclassifyWithAI: "Reclasificar con IA",
    identifyingIndustry: "Identificando...",
    strategicInfoLabel: "Información Estratégica Adicional (Opcional)",
    strategicInfoPlaceholder: "Ej: Foco prioritario en reducción de costos de nube y FinOps, expansión de nuevos canales digitales, cumplimiento normativo y prevención de pérdidas...",
    strategicInfoHelp: "Esta información se inyectará directamente en las instrucciones del debate multi-agente NC-MAD.",
    metadataZipTitle: "Archivo de Metadatos (.ZIP)",
    dragZipTitle: "Arrastre el archivo .ZIP aquí o haga clic para buscar",
    dragZipDesc: "Paquete generado por el extractor en el entorno del cliente (ej: metadata_assessment_organization.zip)",
    clickToReplace: "Haga clic para reemplazar el archivo",
    startAssessmentBtn: "Iniciar Evaluación con Gemini 3.8 Flash",
    processingGemini: "Procesando con Gemini 3.8 Flash...",
    trySamplePackage: "Probar con paquete de ejemplo (1 clic)",
    currentAssessmentLoaded: "Evaluación Actualmente Cargada",
    indexedInBigQuery: "Indexado en BigQuery",
    tables: "Tablas",
    columns: "Columnas",
    documentation: "Documentación",
    accessIntelligence: "Acceder a Agent Intelligence",
    viewUseCasesRoi: "Ver Casos de Uso y Retorno (BC)",
    errZipOnly: "Por favor, seleccione un archivo en formato .zip.",
    errClientRequired: "Por favor, ingrese el nombre del cliente antes de continuar.",
    errZipRequired: "Por favor, agregue el archivo .ZIP de metadados.",
    msgSavingGcsBq: "Guardando en Google Cloud Storage e indexando en BigQuery...",
    msgAssessmentSuccess: "¡Evaluación y metadatos indexados con éxito!",
    msgLoadingSample: "Cargando paquete de ejemplo en Cloud Storage & BigQuery...",
    msgSampleSuccess: "¡Demostración cargada con éxito!",

    // Neuro-Debate
    debateTitle: "Neuro-Cognitive Multi-Agent Debate (NC-MAD)",
    debateSubtitle: "Debate dialéctico basado en el modelo neurobiológico de Triple Red (DMN, SN y CEN) impulsado por Gemini 3.8 Flash para priorización formal del Top 6.",
    backToIntelligence: "← Volver a Agent Intelligence",
    debatingStatus: "Debatiendo en Tiempo Real...",
    startDebateBtn: "Iniciar Debate Multi-Agente",
    reRunDebateBtn: "Re-ejecutar Debate NC-MAD",
    orchestratingStatus: "Orquestando Triple Red Neurocognitiva (DMN ➔ SN ➔ CEN) con Gemini 3.8 Flash...",
    tabTurns: "Transcripción del Debate",
    tabSalience: "Matriz de Saliencia SN",
    tabAudit: "Objetivos de Auditoría CEN",
    viewApprovedCasesBtn: "Ver Top 6 Casos de Uso Aprobados",

    // Executive Decision / Agent Intelligence
    strategicCouncil: "CONSEJO ESTRATÉGICO",
    runLiveDebate: "Ejecutar Neuro-Debate en Vivo",
    newZipUpload: "Nueva Carga ZIP",
    decisionHeroTitle: "Agent Intelligence: Consejo Neurocognitivo y Decisión Estratégica",
    viewFullDossier: "Ver Dossier Completo",

    // Use Cases & BC
    useCasesTitle: "Casos de Uso Priorizados para",
    useCasesSubtitle: "Soluciones validadas sobre datos reales de BigQuery, estimando retorno financiero para el cliente y consumo de infraestructura Google Cloud.",
    viewInGraphBtn: "Ver en Property Graph",
    consolidatedReturn: "RETORNO CONSOLIDADO (BC)",
    gcpCost: "COSTO TOTAL GOOGLE CLOUD",
    overallRoi: "ROI ESTIMADO (12M)",
    filterAll: "TODOS LOS CASOS",
    financialGainLabel: "GANANCIA FINANCIERA ESTIMADA",
    gcpMonthlyCostLabel: "COSTO MENSUAL GCP",
    confidenceScoreLabel: "Confianza IA",
    detailsBtn: "Ver Detalles Técnicos y BC",
    bottleneckLabel: "Cuello de Botella / Problema",
    solutionLabel: "Solución con IA y BigQuery",
    clientGainsLabel: "Business Case (Ganancias del Cliente)",
    gcpConsumptionLabel: "Consumo Google Cloud (FinOps)",
    requiredTablesLabel: "Tablas Auditadas Necesarias en BigQuery",
    guardrailsLabel: "Guardrails de Gobernanza y Cero Alucinación",
    closeBtn: "Cerrar Detalles",
    similarCasesHeader: "Casos de Éxito Similares en Google Cloud",
    similarCasesSubtitle: "Historias oficiales comprobadas de clientes en el mismo sector y desafío tecnológico publicadas en",
    readFullStory: "Ver historia en cloud.google.com/customers",
    productsUsed: "Productos Google Cloud"
  }
};

type TranslationKey = keyof typeof translations["pt-BR"];

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "pt-BR",
  setLocale: () => {},
  t: (key: TranslationKey) => translations["pt-BR"][key] || key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("pt-BR");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cockpit_locale") as Locale;
      if (saved && (saved === "pt-BR" || saved === "en-US" || saved === "es-ES")) {
        setLocaleState(saved);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("cockpit_locale", newLocale);
    }
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[locale] || translations["pt-BR"];
    return dict[key] || translations["pt-BR"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
