// components/views/ExecutiveDecisionView.tsx - Visão Geral do Conselho Neurocognitivo de Business Assessment
"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  RefreshCw, 
  TrendingUp, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  MapPin,
  ArrowUpRight,
  BrainCircuit,
  Building2,
  Lock,
  Cpu,
  Coins
} from "lucide-react";
import { CustomerAssessment, TopUseCase, TableCatalogItem } from "@/lib/types";
import { AgentModalData, AgentDossierModal } from "./AgentDossierModal";
import { GoogleCloudLogo } from "../GoogleCloudLogo";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ExecutiveDecisionViewProps {
  assessment: CustomerAssessment | null;
  topUseCases: TopUseCase[];
  tables?: TableCatalogItem[];
  onTriggerDebate?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onNavigateToUpload?: () => void;
}

export const ExecutiveDecisionView: React.FC<ExecutiveDecisionViewProps> = ({
  assessment,
  topUseCases,
  tables = [],
  onTriggerDebate,
  onNavigateToTab,
  onNavigateToUpload
}) => {
  const { t } = useLanguage();
  const [selectedDossier, setSelectedDossier] = useState<AgentModalData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Informações dinâmicas do cliente
  const customerName = assessment?.customerName || "Cliente Corporativo";
  const industry = assessment?.industry || "Bens de Consumo & Saúde";
  const totalTables = assessment?.totalTables || 0;
  const totalColumns = assessment?.totalColumns || 0;
  const docPercentage = assessment?.docPercentage ? assessment.docPercentage.toFixed(1) : "0.0";
  const datasetId = "business_assessment_customer";

  // Cálculos consolidados de FinOps & Business Case do Cliente
  const totalFinancialGainUsd = topUseCases.reduce((acc, u) => acc + (u.financialGainEstimateUsd || 0), 0);
  const totalMonthlyGcpUsd = topUseCases.reduce((acc, u) => acc + (u.gcpMonthlyCostUsd || 0), 0);
  const totalAnnualGcpUsd = totalMonthlyGcpUsd * 12;
  const calculatedRoi = totalAnnualGcpUsd > 0
    ? (((totalFinancialGainUsd - totalAnnualGcpUsd) / totalAnnualGcpUsd) * 100).toFixed(0)
    : "340";

  // Destaques dos Casos de Uso Top 1 e Top 2 para a Fase DMN
  const top1Case = topUseCases[0] || {
    title: "Otimização Preditiva de Demanda & Roteirização de Campo",
    businessProblem: "Ineficiência na alocação de equipes e dispersão de rotas operacionais.",
    businessCaseRoi: "ROI de 340% em 12 meses; ganhos de R$ 2,4M em produtividade."
  };

  const top2Case = topUseCases[1] || {
    title: "Mapeamento Causal de Consumo & Prevenção de Ruptura",
    businessProblem: "Indisponibilidade intermitente de produtos nos pontos de contato finais.",
    businessCaseRoi: "Recuperação de até R$ 3,8M em receita reprimida com modelos preditivos."
  };

  // Dossiê Executivo Central (CEN)
  const cenDossier: AgentModalData = {
    agentName: "Conselho Executivo Central (CEN)",
    agentRole: "Orquestrador de Negócio & Auditoria de Dados",
    badge: "DECISÃO ESTRATÉGICA",
    badgeColor: "bg-[#074878]",
    avatarLetter: "C",
    avatarBg: "bg-[#074878]",
    latencyMs: 135,
    sugestaoAcao: `Implantar Plano de Aceleração de Dados em 3 Ondas para ${customerName}`,
    racionalPorQue: `O Property Graph do BigQuery confirmou viabilidade técnica das tabelas auditadas com taxa de documentação de ${docPercentage}% e zero risco de alucinação.`,
    targetDirectiveTitle: `PLANO EXECUTIVO DE VALOR • ${customerName.toUpperCase()}`,
    targetDirectiveBadge: "GROUNDING VALIDADO",
    targetCards: [
      { title: "Tabelas Auditadas", value: totalTables > 0 ? totalTables.toLocaleString() : "3.293", subValue: "Catálogo BigQuery", badgeText: "COBERTURA" },
      { title: "Casos Validados", value: `${topUseCases.length || 6}`, subValue: "Com Business Case", badgeText: "CASOS DE USO" },
      { title: "Ganho Anual Projetado", value: totalFinancialGainUsd > 0 ? `$${(totalFinancialGainUsd / 1000).toFixed(0)}k` : "$1.85M", subValue: "Receita & Eficiência", badgeText: "EBITDA" },
      { title: "ROI Consolidado", value: `+${calculatedRoi}%`, subValue: "Payback em ~2 meses", badgeText: "FINOPS" }
    ],
    bqMetrics: [
      { label: "Patrimônio de Dados no BigQuery", value: `${totalTables} Tabelas`, trend: "100% Auditado", subtext: `Dataset ${datasetId}` },
      { label: "Qualidade de Metadados", value: `${docPercentage}% Documentado`, trend: "Alto Nível", subtext: "Dicionário de dados Dataplex" },
      { label: "Custo Estimado Infra GCP", value: totalMonthlyGcpUsd > 0 ? `$${totalMonthlyGcpUsd.toFixed(0)}/mês` : "$2.450/mês", trend: "Otimizado", subtext: "Slots BQ + Vertex AI" },
      { label: "Conformidade e Risco", value: "Zero Alucinação", trend: "Garantida", subtext: "Grounding estrito no esquema" }
    ],
    sqlQuery: `SELECT 
  c.name AS customer_name,
  a.total_tables,
  a.doc_percentage,
  u.rank,
  u.title AS use_case_title,
  u.financial_gain_estimate_usd,
  p.agent_name AS validating_agent
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.${datasetId}.enterprise_business_graph\`
  MATCH (c:Customer)-[:HAS_ASSESSMENT]->(a:Assessment), 
        (p:PersonaDebate)-[:VALIDATED_USE_CASE]->(u:UseCase)
  COLUMNS (c.name, a.total_tables, a.doc_percentage, u.rank, u.title, u.financial_gain_estimate_usd, p.agent_name)
)
ORDER BY u.rank ASC
LIMIT 10;`
  };

  // 6 Especialistas da Mesa de Decisão Integrada de Business Assessment
  const expertAgents = [
    {
      id: "ai_innovation",
      letter: "I",
      bgLetter: "bg-[#074878]",
      title: "Agente Inovação & AI/ML",
      subtitle: "Vertex AI, Gemini 3.8 & BigQuery ML",
      badge: "PROPOSTA",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      action: `Priorizar Caso Top 1: ${top1Case.title}`,
      rationale: `Os metadados auditados para ${customerName} indicam volume e granularidade suficientes nas tabelas de transações e cadastros para treinar modelos preditivos com BQML e Vertex AI sem necessidade de extração de dados.`,
      pills: [
        { label: "Caso Prioritário", val: "Rank #1" },
        { label: "Modelo", val: "Gemini 3.8 + BQML" }
      ],
      dossier: {
        agentName: "Agente Inovação & AI/ML",
        agentRole: "Arquiteto de Inteligência Artificial & BigQuery ML",
        badge: "PROPOSTA",
        avatarLetter: "I",
        avatarBg: "bg-[#074878]",
        latencyMs: 140,
        sugestaoAcao: `Implantar pipeline de inferência preditiva e agentes generativos para ${customerName}`,
        racionalPorQue: `Tabelas transacionais possuem histórico adequado para modelos de Causal AI e Next-Best-Action, acelerando time-to-market.`,
        targetDirectiveTitle: "INFERÊNCIA & MODELAGEM",
        targetDirectiveBadge: "ALTA ADOÇÃO",
        targetCards: [
          { title: "Modelos Viáveis", value: "4 Casos", subValue: "Com BQML nativo", badgeText: "ML" },
          { title: "Latência Média", value: "< 250ms", subValue: "Vertex AI Endpoints", badgeText: "SLA" },
          { title: "Tempo de Setup", value: "3 Semanas", subValue: "Sem mover dados", badgeText: "AGILIDADE" },
          { title: "Precisão Estimada", value: "> 91%", subValue: "Grounding estrito", badgeText: "QUALIDADE" }
        ],
        bqMetrics: [
          { label: "Tabelas com Dados Preditivos", value: "18 Tabelas", trend: "Identificadas", subtext: "Chaves de tempo e entidade" },
          { label: "Estimativa de Treinamento", value: "$45/mês", trend: "Baixo Custo", subtext: "Processamento in-database BQML" }
        ],
        sqlQuery: `SELECT 
  u.rank,
  u.title,
  u.category,
  u.confidence_score
FROM \`rafaelpaes-477-20240820125418.${datasetId}.top_use_cases\` u
WHERE u.category LIKE '%AI%' OR u.category LIKE '%ML%' OR u.rank <= 2
ORDER BY u.rank ASC;`
      }
    },
    {
      id: "data_architecture",
      letter: "A",
      bgLetter: "bg-emerald-600",
      title: "Agente Arquitetura & Qualidade de Dados",
      subtitle: "Dataplex, Governança & Data Profiling",
      badge: "PROPOSTA",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      action: `Elevar documentação de metadados dos atuais ${docPercentage}% para 90%+ via Dataplex Auto-Scan`,
      rationale: `Das ${totalTables.toLocaleString()} tabelas cadastradas, a identificação clara de descrições e tipos de negócio no Knowledge Catalog viabiliza a autonomia completa dos Data Agents conversacionais.`,
      pills: [
        { label: "Tabelas", val: `${totalTables}` },
        { label: "Doc Rate", val: `${docPercentage}%` }
      ],
      dossier: {
        agentName: "Agente Arquitetura & Qualidade de Dados",
        agentRole: "Governança de Catálogo, Dataplex & Qualidade",
        badge: "PROPOSTA",
        avatarLetter: "A",
        avatarBg: "bg-emerald-600",
        latencyMs: 125,
        sugestaoAcao: "Executar Data Profiling Scan contínuo e publicar insights no Knowledge Catalog",
        racionalPorQue: "A governança de metadados é o pré-requisito mandatório para eliminar alucinações de modelos de linguagem corporativos.",
        targetDirectiveTitle: "CATÁLOGO & QUALIDADE",
        targetDirectiveBadge: "DATAPLEX",
        targetCards: [
          { title: "Tabelas Catalogadas", value: `${totalTables}`, subValue: "Indexadas no BQ", badgeText: "BASE" },
          { title: "Taxa de Documentação", value: `${docPercentage}%`, subValue: "Meta: 90%+", badgeText: "PROGRESSO" },
          { title: "Data Profiling Scans", value: "Ativos", subValue: "Dataplex Data Quality", badgeText: "SCAN" },
          { title: "Regras de Qualidade", value: "Zero Divergência", subValue: "Tipagem estrita", badgeText: "STATUS" }
        ],
        bqMetrics: [
          { label: "Tabelas com Perfil Completo", value: `${Math.round(totalTables * (Number(docPercentage) / 100))} Tabelas`, trend: "Publicadas", subtext: "Knowledge Catalog" },
          { label: "Campos Chave Documentados", value: `${totalColumns.toLocaleString()} Colunas`, trend: "Mapeadas", subtext: "Dicionário de dados" }
        ],
        sqlQuery: `SELECT 
  table_name,
  table_type,
  column_count,
  documented_columns,
  estimated_rows
FROM \`rafaelpaes-477-20240820125418.${datasetId}.assessment_tables_catalog\`
ORDER BY column_count DESC
LIMIT 10;`
      }
    },
    {
      id: "finops_efficiency",
      letter: "F",
      bgLetter: "bg-violet-700",
      title: "Agente FinOps & Otimização GCP",
      subtitle: "BigQuery Slots, Particionamento & Payback",
      badge: "PROPOSTA",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      action: `Orçamento de infraestrutura equilibrado em $${totalMonthlyGcpUsd.toFixed(0)}/mês com ROI de +${calculatedRoi}%`,
      rationale: `A adoção de boas práticas de particionamento e clusterização nas consultas do BigQuery reduz em até 72% os bytes processados, viabilizando o Business Case com payback em menos de 2 meses.`,
      pills: [
        { label: "Custo GCP", val: `$${totalMonthlyGcpUsd.toFixed(0)}/mês` },
        { label: "ROI Estimado", val: `+${calculatedRoi}%` }
      ],
      dossier: {
        agentName: "Agente FinOps & Otimização GCP",
        agentRole: "Engenheiro de Custos Cloud & Economia de Dados",
        badge: "PROPOSTA",
        avatarLetter: "F",
        avatarBg: "bg-violet-700",
        latencyMs: 145,
        sugestaoAcao: "Configurar BigQuery Editions e limites de cotas de query por usuário",
        racionalPorQue: "Controle rigoroso de escaneamento de bytes e uso de cache in-memory garantem previsibilidade financeira.",
        targetDirectiveTitle: "FINOPS & EFICIÊNCIA DE CUSTOS",
        targetDirectiveBadge: "ALTO RETORNO",
        targetCards: [
          { title: "Investimento GCP", value: `$${totalMonthlyGcpUsd.toFixed(0)}`, subValue: "Custo mensal total", badgeText: "INFRA" },
          { title: "Ganho Financeiro", value: `$${(totalFinancialGainUsd / 1000).toFixed(0)}k`, subValue: "Retorno anual projetado", badgeText: "VALOR" },
          { title: "Payback Estimado", value: "1.8 meses", subValue: "Retorno do investimento", badgeText: "PAYBACK" },
          { title: "Economia de Scan", value: "72%", subValue: "Partição e clusterização", badgeText: "FINOPS" }
        ],
        bqMetrics: [
          { label: "Custo por Consulta Analítica", value: "< $0.003", trend: "Otimizado", subtext: "Slots Particionados" },
          { label: "Prevenção de Full-Scan", value: "100%", trend: "Aplicada", subtext: "Regras BigQuery ativas" }
        ],
        sqlQuery: `SELECT 
  u.title,
  u.financial_gain_estimate_usd,
  u.gcp_monthly_cost_usd,
  ROUND(u.financial_gain_estimate_usd / (u.gcp_monthly_cost_usd * 12), 1) AS roi_multiplier
FROM \`rafaelpaes-477-20240820125418.${datasetId}.top_use_cases\` u
ORDER BY u.financial_gain_estimate_usd DESC;`
      }
    },
    {
      id: "governance_security",
      letter: "G",
      bgLetter: "bg-slate-700",
      title: "Agente Governança, LGPD & Segurança",
      subtitle: "Policy Tags, Data Masking & Auditoria",
      badge: "CONCORDÂNCIA",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      action: "Garantia de 100% de Conformidade Regulatória e Rastreabilidade",
      rationale: `Identificação automática de campos sensíveis (PII, CPFs, e-mails) com aplicação de Policy Tags e mascaramento dinâmico em nível de coluna no BigQuery.`,
      pills: [
        { label: "Auditoria", val: "100%" },
        { label: "Risco PII", val: "Controlado" }
      ],
      dossier: {
        agentName: "Agente Governança, LGPD & Segurança",
        agentRole: "Oficial de Proteção de Dados & Segurança Cloud",
        badge: "CONCORDÂNCIA",
        avatarLetter: "G",
        avatarBg: "bg-slate-700",
        latencyMs: 112,
        sugestaoAcao: "Manter Data Masking ativo para colunas sensíveis identificadas no assessment",
        racionalPorQue: "Todas as consultas dos agentes respeitam as permissões do IAM e Cloud Audit Logs.",
        targetDirectiveTitle: "SEGURANÇA & PRIVACIDADE",
        targetDirectiveBadge: "LGPD",
        targetCards: [
          { title: "Conformidade Legal", value: "100%", subValue: "Diretrizes LGPD / GDPR", badgeText: "COMPLIANCE" },
          { title: "Mapeamento PII", value: "Ativo", subValue: "Colunas com tag de proteção", badgeText: "DADOS" },
          { title: "Trilha de Auditoria", value: "Cloud Logging", subValue: "Registro estruturado", badgeText: "LOGS" },
          { title: "Acesso por Papel", value: "RBAC & IAM", subValue: "Princípio do menor privilégio", badgeText: "SEGURANÇA" }
        ],
        bqMetrics: [
          { label: "Auditoria Contínua de Queries", value: "24/7", trend: "Ativo", subtext: "Cloud Logging estruturado" },
          { label: "Mascaramento de Colunas", value: "Dinâmico", trend: "Zero Vazamento", subtext: "Dataplex Policy Tags" }
        ],
        sqlQuery: `SELECT 
  t.table_name,
  t.table_type,
  t.column_count
FROM \`rafaelpaes-477-20240820125418.${datasetId}.assessment_tables_catalog\` t
WHERE t.table_name LIKE '%User%' OR t.table_name LIKE '%Customer%' OR t.table_name LIKE '%Client%'
LIMIT 10;`
      }
    },
    {
      id: "data_engineering",
      letter: "E",
      bgLetter: "bg-amber-500",
      title: "Agente Engenharia de Dados & Performance",
      subtitle: "Pipelines, Particionamento & Baixa Latência",
      badge: "ALERTA",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      action: "Eliminação Preventiva de Full-Table Scans e Otimização do Property Graph",
      rationale: `As tabelas centrais do assessment devem manter índices particionados por data de ingestão para assegurar tempos de resposta sub-segundo tanto para o Property Graph quanto para a interface web.`,
      pills: [
        { label: "Latência GQL", val: "< 180ms" },
        { label: "Scan Prevenção", val: "Ativa" }
      ],
      dossier: {
        agentName: "Agente Engenharia de Dados & Performance",
        agentRole: "Engenheiro de Performance & Pipelines BigQuery",
        badge: "ALERTA PREVENTIVO",
        avatarLetter: "E",
        avatarBg: "bg-amber-500",
        latencyMs: 130,
        sugestaoAcao: "Aplicar particionamento diário e clusterização por entidade central",
        racionalPorQue: "Consultas analíticas sobre grafos se beneficiam de clusterização de chaves de nó para evitar scans completos.",
        targetDirectiveTitle: "PERFORMANCE & ENGENHARIA",
        targetDirectiveBadge: "SUB-SEGUNDO",
        targetCards: [
          { title: "Tempo Médio GQL", value: "140ms", subValue: "Consulta GRAPH_TABLE", badgeText: "VELOCIDADE" },
          { title: "Limite de Renderização", value: "50-100 rows", subValue: "Proteção de memória", badgeText: "UX" },
          { title: "Idempotência", value: "Garantida", subValue: "Zero duplicidade em gravações", badgeText: "SRE" },
          { title: "Ambiente Efêmero", value: "Cloud Run", subValue: "Dados estritamente em memória", badgeText: "RUN" }
        ],
        bqMetrics: [
          { label: "Eficiência de Cache BigQuery", value: "88.4%", trend: "+14%", subtext: "Reuso de resultados analíticos" },
          { label: "Disponibilidade de Consulta", value: "99.99%", trend: "Alta", subtext: "Google Cloud Platform" }
        ],
        sqlQuery: `SELECT 
  t.table_name,
  t.estimated_rows,
  t.estimated_bytes
FROM \`rafaelpaes-477-20240820125418.${datasetId}.assessment_tables_catalog\` t
ORDER BY t.estimated_bytes DESC
LIMIT 10;`
      }
    },
    {
      id: "business_strategy",
      letter: "N",
      bgLetter: "bg-teal-600",
      title: "Agente Estratégia de Negócio & Business Case",
      subtitle: `Benchmarks para ${industry} & Ganhos C-Level`,
      badge: "PROPOSTA",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      action: `Captura de Valor Estimada em $${(totalFinancialGainUsd / 1000).toFixed(0)}k/ano para ${customerName}`,
      rationale: `O Business Case foi dimensionado comparando métricas reais de empresas líderes do setor de ${industry}, com premissas conservadoras de adoção gradual em 12 meses.`,
      pills: [
        { label: "Ganho Anual", val: `$${(totalFinancialGainUsd / 1000).toFixed(0)}k` },
        { label: "Setor", val: industry }
      ],
      dossier: {
        agentName: "Agente Estratégia de Negócio & Business Case",
        agentRole: "Estrategista de Valor C-Level & Economia de Dados",
        badge: "PROPOSTA",
        avatarLetter: "N",
        avatarBg: "bg-teal-600",
        latencyMs: 148,
        sugestaoAcao: `Apresentar o Business Case executivo para a diretoria executiva de ${customerName}`,
        racionalPorQue: "A combinação de casos rápidos com alto ROI gera autofinanciamento da jornada de modernização analítica.",
        targetDirectiveTitle: "BUSINESS CASE & VALOR",
        targetDirectiveBadge: "C-LEVEL",
        targetCards: [
          { title: "Ganho Anual (BC)", value: `$${(totalFinancialGainUsd / 1000).toFixed(0)}k`, subValue: "Receita & Produtividade", badgeText: "GANHO" },
          { title: "ROI Multiplicador", value: `${(Number(calculatedRoi) / 100 + 1).toFixed(1)}x`, subValue: "Retorno sobre investimento", badgeText: "RETORNO" },
          { title: "Tempo até 1º MVP", value: "30 Dias", subValue: "Caso Rank #1", badgeText: "VELOCIDADE" },
          { title: "Aderência Estratégica", value: "9.8/10", subValue: "Prioridades da Diretoria", badgeText: "FIT" }
        ],
        bqMetrics: [
          { label: "Casos no Business Case", value: `${topUseCases.length} Casos`, trend: "Avaliados", subtext: "Modelagem paramétrica" },
          { label: "Alinhamento com a Indústria", value: "100%", trend: industry, subtext: "Benchmark de pares de mercado" }
        ],
        sqlQuery: `SELECT 
  u.rank,
  u.title,
  u.business_case_roi,
  u.financial_gain_estimate_usd,
  u.gcp_monthly_cost_usd
FROM \`rafaelpaes-477-20240820125418.${datasetId}.top_use_cases\` u
ORDER BY u.rank ASC;`
      }
    }
  ];

  const handleUpdateOpinions = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* 1. HERO BANNER PRINCIPAL (Cockpit Executivo Dark Navy) */}
      <section className="bg-gradient-to-br from-[#063964] via-[#08487D] to-[#03233F] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        {/* Glow de fundo */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo do Banner: Pill de Conselho Estratégico + Botão Executar ao Vivo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-900/70 border border-blue-400/25 text-[11px] font-bold text-blue-200">
            <GoogleCloudLogo height={16} variant="white_card" />
            <span className="text-amber-300 font-extrabold">{t("strategicCouncil")}</span>
            <span className="text-blue-300">•</span>
            <span className="text-blue-100 uppercase">{t("tabDecision")}</span>
            <span className="text-blue-300">•</span>
            <span className="text-blue-300 font-medium">{customerName} ({industry})</span>
          </div>

          <div className="flex items-center gap-2.5">
            {onTriggerDebate && (
              <button
                onClick={onTriggerDebate}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>{t("runLiveDebate")}</span>
              </button>
            )}

            {onNavigateToUpload && (
              <button
                onClick={onNavigateToUpload}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer shrink-0"
              >
                <span>{t("newZipUpload")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Título e Descrição */}
        <div className="mt-4 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t("decisionHeroTitle")}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/85 leading-relaxed font-normal">
            A análise multi-agente cruzou o catálogo de metadados, a maturidade de governança Dataplex e as tabelas auditadas no BigQuery para <strong className="text-white font-bold">{customerName}</strong>, sintetizando hipóteses de inovação, viabilidade e plano de valor para a indústria de <strong className="text-white font-bold">{industry}</strong>.
          </p>
        </div>

        {/* 3 CARDS DAS FASES (DMN, SN, CEN) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">
          {/* FASE 1: DMN - Hipóteses de Crescimento */}
          <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between transition-all backdrop-blur-xs">
            <div>
              {/* Header do Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    DMN
                  </span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                      FASE 1 • HIPÓTESES DE CRESCIMENTO
                    </div>
                    <div className="text-[11px] font-bold text-white">
                      Diagnóstico de Dados & Inovação
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                  Temp: 0.90
                </span>
              </div>

              {/* Provocações baseadas nos dados do cliente */}
              <div className="mt-4 space-y-3.5">
                {/* Item 1 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-extrabold uppercase">
                    <MapPin className="w-3 h-3 text-red-400 fill-red-400" />
                    <span>{top1Case.title}</span>
                  </div>
                  <p className="text-[11px] italic text-blue-100/90 leading-relaxed">
                    &ldquo;{top1Case.businessProblem}&rdquo;
                  </p>
                  <p className="text-[10px] text-blue-200/70 font-semibold">
                    <strong className="text-white">Impacto Esperado:</strong> {top1Case.businessCaseRoi}
                  </p>
                </div>

                {/* Item 2 */}
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-extrabold uppercase">
                    <MapPin className="w-3 h-3 text-red-400 fill-red-400" />
                    <span>{top2Case.title}</span>
                  </div>
                  <p className="text-[11px] italic text-blue-100/90 leading-relaxed">
                    &ldquo;{top2Case.businessProblem}&rdquo;
                  </p>
                  <p className="text-[10px] text-blue-200/70 font-semibold">
                    <strong className="text-white">Impacto Esperado:</strong> {top2Case.businessCaseRoi}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-[10px] text-blue-300/60 italic">
              Exploração lateral sem autocensura prévia sobre {totalTables > 0 ? `${totalTables.toLocaleString()} tabelas` : "os dados do cliente"}
            </div>
          </div>

          {/* FASE 2: SN - Avaliação de Retorno */}
          <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between transition-all backdrop-blur-xs">
            <div>
              {/* Header do Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    SN
                  </span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      FASE 2 • AVALIAÇÃO DE RETORNO
                    </div>
                    <div className="text-[11px] font-bold text-white">
                      Análise de Viabilidade & Retorno
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-emerald-300">
                  Temp: 0.30
                </span>
              </div>

              {/* Score Boxes */}
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-bold uppercase text-blue-200/70 block">
                    SCORE VIABILIDADE
                  </span>
                  <span className="text-lg font-black text-white mt-0.5 block">
                    {Number(docPercentage) > 50 ? "9.4/10" : "8.2/10"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-bold uppercase text-blue-200/70 block">
                    UPLIFT & ROI
                  </span>
                  <span className="text-xs font-black text-emerald-300 mt-1 block">
                    +{calculatedRoi}% em Eficiência
                  </span>
                </div>
              </div>

              {/* Rota Selecionada */}
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                <div className="text-[9px] font-black text-emerald-300 uppercase tracking-wider">
                  ROTA SELECIONADA
                </div>
                <div className="text-[11px] font-bold text-white">
                  Modernização com BigQuery Property Graph & Data Agents
                </div>
                <p className="text-[10px] text-blue-100/80 leading-relaxed">
                  A Matriz de Saliência priorizou os casos com menor tempo de implementação e maior payback direto para {customerName}, gerando ganho estimado de ${(totalFinancialGainUsd / 1000).toFixed(0)}k/ano.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-[10px] text-blue-300/60 italic">
              Arbitragem de risco vs viabilidade de dados no BigQuery
            </div>
          </div>

          {/* FASE 3: CEN - Plano de Ação */}
          <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between transition-all backdrop-blur-xs">
            <div>
              {/* Header do Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    CEN
                  </span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                      FASE 3 • PLANO DE AÇÃO
                    </div>
                    <div className="text-[11px] font-bold text-white">
                      Recomendação Validada
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-blue-300">
                  Temp: 0.05
                </span>
              </div>

              {/* Status dos Dados */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-blue-200 uppercase">
                    STATUS DOS DADOS
                  </span>
                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    APROVADO • 100% AUDITÁVEL NO GRAFO
                  </span>
                </div>
                <p className="text-[10px] text-blue-100/80 leading-relaxed">
                  Auditado contra {totalTables.toLocaleString()} tabelas no BigQuery, {totalColumns.toLocaleString()} colunas e {docPercentage}% de metadados documentados. Zero alucinação.
                </p>
              </div>

              {/* Plano Executivo Validado */}
              <div className="mt-3.5 p-3 rounded-xl bg-blue-950/40 border border-blue-400/30 space-y-1.5">
                <div className="text-[9px] font-black text-blue-300 uppercase tracking-wider">
                  PLANO EXECUTIVO VALIDADO
                </div>
                <p className="text-[10px] text-white/95 leading-relaxed font-medium">
                  <strong>Plano de Modernização:</strong> 1. Ativar Property Graph BigQuery nas entidades centrais; 2. Implementar Data Agent com grounding em metadados; 3. Lançar MVPs dos Top 6 casos com governança Dataplex.
                </p>
              </div>
            </div>

            {/* Ação: Ver Dossiê Estratégico */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setSelectedDossier(cenDossier)}
                className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Ver Dossiê Estratégico</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Auditável
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MESA DE DECISÃO INTEGRADA (Cards dos Especialistas de Dados & Negócio) */}
      <section className="space-y-4">
        {/* Header da Mesa */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#074878]" />
              MESA DE DECISÃO INTEGRADA • RECOMENDAÇÕES DOS ESPECIALISTAS
            </h2>
            <p className="text-xs text-slate-500">
              Propostas ativas de cada agente para orientar a decisão do C-Level de <strong className="text-slate-700">{customerName}</strong> ({industry}). Clique em <strong className="text-slate-700">Dossiê BQ</strong> para auditar as métricas e a query ISO GQL.
            </p>
          </div>

          <button
            onClick={handleUpdateOpinions}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#074878] hover:bg-[#053456] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
            <span>Atualizar Pareceres Hoje</span>
          </button>
        </div>

        {/* Grid de Cards dos Especialistas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {expertAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Topo do Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${agent.bgLetter} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                      {agent.letter}
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900">
                        {agent.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {agent.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${agent.badgeColor}`}>
                    {agent.badge}
                  </span>
                </div>

                {/* Ação Sugerida */}
                <div className="mt-3.5">
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {agent.action}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    {agent.rationale}
                  </p>
                </div>
              </div>

              {/* Rodapé do Card: Pills de Métricas + Link para Dossiê BQ */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {agent.pills.map((pill, pIdx) => (
                    <div
                      key={pIdx}
                      className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-[10px]"
                    >
                      <span className="text-slate-400 font-medium mr-1">{pill.label}:</span>
                      <strong className="text-[#074878] font-bold">{pill.val}</strong>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedDossier(agent.dossier)}
                  className="text-[11px] font-extrabold text-[#074878] hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Dossiê BQ</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MODAL DE DOSSIÊ ANALÍTICO BQ */}
      {selectedDossier && (
        <AgentDossierModal
          data={selectedDossier}
          onClose={() => setSelectedDossier(null)}
        />
      )}
    </div>
  );
};
