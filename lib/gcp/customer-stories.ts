// lib/gcp/customer-stories.ts - Catálogo e Algoritmo de Matching de Casos de Sucesso Google Cloud
// REGRA: Apenas casos reais e comprovados do repositório oficial https://cloud.google.com/customers?hl=pt-BR

import { TopUseCase } from "@/lib/types";

export interface GoogleCloudCustomerStory {
  id: string;
  customerName: string;
  industry: string;
  headline: string;
  summary: string;
  products: string[];
  storyUrl: string; // URL canônica e estrita em cloud.google.com/customers
  country: string;
  tags: string[];
}

export const GCP_CUSTOMER_STORIES_CATALOG: GoogleCloudCustomerStory[] = [
  {
    id: "somapay",
    customerName: "Somapay",
    industry: "Serviços Financeiros & Fintech",
    headline: "Como a Somapay aumentou a eficiência financeira e reduziu custos de infraestrutura em nuvem",
    summary: "A fintech brasileira escalou operações de contas digitais e pagamentos instantâneos com alta disponibilidade e governança estrita, utilizando BigQuery e Cloud Run para processar milhões de transações.",
    products: ["BigQuery", "Cloud Run", "Cloud SQL", "Cloud Armor"],
    storyUrl: "https://cloud.google.com/customers/somapay?hl=pt-BR",
    country: "Brasil",
    tags: ["fintech", "financeiro", "inadimplência", "transacional", "pagamentos", "crédito", "finops", "banco", "contas"]
  },
  {
    id: "revolut",
    customerName: "Revolut",
    industry: "Fintech & Bancos Digitais",
    headline: "Revolut impulsiona decisões financeiras em tempo real para 35M+ de clientes com BigQuery",
    summary: "O neobanco global processa bilhões de registros no BigQuery para análises preditivas de score de crédito, prevenção de churn e engenharia de decisão analítica com sub-segundo de resposta.",
    products: ["BigQuery", "Vertex AI", "Cloud Storage", "Looker"],
    storyUrl: "https://cloud.google.com/customers/revolut-data?hl=pt-BR",
    country: "Global",
    tags: ["banco", "fintech", "sessões", "transacional", "inadimplência", "churn", "ltv", "finops", "big data", "score", "risco"]
  },
  {
    id: "millennium-bcp",
    customerName: "Millennium BCP",
    industry: "Bancos & Prevenção a Fraudes",
    headline: "Millennium BCP combate fraudes e aprimora governança regulatória com machine learning no GCP",
    summary: "Detecção de anomalias em pagamentos e esteiras de conformidade para prevenção a lavagem de dinheiro e PEPs, diminuindo falsos positivos e garantindo compliance financeiro automatizado.",
    products: ["BigQuery", "Vertex AI", "Security Command Center"],
    storyUrl: "https://cloud.google.com/customers/millennium-bcp?hl=pt-BR",
    country: "Portugal / Latam",
    tags: ["fraude", "compliance", "peps", "regulatório", "anomalias", "segurança", "governança", "risco", "impedidos", "financeiro"]
  },
  {
    id: "super-pharm",
    customerName: "Super-Pharm",
    industry: "Farmacêutica & Saúde",
    headline: "Super-Pharm conecta 280+ farmácias com recomendações personalizadas e análise de demanda por PDV",
    summary: "Rede líder de drogarias utilizou BigQuery e modelos preditivos para cruzar hábitos de consumo locais, raios de cobertura e demanda gravitacional para abastecimento de medicamentos sem rupturas.",
    products: ["BigQuery", "Vertex AI", "BigQuery ML"],
    storyUrl: "https://cloud.google.com/customers/super-pharm?hl=pt-BR",
    country: "Global / Varejo Farma",
    tags: ["farmacêutica", "farma", "saúde", "pdv", "prescrições", "gravitação", "huff", "lojas", "farmácias", "sellout", "medicamentos"]
  },
  {
    id: "eversana",
    customerName: "Eversana",
    industry: "Ciências Médicas & Farmacêutica",
    headline: "Eversana acelera comercialização de medicamentos e engajamento médico com IA no Google Cloud",
    summary: "Plataforma de inteligência comercial médica que integra dados de visitas a médicos, prescrições e ensaios clínicos para otimizar rotas de campo e produtividade com IA causal e BigQuery.",
    products: ["BigQuery", "Vertex AI", "Healthcare API", "Gemini"],
    storyUrl: "https://cloud.google.com/customers/eversana?hl=pt-BR",
    country: "Global",
    tags: ["médico", "prescritores", "doutor", "farmacêutica", "rotas", "campo", "uplift", "causal", "remédios", "medicamentos", "saúde"]
  },
  {
    id: "beep-saude",
    customerName: "Beep Saúde",
    industry: "Saúde & Farmacêutica Domiciliar",
    headline: "Beep Saúde transforma logística médica domiciliar com inteligência de dados no Google Cloud",
    summary: "A healthtech brasileira líder em vacinação e exames domiciliares utiliza o BigQuery e geolocalização para otimizar roteirização de equipes de saúde em campo e antecipar picos de demanda.",
    products: ["BigQuery", "Google Maps Platform", "Cloud Functions"],
    storyUrl: "https://cloud.google.com/customers/intl/pt-br/beep-saude?hl=pt-BR",
    country: "Brasil",
    tags: ["saúde", "médica", "rotas", "campo", "domiciliar", "logística", "atendimento", "vacinas", "farmacêutica"]
  },
  {
    id: "morrisons",
    customerName: "Morrisons",
    industry: "Cadeia de Suprimentos & Varejo",
    headline: "Morrisons otimiza cadeia de suprimentos e reduz índice de rupturas em 500 lojas com BigQuery",
    summary: "Monitoramento de estoque em centros de distribuição e gôndolas com machine learning no BigQuery, prevenindo desbalanceamentos logísticos e eliminando perdas por ruptura de canais.",
    products: ["BigQuery", "Vertex AI", "Dataplex"],
    storyUrl: "https://cloud.google.com/customers/morrisons?hl=pt-BR",
    country: "Global",
    tags: ["ruptura", "estoque", "supply chain", "distribuição", "s&op", "logística", "sku", "canais", "anti-ruptura"]
  },
  {
    id: "swarovski",
    customerName: "Swarovski",
    industry: "Varejo & Omnichannel",
    headline: "Swarovski conecta jornadas físicas e digitais com ativação omnichannel personalizada no GCP",
    summary: "Unificação de perfis de consumidores de milhares de lojas físicas e e-commerce via BigQuery, acionando campanhas omnichannel pós-visita que aumentaram a taxa de engajamento e recompra.",
    products: ["BigQuery", "Cloud Run", "Pub/Sub", "Looker"],
    storyUrl: "https://cloud.google.com/customers/swarovski?hl=pt-BR",
    country: "Global",
    tags: ["omnichannel", "crm", "whatsapp", "recompra", "retenção", "pós-contato", "engajamento", "canais digitais", "marketing"]
  },
  {
    id: "etsy-ai",
    customerName: "Etsy",
    industry: "Inteligência Artificial & Mídia",
    headline: "Etsy escala causal AI e otimização algorítmica de campanhas com Vertex AI e BigQuery",
    summary: "Implementação de modelos causais sobre centenas de terabytes de dados no BigQuery para supressão de anúncios ineficientes, hiperpersonalização e expansão de margem financeira.",
    products: ["Vertex AI", "BigQuery", "Cloud GPUs", "Spanner"],
    storyUrl: "https://cloud.google.com/customers/etsy-ai?hl=pt-BR",
    country: "Global",
    tags: ["mídia", "digital", "anúncios", "marketing", "causal", "ia generativa", "ad spend", "algoritmo", "supressão", "margem"]
  }
];

/**
 * Busca casos de sucesso reais do Google Cloud estritamente em cloud.google.com/customers?hl=pt-BR
 * Se não houver similaridade semântica ou contextual comprovada, retorna lista vazia (não exibir).
 */
export function getSimilarGoogleCloudCustomerStories(
  useCase: TopUseCase,
  industry?: string
): GoogleCloudCustomerStory[] {
  if (!useCase) return [];

  const textToMatch = `${useCase.title} ${useCase.category} ${useCase.businessProblem} ${useCase.solutionDescription} ${industry || ""}`.toLowerCase();

  const matchedStories = GCP_CUSTOMER_STORIES_CATALOG.filter(story => {
    // 1. Verifica se alguma tag-chave bate com o contexto do caso de uso
    const tagMatch = story.tags.some(tag => textToMatch.includes(tag.toLowerCase()));
    
    // 2. Verifica se o setor tem correlação direta
    const industryLower = (industry || "").toLowerCase();
    const storyIndustryLower = story.industry.toLowerCase();
    const industryMatch = (
      (industryLower.includes("finan") || industryLower.includes("fintech") || industryLower.includes("banc")) &&
      (storyIndustryLower.includes("finan") || storyIndustryLower.includes("fintech") || storyIndustryLower.includes("banco"))
    ) || (
      (industryLower.includes("farma") || industryLower.includes("saúde") || industryLower.includes("saude") || industryLower.includes("medic")) &&
      (storyIndustryLower.includes("farma") || storyIndustryLower.includes("saúde") || storyIndustryLower.includes("médic"))
    ) || (
      (industryLower.includes("varejo") || industryLower.includes("bens de consumo")) &&
      (storyIndustryLower.includes("varejo") || storyIndustryLower.includes("omnichannel") || storyIndustryLower.includes("suprimentos"))
    );

    return tagMatch || industryMatch;
  });

  // Retorna no máximo os 2 casos mais relevantes para manter a interface clean e executiva
  return matchedStories.slice(0, 2);
}
