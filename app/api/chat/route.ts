// app/api/chat/route.ts - BigQuery Data Agent (Conversational Analytics API) + Fallback Grounded
import { NextRequest, NextResponse } from "next/server";
import { askBigQueryDataAgent, DATA_AGENT_ID } from "@/lib/gcp/conversational-analytics";
import { callGemini38Flash } from "@/lib/gcp/gemini-3-8";
import { logStructuredStep, runOptimizedBigQueryQuery } from "@/lib/gcp/bigquery";
import { PROJECT_ID, DATASET_ID } from "@/lib/gcp/auth";

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

    // 1. Tenta acionar prioritariamente o BigQuery Data Agent oficial (Conversational Analytics API)
    try {
      const dataAgentRes = await askBigQueryDataAgent(message, customerName);
      if (dataAgentRes && dataAgentRes.reply) {
        return NextResponse.json({
          success: true,
          reply: dataAgentRes.reply,
          thoughts: dataAgentRes.thoughts,
          generatedSql: dataAgentRes.generatedSql,
          queryResults: dataAgentRes.queryResults,
          querySchema: dataAgentRes.querySchema,
          followupQuestions: dataAgentRes.followupQuestions,
          jobId: dataAgentRes.jobId,
          source: "bigquery_data_agent",
          agentId: DATA_AGENT_ID
        });
      }
    } catch (agentErr: any) {
      console.warn("[Chat API] BigQuery Data Agent indisponível ou timeout, acionando fallback local com Gemini 3.8 Flash:", agentErr.message);
    }

    // 2. Fallback de Alta Resiliência: Gemini 3.8 Flash com Grounding Estrito no BigQuery
    let useCasesSummary = "";
    let tablesSummary = "";

    try {
      const ucRows = await runOptimizedBigQueryQuery(`
        SELECT rank, title, category, business_problem, solution_description, business_case_roi, gcp_monthly_cost_usd, payback_months, financial_gain_estimate_usd
        FROM \`${PROJECT_ID}.${DATASET_ID}.top_use_cases\`
        ORDER BY rank ASC
        LIMIT 6;
      `, "Fetch Top Use Cases for Chat Fallback");

      if (ucRows.length > 0) {
        useCasesSummary = ucRows.map((r: any) => 
          `#${r.rank} [${r.category}] ${r.title} | ROI: ${r.business_case_roi}x | Payback: ${r.payback_months}m | Custo GCP: $${r.gcp_monthly_cost_usd}/mês | Ganho: $${r.financial_gain_estimate_usd}/ano`
        ).join("\n");
      }
    } catch (e) {}

    try {
      const gcpRows = await runOptimizedBigQueryQuery(`
        SELECT service_name, category, tier, description
        FROM \`${PROJECT_ID}.${DATASET_ID}.n_gcp_service\`
        LIMIT 10;
      `, "Fetch GCP Services for Chat Fallback");

      if (gcpRows.length > 0) {
        tablesSummary = gcpRows.map((r: any) => 
          `- ${r.service_name} (${r.category}): ${r.description || ""}`
        ).join("\n");
      }
    } catch (e) {}

    const prompt = `
Você é o BigQuery Data Agent Executivo de Inteligência Analítica e IA da Google Cloud para o cliente ${customerName || "Corporativo"}.
Você está operando diretamente sobre os metadados e casos de uso auditados no BigQuery.

SERVIÇOS GOOGLE CLOUD NO GRAFO:
${tablesSummary || "BigQuery, Vertex AI, Dataplex, Cloud Run, Cloud Logging"}

TOP 6 CASOS DE USO PRIORIZADOS NO BIGQUERY:
${useCasesSummary || "Nenhum caso de uso priorizado registrado."}

HISTÓRICO RECENTE:
${JSON.stringify((history || []).slice(-4))}

PERGUNTA DO EXECUTIVO / VENDEDOR GOOGLE CLOUD:
${message}

DIRETRIZES MANDATÓRIAS DE RESPOSTA (ZERO-HALLUCINATION):
1. Responda em Português do Brasil com postura executiva, clara, elegante e objetiva.
2. Fundamente suas respostas nos 6 casos de uso e serviços listados acima.
3. Se a informação solicitada não existir no BigQuery do cliente, declare explicitamente: "Com base nos metadados auditados no BigQuery, não há dados ou tabelas registradas para esse critério." NUNCA invente tendências ou métricas que não constem nos dados reais.
4. Ao citar custos e ROI, utilize com precisão os valores numéricos fornecidos acima.
5. Se for perguntado sobre custos em GCP, detalhe os componentes (BigQuery, Vertex AI, Cloud Run, Dataplex).
`;

    const geminiRes = await callGemini38Flash(prompt, {
      thinkingLevel: "MEDIUM",
      systemInstruction: "Você é o BigQuery Data Agent da Google Cloud. Respostas embasadas, inteligentes e com rigor analítico."
    });

    logStructuredStep({
      severity: "INFO",
      phase: "CHAT",
      toolAction: "gemini_chat_fallback_response",
      thought: "Resposta executiva gerada com grounding estrito nos dados do BigQuery via Gemini 3.8 Flash.",
      outputSummary: geminiRes.text.slice(0, 150)
    });

    return NextResponse.json({
      success: true,
      reply: geminiRes.text,
      thoughts: geminiRes.thoughtText ? [geminiRes.thoughtText] : ["Consulta fundamentada nos dados do BigQuery."],
      source: "gemini_3_8_fallback",
      followupQuestions: [
        "Qual o caso de uso com maior ROI estimado?",
        "Qual a estimativa de consumo mensal em serviços GCP?",
        "Quais serviços GCP são ativados para cada caso de negócio?"
      ]
    });
  } catch (error: any) {
    console.error("Erro no chat conversacional:", error);
    return NextResponse.json({ error: error.message || "Erro no processamento da mensagem" }, { status: 500 });
  }
}
