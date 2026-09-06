// lib/gcp/conversational-analytics.ts - Cliente Oficial BigQuery Data Agent (Conversational Analytics API)
import { getGcpAccessToken, PROJECT_ID } from "./auth";
import { logStructuredStep } from "./bigquery";

export interface DataAgentChatResult {
  reply: string;
  thoughts: string[];
  generatedSql?: string;
  queryResults?: any[];
  querySchema?: any[];
  followupQuestions: string[];
  jobId?: string;
  source: "bigquery_data_agent" | "gemini_3_8_fallback";
}

export const DATA_AGENT_ID = "gda-7ebe8c68-f7e1-45ce-8598-87af77ec0c69";
export const DATA_AGENT_RESOURCE = `projects/${PROJECT_ID}/locations/global/dataAgents/${DATA_AGENT_ID}`;

export async function askBigQueryDataAgent(
  prompt: string,
  customerName: string = "Corporativo"
): Promise<DataAgentChatResult> {
  const startTime = Date.now();
  
  logStructuredStep({
    severity: "INFO",
    phase: "CHAT",
    toolAction: "invoke_conversational_analytics_api",
    thought: `Invocando BigQuery Data Agent (${DATA_AGENT_ID}) para cliente ${customerName}: "${prompt.slice(0, 100)}..."`
  });

  try {
    const token = await getGcpAccessToken();
    const url = `https://geminidataanalytics.googleapis.com/v1alpha/projects/${PROJECT_ID}/locations/global:chat`;

    // Prefixa a menção ao cliente no prompt para garantir alinhamento semântico aos filtros
    const contextualPrompt = customerName && !prompt.toLowerCase().includes(customerName.toLowerCase())
      ? `Para o cliente ${customerName}: ${prompt}`
      : prompt;

    const payload = {
      parent: `projects/${PROJECT_ID}/locations/global`,
      messages: [
        {
          userMessage: {
            text: contextualPrompt
          }
        }
      ],
      data_agent_context: {
        data_agent: DATA_AGENT_RESOURCE
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Conversational Analytics API erro ${res.status}: ${errText}`);
    }

    const rawText = await res.text();
    let events: any[] = [];
    
    try {
      events = JSON.parse(rawText);
    } catch {
      // Se vier em formato NDJSON ou linhas
      const lines = rawText.split("\n").filter(l => l.trim().startsWith("{") && l.trim().endsWith("}"));
      events = lines.map(l => {
        try { return JSON.parse(l); } catch { return null; }
      }).filter(Boolean);
    }

    let reply = "";
    const thoughts: string[] = [];
    let generatedSql: string | undefined;
    let queryResults: any[] | undefined;
    let querySchema: any[] | undefined;
    const followupQuestions: string[] = [];
    let jobId: string | undefined;

    for (const evt of events) {
      const msg = evt?.systemMessage;
      if (!msg) continue;

      // 1. Textos e Pensamentos
      if (msg.text) {
        const textType = msg.text.textType;
        const parts = msg.text.parts || [];

        if (textType === "THOUGHT") {
          parts.forEach((p: string) => thoughts.push(p));
        } else if (textType === "FINAL_RESPONSE") {
          reply += parts.join("\n");
        } else if (textType === "FOLLOWUP_QUESTIONS") {
          parts.forEach((p: string) => followupQuestions.push(p));
        }
      }

      // 2. SQL Gerado pelo Agente
      if (msg.data?.generatedSql) {
        generatedSql = msg.data.generatedSql;
      }

      // 3. Resultado Tabular da Query
      if (msg.data?.result?.data) {
        queryResults = msg.data.result.data;
        querySchema = msg.data.result.schema?.fields || [];
      }

      // 4. Job do BigQuery
      if (msg.data?.bigQueryJob?.jobId) {
        jobId = msg.data.bigQueryJob.jobId;
      }
    }

    if (!reply && generatedSql && queryResults) {
      reply = `Executei a consulta no BigQuery e obtive ${queryResults.length} resultado(s) para sua análise.`;
    }

    logStructuredStep({
      severity: "INFO",
      phase: "CHAT",
      toolAction: "conversational_analytics_api_success",
      thought: `Data Agent respondeu em ${((Date.now() - startTime) / 1000).toFixed(2)}s. SQL gerado: ${generatedSql ? "SIM" : "NÃO"}.`,
      sqlQuery: generatedSql,
      bqResultRows: queryResults?.length,
      outputSummary: reply.slice(0, 200)
    });

    return {
      reply: reply.trim(),
      thoughts,
      generatedSql,
      queryResults,
      querySchema,
      followupQuestions,
      jobId,
      source: "bigquery_data_agent"
    };

  } catch (error: any) {
    console.warn("[Data Agent] Falha ao invocar Conversational Analytics API, acionando fallback:", error);
    throw error;
  }
}
