// app/api/chat/route.ts - BigQuery Data Agent (Conversational Analytics API) + Property Graph GQL Grounding
import { NextRequest, NextResponse } from "next/server";
import { callGemini38Flash } from "@/lib/gcp/gemini-3-8";
import { 
  logStructuredStep, 
  inspectKnowledgeCatalog, 
  queryUseCaseImpactGraphGQL, 
  queryGovernanceLineageGQL 
} from "@/lib/gcp/bigquery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, customerName, assessmentId, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Mensagem não informada." }, { status: 400 });
    }

    logStructuredStep({
      severity: "INFO",
      phase: "CHAT",
      toolAction: "user_chat_message",
      thought: `Pergunta do usuário para ${customerName || "Cliente"}: "${message.slice(0, 100)}..."`
    });

    // =========================================================================
    // FASE 1: Inspeção do Knowledge Catalog (Semântica & Data Profiles)
    // =========================================================================
    let catalogSummary = "";
    let catalogItems: any[] = [];
    try {
      const catalogResult = await inspectKnowledgeCatalog(assessmentId);
      catalogSummary = catalogResult.summaryText;
      catalogItems = catalogResult.catalogItems;
    } catch (catErr) {
      console.warn("[Chat ADK] Falha ao inspecionar Knowledge Catalog:", catErr);
      catalogSummary = "Metadados do Knowledge Catalog em sincronização.";
    }

    // =========================================================================
    // FASE 2: Travessia no Property Graph via ISO GQL (GRAPH_TABLE)
    // =========================================================================
    const isGovernanceQuestion = /lgpd|bacen|governança|governance|segurança|security|pii|mascaramento|ciso/i.test(message);
    
    let graphResult;
    if (isGovernanceQuestion) {
      graphResult = await queryGovernanceLineageGQL(assessmentId);
    } else {
      graphResult = await queryUseCaseImpactGraphGQL(assessmentId);
    }

    const graphRows = graphResult.rows || [];
    const generatedGql = graphResult.gqlQuery;

    let graphSummary = "";
    if (graphRows.length > 0) {
      if (isGovernanceQuestion) {
        graphSummary = graphRows.map((r: any) => 
          `- Tabela \`${r.table_name}\` -> Caso: "${r.use_case_title}" | Mecanismo: ${r.governance_mechanism} | Nível: ${r.policy_tag_level}`
        ).join("\n");
      } else {
        graphSummary = graphRows.map((r: any) => 
          `#${r.use_case_rank || "-"} [${r.use_case_title}] -> Meta Estratégica: "${r.strategic_goal_name}" (Ganho: $${r.annual_gain_usd || 0}/ano) | Serviço GCP: ${r.gcp_service_name} (Custo: $${r.monthly_cost_usd || 0}/mês) | ROI: ${r.use_case_roi || "N/A"}`
        ).join("\n");
      }
    } else {
      graphSummary = "Nenhum relacionamento encontrado no BigQuery Property Graph para este critério de filtro.";
    }

    // =========================================================================
    // FASE 3: Síntese Grounded com Gemini 3.8 Flash (Zero-Hallucination)
    // =========================================================================
    const prompt = `
Você é o BigQuery Data Agent Executivo de Inteligência Analítica e IA da Google Cloud para o cliente ${customerName || "Corporativo"}.
Você está operando diretamente sobre o BigQuery Property Graph (GQL) e o Knowledge Catalog.

METADADOS DO KNOWLEDGE CATALOG (DATA PROFILE & QUALIDADE DE DADOS):
${catalogSummary}

EVIDÊNCIAS DE TRAVESSIA NO BIGQUERY PROPERTY GRAPH (ISO GQL GRAPH_TABLE):
${graphSummary}

CONSULTA GQL EXECUTADA NO PROPERTY GRAPH:
\`\`\`sql
${generatedGql}
\`\`\`

HISTÓRICO RECENTE:
${JSON.stringify((history || []).slice(-4))}

PERGUNTA DO EXECUTIVO / VENDEDOR GOOGLE CLOUD:
${message}

DIRETRIZES MANDATÓRIAS DE RESPOSTA (ZERO-HALLUCINATION & POSTURA EXECUTIVA):
1. Responda em Português do Brasil com postura executiva de alto nível (C-Level), clara, elegante e orientada a valor de negócio.
2. Fundamente suas afirmações ESTRITAMENTE nos dados auditados do Knowledge Catalog e nas conexões do Property Graph listadas acima.
3. Se a consulta ao Property Graph ou ao Catálogo retornar vazia (0 rows) para o critério perguntado, declare explicitamente: "Com base nas consultas ao BigQuery Property Graph e ao Knowledge Catalog, não há dados ou relacionamentos mapeados para este critério específico." NUNCA invente tendências, números ou tabelas.
4. Quando citar tabelas, cite o nome exato e o status de profiling do Knowledge Catalog (ex: taxa de documentação, volumetria).
5. Quando citar casos de uso, cite o ROI, a meta estratégica atingida e o consumo mensal de serviços GCP auditados, evidenciando sempre que o valor do retorno financeiro para o cliente é SEMPRE MAIOR que o consumo GCP.
6. Apresente os dados com clareza (use bullet points executivos e destaques em negrito).
`;

    const geminiRes = await callGemini38Flash(prompt, {
      thinkingLevel: "MEDIUM",
      systemInstruction: "Você é o BigQuery Data Agent oficial da Google Cloud. Respostas fundamentadas estritamente no Property Graph (GQL) e no Knowledge Catalog, com rigor analítico e clareza executiva. Regra mandatória: o valor do retorno financeiro para o cliente deve sempre ser explicitado como superior ao consumo GCP."
    });

    logStructuredStep({
      severity: "INFO",
      phase: "CHAT",
      toolAction: "gemini_graph_grounded_response",
      thought: "Resposta executiva gerada com grounding duplo: Knowledge Catalog + BigQuery Property Graph GQL.",
      sqlQuery: generatedGql,
      bqResultRows: graphRows.length,
      outputSummary: geminiRes.text.slice(0, 150)
    });

    return NextResponse.json({
      success: true,
      reply: geminiRes.text,
      thoughts: geminiRes.thoughtText ? [geminiRes.thoughtText] : ["Consulta fundamentada no BigQuery Property Graph (ISO GQL) e Knowledge Catalog."],
      generatedSql: generatedGql,
      queryResults: graphRows,
      catalogMetadata: catalogItems,
      source: "bigquery_data_agent",
      followupQuestions: isGovernanceQuestion ? [
        "Como as Policy Tags do Knowledge Catalog garantem conformidade com a LGPD?",
        "Quais tabelas que alimentam os casos de uso possuem dados sensíveis mascarados?",
        "Qual o impacto de governança na migração para o BigQuery?"
      ] : [
        "Quais casos de uso conectam diretamente à meta de maior retorno financeiro?",
        "Qual o consumo mensal total dos serviços GCP no Property Graph?",
        "Quais tabelas do Knowledge Catalog alimentam o Caso 1 prioritário?"
      ]
    });
  } catch (error: any) {
    console.error("Erro no chat conversacional com Property Graph:", error);
    return NextResponse.json({ error: error.message || "Erro no processamento da consulta analítica" }, { status: 500 });
  }
}

