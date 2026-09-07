// app/api/identify-sector/route.ts - Identificação Ultra-Rápida de Setor (<1ms) com Base Corporativa & Heurística Semântica
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

interface FastMatchResult {
  industry: string;
  rationale: string;
  confidence: number;
}

function normalizeStr(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s.-]/g, " ") // normaliza caracteres especiais
    .trim();
}

/**
 * Motor semântico e corporativo em memória de altíssima velocidade (<0.5ms).
 * Classifica a partir de marcas registradas, domínios e radicais semânticos em português/inglês.
 */
function classifyInstantIndustry(
  companyName: string,
  websiteUrl: string,
  additionalInfo: string
): FastMatchResult {
  const normName = normalizeStr(companyName);
  const normUrl = normalizeStr(websiteUrl);
  const normInfo = normalizeStr(additionalInfo);

  // Extrai núcleo do domínio (ex: "https://www.hypera.com.br/contato" -> "hypera")
  let domainCore = "";
  if (normUrl) {
    domainCore = normUrl
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(/[/?#]/)[0]
      .split(".")[0];
  }

  const combined = ` ${normName} ${normUrl} ${domainCore} ${normInfo} `;

  // Helper para verificar presença de termos ou radicais
  const has = (...terms: string[]) => {
    return terms.some(t => {
      const cleanTerm = normalizeStr(t);
      if (!cleanTerm) return false;
      if (cleanTerm.length <= 4) {
        const regex = new RegExp(`(^|\\s|\\.|-)${cleanTerm}(\\s|\\.|-|$)`, "i");
        return regex.test(combined) || domainCore === cleanTerm;
      }
      return combined.includes(cleanTerm) || domainCore.includes(cleanTerm);
    });
  };

  // 1. Financeiro & Fintech
  if (
    has(
      "digio", "nubank", "inter", "c6", "c6 bank", "itau", "itaubank", "bradesco", "santander",
      "btg", "btg pactual", "banco do brasil", "caixa economica", "pagseguro", "pagbank",
      "stone", "picpay", "cielo", "getnet", "redecard", "xp", "xp investimentos", "genial",
      "modal", "modalmais", "b3", "warren", "cora", "asaas", "nomad", "avenue", "neon",
      "banco pan", "safra", "daycoval", "agibank", "mercado pago", "creditas", "sicoob",
      "sicredi", "unicred", "banrisul", "bnb", "bmg", "porto seguro", "allianz", "mapfre",
      "sulamerica", "icatu", "mongeral", "prudential", "bb seguros", "clear corretora", "rico",
      "toro investimentos", "binance", "mercado bitcoin", "foxbit", "mastercard", "visa",
      "banc", "bank", "fintech", "cartao", "credito", "credit", "financi", "emprest", "corretor",
      "invest", "adquirenc", "maquininha", "split", "wallet", "cambio", "seguradora", "previdenci"
    )
  ) {
    return {
      industry: "Financeiro & Fintech",
      rationale: "Identificado como instituição financeira, banco, fintech, crédito ou seguros.",
      confidence: 0.98
    };
  }

  // 2. Farmacêutica & Saúde
  if (
    has(
      "hypera", "hypera pharma", "neo quimica", "ems", "eurofarma", "ache", "biolab", "libbs",
      "cristalia", "sanofi", "pfizer", "novartis", "roche", "bayer", "astrazeneca", "johnson & johnson",
      "drogasil", "droga raia", "raia drogasil", "rd saude", "pague menos", "extrafarma", "panvel",
      "dpsp", "drogaria sao paulo", "pacheco", "araujo", "drogaria araujo", "venancio", "nissei",
      "fleury", "dasa", "rede d'or", "sao luiz", "einstein", "albert einstein", "sirio libanes",
      "hapvida", "notredame", "gndi", "unimed", "amil", "bradesco saude", "sulamerica saude",
      "sabin", "hermes pardini", "farma", "pharma", "farmaceut", "drogar", "medicament",
      "remedio", "hospital", "clinic", "laborat", "oncolog", "diagnost", "saud", "health",
      "posolog", "convenio medic", "terap", "odontolog", "dental"
    )
  ) {
    return {
      industry: "Farmacêutica & Saúde",
      rationale: "Identificado como indústria farmacêutica, rede de drogarias, hospital ou saúde diagnóstica.",
      confidence: 0.98
    };
  }

  // 3. Bens de Consumo & CPG
  if (
    has(
      "ambev", "heineken", "coca-cola", "coca cola", "femsa", "solar coca-cola", "pepsico", "pepsi",
      "nestle", "unilever", "mondelez", "jbs", "friboi", "seara", "brf", "sadia", "perdigao",
      "marfrig", "minerva", "m dias branco", "danone", "bauducco", "pandurata", "camil", "3 coracoes",
      "melitta", "yoki", "wickbold", "bimbo", "natura", "boticario", "avon", "colgate", "procter & gamble",
      "p&g", "kimberly-clark", "l'oreal", "loreal", "nivea", "ype", "bombril", "reckitt",
      "aliment", "bebid", "cervej", "refrigerant", "snack", "laticini", "frigorif", "cosmet",
      "perfum", "higien", "limpez", "sabao", "detergent", "cpg", "fmcg", "bens de consumo"
    )
  ) {
    return {
      industry: "Bens de Consumo & CPG",
      rationale: "Identificado como indústria de bens de consumo, bebidas, alimentos ou cosméticos (CPG/FMCG).",
      confidence: 0.98
    };
  }

  // 4. Varejo & E-commerce
  if (
    has(
      "magalu", "magazine luiza", "americanas", "b2w", "submarino", "shoptime", "casas bahia",
      "ponto frio", "via varejo", "mercado livre", "meli", "amazon", "shopee", "shein", "aliexpress",
      "netshoes", "centauro", "dafiti", "mobly", "madeira madeira", "enjoei", "carrefour", "assai",
      "atacadao", "pao de acucar", "gpa", "grupo mateus", "cencosud", "muffato", "lojas renner",
      "renner", "riachuelo", "c&a", "marisa", "zara", "arezzo", "grupo soma", "vivara", "petz", "cobasi",
      "leroy merlin", "telhanorte", "sodimac", "varej", "retail", "ecommerce", "e-commerce", "loja",
      "marketplace", "supermercad", "hipermercad", "atacad", "atacarej", "boutique", "calcado", "vestuar", "moda"
    )
  ) {
    return {
      industry: "Varejo & E-commerce",
      rationale: "Identificado como rede de varejo, atacarejo ou comércio eletrônico / marketplace.",
      confidence: 0.98
    };
  }

  // 5. Telecom & Mídia
  if (
    has(
      "vivo", "telefonica", "claro", "tim", "oi", "algar", "brisanet", "desktop", "unifique",
      "vero", "ligga", "globo", "globoplay", "sbt", "record", "band", "folha", "estadao",
      "uol", "terra", "netflix", "disney", "hbo", "spotify", "telecom", "telefoni", "fibra",
      "banda larga", "5g", "operadora", "midia", "media", "broadcast", "streaming", "jornal", "notici"
    )
  ) {
    return {
      industry: "Telecom & Mídia",
      rationale: "Identificado como operadora de telecomunicações, conectividade ou empresa de mídia e conteúdo.",
      confidence: 0.98
    };
  }

  // 6. Tecnologia & SaaS
  if (
    has(
      "totvs", "linx", "sankhya", "senior sistemas", "rd station", "vtex", "ci&t", "stefanini",
      "neoway", "take blip", "zup", "locaweb", "tray", "google", "microsoft", "aws", "oracle",
      "sap", "salesforce", "ibm", "adobe", "meta", "intel", "nvidia", "snowflake", "databricks",
      "software", "saas", "cloud", "comput", "sistem", "plataform", "api", "crm", "erp",
      "cibersegur", "tecnolog", "tech", "ti", "digital", "inteligencia artificial"
    )
  ) {
    return {
      industry: "Tecnologia & SaaS",
      rationale: "Identificado como desenvolvedora de software, plataforma de nuvem, SaaS ou serviços de TI.",
      confidence: 0.98
    };
  }

  // 7. Logística & Supply Chain
  if (
    has(
      "loggi", "jadlog", "dhl", "fedex", "ups", "correios", "total express", "jamef", "braspress",
      "tegma", "rumo", "vli", "mrs", "santos brasil", "wilson sons", "azul cargo", "gollog",
      "latam cargo", "sequoia", "jsl", "simpar", "vamos", "viacao", "onibus", "transport",
      "logist", "frete", "entrega", "last mile", "armaz", "porto", "terminal", "supply chain", "ferrovi"
    )
  ) {
    return {
      industry: "Logística & Supply Chain",
      rationale: "Identificado como operadora logística, transportadora, transporte de passageiros/cargas ou supply chain.",
      confidence: 0.98
    };
  }

  // 8. iGaming & Apostas Regulamentadas
  if (
    has(
      "betano", "bet365", "sportingbet", "kto", "betfair", "estrelabet", "pixbet", "superbet",
      "novibet", "betnacional", "parimatch", "blaze", "stake", "f12.bet", "galera.bet", "betsson",
      "betway", "kaizen", "sportsbet", "vaidebet", "bet", "aposta", "apostas", "cassino", "casino",
      "igaming", "odds", "palpit", "loter", "sorte"
    )
  ) {
    return {
      industry: "iGaming & Apostas Regulamentadas",
      rationale: "Identificado como plataforma regulamentada de apostas de quota fixa, apostas esportivas e iGaming.",
      confidence: 0.98
    };
  }

  // 9. Energia & Utilities
  if (
    has(
      "petrobras", "vibra", "ipiranga", "ultrapar", "raizen", "cosan", "shell", "eletrobras",
      "cpfl", "enel", "neoenergia", "cemig", "copel", "engie", "equatorial", "edp", "light",
      "energisa", "sabesp", "copasa", "sanepar", "comgas", "aegea", "energ", "eletric",
      "solar", "eolic", "petrol", "oil", "gas", "combustiv", "etanol", "biodiesel", "saneament", "agua"
    )
  ) {
    return {
      industry: "Energia & Utilities",
      rationale: "Identificado como empresa de energia, óleo & gás, geração elétrica ou saneamento e utilities.",
      confidence: 0.98
    };
  }

  // 10. Educação & Serviços
  if (
    has(
      "cogna", "kroton", "yduqs", "estacio", "ser educacional", "anima", "cruzeiro do sul",
      "descomplica", "alura", "coursera", "fgv", "puc", "usp", "senac", "sesi", "localiza",
      "movida", "unidas", "rent a car", "educ", "ensin", "escol", "universidad", "faculd",
      "colegi", "curs", "graduac", "ead", "edtech", "locac"
    )
  ) {
    return {
      industry: "Educação & Serviços",
      rationale: "Identificado como instituição de ensino superior/básico, EdTech ou locação e serviços corporativos.",
      confidence: 0.98
    };
  }

  // 11. Manufatura & Indústria
  if (
    has(
      "vale", "csn", "gerdau", "usiminas", "embraer", "weg", "tupy", "randon", "marcopolo",
      "suzano", "klabin", "votorantim", "braskem", "dexco", "tigre", "saint-gobain", "tramontina",
      "whirlpool", "brastemp", "electrolux", "miner", "siderurg", "aco", "metalurg", "fundic",
      "celulos", "papel", "ciment", "petroquim", "motor", "maquin", "industr", "fabric", "manufatur"
    )
  ) {
    return {
      industry: "Manufatura & Indústria",
      rationale: "Identificado como indústria pesada, mineração, siderurgia ou manufatura de bens de produção.",
      confidence: 0.98
    };
  }

  // Fallback padrão amigável caso não tenha correspondência em nenhum radical
  return {
    industry: "Outro Segmento",
    rationale: `Setor corporativo para ${companyName || websiteUrl}`,
    confidence: 0.85
  };
}

export async function POST(req: NextRequest) {
  const { companyName, websiteUrl, additionalInfo } = await req.json();

  if (!companyName && !websiteUrl) {
    return NextResponse.json({ error: "Informe o nome da empresa ou o site." }, { status: 400 });
  }

  // Classificação Instantânea em Memória (<1ms)
  const result = classifyInstantIndustry(
    companyName || "",
    websiteUrl || "",
    additionalInfo || ""
  );

  return NextResponse.json({
    success: true,
    industry: result.industry,
    rationale: result.rationale,
    confidence: result.confidence,
    source: "instant-classifier"
  });
}
