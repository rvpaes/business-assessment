// lib/constants/verified-queries.ts - 28 Verified Queries oficiais do BigQuery Property Graph

export interface VerifiedQueryItem {
  id: number;
  question: string;
  category: "roi" | "customers" | "gcp" | "governance" | "roadmap";
  categoryLabel: string;
  sqlSnippet: string;
}

export const VERIFIED_QUERIES: VerifiedQueryItem[] = [
  // 🎯 Casos de Uso, ROI & FinOps
  {
    id: 1,
    question: "Quais são os casos de uso prioritários no Grafo Corporativo?",
    category: "roi",
    categoryLabel: "Casos & ROI",
    sqlSnippet: "MATCH (u:UseCase) COLUMNS (u.rank, u.title, u.category, ...)"
  },
  {
    id: 2,
    question: "Quais casos de uso possuem o maior retorno financeiro estimado para o cliente?",
    category: "roi",
    categoryLabel: "Casos & ROI",
    sqlSnippet: "MATCH (u:UseCase) ... ORDER BY financial_gain_estimate_usd DESC"
  },
  {
    id: 3,
    question: "Qual a comparação entre retorno financeiro anual do cliente e custo de nuvem anual de GCP no Grafo?",
    category: "roi",
    categoryLabel: "Casos & ROI",
    sqlSnippet: "MATCH (u:UseCase) COLUMNS (annual_gain_usd, annual_gcp_cost_usd, gain_multiple)"
  },
  {
    id: 20,
    question: "Quais casos de uso possuem payback rápido inferior ou igual a 6 meses?",
    category: "roi",
    categoryLabel: "Casos & ROI",
    sqlSnippet: "MATCH (u:UseCase) WHERE u.payback_months <= 6.0"
  },
  {
    id: 24,
    question: "Quais casos de uso geram um múltiplo de retorno superior a 80 vezes o custo de nuvem GCP?",
    category: "roi",
    categoryLabel: "Casos & ROI",
    sqlSnippet: "MATCH (u:UseCase) WHERE (financial_gain_estimate_usd / (gcp_monthly_cost_usd * 12)) >= 80.0"
  },
  {
    id: 27,
    question: "Quais casos de uso possuem score de confiança executiva acima de 85%?",
    category: "roi",
    categoryLabel: "Casos & ROI",
    sqlSnippet: "MATCH (u:UseCase) WHERE u.confidence_score >= 0.85"
  },

  // 🏢 Clientes Corporativos
  {
    id: 4,
    question: "Quais são os casos de uso do cliente Digio no Grafo?",
    category: "customers",
    categoryLabel: "Clientes",
    sqlSnippet: "MATCH (c:Customer)-[:INVESTS_IN]->(u:UseCase) WHERE c.name = 'digio'"
  },
  {
    id: 5,
    question: "Quais são os casos de uso da Hypera Pharma no Grafo?",
    category: "customers",
    categoryLabel: "Clientes",
    sqlSnippet: "MATCH (c:Customer)-[:INVESTS_IN]->(u:UseCase) WHERE c.name LIKE '%hypera%'"
  },
  {
    id: 18,
    question: "Quais são os clientes corporativos cadastrados e seu nível de maturidade analítica?",
    category: "customers",
    categoryLabel: "Clientes",
    sqlSnippet: "MATCH (c:Customer) COLUMNS (c.name, c.industry, c.data_maturity_level, ...)"
  },
  {
    id: 19,
    question: "Quais assessments técnicos foram executados e qual a volumetria total auditada?",
    category: "customers",
    categoryLabel: "Clientes",
    sqlSnippet: "MATCH (c:Customer)-[:HAS_ASSESSMENT]->(a:Assessment)"
  },
  {
    id: 26,
    question: "Quais metas estratégicas de negócio estão associadas a clientes no Grafo?",
    category: "customers",
    categoryLabel: "Clientes",
    sqlSnippet: "MATCH (c:Customer)-[cg:TARGETS_GOAL]->(g:StrategicGoal)"
  },

  // ☁️ Consumo GCP & Serviços
  {
    id: 6,
    question: "Quais serviços GCP são consumidos pelo caso de uso rank 1?",
    category: "gcp",
    categoryLabel: "Consumo GCP",
    sqlSnippet: "MATCH (u:UseCase WHERE u.rank = 1)-[:CONSUMES_GCP_SERVICE]->(s:GcpService)"
  },
  {
    id: 7,
    question: "Quais casos de uso consomem o serviço BigQuery no Grafo?",
    category: "gcp",
    categoryLabel: "Consumo GCP",
    sqlSnippet: "MATCH (u:UseCase)-[:CONSUMES_GCP_SERVICE]->(s:GcpService WHERE s.service_name LIKE '%bigquery%')"
  },
  {
    id: 8,
    question: "Quais casos de uso consomem Agent Platform e qual o custo mensal em GCP?",
    category: "gcp",
    categoryLabel: "Consumo GCP",
    sqlSnippet: "MATCH (u:UseCase)-[:CONSUMES_GCP_SERVICE]->(s:GcpService WHERE s.service_name LIKE '%vertex%' OR s.service_name LIKE '%agent%')"
  },
  {
    id: 21,
    question: "Qual o custo mensal estimado em serviços Google Cloud por caso de uso?",
    category: "gcp",
    categoryLabel: "Consumo GCP",
    sqlSnippet: "MATCH (u:UseCase) COLUMNS (u.rank, u.title, u.gcp_monthly_cost_usd, ...)"
  },
  {
    id: 25,
    question: "Quais serviços Google Cloud possuem maior investimento mensal nos casos de uso do Grafo?",
    category: "gcp",
    categoryLabel: "Consumo GCP",
    sqlSnippet: "MATCH (u:UseCase)-[cs:CONSUMES_GCP_SERVICE]->(s:GcpService) ORDER BY monthly_cost_usd DESC"
  },
  {
    id: 28,
    question: "Quais produtos e serviços Google Cloud estão mapeados no Grafo e qual sua categoria?",
    category: "gcp",
    categoryLabel: "Consumo GCP",
    sqlSnippet: "MATCH (s:GcpService) COLUMNS (s.service_name, s.category, s.tier, ...)"
  },

  // 🛡️ Knowledge Catalog & Governança
  {
    id: 11,
    question: "Quais casos de uso tratam de prevenção de fraude ou segurança analítica?",
    category: "governance",
    categoryLabel: "Knowledge Catalog",
    sqlSnippet: "MATCH (u:UseCase) WHERE u.title LIKE '%fraude%' OR u.category LIKE '%segurança%'"
  },
  {
    id: 12,
    question: "Quais tabelas do catálogo empoderam casos de uso no Grafo?",
    category: "governance",
    categoryLabel: "Knowledge Catalog",
    sqlSnippet: "MATCH (t:TableCatalog)-[emp:EMPOWERS_USE_CASE]->(u:UseCase)"
  },
  {
    id: 13,
    question: "Quais tabelas auditadas possuem maior score de qualidade de dados no Grafo?",
    category: "governance",
    categoryLabel: "Knowledge Catalog",
    sqlSnippet: "MATCH (a:Assessment)-[aud:AUDITS_TABLE]->(t:TableCatalog) ORDER BY data_quality_score DESC"
  },
  {
    id: 14,
    question: "Qual a linhagem entre tabelas do catálogo e mecanismos de governança do Knowledge Catalog?",
    category: "governance",
    categoryLabel: "Knowledge Catalog",
    sqlSnippet: "MATCH (t:TableCatalog)-[gov:GOVERNED_BY]->(s:GcpService)"
  },
  {
    id: 22,
    question: "Quais tabelas do catálogo de dados possuem maior contagem de linhas no Grafo?",
    category: "governance",
    categoryLabel: "Knowledge Catalog",
    sqlSnippet: "MATCH (t:TableCatalog) ORDER BY estimated_rows DESC LIMIT 10"
  },
  {
    id: 23,
    question: "Quais casos de uso pertencem à categoria de AI/ML e Analytics Avançado?",
    category: "governance",
    categoryLabel: "Knowledge Catalog",
    sqlSnippet: "MATCH (u:UseCase) WHERE u.category LIKE '%ai%' OR u.category LIKE '%ml%'"
  },

  // 🚀 Roadmap, Metas & Modernização
  {
    id: 9,
    question: "Quais são as metas estratégicas corporativas cadastradas no Grafo?",
    category: "roadmap",
    categoryLabel: "Metas & Roadmap",
    sqlSnippet: "MATCH (g:StrategicGoal) COLUMNS (g.goal_id, g.goal_name, g.business_domain, ...)"
  },
  {
    id: 10,
    question: "Quais casos de uso alcançam objetivos estratégicos e qual o impacto esperado?",
    category: "roadmap",
    categoryLabel: "Metas & Roadmap",
    sqlSnippet: "MATCH (u:UseCase)-[ag:ACHIEVES_GOAL]->(g:StrategicGoal)"
  },
  {
    id: 15,
    question: "Quais ações de modernização foram recomendadas para os casos de uso do Grafo?",
    category: "roadmap",
    categoryLabel: "Metas & Roadmap",
    sqlSnippet: "MATCH (u:UseCase)-[ra:RECOMMENDS_ACTION]->(m:ModernizationAction)"
  },
  {
    id: 16,
    question: "Quais ações de modernização pertencem à Onda 1 de execução?",
    category: "roadmap",
    categoryLabel: "Metas & Roadmap",
    sqlSnippet: "MATCH (m:ModernizationAction) WHERE m.execution_wave LIKE '%onda 1%'"
  },
  {
    id: 17,
    question: "Quais especialistas do comitê neurocognitivo validaram os casos de uso no Grafo?",
    category: "roadmap",
    categoryLabel: "Metas & Roadmap",
    sqlSnippet: "MATCH (p:PersonaDebate)-[val:VALIDATED_USE_CASE]->(u:UseCase)"
  }
];
