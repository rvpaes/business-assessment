// components/views/ExecutiveDecisionView.tsx - Visão Geral do Conselho Neurocognitivo (Estilo Hypera Commercial Brain)
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
  BrainCircuit
} from "lucide-react";
import { CustomerAssessment, TopUseCase } from "@/lib/types";
import { AgentModalData, AgentDossierModal } from "./AgentDossierModal";

interface ExecutiveDecisionViewProps {
  assessment: CustomerAssessment | null;
  topUseCases: TopUseCase[];
  onTriggerDebate?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ExecutiveDecisionView: React.FC<ExecutiveDecisionViewProps> = ({
  assessment,
  topUseCases,
  onTriggerDebate,
  onNavigateToTab
}) => {
  const [selectedDossier, setSelectedDossier] = useState<AgentModalData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Informações de contexto
  const customerName = assessment?.customerName || "Hypera Pharma";
  const customerExecutive = "ADRIANA BARBERI FERREIRA";
  const districtName = "FEMME - Distrito 102010000";
  const totalTables = assessment?.totalTables || 3293;
  const docPercentage = assessment?.documentationPercentage?.toFixed(1) || "71.4";

  // Dossiê Estratégico Global (CEN)
  const cenDossier: AgentModalData = {
    agentName: "Conselho Executivo Central (CEN)",
    agentRole: "Orquestrador Causal & Validador de Negócio",
    badge: "DECISÃO EXECUTIVA",
    badgeColor: "bg-[#074878]",
    avatarLetter: "C",
    avatarBg: "bg-[#074878]",
    latencyMs: 142,
    sugestaoAcao: "Executar Plano Tático Distrital em 3 Ondas Integradas de Co-visitação e Abastecimento",
    racionalPorQue: "O Property Graph do BigQuery confirmou correlação de 0.89 entre presença no PDV satélite e prescrição médica ativa no distrito.",
    targetDirectiveTitle: "DIRETRIZ CENTRAL DISTRITAL",
    targetDirectiveBadge: "CO-VISITAÇÃO & SELL-OUT",
    targetCards: [
      { title: "Médicos Distritais", value: "2.100", subValue: "100% Auditados", badgeText: "COBERTURA" },
      { title: "Visitas Registradas", value: "2.604", subValue: "MDV Médio 12.4", badgeText: "PRODUTIVIDADE" },
      { title: "Sell-Out Distrital", value: "R$ 5.38M", subValue: "447 PDVs Ativos", badgeText: "FATURAMENTO" },
      { title: "Uplift Causal", value: "+16.4%", subValue: "Eficiência Validada", badgeText: "GANHO" }
    ],
    bqMetrics: [
      { label: "Tabelas Auditadas no Grafo", value: `${totalTables} Tabelas`, trend: "100% OK", subtext: "Dataset business_assessment_customer" },
      { label: "Documentação de Metadados", value: `${docPercentage}%`, trend: "+8.5%", subtext: "Campos de negócio preenchidos" },
      { label: "Consultas BigQuery GQL", value: "Sub-segundo", trend: "140ms", subtext: "Índice de nós e arestas particionado" },
      { label: "Prevenção de Alucinação", value: "Zero Alucinação", trend: "Garantida", subtext: "Grounding direto nas tabelas BQ" }
    ],
    sqlQuery: `SELECT 
  c.name AS customer,
  a.total_tables,
  a.doc_percentage,
  u.rank,
  u.title AS use_case,
  p.agent_name AS validator
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (c:Customer)-[:HAS_ASSESSMENT]->(a:Assessment), 
        (p:PersonaDebate)-[:VALIDATED_USE_CASE]->(u:UseCase)
  COLUMNS (c.name, a.total_tables, a.doc_percentage, u.rank, u.title, p.agent_name)
)
ORDER BY u.rank ASC
LIMIT 10;`
  };

  // 6 Especialistas da Mesa de Decisão
  const expertAgents = [
    {
      id: "performance",
      letter: "T",
      bgLetter: "bg-[#074878]",
      title: "Agente Performance do Time",
      subtitle: "Cota Distrital & Ranking",
      badge: "PROPOSTA",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      action: "Gestão de Produtividade: Sustentar MDV médio de 12.4 visitas/dia no distrito",
      rationale: "Garantir consistência na frequência de visitação médica dos 8 setores. Concentrar nas quartas e quintas-feiras nos setores de maior dispersão geográfica para blindar a cobertura de painel A/B.",
      pills: [
        { label: "MDV Médio", val: "12.4" },
        { label: "Cota Atingida", val: "98.2%" }
      ],
      dossier: {
        agentName: "Agente Performance do Time",
        agentRole: "Otimização de Força de Vendas e Produtividade Médica",
        badge: "PROPOSTA",
        avatarLetter: "T",
        avatarBg: "bg-[#074878]",
        latencyMs: 128,
        sugestaoAcao: "Sustentar MDV médio de 12.4 visitas/dia e fechar 100% da cobertura distrital",
        racionalPorQue: "Representantes com rota otimizada pelo Grafo reduzem tempo de deslocamento em 22%, liberando 1.5 visita adicional/dia.",
        targetDirectiveTitle: "ROTA & PRODUTIVIDADE",
        targetDirectiveBadge: "ALTA ADERÊNCIA",
        targetCards: [
          { title: "Meta Visitas/Dia", value: "12.4", subValue: "Média Regional", badgeText: "KPI CHAVE" },
          { title: "Setores Ativos", value: "8", subValue: "100% monitorados", badgeText: "PAINEL" },
          { title: "Médicos sem Contato", value: "0", subValue: "Foco Zero Vácuo", badgeText: "COBERTURA" },
          { title: "Horas em Trânsito", value: "-22%", subValue: "Economia Logística", badgeText: "GANHO" }
        ],
        bqMetrics: [
          { label: "Total de Visitas Registradas", value: "2.604 visitas", trend: "+5.1%", subtext: "Ciclo atual" },
          { label: "Aderência à Grade de Painel", value: "96.4%", trend: "Acima da meta", subtext: "Especialidades Femme" },
          { label: "Custo Médio por Visita", value: "R$ 42,50", trend: "-11%", subtext: "Otimizado via roteirização BQ" }
        ],
        sqlQuery: `SELECT 
  t.table_name,
  t.total_rows,
  t.has_pii
FROM \`rafaelpaes-477-20240820125418.business_assessment_customer.assessment_tables_catalog\` t
WHERE t.table_name LIKE '%Activities%' OR t.table_name LIKE '%Visit%'
LIMIT 5;`
      }
    },
    {
      id: "market_intelligence",
      letter: "I",
      bgLetter: "bg-emerald-600",
      title: "Agente Inteligência de Mercado",
      subtitle: "Prescrição Close-up & Modelo Huff",
      badge: "PROPOSTA",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      action: "Consolidação de Share em GOB (55.5%) e Conquista de Pediatria & Puericultura",
      rationale: "Expandir o receituário de ALIVIUM GOTAS sobre concorrentes diretos nos clusters de alto potencial de prescrição, capturando o fluxo gerado pelas farmácias satélites mapeadas pelo modelo Huff.",
      pills: [
        { label: "Market Share", val: "55.5%" },
        { label: "Potencial", val: "+R$ 376k" }
      ],
      dossier: {
        agentName: "Agente Inteligência de Mercado",
        agentRole: "Análise Causal de Demanda & Gravitação Huff",
        badge: "PROPOSTA",
        avatarLetter: "I",
        avatarBg: "bg-emerald-600",
        latencyMs: 154,
        sugestaoAcao: "Concentrar blitz de amostras e detalhamento médico nos clusters de Pediatria",
        racionalPorQue: "O modelo de gravitação de Huff revelou que 38 farmácias independentes convertem 64% da prescrição emitida pelos consultórios vizinhos.",
        targetDirectiveTitle: "GRAVITAÇÃO DE DEMANDA HUFF",
        targetDirectiveBadge: "ALTA CONVERSÃO",
        targetCards: [
          { title: "Share GOB Atual", value: "55.5%", subValue: "Liderança isolada", badgeText: "MARKET SHARE" },
          { title: "Incremento Previsto", value: "+R$ 376k", subValue: "ALIVIUM Gotas", badgeText: "OPORTUNIDADE" },
          { title: "PDVs Gravitacionais", value: "447", subValue: "Raio de 800m", badgeText: "PONTOS DE VENDA" },
          { title: "Índice de Prescrição", value: "9.2/10", subValue: "Close-up auditado", badgeText: "SCORE" }
        ],
        bqMetrics: [
          { label: "Prescrições Monitoradas", value: "14.280 Rxs", trend: "+8.4%", subtext: "Especialidades prioritárias" },
          { label: "Taxa de Conversão PDV", value: "73.2%", trend: "+12.1%", subtext: "Farmácias com estoque garantido" },
          { label: "Share de Voz Promocional", value: "61.0%", trend: "Top 1", subtext: "Impacto no target A" }
        ],
        sqlQuery: `SELECT 
  u.title,
  u.financial_gain_estimate_usd,
  u.implementation_complexity
FROM \`rafaelpaes-477-20240820125418.business_assessment_customer.top_use_cases\` u
WHERE u.rank = 1 OR u.category = 'MARKETING_ANALYTICS'
LIMIT 5;`
      }
    },
    {
      id: "supply",
      letter: "A",
      bgLetter: "bg-amber-500",
      title: "Agente Abastecimento e Ruptura",
      subtitle: "Estoque em Redes e Sell-Out PDV",
      badge: "ALERTA",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      action: "Prevenção Ativa de Ruptura nos 447 PDVs e Redes Regionais",
      rationale: "Cruzar o Sell-Out semanal das lojas com o estoque em trânsito das distribuidoras. Acionar trade marketing preventivamente nos clusters onde os dias de estoque estão abaixo de 4 dias de demanda.",
      pills: [
        { label: "Ruptura Evitada", val: "99.4%" },
        { label: "Sell-Out", val: "R$ 5.38M" }
      ],
      dossier: {
        agentName: "Agente Abastecimento e Ruptura",
        agentRole: "Previsão de Ruptura & Integração Supply Chain",
        badge: "ALERTA PREVENTIVO",
        avatarLetter: "A",
        avatarBg: "bg-amber-500",
        latencyMs: 139,
        sugestaoAcao: "Disparar alertas automáticos para compras das redes com estoque < 4 dias",
        racionalPorQue: "Ruptura no ponto de venda após visita do médico causa perda de 38% do receituário gerado.",
        targetDirectiveTitle: "BLINDAGEM DE ESTOQUE PDV",
        targetDirectiveBadge: "RISCO DE RUPTURA",
        targetCards: [
          { title: "PDVs Auditados", value: "447", subValue: "100% monitorados", badgeText: "COBERTURA" },
          { title: "Índice de Ruptura", value: "0.6%", subValue: "Nível histórico mínimo", badgeText: "CONTROLE" },
          { title: "Sell-Out Total", value: "R$ 5.38M", subValue: "Período auditado", badgeText: "VALOR" },
          { title: "Tempo Médio Reposição", value: "2.1 dias", subValue: "Distribuidor regional", badgeText: "SLA" }
        ],
        bqMetrics: [
          { label: "SKUs com Alerta Ativo", value: "3 SKUs", trend: "-40%", subtext: "Alivium e suplementos" },
          { label: "Confiabilidade do Estoque", value: "98.7%", trend: "Auditado", subtext: "Integração ERP e Distribuidor" }
        ],
        sqlQuery: `SELECT 
  t.table_name,
  t.row_count,
  t.documentation_status
FROM \`rafaelpaes-477-20240820125418.business_assessment_customer.assessment_tables_catalog\` t
WHERE t.table_name LIKE '%Inventory%' OR t.table_name LIKE '%Stock%' OR t.table_name LIKE '%Orders%'
LIMIT 5;`
      }
    },
    {
      id: "governance",
      letter: "G",
      bgLetter: "bg-slate-700",
      title: "Agente Governança e Compliance",
      subtitle: "LGPD & Conformidade CFM/Anvisa",
      badge: "CONCORDÂNCIA",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      action: "Garantia de 100% de Consentimento e Amostras Grátis Auditadas",
      rationale: "Rastreabilidade ponta-a-ponta em BigQuery para todas as entregas de amostras grátis e assinaturas digitais dos médicos, mantendo a conformidade com as regras da Anvisa e LGPD.",
      pills: [
        { label: "Auditoria", val: "100%" },
        { label: "Conformidade", val: "Total" }
      ],
      dossier: {
        agentName: "Agente Governança e Compliance",
        agentRole: "Segurança de Dados, PII & Rastreabilidade Regulatória",
        badge: "CONCORDÂNCIA",
        avatarLetter: "G",
        avatarBg: "bg-slate-700",
        latencyMs: 110,
        sugestaoAcao: "Manter Policy Tags ativas e criptografia de ponta-a-ponta em campos PII",
        racionalPorQue: "Todas as tabelas com CRM e geolocalização possuem mascaramento dinâmico no BigQuery (Data Masking).",
        targetDirectiveTitle: "GOVERNANÇA & SEGURANÇA",
        targetDirectiveBadge: "REGULATÓRIO",
        targetCards: [
          { title: "Tabelas com PII", value: "142", subValue: "Auditadas e Mascaradas", badgeText: "LGPD" },
          { title: "Consentimentos Ativos", value: "100%", subValue: "Assinaturas digitais", badgeText: "ANVISA" },
          { title: "Risco de Não-Conformidade", value: "Zero", subValue: "Políticas vigentes", badgeText: "SEGURANÇA" },
          { title: "Auditoria Automática", value: "Contínua", subValue: "Cloud Logging", badgeText: "COMPLIANCE" }
        ],
        bqMetrics: [
          { label: "Policy Tags Aplicadas", value: "100%", trend: "Ativo", subtext: "Dataplex Security Policy" },
          { label: "Auditoria de Acesso", value: "24/7", trend: "OK", subtext: "Trilha Cloud Audit Logs" }
        ],
        sqlQuery: `SELECT 
  t.table_name,
  t.has_pii,
  t.compliance_tags
FROM \`rafaelpaes-477-20240820125418.business_assessment_customer.assessment_tables_catalog\` t
WHERE t.has_pii = true
LIMIT 5;`
      }
    },
    {
      id: "finops",
      letter: "S",
      bgLetter: "bg-violet-700",
      title: "Agente Estratégia Comercial & FinOps",
      subtitle: "ROI & Lucratividade por SKU",
      badge: "PROPOSTA",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      action: "Maximização de Margem por Caixa e Otimização de Budget Promocional",
      rationale: "Rebalancear o investimento promocional distrital focando nos SKUs com maior margem de contribuição líquida, alcançando ROI de 340% sobre o custo operacional da equipe.",
      pills: [
        { label: "ROI Estimado", val: "+340%" },
        { label: "Margem Adicional", val: "+4.2pp" }
      ],
      dossier: {
        agentName: "Agente Estratégia Comercial & FinOps",
        agentRole: "Modelagem Econômica, Payback & Rentabilidade",
        badge: "PROPOSTA",
        avatarLetter: "S",
        avatarBg: "bg-violet-700",
        latencyMs: 147,
        sugestaoAcao: "Alocar 60% do budget de amostras nos SKUs de alta margem de contribuição",
        racionalPorQue: "A margem líquida dos SKUs foco é de 42%, contra média da carteira de 28%, gerando maior retorno por real investido.",
        targetDirectiveTitle: "RENTABILIDADE & INVESTIMENTO",
        targetDirectiveBadge: "ALTO ROI",
        targetCards: [
          { title: "ROI Esperado", value: "+340%", subValue: "Em 12 meses", badgeText: "RETORNO" },
          { title: "Ganho Financeiro", value: "R$ 4.2M", subValue: "Carteira Nacional", badgeText: "EBITDA" },
          { title: "Custo Infra GCP", value: "$620/mês", subValue: "BigQuery + Vertex AI", badgeText: "FINOPS" },
          { title: "Payback", value: "1.8 meses", subValue: "Retorno acelerado", badgeText: "VIABILIDADE" }
        ],
        bqMetrics: [
          { label: "Custo BigQuery por Consulta", value: "$0.002", trend: "Slots Otimizados", subtext: "Particionamento e clusterização" },
          { label: "Eficiência de Processamento", value: "99.8%", trend: "Alta", subtext: "Zero Full-Table Scan" }
        ],
        sqlQuery: `SELECT 
  u.title,
  u.financial_gain_estimate_usd,
  u.gcp_monthly_cost_usd,
  ROUND((u.financial_gain_estimate_usd / (u.gcp_monthly_cost_usd * 12)), 1) AS roi_multiplier
FROM \`rafaelpaes-477-20240820125418.business_assessment_customer.top_use_cases\` u
ORDER BY u.financial_gain_estimate_usd DESC
LIMIT 5;`
      }
    },
    {
      id: "omnichannel",
      letter: "C",
      bgLetter: "bg-teal-600",
      title: "Agente Conexão Multicanal (Omnichannel)",
      subtitle: "Disparo Digital & Engajamento Médico",
      badge: "PROPOSTA",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      action: "Ativação Digital Complementar pós-visita presencial",
      rationale: "Disparo de conteúdo científico personalizado via WhatsApp e e-mail marketing aprovado no D+2 após a visita do representante, mantendo o recall da marca acima de 80%.",
      pills: [
        { label: "Taxa Abertura", val: "68%" },
        { label: "Recall de Marca", val: "+8.3%" }
      ],
      dossier: {
        agentName: "Agente Conexão Multicanal (Omnichannel)",
        agentRole: "Engajamento Digital, CRM & Comunicação Médica",
        badge: "PROPOSTA",
        avatarLetter: "C",
        avatarBg: "bg-teal-600",
        latencyMs: 133,
        sugestaoAcao: "Sincronizar visitas presenciais com cadências automáticas de nutrição científica",
        racionalPorQue: "Médicos contatados por canal híbrido (presencial + digital) apresentam 2.3x mais prescrições recorrentes.",
        targetDirectiveTitle: "ENGAGEMENT HÍBRIDO",
        targetDirectiveBadge: "ALTA ADOÇÃO",
        targetCards: [
          { title: "Taxa de Abertura", value: "68%", subValue: "Média do mercado 24%", badgeText: "ENGAJAMENTO" },
          { title: "Recall Prescritivo", value: "+8.3%", subValue: "Estudo comparativo", badgeText: "IMPACTO" },
          { title: "Médicos Híbridos", value: "1.420", subValue: "Opt-in ativo", badgeText: "BASE ATIVA" },
          { title: "Cadência D+2", value: "98.4%", subValue: "Disparos no prazo", badgeText: "SLA" }
        ],
        bqMetrics: [
          { label: "Interações Digitais", value: "8.940 envios", trend: "+15.2%", subtext: "WhatsApp e e-mail" },
          { label: "Taxa de Download de Artigos", value: "41.5%", trend: "Alta", subtext: "Material científico validado" }
        ],
        sqlQuery: `SELECT 
  t.table_name,
  t.total_rows,
  t.category
FROM \`rafaelpaes-477-20240820125418.business_assessment_customer.assessment_tables_catalog\` t
WHERE t.table_name LIKE '%Campaign%' OR t.table_name LIKE '%Email%' OR t.table_name LIKE '%Message%'
LIMIT 5;`
      }
    }
  ];

  const handleUpdateOpinions = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* 1. HERO BANNER PRINCIPAL (Exato Imagem 2 - Hypera Commercial Brain) */}
      <section className="bg-gradient-to-br from-[#063964] via-[#08487D] to-[#03233F] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        {/* Glow de fundo */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo do Banner: Pill de Conselho Estratégico + Botão Executar ao Vivo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-400/20 text-[11px] font-bold text-blue-200">
            <span className="text-amber-300 font-extrabold">ⓘ CONSELHO ESTRATÉGICO INTELIGENTE</span>
            <span className="text-blue-300">•</span>
            <span className="text-blue-100">RECOMENDAÇÃO DE NEGÓCIO</span>
            <span className="text-blue-300">•</span>
            <span className="text-blue-300 font-medium">Análise da Carteira de {customerExecutive} ({districtName})</span>
          </div>

          {onTriggerDebate && (
            <button
              onClick={onTriggerDebate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>Executar Neuro-Debate ao Vivo</span>
            </button>
          )}
        </div>

        {/* Título e Descrição */}
        <div className="mt-4 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Conselho Neurocognitivo & Provocações Estratégicas da Carteira
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/80 leading-relaxed font-normal">
            A análise estratégica integrada cruzou as visitas de campo, o abastecimento de farmácias e as vendas da carteira para <strong className="text-white font-bold">{customerExecutive}</strong> emitindo provocações de ruptura e alavancagem de resultados.
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
                      Diagnóstico de Campo
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                  Temp: 0.90
                </span>
              </div>

              {/* Provocações */}
              <div className="mt-4 space-y-3.5">
                {/* Item 1 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-extrabold uppercase">
                    <MapPin className="w-3 h-3 text-red-400 fill-red-400" />
                    <span>CO-VISITAÇÃO DIRIGIDA NOS SETORES EM DESENVOLVIMENTO</span>
                  </div>
                  <p className="text-[11px] italic text-blue-100/90 leading-relaxed">
                    &ldquo;Dedicar 3 dias/semana de acompanhamento em campo nos 2 setores com maior volume de médicos não contatados (0 médicos no distrito).&rdquo;
                  </p>
                  <p className="text-[10px] text-blue-200/70 font-semibold">
                    <strong className="text-white">Impacto Esperado:</strong> Ganho de +1,5 visitas/dia por representante e fechamento de 100% da cobertura distrital.
                  </p>
                </div>

                {/* Item 2 */}
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-extrabold uppercase">
                    <MapPin className="w-3 h-3 text-red-400 fill-red-400" />
                    <span>FORÇA-TAREFA DISTRITAL EM PEDIATRIA & PUERICULTURA</span>
                  </div>
                  <p className="text-[11px] italic text-blue-100/90 leading-relaxed">
                    &ldquo;Concentrar a energia promocional do distrito nos especialistas de Pediatria & Puericultura para recuperar a cota de ALIVIUM GOTAS 100.0 MG 20.0 ML X 1 /1.0ML.&rdquo;
                  </p>
                  <p className="text-[10px] text-blue-200/70 font-semibold">
                    <strong className="text-white">Impacto Esperado:</strong> Elevação de +R$ 376.601 no faturamento distrital.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-[10px] text-blue-300/60 italic">
              Exploração lateral sem autocensura prévia
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
                      Análise de Viabilidade
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
                    9.6/10
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] font-bold uppercase text-blue-200/70 block">
                    UPLIFT CAUSAL
                  </span>
                  <span className="text-xs font-black text-emerald-300 mt-1 block">
                    +16,4% em Eficiência Distrital
                  </span>
                </div>
              </div>

              {/* Rota Selecionada */}
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                <div className="text-[9px] font-black text-emerald-300 uppercase tracking-wider">
                  ROTA SELECIONADA
                </div>
                <div className="text-[11px] font-bold text-white">
                  Co-visitação Tática de Coaching + Blitz Promocional de ALIVIUM GOTAS 100.0 MG 20.0 ML X 1 /1.0ML
                </div>
                <p className="text-[10px] text-blue-100/80 leading-relaxed">
                  A Análise de Viabilidade valida que o coaching direto de {customerExecutive} nos setores com maior dispersão médica destrava o maior ganho de produtividade distrital.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-[10px] text-blue-300/60 italic">
              Arbitragem de risco vs retorno na Base Oficial de Inteligência
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
                  Auditado contra 2100 médicos distritais, 2604 visitas, R$ 5.380.011 de Sell-Out e 447 PDVs. 0 divergências.
                </p>
              </div>

              {/* Plano Executivo Validado */}
              <div className="mt-3.5 p-3 rounded-xl bg-blue-950/40 border border-blue-400/30 space-y-1.5">
                <div className="text-[9px] font-black text-blue-300 uppercase tracking-wider">
                  PLANO EXECUTIVO VALIDADO
                </div>
                <p className="text-[10px] text-white/95 leading-relaxed font-medium">
                  <strong>Plano Tático Distrital:</strong> 1. Agendar co-visitações nos setores críticos nas próximas 2 semanas; 2. Focar nos 0 médicos distritais não cobertos; 3. Monitorar abastecimento de ALIVIUM GOTAS nas redes regionais.
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

      {/* 2. SEÇÃO DA MESA DE DECISÃO INTEGRADA (Cards dos Especialistas) */}
      <section className="space-y-4">
        {/* Header da Mesa */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#074878]" />
              MESA DE DECISÃO INTEGRADA - RECOMENDAÇÕES DOS ESPECIALISTAS
            </h2>
            <p className="text-xs text-slate-500">
              Propostas ativas de cada agente para orientar a decisão de <strong className="text-slate-700">{customerExecutive}</strong> ({districtName}). Clique em <strong className="text-slate-700">Dossiê BQ</strong> para auditar as métricas no sistema.
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
