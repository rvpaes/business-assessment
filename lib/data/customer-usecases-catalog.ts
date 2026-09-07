// lib/data/customer-usecases-catalog.ts - Catálogo Especializado de Casos de Uso por Cliente & Indústria
// Projetado para vendedores do Google Cloud e tomadores de decisão C-Level
// Cada caso balanceia: 1) Impacto no Negócio do Cliente ($ EBITDA/Receita) e 2) Consumo na Plataforma GCP (BigQuery, Vertex AI, Cloud Run, Knowledge Catalog)
// Padrão Estratégico:
//   - Casos 1 a 3: Alto consumo GCP ($7.6k - $13.5k/mês) com altíssimo impacto no cliente ($2.2M - $4.8M/ano)
//   - Casos 4 a 6: Consumo GCP otimizado/baixo ($750 - $1.85k/mês) com impacto relevante no cliente ($480k - $920k/ano)

import { TopUseCase } from "@/lib/types";

export interface ExtendedUseCase extends TopUseCase {
  keyImprovement: string;       // Principal melhoria arquitetural/técnica a ser aplicada
  gcpExpansionOpportunity: string; // Narrativa de oportunidade de vendas GCP (Upsell/Cross-sell)
  paybackMonths: number;
}

// 1. Casos de Uso para DIGIO (Financeiro & Fintech)
export const DIGIO_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_digio_01_credit_scoring",
    assessmentId: "asm_digio_2026",
    rank: 1,
    title: "Score Preditivo de Crédito em Tempo Real & Concessão de Limite Dinâmico",
    category: "AI/ML Preditivo & Streaming",
    businessProblem: "Modelos legados de score estático com atualização mensal geram rejeição de 24% de bons tomadores e atraso na concessão de limites de cartão, limitando a expansão da carteira.",
    solutionDescription: "Pipeline corporativo de feature store no BigQuery com inferência online em sub-segundo no Vertex AI, integrando histórico transacional, pagamentos via Pix e birôs externos para ajuste contínuo de limite.",
    businessCaseRoi: "Redução de 28% no default de 90 dias e aumento de +$4.200.000/ano em margem líquida financeira com payback em 1.3 meses.",
    financialGainEstimateUsd: 4200000,
    gcpMonthlyCostUsd: 12800,
    costBreakdown: {
      bigqueryUsd: 6800,
      vertexAiUsd: 4400,
      cloudRunUsd: 1100,
      storageUsd: 500
    },
    requiredTables: ["transacoes_cartao", "cadastro_correntistas", "historico_faturas", "bureaux_score"],
    requiredColumns: ["cpf_hash", "valor_transacao", "score_interno", "limite_disponivel", "status_inadimplencia"],
    guardrails: "Auditoria contínua de viés algorítmico no Vertex Explainable AI; conformidade estrita com resolução Bacen 4.658.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Migrar rotinas batch noturnas para BigQuery Continuous Queries com CDC e Vertex AI Online Feature Store, reduzindo latência de concessão de 48h para 180ms.",
    gcpExpansionOpportunity: "Consumo de BigQuery Slots dedicados + Vertex AI Prediction Endpoints corporativos para 15M+ de avaliações de crédito/mês.",
    paybackMonths: 1.3
  },
  {
    useCaseId: "uc_digio_02_fraud_detection",
    assessmentId: "asm_digio_2026",
    rank: 2,
    title: "Motor Causal de Anomalias & Prevenção Antifraude Pix/Cartão em Sub-Segundo",
    category: "Causal AI & Segurança",
    businessProblem: "Aumento de fraudes sofisticadas de engenharia social e transações suspeitas fora do perfil de gastos, com custo elevado de estornos (chargebacks) e atrito com clientes VIP.",
    solutionDescription: "Detecção de anomalias com Vertex AI Autoencoders e BigQuery Vector Search processando redes de relacionamento entre contas recebedoras de Pix e geolocalização de dispositivos.",
    businessCaseRoi: "Bloqueio preventivo de $3.100.000/ano em fraudes com queda de 52% em falsos positivos com payback em 1.4 meses.",
    financialGainEstimateUsd: 3100000,
    gcpMonthlyCostUsd: 10400,
    costBreakdown: {
      bigqueryUsd: 5600,
      vertexAiUsd: 3500,
      cloudRunUsd: 850,
      storageUsd: 450
    },
    requiredTables: ["eventos_pix", "dispositivos_logados", "regras_antifraude", "historico_chargebacks"],
    requiredColumns: ["transacao_id", "device_fingerprint", "ip_geoloc", "valor", "chave_pix_destino"],
    guardrails: "Zero bloqueio sem validação biométrica em fallback; registro idempotente em log imutável no Cloud Logging.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Implementar BigQuery Continuous Queries com CDC do banco transacional para scoring de anomalias em sub-segundo sem onerar o core banking.",
    gcpExpansionOpportunity: "Pipeline corporativo de segurança bancária integrando BigQuery, Cloud Run e Security Command Center.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_digio_03_collections_engine",
    assessmentId: "asm_digio_2026",
    rank: 3,
    title: "Motor Causal de Cobrança & Renegociação Personalizada Omnichannel",
    category: "Causal AI & FinOps",
    businessProblem: "Estratégias homogêneas de cobrança por SMS e call center geram custo elevado de terceirizados e baixa efetividade em faixas de atraso D+15 a D+60.",
    solutionDescription: "Modelos causais de propensão a pagamento (Uplift Modeling) no BigQuery ML que determinam o canal ideal (WhatsApp, push, e-mail) e o desconto ótimo para acordo imediato.",
    businessCaseRoi: "Elevação de +26% na recuperação de créditos em atraso e economia de $2.400.000/ano em custos operacionais com payback em 1.5 meses.",
    financialGainEstimateUsd: 2400000,
    gcpMonthlyCostUsd: 7900,
    costBreakdown: {
      bigqueryUsd: 4200,
      vertexAiUsd: 2600,
      cloudRunUsd: 700,
      storageUsd: 400
    },
    requiredTables: ["historico_cobranca", "acordos_renegociacao", "engajamento_canais", "faturas_atrasadas"],
    requiredColumns: ["contrato_id", "dias_atraso", "canal_acionamento", "faixa_desconto", "status_acordo"],
    guardrails: "Respeito rigoroso aos horários legais de contato (LGPD / CDC); limite de 1 mensagem/semana.",
    confidenceScore: 0.93,
    status: "VALIDATED",
    keyImprovement: "Clusterização e particionamento das tabelas de faturas por mês contábil e faixa de atraso, cortando custos de query no BigQuery em 68%.",
    gcpExpansionOpportunity: "Crescimento contínuo de dados analíticos no BigQuery com ativação de Vertex AI AutoML.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_digio_04_sanctions_pep",
    assessmentId: "asm_digio_2026",
    rank: 4,
    title: "Higienização Cadastral Contínua & Esteira Automatizada PEPs/Sanções",
    category: "Governança & Compliance",
    businessProblem: "Checagem manual ou em batches esparsos de listas de Pessoas Politicamente Expostas (PEPs) e sanções financeiras (OFAC, CSNU), expondo a instituição a multas regulatórias.",
    solutionDescription: "Esteira automatizada no Knowledge Catalog cruzando diariamente o cadastro com bases regulatórias abertas e gerando alertas imediatos de conformidade no BigQuery.",
    businessCaseRoi: "Mitigação de risco regulatório de multas milionárias e economia direta de $860.000/ano em auditoria externa e triagem manual.",
    financialGainEstimateUsd: 860000,
    gcpMonthlyCostUsd: 1650,
    costBreakdown: {
      bigqueryUsd: 850,
      vertexAiUsd: 450,
      cloudRunUsd: 200,
      storageUsd: 150
    },
    requiredTables: ["cadastro_correntistas", "lista_peps_oficial", "sancoes_ofac", "alertas_compliance"],
    requiredColumns: ["cpf_cnpj", "nome_completo", "grau_parentesco", "fonte_sancao", "data_inclusao"],
    guardrails: "Armazenamento imutável de logs de checagem para auditoria do Banco Central do Brasil; triplo check antes de qualquer bloqueio preventivo.",
    confidenceScore: 0.98,
    status: "VALIDATED",
    keyImprovement: "Ativação do Knowledge Catalog Data Profiling e Data Quality Scan automático com publicação contínua de metadados no Knowledge Catalog.",
    gcpExpansionOpportunity: "Adoção de Knowledge Catalog como catálogo corporativo mestre de governança para todo o ecossistema bancário.",
    paybackMonths: 0.9
  },
  {
    useCaseId: "uc_digio_05_conversational_agent",
    assessmentId: "asm_digio_2026",
    rank: 5,
    title: "Assistente Conversacional do Correntista com Grounding no Knowledge Catalog",
    category: "GenAI & Agentes Conversacionais",
    businessProblem: "Volume massivo de chamados repetitivos de dúvidas sobre faturas, limite, parcelamento e extrato gerando filas e custo por ticket elevado.",
    solutionDescription: "Data Agent conversacional no Cloud Run alimentado por Gemini 3.8 Flash no Vertex AI, com grounding estrito no schema do BigQuery e Knowledge Catalog para respostas exatas.",
    businessCaseRoi: "Deflexão de 48% dos chamados de 1º nível e ganho de produtividade operacional avaliado em $720.000/ano.",
    financialGainEstimateUsd: 720000,
    gcpMonthlyCostUsd: 1350,
    costBreakdown: {
      bigqueryUsd: 650,
      vertexAiUsd: 450,
      cloudRunUsd: 150,
      storageUsd: 100
    },
    requiredTables: ["enterprise_business_graph", "faq_politicas_banco", "logs_atendimento", "extrato_consolidado"],
    requiredColumns: ["conta_id", "pergunta_usuario", "intencao_detectada", "tabela_grounding", "score_resposta"],
    guardrails: "Isolamento estrito com Row-Level Security (RLS) e mascaramento de dados (Policy Tags) para que o agente nunca exponha PII de outros correntistas.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Implementar Knowledge Catalog Policy Tags de mascaramento dinâmico em colunas sensíveis (CPF, dados de cartão, saldos) garantindo conformidade LGPD nativa.",
    gcpExpansionOpportunity: "Porta de entrada para adoção de GenAI corporativa no Vertex AI com 500k+ sessões mensais de chat.",
    paybackMonths: 1.1
  },
  {
    useCaseId: "uc_digio_06_card_activation",
    assessmentId: "asm_digio_2026",
    rank: 6,
    title: "Otimização de Ativação de Cartões & Prevenção de Inatividade (Next-Best-Action)",
    category: "Next-Best-Action",
    businessProblem: "Clientes recebem o cartão de crédito e não realizam o desbloqueio ou reduzem os gastos após o 3º mês de uso, gerando ociosidade da base emitida.",
    solutionDescription: "Modelos de Next-Best-Action no BigQuery ML que identificam o momento exato de desaceleração e recomendam incentivos personalizados (cashback pontual, aumento temporário de limite).",
    businessCaseRoi: "Aumento de 9.4% no volume transacionado por cartão ativo e retenção de receita avaliada em $540.000/ano.",
    financialGainEstimateUsd: 540000,
    gcpMonthlyCostUsd: 950,
    costBreakdown: {
      bigqueryUsd: 500,
      vertexAiUsd: 280,
      cloudRunUsd: 100,
      storageUsd: 70
    },
    requiredTables: ["desbloqueio_cartoes", "faturas_mensais", "historico_compras_categorias", "resgate_recompensas"],
    requiredColumns: ["cartao_id", "dias_desde_emissao", "status_desbloqueio", "ticket_medio", "categoria_preferida"],
    guardrails: "Regras de governança de marketing com limite de ofertas por ciclo de fatura para evitar saturação do correntista.",
    confidenceScore: 0.92,
    status: "VALIDATED",
    keyImprovement: "Configuração do BigQuery BI Engine com 10GB de memória para dashboards de acompanhamento executivo de ativação de cartões em sub-segundo.",
    gcpExpansionOpportunity: "Expansão de consumo para Looker e BI Engine acelerando a visualização de métricas da diretoria de produtos.",
    paybackMonths: 1.2
  }
];

// 2. Casos de Uso para HYPERA PHARMA (Farmacêutica & Saúde) - CLIENTE PADRÃO
export const HYPERA_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_hypera_01_demand_anti_rupture",
    assessmentId: "asm_hypera_2026",
    rank: 1,
    title: "Previsão de Demanda Multinível & Otimização de Ruptura de Estoque em 85.000 PDVs",
    category: "Supply Chain & S&OP",
    businessProblem: "Esgotamento imprevisto de medicamentos estratégicos em 85.000 farmácias e 14 centros de distribuição regionais, gerando perdas milionárias de faturamento e fretes aéreos emergenciais.",
    solutionDescription: "Previsão hiperlocal de demanda com Vertex AI Time Series e BigQuery Slots Dedicados cruzando sell-out diário, sazonalidade epidemiológica e lead time de centros de distribuição para disparo preditivo de reposição.",
    businessCaseRoi: "Eliminação de 34% das perdas por ruptura de estoque e ganho financeiro direto de +$3.850.000/ano (~R$ 21.56M/ano) com payback em 1.4 meses.",
    financialGainEstimateUsd: 3850000,
    gcpMonthlyCostUsd: 11450,
    costBreakdown: {
      bigqueryUsd: 6200,
      vertexAiUsd: 3800,
      cloudRunUsd: 950,
      storageUsd: 500
    },
    requiredTables: ["SellOut_Weekly", "Inventory_Distribution", "SKU_Master", "Pharmacy_Master"],
    requiredColumns: ["sku_id", "pharmacy_cnpj", "lead_time_days", "current_stock", "safety_stock_limit", "weekly_sales_volume"],
    guardrails: "Alertas idempotentes enviados ao ERP SAP; execuções repetidas não duplicam ordens de transferência de estoque.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Implementar BigQuery Reservations com slots dedicados e particionamento temporal diário para processar terabytes de sell-out sem degradação de performance.",
    gcpExpansionOpportunity: "Substituição completa do módulo legado de S&OP por pipelines modernos em BigQuery Studio e Vertex AI.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_hypera_02_field_routes",
    assessmentId: "asm_hypera_2026",
    rank: 2,
    title: "Motor Causal de Conversão Médica & Otimização de Rotas da Força de Campo",
    category: "Causal AI & Força de Vendas",
    businessProblem: "Dispersão de roteiro operacional das equipes de representantes em campo, gerando ociosidade em setores com alto potencial de prescrição médica não atendido.",
    solutionDescription: "Modelagem causal com Vertex AI e BigQuery GIS cruzando histórico de prescrições, especialidades médicas e sell-out regional para maximizar a conversão das visitas presenciais.",
    businessCaseRoi: "Aumento de 14.8% no volume de prescrições ativas por médico visitado e acréscimo de +$2.900.000/ano (~R$ 16.24M/ano) com payback em 1.6 meses.",
    financialGainEstimateUsd: 2900000,
    gcpMonthlyCostUsd: 9600,
    costBreakdown: {
      bigqueryUsd: 4900,
      vertexAiUsd: 3400,
      cloudRunUsd: 800,
      storageUsd: 500
    },
    requiredTables: ["Medical_Specialties", "Prescriber_Visits", "SellOut_Weekly", "Doctor_Registry"],
    requiredColumns: ["doctor_crm", "territory_id", "visit_date", "specialty_code", "prescribed_units", "potential_score"],
    guardrails: "Respeito aos limites éticos e regulatórios do CFM/Anvisa; zero utilização de dados pessoais sem conformidade LGPD.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Particionar tabelas de visitas e sell-out por mês e clusterizar por territory_id no BigQuery, reduzindo o tempo de processamento de rotas de 4h para 8min.",
    gcpExpansionOpportunity: "Integração nativa de BigQuery com Google Maps Platform Route Optimization API gerando pipeline conjunto de dados e mapas.",
    paybackMonths: 1.6
  },
  {
    useCaseId: "uc_hypera_03_huff_gravity",
    assessmentId: "asm_hypera_2026",
    rank: 3,
    title: "Mapeamento Gravitacional de Prescrição & Demanda por Microrregião (Modelo Huff)",
    category: "Geomarketing & BigQuery GIS",
    businessProblem: "Falta de correlação precisa entre os médicos prescritores e as farmácias satélites onde o paciente adquire o medicamento prescrito, gerando ruptura invisível.",
    solutionDescription: "Algoritmo gravitacional de Huff no BigQuery ML e Vertex AI para atribuir probabilidades espaciais de compra por ponto de venda em raio de até 5km.",
    businessCaseRoi: "Recuperação de 42% da demanda reprimida em farmácias satélites no raio de influência médica, gerando +$2.200.000/ano com payback em 1.8 meses.",
    financialGainEstimateUsd: 2200000,
    gcpMonthlyCostUsd: 7800,
    costBreakdown: {
      bigqueryUsd: 4200,
      vertexAiUsd: 2500,
      cloudRunUsd: 700,
      storageUsd: 400
    },
    requiredTables: ["Pharmacy_Master", "Brick_Territory_Mapping", "SellOut_Weekly", "Medical_Specialties"],
    requiredColumns: ["pharmacy_cnpj", "geo_latitude", "geo_longitude", "brick_id", "huff_probability", "weekly_sales_volume"],
    guardrails: "Limitação de raio gravitacional calibrado com base no tráfego urbano real; reprocessamento mensal idempotente.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Utilizar funções geoespaciais BigQuery GIS (ST_GEOHASH, ST_DISTANCE, ST_CLUSTERDBSCAN) para cálculos vetoriais in-database sem mover dados.",
    gcpExpansionOpportunity: "Uso intensivo de BigQuery GIS e Vertex AI AutoML para calibração contínua dos pesos gravitacionais por CEP.",
    paybackMonths: 1.8
  },
  {
    useCaseId: "uc_hypera_04_sku_margin",
    assessmentId: "asm_hypera_2026",
    rank: 4,
    title: "Otimização Algorítmica de Margem de Contribuição & Alocação de Verba Promocional",
    category: "FinOps & Rentabilidade",
    businessProblem: "Alocação homogênea de investimento promocional e amostras grátis entre produtos com margens financeiras díspares, comprimindo a rentabilidade.",
    solutionDescription: "Priorização algorítmica de incentivos comerciais e amostras nos produtos com margem de contribuição líquida superior a 42% via BigQuery Studio SQLX.",
    businessCaseRoi: "Ganho de +3.4 pontos percentuais na margem média da carteira de medicamentos, representando +$820.000/ano com payback em 0.9 meses.",
    financialGainEstimateUsd: 820000,
    gcpMonthlyCostUsd: 1450,
    costBreakdown: {
      bigqueryUsd: 750,
      vertexAiUsd: 450,
      cloudRunUsd: 150,
      storageUsd: 100
    },
    requiredTables: ["SKU_Master", "Commercial_Budget", "Sample_Distribution"],
    requiredColumns: ["sku_id", "gross_margin_pct", "promotional_budget", "unit_cost", "net_margin_contribution"],
    guardrails: "Queries SQL estritamente otimizadas com partições por ano e mês de fechamento contábil.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Otimização de custos com particionamento por mês e criação de BigQuery Materialized Views com atualização incremental.",
    gcpExpansionOpportunity: "Ativação de BigQuery Studio Pipelines para cálculo automático de DRE por SKU em D+1.",
    paybackMonths: 0.9
  },
  {
    useCaseId: "uc_hypera_05_omnichannel_crm",
    assessmentId: "asm_hypera_2026",
    rank: 5,
    title: "Ativação Omnichannel de Suporte Científico Personalizado Pós-Visita (CRM Automation)",
    category: "Next-Best-Action",
    businessProblem: "Queda expressiva de recall do médico 7 dias após a interação presencial da equipe de representantes, reduzindo o ciclo de prescrições.",
    solutionDescription: "Disparo automatizado de conteúdos científicos e bulários técnicos aprovados via canais digitais com base no perfil do especialista sumarizado pelo Gemini 3.8 Flash.",
    businessCaseRoi: "Crescimento de 9.2% no recall contínuo de prescrição sustentado ao longo de 90 dias, gerando ganho de +$680.000/ano com payback em 1.1 meses.",
    financialGainEstimateUsd: 680000,
    gcpMonthlyCostUsd: 1250,
    costBreakdown: {
      bigqueryUsd: 600,
      vertexAiUsd: 450,
      cloudRunUsd: 120,
      storageUsd: 80
    },
    requiredTables: ["Doctor_Registry", "VisitEvents", "Omnichannel_Engagements"],
    requiredColumns: ["doctor_id", "opt_in_whatsapp", "last_visit_date", "specialty_tag", "content_engagement_score"],
    guardrails: "Opt-in obrigatório e auditado em Knowledge Catalog; zero envio sem consentimento prévio registrado.",
    confidenceScore: 0.92,
    status: "VALIDATED",
    keyImprovement: "Construção de camada unificada de dados de CRM no BigQuery integrando Veeva, Salesforce e eventos digitais.",
    gcpExpansionOpportunity: "Consumo de Cloud Run e Vertex AI para geração dinâmica de resumos de ensaios clínicos aprovados pelo compliance.",
    paybackMonths: 1.1
  },
  {
    useCaseId: "uc_hypera_06_conversational_agent",
    assessmentId: "asm_hypera_2026",
    rank: 6,
    title: "Data Agent Conversacional com Grounding no Knowledge Catalog (Autosserviço Executivo)",
    category: "GenAI & Data Agents",
    businessProblem: "Lentidão e dependência excessiva da equipe de BI para líderes comerciais obterem relatórios de sell-out por praça e auditorias de metas.",
    solutionDescription: "BigQuery Conversational Data Agent baseado em Gemini 3.8 Flash conectado ao Property Graph e Knowledge Catalog para responder perguntas de negócio em sub-segundo.",
    businessCaseRoi: "Redução de 85% no tempo de resposta analítica para a diretoria comercial e economia de 18.000 horas analíticas ao ano ($520.000/ano).",
    financialGainEstimateUsd: 520000,
    gcpMonthlyCostUsd: 980,
    costBreakdown: {
      bigqueryUsd: 480,
      vertexAiUsd: 350,
      cloudRunUsd: 100,
      storageUsd: 50
    },
    requiredTables: ["enterprise_business_graph", "assessment_tables_catalog", "top_use_cases"],
    requiredColumns: ["table_name", "graph_node_id", "business_metric", "kpi_name", "query_response_time"],
    guardrails: "Tratamento elegante de empty states; streaming de respostas e limite forçado de 50 linhas em tabelas.",
    confidenceScore: 0.97,
    status: "VALIDATED",
    keyImprovement: "Conexão do Data Agent ao BigQuery Property Graph e Knowledge Catalog para entendimento semântico com zero alucinação.",
    gcpExpansionOpportunity: "Substituição de ferramentas legadas de BI conversacional por BigQuery Data Agents nativos no GCP.",
    paybackMonths: 1.2
  }
];

// 3. Casos de Uso para NUBANK (Fintech & Banco Digital)
export const NUBANK_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_nubank_01_realtime_churn",
    assessmentId: "asm_nubank_2026",
    rank: 1,
    title: "Prevenção Ativa de Churn & Retenção Preditiva de Clientes Alta Renda (Ultravioleta)",
    category: "Causal AI & Retenção",
    businessProblem: "Migração silenciosa de saldos e transações de clientes Ultravioleta para outros bancos digitais antes do encerramento formal da conta.",
    solutionDescription: "Monitoramento de micro-sinais de desengajamento com modelos causais no Vertex AI e BigQuery Vector Search processando 50M+ de eventos diários.",
    businessCaseRoi: "Retenção de +$4.600.000/ano em receita de intercâmbio e investimentos com intervenções automatizadas em D+3.",
    financialGainEstimateUsd: 4600000,
    gcpMonthlyCostUsd: 13200,
    costBreakdown: {
      bigqueryUsd: 7100,
      vertexAiUsd: 4500,
      cloudRunUsd: 1100,
      storageUsd: 500
    },
    requiredTables: ["eventos_navegacao_app", "saldos_diarios", "transacoes_ultravioleta", "pesquisas_csat"],
    requiredColumns: ["customer_id", "delta_saldo_30d", "dias_sem_pix", "segmento_renda"],
    guardrails: "Opt-out de campanhas e governança estrita de privacidade sob LGPD com Policy Tags.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Implementação de BigQuery BI Engine e Vertex AI Vector Search para cálculo em tempo real de embeddings de comportamento do cliente.",
    gcpExpansionOpportunity: "Consumo maciço de BigQuery Slots dedicados para streaming analytics contínuo.",
    paybackMonths: 1.2
  },
  {
    useCaseId: "uc_nubank_02_instant_credit",
    assessmentId: "asm_nubank_2026",
    rank: 2,
    title: "Esteira de Crédito Pré-Aprovado & Ajuste Algorítmico de Limite em Tempo Real",
    category: "AI/ML Preditivo & Streaming",
    businessProblem: "Limites estáticos de cartão de crédito não acompanham a evolução de renda instantânea dos usuários, gerando recusas em compras de alto valor.",
    solutionDescription: "Modelos preditivos in-database no BigQuery ML e Vertex AI Online Feature Store com avaliação contínua de capacidade de pagamento e ampliação segura de limites.",
    businessCaseRoi: "Expansão de 16% no faturamento total de cartões com incremento de +$3.400.000/ano em margem líquida com payback em 1.4 meses.",
    financialGainEstimateUsd: 3400000,
    gcpMonthlyCostUsd: 10800,
    costBreakdown: {
      bigqueryUsd: 5800,
      vertexAiUsd: 3700,
      cloudRunUsd: 850,
      storageUsd: 450
    },
    requiredTables: ["faturas_consolidadas", "entradas_pix_recorrentes", "limites_historicos", "score_credito"],
    requiredColumns: ["user_uuid", "renda_estimada_ia", "limite_atual", "taxa_utilizacao_90d"],
    guardrails: "Testes A/B rigorosos com grupos de controle para medição de risco e inadimplência marginal.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Substituição de pipelines externos em Python por BigQuery ML in-database, eliminando custos de transferência e acelerando retreinamento.",
    gcpExpansionOpportunity: "Consumo contínuo de Vertex AI Feature Store e BigQuery ML para dezenas de milhões de correntistas.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_nubank_03_fraud_graph",
    assessmentId: "asm_nubank_2026",
    rank: 3,
    title: "Grafo de Risco Transacional & Prevenção de Contas Laranjas (BigQuery Graph GQL)",
    category: "Graph Analytics & GQL",
    businessProblem: "Criação de redes de contas de passagem usadas para pulverização de quantias de golpes e fraudes bancárias.",
    solutionDescription: "BigQuery Property Graph utilizando sintaxe nativa ISO GQL para identificar anéis de relacionamento e contas receptoras com alta centralidade de risco.",
    businessCaseRoi: "Bloqueio de +$2.600.000/ano em prejuízos financeiros e redução drástica de notificações judiciais.",
    financialGainEstimateUsd: 2600000,
    gcpMonthlyCostUsd: 8400,
    costBreakdown: {
      bigqueryUsd: 4600,
      vertexAiUsd: 2600,
      cloudRunUsd: 750,
      storageUsd: 450
    },
    requiredTables: ["enterprise_business_graph", "transferencias_pix", "dispositivos_vinculados", "denuncias_bacen"],
    requiredColumns: ["conta_origem", "conta_destino", "valor_pix", "timestamp_transacao", "score_grafo"],
    guardrails: "Quarentena temporária de fundos com comprovação documental em menos de 1 hora.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Adoção de BigQuery Property Graph DDL com GRAPH_TABLE para substituir bancos de grafos proprietários de alto custo de licença.",
    gcpExpansionOpportunity: "Grande vitrine para o recurso de Property Graph do BigQuery no setor financeiro da América Latina.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_nubank_04_support_agent",
    assessmentId: "asm_nubank_2026",
    rank: 4,
    title: "Agente IA Autônomo para Resolução Instantânea de Disputas de Fatura",
    category: "GenAI & Agentes",
    businessProblem: "Tempo excessivo de análise humana para chargebacks não reconhecidos pelo cliente, gerando atrito e custo operacional.",
    solutionDescription: "Agente inteligente construído no Cloud Run com Gemini 3.8 Flash para conciliação automática de comprovantes de pagamento e regras de bandeira.",
    businessCaseRoi: "Resolução de 65% das disputas em menos de 3 minutos, com economia operacional de +$890.000/ano.",
    financialGainEstimateUsd: 890000,
    gcpMonthlyCostUsd: 1550,
    costBreakdown: {
      bigqueryUsd: 750,
      vertexAiUsd: 550,
      cloudRunUsd: 150,
      storageUsd: 100
    },
    requiredTables: ["disputas_fatura", "logs_transacoes_adquirente", "regras_bandeira_mastercard", "comprovantes_gcs"],
    requiredColumns: ["disputa_id", "motivo_contestacao", "status_bandeira", "evidencias_aceitas"],
    guardrails: "Decisões de estorno acima de R$ 5.000 passam por validação humana em 2ª instância.",
    confidenceScore: 0.93,
    status: "VALIDATED",
    keyImprovement: "Grounding estrito do Gemini no BigQuery com resposta em streaming para reduzir latência de percepção do usuário.",
    gcpExpansionOpportunity: "Volume massivo de requisições de Vertex AI Gemini 3.8 Flash e Cloud Run.",
    paybackMonths: 1.0
  },
  {
    useCaseId: "uc_nubank_05_finops_catalog",
    assessmentId: "asm_nubank_2026",
    rank: 5,
    title: "Governança FinOps & Otimização de Armazenamento/Slots no Knowledge Catalog",
    category: "FinOps & Infraestrutura",
    businessProblem: "Crescimento exponencial de dados analíticos sem políticas automatizadas de particionamento e ciclo de vida, elevando custos de nuvem.",
    solutionDescription: "Auditoria contínua de consultas e tabelas com Knowledge Catalog e BigQuery INFORMATION_SCHEMA, identificando queries ineficientes e tabelas frias para migração ao Long-Term Storage.",
    businessCaseRoi: "Economia anual direta de +$750.000 em custos de processamento analítico com zero perda de performance.",
    financialGainEstimateUsd: 750000,
    gcpMonthlyCostUsd: 1200,
    costBreakdown: {
      bigqueryUsd: 650,
      vertexAiUsd: 350,
      cloudRunUsd: 120,
      storageUsd: 80
    },
    requiredTables: ["INFORMATION_SCHEMA_JOBS_BY_PROJECT", "TABLE_STORAGE_USAGE", "QUERY_HISTORY"],
    requiredColumns: ["job_id", "total_bytes_billed", "query_text", "cache_hit", "referenced_tables"],
    guardrails: "Nenhuma tabela é arquivada sem aprovação prévia do time de engenharia de dados responsável.",
    confidenceScore: 0.97,
    status: "VALIDATED",
    keyImprovement: "Aplicação das boas práticas oficiais de particionamento e clustering do BigQuery para reduzir bytes faturados em mais de 50%.",
    gcpExpansionOpportunity: "Migração para o modelo de BigQuery Editions (Enterprise Plus) com slots flexíveis e autoscaling de computação.",
    paybackMonths: 0.9
  },
  {
    useCaseId: "uc_nubank_06_investments_nba",
    assessmentId: "asm_nubank_2026",
    rank: 6,
    title: "Recomendação Personalizada de Produtos de Investimento (Next-Best-Action NuInvest)",
    category: "Next-Best-Action",
    businessProblem: "Baixa taxa de conversão de clientes com saldo ocioso em conta corrente para produtos de renda fixa e fundos imobiliários.",
    solutionDescription: "Motor de Next-Best-Action no BigQuery ML que analisa perfil de risco, liquidez necessária e metas financeiras para ofertar o produto mais adequado.",
    businessCaseRoi: "Aumento de 24% na captação líquida de novos ativos sob custódia (AuC), representando ganho de +$580.000/ano.",
    financialGainEstimateUsd: 580000,
    gcpMonthlyCostUsd: 920,
    costBreakdown: {
      bigqueryUsd: 480,
      vertexAiUsd: 320,
      cloudRunUsd: 80,
      storageUsd: 40
    },
    requiredTables: ["perfil_suitability", "catalogo_investimentos", "saldos_ociosos", "historico_aportes"],
    requiredColumns: ["cliente_id", "perfil_risco", "patrimonio_total", "prazo_almejado"],
    guardrails: "Conformidade obrigatória com suitability da CVM e Anbima; produtos de risco nunca são ofertados a clientes conservadores.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Criação de views analíticas de clientes com zero custo de query através de Materialized Views com atualização incremental no BigQuery.",
    gcpExpansionOpportunity: "Expansão de BigQuery e Looker para relatórios de conformidade regulatória para órgãos fiscalizadores.",
    paybackMonths: 1.1
  }
];

// 4. Casos de Uso para AMBEV (Bens de Consumo & CPG)
export const AMBEV_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_ambev_01_sellout_forecast",
    assessmentId: "asm_ambev_2026",
    rank: 1,
    title: "Previsão de Sell-Out Hiperlocal & Reposição Dinâmica para Bares e Restaurantes (BEES)",
    category: "Supply Chain & Demanda",
    businessProblem: "Ruptura de estoque de marcas premium em fins de semana e feriados em 400.000 pontos de venda parceiros, gerando perda irrecuperável de consumo.",
    solutionDescription: "Previsão hiperlocal de consumo no BigQuery com slots dedicados e Vertex AI integrando meteorologia em tempo real, eventos esportivos e histórico de compras da plataforma BEES.",
    businessCaseRoi: "Elevação de 8.4% no sell-out mensal e ganho financeiro direto de +$4.100.000/ano (~R$ 22.9M/ano) com payback em 1.4 meses.",
    financialGainEstimateUsd: 4100000,
    gcpMonthlyCostUsd: 12200,
    costBreakdown: {
      bigqueryUsd: 6600,
      vertexAiUsd: 4100,
      cloudRunUsd: 1000,
      storageUsd: 500
    },
    requiredTables: ["pedidos_bees", "cadastro_pontos_venda", "previsao_meteorologica", "calendario_eventos"],
    requiredColumns: ["pdv_id", "sku_cerveja", "volume_grade", "temperatura_prevista", "fim_de_semana"],
    guardrails: "Respeito às janelas de entrega de centros de distribuição locais e capacidade de carga da frota.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Uso de BigQuery Time-Series Forecasting (ARIMA_PLUS) com agregação automática de feriados e eventos esportivos municipais.",
    gcpExpansionOpportunity: "Conexão direta do ecossistema B2B BEES com BigQuery e Vertex AI para pedidos preditivos automatizados.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_ambev_02_logistics_routing",
    assessmentId: "asm_ambev_2026",
    rank: 2,
    title: "Otimização Combinatória de Roteirização de Distribuição & Redução de Emissões",
    category: "Logística & ESG",
    businessProblem: "Custo elevado de combustível e quilometragem rodada da frota pesada em grandes regiões metropolitanas com restrições urbanas de circulação.",
    solutionDescription: "Otimização combinatória com Vertex AI e BigQuery GIS gerando rotas eficientes com menor emissão de CO2 e redução de tempo de descarga.",
    businessCaseRoi: "Economia anual de combustível e manutenção de frota calculada em +$3.200.000/ano com payback em 1.5 meses.",
    financialGainEstimateUsd: 3200000,
    gcpMonthlyCostUsd: 9900,
    costBreakdown: {
      bigqueryUsd: 5300,
      vertexAiUsd: 3300,
      cloudRunUsd: 850,
      storageUsd: 450
    },
    requiredTables: ["frota_caminhoes", "pontos_entrega_geoloc", "restricoes_horario_cidade", "custos_diesel"],
    requiredColumns: ["veiculo_id", "capacidade_paletes", "latitude_pdv", "longitude_pdv", "janela_descarga"],
    guardrails: "Conformidade com leis trabalhistas de descanso de motoristas e restrições de tráfego de caminhões municipais.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Implementar funções nativas do BigQuery GIS (ST_CLUSTERDBSCAN, ST_DISTANCE) para agrupamento geográfico de cargas em tempo real.",
    gcpExpansionOpportunity: "Integração conjunta de BigQuery, Cloud Run e Google Maps Platform para rastreabilidade de entrega.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_ambev_03_pricing_b2b",
    assessmentId: "asm_ambev_2026",
    rank: 3,
    title: "Precificação Dinâmica B2B & Maximização de Margem por Praça e Categoria",
    category: "FinOps & Receita",
    businessProblem: "Tabelas de preço estáticas desconsideram elasticidade de demanda local e pressão de concorrentes regionais, comprimindo a margem de contribuição.",
    solutionDescription: "Modelos de elasticidade de preço causal no BigQuery ajustando descontos e incentivos comerciais por categoria e região de venda.",
    businessCaseRoi: "Aumento de +3.8 pontos percentuais na margem de contribuição média, gerando ganho de +$2.500.000/ano com payback em 1.6 meses.",
    financialGainEstimateUsd: 2500000,
    gcpMonthlyCostUsd: 7600,
    costBreakdown: {
      bigqueryUsd: 4100,
      vertexAiUsd: 2400,
      cloudRunUsd: 700,
      storageUsd: 400
    },
    requiredTables: ["tabela_precos_base", "historico_descontos_concedidos", "elasticidade_demanda_sku", "vendas_diarias"],
    requiredColumns: ["sku_id", "regiao_comercial", "preco_efetivo", "volume_vendido", "margem_liquida"],
    guardrails: "Preços calculados respeitam pisos de margem estabelecidos pela diretoria financeira da companhia.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Criação de BigQuery Materialized Views com clustering por região comercial e mês contábil.",
    gcpExpansionOpportunity: "Adoção de BigQuery como motor analítico central de precificação do ecossistema B2B.",
    paybackMonths: 1.6
  },
  {
    useCaseId: "uc_ambev_04_inventory_loss",
    assessmentId: "asm_ambev_2026",
    rank: 4,
    title: "Prevenção de Perdas por Vencimento & Giro de Estoque em Centros de Distribuição",
    category: "Supply Chain & S&OP",
    businessProblem: "Descartes de lotes de bebidas em centros de distribuição decorrentes de descompasso entre fabricação e giro de vendas.",
    solutionDescription: "Monitoramento de shelf-life com BigQuery Analytics acionando campanhas de escoamento no BEES para lotes com proximidade de vencimento.",
    businessCaseRoi: "Redução de 45% no descarte de produtos e recuperação de +$840.000/ano em custos de perda de produto com payback em 1.0 mês.",
    financialGainEstimateUsd: 840000,
    gcpMonthlyCostUsd: 1480,
    costBreakdown: {
      bigqueryUsd: 750,
      vertexAiUsd: 480,
      cloudRunUsd: 150,
      storageUsd: 100
    },
    requiredTables: ["estoque_lotes_cds", "shelf_life_produtos", "giro_vendas_recentes", "campanhas_promocionais"],
    requiredColumns: ["lote_id", "sku_codigo", "data_fabricacao", "data_validade", "quantidade_paletes"],
    guardrails: "Produtos com validade inferior a 30 dias não são ofertados para venda regular.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Automação de pipelines com BigQuery Studio Pipelines e alertas idempotentes para a equipe de trade marketing.",
    gcpExpansionOpportunity: "Modernização das esteiras de dados com BigQuery e Knowledge Catalog Data Lineage para rastreabilidade de lotes.",
    paybackMonths: 1.0
  },
  {
    useCaseId: "uc_ambev_05_trade_marketing",
    assessmentId: "asm_ambev_2026",
    rank: 5,
    title: "Auditoria Visual de Gôndolas & Geladeiras com Gemini 3.8 Multimodal",
    category: "Visão Computacional & IA",
    businessProblem: "Dificuldade para aferir conformidade de planogramas de geladeiras e presença de marcas concorrentes nos pontos de venda parceiros.",
    solutionDescription: "Classificação automática de fotos de geladeiras enviadas pelos promotores usando modelos de Gemini 3.8 Flash Multimodal no Vertex AI.",
    businessCaseRoi: "Elevação de 22% no cumprimento de contratos de visibilidade de gôndola, gerando +$710.000/ano.",
    financialGainEstimateUsd: 710000,
    gcpMonthlyCostUsd: 1280,
    costBreakdown: {
      bigqueryUsd: 550,
      vertexAiUsd: 550,
      cloudRunUsd: 120,
      storageUsd: 60
    },
    requiredTables: ["fotos_gondolas_gcs", "contratos_visibilidade_pdv", "reconhecimento_skus_ia", "auditorias_campo"],
    requiredColumns: ["foto_uri", "pdv_id", "share_of_shelf_detectado", "concorrentes_detectados", "data_auditoria"],
    guardrails: "Rosto de pessoas presentes nas imagens é automaticamente borrado antes da análise para proteção de privacidade.",
    confidenceScore: 0.93,
    status: "VALIDATED",
    keyImprovement: "Processamento de imagens diretamente do Cloud Storage chamando Vertex AI Gemini 3.8 Multimodal com persistência de metadados no BigQuery.",
    gcpExpansionOpportunity: "Consumo de tokens multimodais do Gemini no Vertex AI para dezenas de milhares de promotores de campo.",
    paybackMonths: 1.1
  },
  {
    useCaseId: "uc_ambev_06_conversational_bees",
    assessmentId: "asm_ambev_2026",
    rank: 6,
    title: "Data Agent Conversacional de Insights para Gerentes de Vendas e Trade",
    category: "GenAI & Data Agents",
    businessProblem: "Gerentes regionais levam horas consultando múltiplos relatórios para identificar quais rotas estão abaixo da meta.",
    solutionDescription: "Data Agent conversacional no BigQuery com interface em linguagem natural, respondendo perguntas como 'quais cidades de MG tiveram maior queda de cerveja puro malte esta semana?'.",
    businessCaseRoi: "Ganho de agilidade comercial e economia de 18.000 horas/ano da liderança de vendas (+$530.000/ano).",
    financialGainEstimateUsd: 530000,
    gcpMonthlyCostUsd: 940,
    costBreakdown: {
      bigqueryUsd: 460,
      vertexAiUsd: 360,
      cloudRunUsd: 80,
      storageUsd: 40
    },
    requiredTables: ["enterprise_business_graph", "metas_vendas_regionais", "faturamento_diario_skus"],
    requiredColumns: ["gerente_id", "territorio_nome", "meta_volume", "volume_realizado", "gap_meta"],
    guardrails: "Isolamento de dados por território garantido por Row-Level Security no BigQuery.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Conexão do Data Agent ao BigQuery Property Graph e Knowledge Catalog para entendimento semântico de hierarquias de produtos e canais de distribuição.",
    gcpExpansionOpportunity: "Demonstração de liderança de GenAI corporativa com BigQuery Data Agents em larga escala.",
    paybackMonths: 1.2
  }
];

// 5. Função de Resolução Dinâmica de Casos de Uso por Cliente / Indústria
export function getCustomerUseCases(customerNameOrId: string): ExtendedUseCase[] {
  const normalized = (customerNameOrId || "").toLowerCase();

  if (normalized.includes("digio")) {
    return DIGIO_USE_CASES;
  }
  if (normalized.includes("nubank") || normalized.includes("fintech") || normalized.includes("banco") || normalized.includes("financeir")) {
    return NUBANK_USE_CASES;
  }
  if (normalized.includes("ambev") || normalized.includes("cpg") || normalized.includes("bebidas") || normalized.includes("consumo")) {
    return AMBEV_USE_CASES;
  }
  if (normalized.includes("hypera") || normalized.includes("farma") || normalized.includes("saude") || normalized.includes("saúde")) {
    return HYPERA_USE_CASES;
  }

  // Fallback padrão: Digio (se financeiro) ou Hypera
  return normalized.includes("finan") ? DIGIO_USE_CASES : HYPERA_USE_CASES;
}
