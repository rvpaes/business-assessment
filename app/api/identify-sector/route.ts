// app/api/identify-sector/route.ts - Identificação Automática de Setor via Gemini 3.8 Flash
import { NextRequest, NextResponse } from "next/server";
import { callGemini38Flash } from "@/lib/gcp/gemini-3-8";

const standardIndustries = [
  "Varejo & E-commerce",
  "Financeiro & Fintech",
  "Farmacêutica & Saúde",
  "Bens de Consumo & CPG",
  "Manufatura & Indústria",
  "Logística & Supply Chain",
  "Telecom & Mídia",
  "Tecnologia & SaaS",
  "Energia & Utilities",
  "Educação & Serviços",
  "iGaming & Apostas Regulamentadas",
  "Outro Segmento"
];

export async function POST(req: NextRequest) {
  try {
    const { companyName, websiteUrl, additionalInfo } = await req.json();

    if (!companyName && !websiteUrl) {
      return NextResponse.json({ error: "Informe o nome da empresa ou o site." }, { status: 400 });
    }

    const prompt = `
Identifique com precisão o setor/indústria da empresa abaixo e classifique-a obrigatoriamente em uma das seguintes categorias padrão:
Categorias permitidas:
${standardIndustries.map(i => `- "${i}"`).join("\n")}

DADOS DA EMPRESA:
- Nome da Empresa: ${companyName || "Não informado"}
- Website / URL: ${websiteUrl || "Não informado"}
- Informações adicionais fornecidas: ${additionalInfo || "Nenhuma"}

Responda em formato JSON estrito com o seguinte formato:
{
  "industry": "Nome exato de uma das categorias acima",
  "rationale": "Breve justificativa em 1 frase",
  "confidence": 0.95
}
`;

    const result = await callGemini38Flash(prompt, {
      responseMimeType: "application/json",
      systemInstruction: "Você é um classificador corporativo sênior de indústrias e setores de mercado para o Google Cloud."
    });

    let parsed = { industry: "Varejo & E-commerce", rationale: "Classificação automática", confidence: 0.9 };
    try {
      parsed = JSON.parse(result.text);
    } catch (e) {
      console.warn("Falha no parse do JSON de setor:", result.text);
    }

    return NextResponse.json({
      success: true,
      industry: parsed.industry || "Varejo & E-commerce",
      rationale: parsed.rationale || "",
      confidence: parsed.confidence || 0.9
    });
  } catch (error: any) {
    console.error("Erro ao identificar setor:", error);
    return NextResponse.json({ error: error.message || "Erro na identificação do setor" }, { status: 500 });
  }
}
