// lib/gcp/gemini-3-8.ts - Integração com Gemini 3.8 Flash via Vertex AI Publisher Model
import { getGcpAccessToken, PROJECT_ID } from "./auth";
import { logStructuredStep } from "./bigquery";

export interface Gemini38Options {
  thinkingLevel?: "LOW" | "MEDIUM" | "HIGH";
  responseMimeType?: string;
  responseSchema?: Record<string, any>;
  systemInstruction?: string;
}

export async function callGemini38Flash(
  prompt: string,
  options: Gemini38Options = {}
): Promise<{ text: string; thoughtText?: string; raw: any }> {
  const token = await getGcpAccessToken();
  const url = `https://aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/global/publishers/google/models/gemini-3.8-flash:generateContent`;

  const thinkingLevel = options.thinkingLevel || "MEDIUM";

  const systemPrompt = [
    options.systemInstruction || "",
    "--- GUARDRAILS OBRIGATÓRIOS DO GOOGLE CLOUD ASSISTANT ---",
    "1. NUNCA invente ou alucine tabelas, colunas, métricas ou tendências inexistentes.",
    "2. Se uma consulta analítica ou metadado retornar vazio (0 rows), você DEVE afirmar categoricamente que não há dados disponíveis para o critério, sem extrapolar estimativas de conhecimento prévio.",
    "3. Fundamente qualquer caso de uso estritamente nos ativos de dados comprovadamente existentes no catálogo do BigQuery do cliente.",
    "4. Ao gerar código ou consultas SQL, siga as regras de otimização de custo e performance de BigQuery e Graph Analytics (GQL).",
    "5. Mantenha tom executivo C-Level, claro, conciso, de alto impacto e minimalista."
  ].filter(Boolean).join("\n\n");

  const requestBody: any = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
      ...(options.responseSchema ? { responseSchema: options.responseSchema } : {})
    }
  };

  if (systemPrompt) {
    requestBody.systemInstruction = {
      role: "system",
      parts: [{ text: systemPrompt }]
    };
  }

  logStructuredStep({
    severity: "INFO",
    phase: "CEN_EXECUTION",
    toolAction: "call_gemini_38_flash",
    thought: `Chamando Gemini 3.8 Flash com thinkingLevel=${thinkingLevel} e mimeType=${options.responseMimeType || "text/plain"}.`
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errText = await res.text();
    logStructuredStep({
      severity: "ERROR",
      phase: "CEN_EXECUTION",
      toolAction: "gemini_38_flash_error",
      outputSummary: errText
    });
    throw new Error(`Erro na API do Gemini 3.8 Flash (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const parts = candidate?.content?.parts || [];

  let text = "";
  let thoughtText = "";

  for (const part of parts) {
    if (part.thought) {
      thoughtText += part.text;
    } else if (part.text) {
      text += part.text;
    }
  }

  return { text, thoughtText, raw: data };
}
