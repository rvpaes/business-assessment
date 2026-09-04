// app/api/chat/route.ts - Assistente Conversacional Executivo Grounded com Gemini 3.8 Flash
import { NextRequest, NextResponse } from "next/server";
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

    // 1. Contexto dos Casos de Uso e Tabelas do Cliente gravadas no BQ
    let useCasesSummary = "";
    let tablesSummary = "";

    try {
      const ucRows = await runOptimizedBigQueryQuery(`
        SELECT rank, title, category, business_problem, solution_description, business_case_roi, gcp_monthly_cost_usd
        FROM \`${PROJECT_ID}.${DATASET_ID}.top_use_cases\`
        WHERE assessment_id = '${assessmentId || ""}'
        ORDER BY rank ASC
        LIMIT 6;
      `, "Fetch Top Use Cases for Chat");

      if (ucRows.length > 0) {
        useCasesSummary = ucRows.map((r: any) => 
          `#${r.rank} [${r.category}] ${r.title} | ROI: ${r.business_case_roi} | Custo GCP: $${r.gcp_monthly_cost_usd}/mês`
        ).join("\n");
      }
    } catch (e) {}

    try {
      const tRows = await runOptimizedBigQueryQuery(`
        SELECT table_name, table_type, estimated_rows, column_count, table_description
        FROM \`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\`
        WHERE assessment_id = '${assessmentId || ""}'
        ORDER BY estimated_rows DESC
        LIMIT 20;
      `, "Fetch Tables for Chat");

      if (tRows.length > 0) {
        tablesSummary = tRows.map((r: any) => 
          `- ${r.table_name} (${r.table_type}): ${r.estimated_rows} linhas, ${r.column_count} colunas. ${r.table_description || ""}`
        ).join("\n");
      }
    } catch (e) {}

    const prompt = `
Você é o Assistente Executivo de Inteligência Analítica e IA da Google Cloud para o cliente ${customerName || "Corporativo"}.
Você está operando diretamente sobre os metadados e casos de uso auditados no BigQuery.

METADADOS REAIS AUDITADOS NO BIGQUERY:
${tablesSummary || "Nenhuma tabela foi indexada ainda neste assessment."}

TOP CASOS DE USO PRIORIZADOS NO DEBATE:
${useCasesSummary || "Nenhum caso de uso priorizado gravado ainda."}

HISTÓRICO RECENTE:
${JSON.stringify((history || []).slice(-4))}

PERGUNTA DO EXECUTIVO:
${message}

DIRETRIZES MANDATÓRIAS DE RESPOSTA (ZERO-HALLUCINATION):
1. Responda em Português do Brasil com postura executiva, clara, elegante e objetiva.
2. Fundamente suas respostas APENAS nas tabelas e casos de uso listados acima.
3. Se a informação solicitada não existir no BigQuery do cliente, declare explicitamente: "Com base nos metadados auditados no BigQuery, não há dados ou tabelas registradas para esse critério." NUNCA invente tendências ou métricas que não constem nos dados reais.
4. Ao citar tabelas ou custos, seja preciso e use os números fornecidos acima.
5. Se for perguntado sobre custos em GCP, detalhe os componentes (BigQuery, Vertex AI, Cloud Run, Storage).
`;

    const geminiRes = await callGemini38Flash(prompt, {
      thinkingLevel: "MEDIUM",
      systemInstruction: "Você é o consultor executivo da Google Cloud. Respostas embasadas, inteligentes e com rigor analítico."
    });

    logStructuredStep({
      severity: "INFO",
      phase: "CHAT",
      toolAction: "gemini_chat_response",
      thought: "Resposta executiva gerada com grounding estrito nos dados do BigQuery.",
      outputSummary: geminiRes.text.slice(0, 150)
    });

    return NextResponse.json({
      success: true,
      reply: geminiRes.text,
      thought: geminiRes.thoughtText
    });
  } catch (error: any) {
    console.error("Erro no chat conversacional:", error);
    return NextResponse.json({ error: error.message || "Erro no processamento da mensagem" }, { status: 500 });
  }
}
