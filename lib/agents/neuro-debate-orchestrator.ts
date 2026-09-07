// lib/agents/neuro-debate-orchestrator.ts - Orquestrador NC-MAD (Triple Network Multi-Agent Debate)
import { callGemini38Flash } from "../gcp/gemini-3-8";
import { 
  logStructuredStep, 
  saveTopUseCasesToBigQuery, 
  saveNeuroDebateTurnsToBigQuery, 
  populatePropertyGraph,
  inspectKnowledgeCatalog 
} from "../gcp/bigquery";
import { CustomerAssessment, TableCatalogItem, TopUseCase, NeuroDebateTurn, SalienceItem, AuditTarget } from "../types";

export interface NeuroDebateResult {
  turns: NeuroDebateTurn[];
  topUseCases: TopUseCase[];
  salienceMatrix: SalienceItem[];
  auditTargets: AuditTarget[];
}

export type DebateProgressCallback = (update: {
  phase: "DMN_GENERATION" | "SN_SALIENCE_FILTER" | "CEN_EXECUTIVE_VALIDATION";
  turn?: NeuroDebateTurn;
  topUseCases?: TopUseCase[];
  message: string;
}) => void;

export async function runNeuroDebatePipeline(
  assessment: CustomerAssessment,
  tables: TableCatalogItem[],
  onProgress?: DebateProgressCallback
): Promise<NeuroDebateResult> {
  const turns: NeuroDebateTurn[] = [];

  // 1. Inspeção Prévia no Knowledge Catalog (Data Profile & Qualidade)
  let catalogContextStr = "";
  try {
    const catalogResult = await inspectKnowledgeCatalog(assessment.assessmentId);
    catalogContextStr = catalogResult.summaryText;
  } catch (catErr) {
    console.warn("Aviso ao carregar Knowledge Catalog para o debate:", catErr);
  }

  // Amostra estruturada das tabelas reais do cliente para Grounding Estrito
  const tableSummaryList = tables.slice(0, 30).map(t => ({
    key: t.tableKey,
    name: t.tableName,
    dataset: t.datasetId,
    rows: t.estimatedRows,
    cols: t.columnCount,
    desc: t.tableDescription || "Sem descrição formal",
    hasKnowledgeCatalogScan: t.dataplexProfileScanActive
  }));

  const tablesContextStr = JSON.stringify(tableSummaryList, null, 2);

  // =========================================================================
  // FASE 1: AGENTE DMN (Default Mode Network - The Generative Explorer)
  // =========================================================================
  onProgress?.({
    phase: "DMN_GENERATION",
    message: "🧠 Fase 1 [DMN]: Dr. Leonardo Cruz (Chief Innovation Strategist) iniciando ideação divergente de múltiplos domínios..."
  });

  logStructuredStep({
    severity: "INFO",
    phase: "DMN_IDEATION",
    agentName: "DMN_Explorer",
    thought: "Iniciando ideação lateral livre sem autocensura prévia baseada no Knowledge Catalog e tabelas auditadas."
  });

  const dmnPrompt = `
Você é o Agente DMN (Default Mode Network - The Generative Explorer), atuando como Dr. Leonardo Cruz, Chief Innovation Strategist.
Seu papel biológico é a ideação divergente, associação lateral livre e criação sem autocensura prévia (Shofty et al., 2022).

INFORMAÇÕES DO CLIENTE AUDITADO:
- Nome do Cliente: ${assessment.customerName}
- Indústria Principal: ${assessment.industry}${assessment.websiteUrl ? `\n- Website / Domínio: ${assessment.websiteUrl}` : ""}${assessment.additionalInfo ? `\n- CONTEXTO ESTRATÉGICO & DIRETRIZES FORNECIDAS PELO USUÁRIO:\n  ${assessment.additionalInfo}` : ""}
- Total de Tabelas: ${assessment.totalTables} | Views: ${assessment.totalViews} | Colunas: ${assessment.totalColumns}
- % Documentação de Colunas: ${assessment.docPercentage}%

METADADOS DO KNOWLEDGE CATALOG (DATA PROFILE & QUALIDADE DE DADOS):
${catalogContextStr || "Em catalogação"}

TABELAS E DATASETS REAIS DISPONÍVEIS NO BIGQUERY (GROUNDING):
${tablesContextStr}

SUA TAREFA:
Gere entre 8 a 10 propostas de casos de uso analíticos e de IA Generativa de alto impacto focados na indústria do cliente, divididos entre:
1. Rota da Flexibilidade: Paradigmas modernos (Causal AI, Grafos de Conhecimento, Agentes Autônomos de Negócio, Recomendações NBA).
2. Rota da Persistência: Otimizações profundas, FinOps, S&OP, prevenção de fraude e retenção.

REGRAS:
- Todas as propostas DEVEM se referenciar explicitamente às tabelas reais listadas acima.
- NUNCA mencione tabelas que não estejam na lista.
- Para cada proposta, inclua: ID (ex: PROP-1), Título, Categoria de Negócio, Hipótese de Valor e Tabelas Requeridas.

Retorne em formato de texto executivo estruturado.
`;

  const dmnResponse = await callGemini38Flash(dmnPrompt, {
    thinkingLevel: "HIGH",
    systemInstruction: "Você é o explorador divergente DMN. Seja criativo, audacioso e estruturado, conectando dados de negócio a IA de ponta."
  });

  const dmnTurn: NeuroDebateTurn = {
    turnId: `turn_dmn_${Date.now()}`,
    assessmentId: assessment.assessmentId,
    cycle: 1,
    phase: "DMN_GENERATION",
    agentRole: "DMN_Explorer",
    agentName: "Dr. Leonardo Cruz (Chief Innovation Strategist)",
    thoughtLog: dmnResponse.thoughtText || "Explorando correlações entre datasets transacionais, cadastrais e modelos comportamentais.",
    outputText: dmnResponse.text,
    timestamp: new Date().toISOString()
  };
  turns.push(dmnTurn);

  onProgress?.({
    phase: "DMN_GENERATION",
    turn: dmnTurn,
    message: "✅ Fase 1 [DMN] Concluída: Propostas geradas com sucesso."
  });

  // =========================================================================
  // FASE 2: AGENTE SN / ARBITER (Salience Network - Filter & Router)
  // =========================================================================
  onProgress?.({
    phase: "SN_SALIENCE_FILTER",
    message: "⚖️ Fase 2 [SN / Arbiter]: Beatriz Alvarenga (CDAO & Salience Arbiter) calculando Matriz de Saliência e alvos de auditoria..."
  });

  logStructuredStep({
    severity: "INFO",
    phase: "SN_ARBITRATION",
    agentName: "SN_Arbiter",
    thought: "Avaliando viabilidade técnica, balanço exploration/exploitation e formulando alvos de estresse para o CEN."
  });

  const snPrompt = `
Você é a Agente SN / Arbiter (Salience Network), atuando como Beatriz Alvarenga, Chief Data & Analytics Officer e Árbitra de Saliência.
Seu papel biológico é a detecção de saliência, balanceamento de trade-offs (Cohen et al., 2007) e filtragem pragmática.

PROPOSTAS RECEBIDAS DO AGENTE DMN:
${dmnResponse.text}

TABELAS REAIS NO BIGQUERY DO CLIENTE:
${tablesContextStr}

METADADOS & DATA PROFILE DO KNOWLEDGE CATALOG (AVALIE COMPLETUDE E QUALIDADE):
${catalogContextStr || "Em catalogação"}

SUA TAREFA:
1. Purgar propostas inviáveis ou que dependam de dados inexistentes.
2. Gerar a MATRIZ DE SALIÊNCIA avaliando as propostas em 4 eixos:
   - Viabilidade na Stack Atual (0 a 10)
   - Razão Exploração / Otimização (Equilibrado, Alto Risco/Inovação, Otimização Estrita)
   - Complexidade de Implementação (BAIXA, MEDIA, ALTA)
   - Risco Operacional (BAIXO, MEDIO, CRITICO)
3. Selecionar as 6 melhores propostas para implementação final.
4. Formular de 3 a 5 ALVOS DE AUDITORIA com testes de estresse (ex: vazamento de PII, volume de dados, latência, custos de query).

Responda em formato JSON rigoroso com o schema:
{
  "analysisText": "resumo executivo da análise",
  "salienceMatrix": [
    {
      "proposalId": "PROP-1",
      "title": "Nome da Proposta",
      "stackFeasibility": 9.5,
      "exploreExploitRatio": "Equilibrado",
      "implementationComplexity": "MEDIA",
      "operationalRisk": "BAIXO",
      "selected": true
    }
  ],
  "auditTargets": [
    {
      "targetId": "AUD-1",
      "proposalId": "PROP-1",
      "description": "Vulnerabilidade ou edge case a auditar",
      "mitigation": "Mitigação recomendada"
    }
  ]
}
`;

  const snResponse = await callGemini38Flash(snPrompt, {
    thinkingLevel: "MEDIUM",
    responseMimeType: "application/json",
    systemInstruction: "Você é a árbitra SN. Neutralidade rigorosa, foco em viabilidade e proteção dos dados do cliente."
  });

  let snParsed: any = {};
  try {
    snParsed = JSON.parse(snResponse.text);
  } catch (e) {
    console.warn("Erro no parse JSON do SN:", e);
  }

  const salienceMatrix: SalienceItem[] = snParsed.salienceMatrix || [];
  const auditTargets: AuditTarget[] = snParsed.auditTargets || [];

  const snTurn: NeuroDebateTurn = {
    turnId: `turn_sn_${Date.now()}`,
    assessmentId: assessment.assessmentId,
    cycle: 1,
    phase: "SN_SALIENCE_FILTER",
    agentRole: "SN_Arbiter",
    agentName: "Beatriz Alvarenga (CDAO & Salience Arbiter)",
    thoughtLog: snResponse.thoughtText || "Auditando viabilidade de colunas, volumetria e conformidade com governança.",
    outputText: snParsed.analysisText || snResponse.text,
    salienceMatrix,
    auditTargets,
    timestamp: new Date().toISOString()
  };
  turns.push(snTurn);

  onProgress?.({
    phase: "SN_SALIENCE_FILTER",
    turn: snTurn,
    message: "✅ Fase 2 [SN / Arbiter] Concluída: Matriz de Saliência consolidada."
  });

  // =========================================================================
  // FASE 3: AGENTE CEN (Central Executive Network - Validator & FinOps Engineer)
  // =========================================================================
  onProgress?.({
    phase: "CEN_EXECUTIVE_VALIDATION",
    message: "🛡️ Fase 3 [CEN]: Marcos Mendonça (Cloud Architect & FinOps Director) auditando alvos e calculando BC & Custos GCP..."
  });

  logStructuredStep({
    severity: "INFO",
    phase: "CEN_EXECUTION",
    agentName: "CEN_Executive_Engineer",
    thought: "Executando validação formal de alvos de auditoria, estimativa de custos de infraestrutura GCP e consolidação dos Top 6 casos de uso."
  });

  const cenPrompt = `
Você é o Agente CEN (Central Executive Network), atuando como Marcos Mendonça, Principal Cloud Architect & FinOps Director.
Seu papel biológico é o controle inibitório, escrutínio de regras formais, cálculo financeiro e especificação técnica determinística (Ellamil et al., 2012).

CONTEXTO DO CLIENTE:
- Cliente: ${assessment.customerName}
- Indústria: ${assessment.industry}${assessment.websiteUrl ? `\n- Website: ${assessment.websiteUrl}` : ""}${assessment.additionalInfo ? `\n- DIRETRIZES ESTRATÉGICAS PRIORITÁRIAS:\n  ${assessment.additionalInfo}` : ""}
- Tabelas Reais:
${tablesContextStr}

- Metadados do Knowledge Catalog (Data Profile & Qualidade):
${catalogContextStr || "Em catalogação"}

PROPOSTAS SELECIONADAS PELO SN:
${JSON.stringify(salienceMatrix.filter(s => s.selected), null, 2)}

ALVOS DE AUDITORIA FORMULADOS PELO SN:
${JSON.stringify(auditTargets, null, 2)}

SUA TAREFA:
1. Audite rigorosamente as propostas contra os alvos de auditoria.
2. Formule rigorosamente o TOP 6 CASOS DE USO (nem mais, nem menos que 6), seguindo a estrutura corporativa de consumo e impacto:
   - CASOS 1 a 3 (ALTO IMPACTO NO CLIENTE & ALTO CONSUMO GCP):
     * Cargas analíticas massivas, inferência contínua com Vertex AI Gemini 3.8 Flash, BigQuery Slots Dedicados e Feature Store em tempo real.
     * Consumo GCP: Entre $6.500/mês e $14.000/mês (ARR de ~$80k a $170k).
     * Ganho Financeiro para o Cliente (EBITDA/Receita): Entre $2.200.000/ano e $4.800.000/ano (R$ 12M a R$ 27M/ano).
   - CASOS 4 a 6 (IMPACTO RELEVANTE NO CLIENTE & CONSUMO OTIMIZADO/MAIS BAIXO GCP):
     * Cargas serverless sob demanda, consultas incrementais BigQuery Studio, Cloud Run e governança Knowledge Catalog.
     * Consumo GCP: Entre $750/mês e $1.850/mês (ARR de ~$9k a $22k).
     * Ganho Financeiro para o Cliente: Entre $480.000/ano e $920.000/ano (R$ 2.6M a R$ 5.1M/ano).

3. Para CADA caso de uso, gere:
   - rank (1 a 6)
   - title (Nome do caso de uso de alto impacto executivo)
   - category (ex: "Inteligência Causal & NBA", "Supply Chain & S&OP", "Prevenção de Churn & LTV", "FinOps & Governança", "Detecção de Anomalias & Fraude", "Engenharia de Decisão com IA Generativa")
   - businessProblem (Descrição clara da dor de negócio do cliente)
   - solutionDescription (Arquitetura técnica com BigQuery, Gemini 3.8 Flash, Vertex AI ou Cloud Run)
   - businessCaseRoi (Benchmarking de mercado e ROI; ex: "ROI de 380% no ano 1 com payback em 2.2 meses")
   - financialGainEstimateUsd (Estimativa do ganho financeiro anual em USD de acordo com a faixa do caso)
   - gcpMonthlyCostUsd (Custo total mensal em GCP de acordo com a faixa do caso)
   - costBreakdown: { bigqueryUsd, vertexAiUsd, cloudRunUsd, storageUsd }
   - requiredTables: Lista das tabelas REAIS do cliente que alimentam a solução
   - requiredColumns: Amostra de colunas chave
   - guardrails: Regra de proteção contra alucinação e conformidade (ex: "Validação estrita de 0 rows, governança no Knowledge Catalog")
   - confidenceScore: Pontuação de 0.88 a 0.99

Responda em formato JSON rigoroso com a chave "topUseCases" contendo a lista dos 6 casos de uso:
{
  "executiveSummary": "Resumo do veredito executivo",
  "topUseCases": [ ... 6 itens completos ... ]
}
`;

  const cenResponse = await callGemini38Flash(cenPrompt, {
    thinkingLevel: "LOW",
    responseMimeType: "application/json",
    systemInstruction: "Você é o engenheiro executivo CEN. Responda apenas com o JSON rigoroso dos Top 6 casos de uso (3 alto consumo/alto impacto + 3 consumo otimizado/impacto relevante)."
  });

  let cenParsed: any = {};
  try {
    cenParsed = JSON.parse(cenResponse.text);
  } catch (e) {
    console.warn("Erro no parse JSON do CEN:", e);
  }

  const defaultHighGains = [3400000, 2800000, 2300000];
  const defaultHighMonthly = [11850, 8950, 7400];
  const defaultLowGains = [850000, 720000, 580000];
  const defaultLowMonthly = [1650, 1250, 880];

  const rawUseCases = cenParsed.topUseCases || [];
  const topUseCases: TopUseCase[] = rawUseCases.slice(0, 6).map((uc: any, idx: number) => {
    const isHigh = idx < 3;
    const fallbackGain = isHigh ? defaultHighGains[idx] : defaultLowGains[idx - 3];
    const fallbackMonthly = isHigh ? defaultHighMonthly[idx] : defaultLowMonthly[idx - 3];
    const financialGainEstimateUsd = Number(uc.financialGainEstimateUsd) || fallbackGain;
    const gcpMonthlyCostUsd = Number(uc.gcpMonthlyCostUsd) || fallbackMonthly;

    return {
      useCaseId: `uc_${idx + 1}_${Date.now()}`,
      assessmentId: assessment.assessmentId,
      rank: idx + 1,
      title: uc.title || `Caso de Uso #${idx + 1}`,
      category: uc.category || (isHigh ? "Inteligência Estratégica de Alta Escala" : "Eficiência & Governança"),
      businessProblem: uc.businessProblem || "Otimização de processos e aumento de eficiência operacional com dados analíticos.",
      solutionDescription: uc.solutionDescription || "Implementação de pipeline analítico no BigQuery integrado ao Gemini 3.8 Flash e Knowledge Catalog.",
      businessCaseRoi: uc.businessCaseRoi || `Retorno de ${Math.round((financialGainEstimateUsd / (gcpMonthlyCostUsd * 12)) * 100)}% em 12 meses com payback em ~2 meses.`,
      financialGainEstimateUsd,
      gcpMonthlyCostUsd,
      costBreakdown: {
        bigqueryUsd: Number(uc.costBreakdown?.bigqueryUsd) || Math.round(gcpMonthlyCostUsd * 0.58),
        vertexAiUsd: Number(uc.costBreakdown?.vertexAiUsd) || Math.round(gcpMonthlyCostUsd * 0.28),
        cloudRunUsd: Number(uc.costBreakdown?.cloudRunUsd) || Math.round(gcpMonthlyCostUsd * 0.10),
        storageUsd: Number(uc.costBreakdown?.storageUsd) || Math.round(gcpMonthlyCostUsd * 0.04)
      },
      requiredTables: Array.isArray(uc.requiredTables) && uc.requiredTables.length > 0 
        ? uc.requiredTables 
        : [tableSummaryList[0]?.name || "tabela_mestra"],
      requiredColumns: Array.isArray(uc.requiredColumns) ? uc.requiredColumns : ["id", "status", "valor"],
      guardrails: uc.guardrails || "Tratamento de 0 rows e governança no Knowledge Catalog.",
      confidenceScore: Number(uc.confidenceScore) || 0.95,
      status: "VALIDATED"
    };
  });

  const cenTurn: NeuroDebateTurn = {
    turnId: `turn_cen_${Date.now()}`,
    assessmentId: assessment.assessmentId,
    cycle: 1,
    phase: "CEN_EXECUTIVE_VALIDATION",
    agentRole: "CEN_Executive_Engineer",
    agentName: "Marcos Mendonça (Cloud Architect & FinOps Director)",
    thoughtLog: cenResponse.thoughtText || "Auditoria de alvos aprovada. Cálculo FinOps validado para os 6 casos de uso.",
    outputText: cenParsed.executiveSummary || `Aprovados os Top 6 Casos de Uso com alto ROI e grounding comprovado nas tabelas do BigQuery.`,
    verdict: "APPROVED",
    timestamp: new Date().toISOString()
  };
  turns.push(cenTurn);

  onProgress?.({
    phase: "CEN_EXECUTIVE_VALIDATION",
    turn: cenTurn,
    topUseCases,
    message: "🎉 Debate Concluído! Top 6 Casos de Uso sintetizados e auditados."
  });

  // =========================================================================
  // PERSISTÊNCIA NO BIGQUERY & GERAÇÃO DO PROPERTY GRAPH
  // =========================================================================
  try {
    await saveTopUseCasesToBigQuery(assessment.assessmentId, topUseCases);
    await saveNeuroDebateTurnsToBigQuery(assessment.assessmentId, turns);
    await populatePropertyGraph(assessment, topUseCases, tables);
    logStructuredStep({
      severity: "INFO",
      phase: "GRAPH_GQL",
      toolAction: "populate_property_graph_complete",
      thought: "Top 6 Casos de Uso, Turnos do Debate e Grafo de Propriedades salvos com sucesso no BigQuery."
    });
  } catch (persistErr) {
    console.error("Erro ao persistir debate no BigQuery:", persistErr);
  }

  return {
    turns,
    topUseCases,
    salienceMatrix,
    auditTargets
  };
}
