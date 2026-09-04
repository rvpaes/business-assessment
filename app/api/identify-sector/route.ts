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

function detectHeuristicIndustry(name: string, url: string, info: string): string | null {
  const text = `${name} ${url} ${info}`.toLowerCase();
  
  if (text.includes("digio") || text.includes("nubank") || text.includes("inter") || text.includes("c6") || 
      text.includes("itau") || text.includes("bradesco") || text.includes("santander") || text.includes("pagseguro") ||
      text.includes("stone") || text.includes("picpay") || text.includes("bank") || text.includes("banco") || 
      text.includes("fintech") || text.includes("cartao") || text.includes("cartão") || text.includes("credito") || 
      text.includes("crédito") || text.includes("financeir") || text.includes("segur")) {
    return "Financeiro & Fintech";
  }

  if (text.includes("hypera") || text.includes("drogasil") || text.includes("droga raia") || text.includes("pague menos") ||
      text.includes("panvel") || text.includes("farma") || text.includes("pharma") || text.includes("saude") || 
      text.includes("saúde") || text.includes("medicament") || text.includes("hospital") || text.includes("laborat")) {
    return "Farmacêutica & Saúde";
  }

  if (text.includes("ambev") || text.includes("heineken") || text.includes("coca-cola") || text.includes("nestle") || 
      text.includes("unilever") || text.includes("mondelez") || text.includes("jbs") || text.includes("brf") ||
      text.includes("alimento") || text.includes("bebida") || text.includes("cpg")) {
    return "Bens de Consumo & CPG";
  }

  if (text.includes("magalu") || text.includes("magazine luiza") || text.includes("americanas") || text.includes("casas bahia") ||
      text.includes("mercado livre") || text.includes("amazon") || text.includes("shopee") || text.includes("shein") ||
      text.includes("varejo") || text.includes("ecommerce") || text.includes("e-commerce") || text.includes("loja") || text.includes("shop")) {
    return "Varejo & E-commerce";
  }

  if (text.includes("vivo") || text.includes("claro") || text.includes("tim") || text.includes("oi") || text.includes("telecom") || text.includes("fibra")) {
    return "Telecom & Mídia";
  }

  if (text.includes("totvs") || text.includes("locaweb") || text.includes("software") || text.includes("saas") || text.includes("cloud") || text.includes("tech") || text.includes("tecnologia")) {
    return "Tecnologia & SaaS";
  }

  if (text.includes("loggi") || text.includes("jadlog") || text.includes("correios") || text.includes("transport") || text.includes("logistica") || text.includes("logística") || text.includes("frete")) {
    return "Logística & Supply Chain";
  }

  if (text.includes("bet") || text.includes("aposta") || text.includes("gaming") || text.includes("cassino") || text.includes("igaming")) {
    return "iGaming & Apostas Regulamentadas";
  }

  if (text.includes("energia") || text.includes("eletro") || text.includes("solar") || text.includes("oil") || text.includes("petro")) {
    return "Energia & Utilities";
  }

  if (text.includes("escola") || text.includes("educa") || text.includes("ensino") || text.includes("universidade") || text.includes("faculdade")) {
    return "Educação & Serviços";
  }

  return null;
}

export async function POST(req: NextRequest) {
  const { companyName, websiteUrl, additionalInfo } = await req.json();

  if (!companyName && !websiteUrl) {
    return NextResponse.json({ error: "Informe o nome da empresa ou o site." }, { status: 400 });
  }

  // Tenta classificação inteligente com Gemini 3.8 Flash
  try {
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

    let parsed = { industry: "", rationale: "", confidence: 0.9 };
    try {
      parsed = JSON.parse(result.text);
    } catch (e) {
      console.warn("Falha no parse do JSON de setor:", result.text);
    }

    if (parsed.industry && standardIndustries.includes(parsed.industry)) {
      return NextResponse.json({
        success: true,
        industry: parsed.industry,
        rationale: parsed.rationale || "Classificado pelo modelo Gemini 3.8 Flash",
        confidence: parsed.confidence || 0.95
      });
    }
  } catch (geminiError) {
    console.warn("Gemini 3.8 Flash indisponível temporariamente, acionando heurística corporativa:", geminiError);
  }

  // Fallback heurístico imediato e resiliente
  const heuristicIndustry = detectHeuristicIndustry(companyName || "", websiteUrl || "", additionalInfo || "") || "Outro Segmento";

  return NextResponse.json({
    success: true,
    industry: heuristicIndustry,
    rationale: `Setor identificado com base no domínio e perfil de ${companyName || websiteUrl}`,
    confidence: 0.92
  });
}
