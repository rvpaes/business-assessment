// lib/data/customer-usecases-catalog.ts - Catálogo Especializado de Casos de Uso por Cliente & Indústria
// Projetado para vendedores do Google Cloud e tomadores de decisão C-Level
// Cada caso balanceia: 1) Impacto no Negócio do Cliente ($ EBITDA/Receita) e 2) Consumo na Plataforma GCP (BigQuery, Agent Platform, Cloud Run, Knowledge Catalog)
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
    solutionDescription: "Pipeline corporativo de feature store no BigQuery com inferência online em sub-segundo no Agent Platform, integrando histórico transacional, pagamentos via Pix e birôs externos para ajuste contínuo de limite.",
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
    guardrails: "Auditoria contínua de viés algorítmico no Agent Platform Explainable AI; conformidade estrita com resolução Bacen 4.658.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Migrar rotinas batch noturnas para BigQuery Continuous Queries com CDC e Agent Platform Online Feature Store, reduzindo latência de concessão de 48h para 180ms.",
    gcpExpansionOpportunity: "Consumo de BigQuery Slots dedicados + Agent Platform Prediction Endpoints corporativos para 15M+ de avaliações de crédito/mês.",
    paybackMonths: 1.3
  },
  {
    useCaseId: "uc_digio_02_fraud_detection",
    assessmentId: "asm_digio_2026",
    rank: 2,
    title: "Motor Causal de Anomalias & Prevenção Antifraude Pix/Cartão em Sub-Segundo",
    category: "Causal AI & Segurança",
    businessProblem: "Aumento de fraudes sofisticadas de engenharia social e transações suspeitas fora do perfil de gastos, com custo elevado de estornos (chargebacks) e atrito com clientes VIP.",
    solutionDescription: "Detecção de anomalias com Agent Platform Autoencoders e BigQuery Vector Search processando redes de relacionamento entre contas recebedoras de Pix e geolocalização de dispositivos.",
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
    gcpExpansionOpportunity: "Crescimento contínuo de dados analíticos no BigQuery com ativação de Agent Platform AutoML.",
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
    solutionDescription: "Data Agent conversacional no Cloud Run alimentado por Gemini 3.8 Flash no Agent Platform, com grounding estrito no schema do BigQuery e Knowledge Catalog para respostas exatas.",
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
    gcpExpansionOpportunity: "Porta de entrada para adoção de GenAI corporativa no Agent Platform com 500k+ sessões mensais de chat.",
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
    solutionDescription: "Previsão hiperlocal de demanda com Agent Platform Time Series e BigQuery Slots Dedicados cruzando sell-out diário, sazonalidade epidemiológica e lead time de centros de distribuição para disparo preditivo de reposição.",
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
    gcpExpansionOpportunity: "Substituição completa do módulo legado de S&OP por pipelines modernos em BigQuery Studio e Agent Platform.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_hypera_02_field_routes",
    assessmentId: "asm_hypera_2026",
    rank: 2,
    title: "Motor Causal de Conversão Médica & Otimização de Rotas da Força de Campo",
    category: "Causal AI & Força de Vendas",
    businessProblem: "Dispersão de roteiro operacional das equipes de representantes em campo, gerando ociosidade em setores com alto potencial de prescrição médica não atendido.",
    solutionDescription: "Modelagem causal com Agent Platform e BigQuery GIS cruzando histórico de prescrições, especialidades médicas e sell-out regional para maximizar a conversão das visitas presenciais.",
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
    solutionDescription: "Algoritmo gravitacional de Huff no BigQuery ML e Agent Platform para atribuir probabilidades espaciais de compra por ponto de venda em raio de até 5km.",
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
    gcpExpansionOpportunity: "Uso intensivo de BigQuery GIS e Agent Platform AutoML para calibração contínua dos pesos gravitacionais por CEP.",
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
    gcpExpansionOpportunity: "Consumo de Cloud Run e Agent Platform para geração dinâmica de resumos de ensaios clínicos aprovados pelo compliance.",
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
    solutionDescription: "Monitoramento de micro-sinais de desengajamento com modelos causais no Agent Platform e BigQuery Vector Search processando 50M+ de eventos diários.",
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
    keyImprovement: "Implementação de BigQuery BI Engine e Agent Platform Vector Search para cálculo em tempo real de embeddings de comportamento do cliente.",
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
    solutionDescription: "Modelos preditivos in-database no BigQuery ML e Agent Platform Online Feature Store com avaliação contínua de capacidade de pagamento e ampliação segura de limites.",
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
    gcpExpansionOpportunity: "Consumo contínuo de Agent Platform Feature Store e BigQuery ML para dezenas de milhões de correntistas.",
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
    gcpExpansionOpportunity: "Volume massivo de requisições de Agent Platform Gemini 3.8 Flash e Cloud Run.",
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
    solutionDescription: "Previsão hiperlocal de consumo no BigQuery com slots dedicados e Agent Platform integrando meteorologia em tempo real, eventos esportivos e histórico de compras da plataforma BEES.",
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
    gcpExpansionOpportunity: "Conexão direta do ecossistema B2B BEES com BigQuery e Agent Platform para pedidos preditivos automatizados.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_ambev_02_logistics_routing",
    assessmentId: "asm_ambev_2026",
    rank: 2,
    title: "Otimização Combinatória de Roteirização de Distribuição & Redução de Emissões",
    category: "Logística & ESG",
    businessProblem: "Custo elevado de combustível e quilometragem rodada da frota pesada em grandes regiões metropolitanas com restrições urbanas de circulação.",
    solutionDescription: "Otimização combinatória com Agent Platform e BigQuery GIS gerando rotas eficientes com menor emissão de CO2 e redução de tempo de descarga.",
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
    solutionDescription: "Classificação automática de fotos de geladeiras enviadas pelos promotores usando modelos de Gemini 3.8 Flash Multimodal no Agent Platform.",
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
    keyImprovement: "Processamento de imagens diretamente do Cloud Storage chamando Agent Platform Gemini 3.8 Multimodal com persistência de metadados no BigQuery.",
    gcpExpansionOpportunity: "Consumo de tokens multimodais do Gemini no Agent Platform para dezenas de milhares de promotores de campo.",
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


// =========================================================================
// 5. Casos de Uso para Varejo & E-commerce (ex: Magazine Luiza, Mercado Livre, etc.)
// =========================================================================
export const RETAIL_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_retail_01_nba_recommendations",
    assessmentId: "asm_retail_2026",
    rank: 1,
    title: "Motor de Next-Best-Offer e Hiperpersonalização em Tempo Real no App/Web",
    category: "AI/ML Preditivo & Recomendações",
    businessProblem: "Taxa de conversão estagnada e abandono de carrinho de 68% devido a vitrines estáticas e recomendações genéricas não contextualizadas com o momento de compra do cliente.",
    solutionDescription: "Mecanismo de embeddings de produtos e clientes com BigQuery Vector Search e Vertex AI Gemini 3.8 Flash, calculando propensão de compra e personalizando vitrines em <80ms.",
    businessCaseRoi: "Aumento de +18% na taxa de conversão online gerando +$4.300.000/ano em receita incremental com payback em 1.1 meses.",
    financialGainEstimateUsd: 4300000,
    gcpMonthlyCostUsd: 12400,
    costBreakdown: { bigqueryUsd: 6400, vertexAiUsd: 4300, cloudRunUsd: 1200, storageUsd: 500 },
    requiredTables: ["pedidos_vendas", "navegacao_clickstream", "catalogo_produtos", "perfil_clientes"],
    requiredColumns: ["cliente_id", "produto_id", "categoria", "valor_carrinho", "tempo_sessao", "status_compra"],
    guardrails: "Filtro de diversidade de catálogo e restrição de exibição de itens fora de estoque.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Implementar BigQuery Continuous Queries para capturar eventos de navegação em tempo real e atualizar vetores no Vertex AI Feature Store.",
    gcpExpansionOpportunity: "BigQuery Slots dedicados e Vertex AI Vector Search com bilhões de buscas mensais.",
    paybackMonths: 1.1
  },
  {
    useCaseId: "uc_retail_02_dynamic_pricing",
    assessmentId: "asm_retail_2026",
    rank: 2,
    title: "Precificação Dinâmica Competitiva & Otimização de Elasticidade por Praça",
    category: "Inteligência Comercial & BigQuery ML",
    businessProblem: "Perda de margem bruta por precificação inflexível frente a promoções agressivas da concorrência e desconsideração da elasticidade de preço regional.",
    solutionDescription: "Modelo de elasticidade-preço com BigQuery ML cruzando dados de concorrência, histórico de sell-out, estoque disponível e custos de frete por microrregião.",
    businessCaseRoi: "Expansão de 1.8 ponto percentual na margem bruta, representando +$3.600.000/ano em lucro líquido operacional com payback em 1.2 meses.",
    financialGainEstimateUsd: 3600000,
    gcpMonthlyCostUsd: 9800,
    costBreakdown: { bigqueryUsd: 5200, vertexAiUsd: 3200, cloudRunUsd: 950, storageUsd: 450 },
    requiredTables: ["historico_precos_concorrentes", "pedidos_vendas", "custos_logisticos_cep", "estoque_lojas_cds"],
    requiredColumns: ["sku_id", "preco_praticado", "preco_concorrente", "regiao_cep", "elasticidade_estimada"],
    guardrails: "Teto e piso de margem mínima invioláveis garantidos por regras determinísticas no Cloud Run.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Automação de repricing com pipeline de dados particionado por hora no BigQuery.",
    gcpExpansionOpportunity: "Cloud Run jobs em alta escala integrados ao ERP para atualização contínua de preços.",
    paybackMonths: 1.2
  },
  {
    useCaseId: "uc_retail_03_omnichannel_demand",
    assessmentId: "asm_retail_2026",
    rank: 3,
    title: "Previsão de Demanda Omnicanal & Alocação Inteligente em Lojas e CDs",
    category: "Supply Chain & S&OP",
    businessProblem: "Ruptura de estoque de 14% em produtos de alta rotatividade enquanto lojas físicas acumulam itens encalhados, inflacionando o capital de giro.",
    solutionDescription: "Modelagem preditiva hierárquica com BigQuery ML (ARIMA_PLUS) e Vertex AI, considerando sazonalidade, eventos comerciais (Black Friday) e prazos de ressuprimento.",
    businessCaseRoi: "Redução de 35% nas rupturas e liberação de $2.900.000/ano em capital de giro com payback em 1.4 meses.",
    financialGainEstimateUsd: 2900000,
    gcpMonthlyCostUsd: 8500,
    costBreakdown: { bigqueryUsd: 4500, vertexAiUsd: 2800, cloudRunUsd: 800, storageUsd: 400 },
    requiredTables: ["estoque_lojas_cds", "pedidos_vendas", "lead_time_fornecedores", "calendario_promocional"],
    requiredColumns: ["sku_id", "loja_id", "cd_origem", "demanda_prevista", "estoque_minimo_seguranca"],
    guardrails: "Validação cruzada com histórico de 3 anos e detecção de anomalias para evitar superabastecimento.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Otimização de transferências entre lojas (ship-from-store) com BigQuery GIS.",
    gcpExpansionOpportunity: "Ingestão em streaming de inventário de 1.000+ lojas no BigQuery Storage Write API.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_retail_04_churn_prevention",
    assessmentId: "asm_retail_2026",
    rank: 4,
    title: "Detecção Precoce de Churn de Clientes & Campanhas de Reengajamento",
    category: "CRM & Retenção de Clientes",
    businessProblem: "Inatividade progressiva de clientes recorrentes sem identificação prévia pelo marketing, elevando o Custo de Aquisição de Clientes (CAC).",
    solutionDescription: "Classificação preditiva de risco de churn com BigQuery ML (BOOSTED_TREE_CLASSIFIER) acionando cupons e réguas de reengajamento via Cloud Run e Braze/Salesforce.",
    businessCaseRoi: "Recuperação de 12% dos clientes em risco de inatividade, preservando +$820.000/ano em LTV com payback em 1.5 meses.",
    financialGainEstimateUsd: 820000,
    gcpMonthlyCostUsd: 1600,
    costBreakdown: { bigqueryUsd: 850, vertexAiUsd: 500, cloudRunUsd: 180, storageUsd: 70 },
    requiredTables: ["perfil_clientes", "pedidos_vendas", "engajamento_campanhas_crm"],
    requiredColumns: ["cliente_id", "dias_desde_ultima_compra", "frequencia_historica", "score_churn"],
    guardrails: "Limitação de envio de notificações para evitar fadiga de comunicação (governança de contato).",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Scores de propensão recalculados diariamente em batch serverless de baixo custo no BigQuery.",
    gcpExpansionOpportunity: "Ativação de audiências first-party no Google Ad Manager e BigQuery Data Clean Rooms.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_retail_05_sku_profitability",
    assessmentId: "asm_retail_2026",
    rank: 5,
    title: "FinOps Comercial: Rentabilidade Real por SKU e Eficiência de Retail Media",
    category: "FinOps & Rentabilidade de Categorias",
    businessProblem: "Dificuldade em mensurar a lucratividade líquida real de cada produto após descontos, comissões de marketplace, devoluções e custos de frete.",
    solutionDescription: "Datalake analítico no BigQuery consolidando todas as linhas de receita e despesas por transação, calculando a margem de contribuição líquida exata por SKU.",
    businessCaseRoi: "Descontinuação ou renegociação de SKUs deficitários com ganho de +$690.000/ano no EBITDA com payback em 1.6 meses.",
    financialGainEstimateUsd: 690000,
    gcpMonthlyCostUsd: 1200,
    costBreakdown: { bigqueryUsd: 650, vertexAiUsd: 350, cloudRunUsd: 140, storageUsd: 60 },
    requiredTables: ["pedidos_vendas", "tabela_comissoes_fornecedores", "custos_logisticos_cep", "devolucoes_logistica_reversa"],
    requiredColumns: ["sku_id", "receita_liquida", "custo_cmv", "custo_frete", "margem_contribuicao_pct"],
    guardrails: "Validação contábil com ERP e fechamento mensal auditado no Knowledge Catalog.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Dashboards executivos responsivos com consultas cacheadas em BI Engine.",
    gcpExpansionOpportunity: "BigQuery BI Engine para consultas sub-segundo de diretores comerciais.",
    paybackMonths: 1.6
  },
  {
    useCaseId: "uc_retail_06_conversational_buyers",
    assessmentId: "asm_retail_2026",
    rank: 6,
    title: "Data Agent Conversacional para Compradores e Gestores de Categoria",
    category: "GenAI & BigQuery Data Agents",
    businessProblem: "Compradores levam horas cruzando planilhas manuais para negociar pedidos com a indústria antes de reuniões com fornecedores.",
    solutionDescription: "BigQuery Data Agent alimentado por Gemini 3.8 Flash e Knowledge Catalog, respondendo perguntas como 'Qual fornecedor teve maior atraso de entrega em SP no último mês?'.",
    businessCaseRoi: "Economia de 3.200 horas de analistas por ano e melhores negociações com a indústria gerando +$540.000/ano com payback em 1.7 meses.",
    financialGainEstimateUsd: 540000,
    gcpMonthlyCostUsd: 950,
    costBreakdown: { bigqueryUsd: 480, vertexAiUsd: 340, cloudRunUsd: 80, storageUsd: 50 },
    requiredTables: ["pedidos_vendas", "catalogo_produtos", "desempenho_fornecedores_sla"],
    requiredColumns: ["fornecedor_id", "sla_entrega_pct", "volume_comprado", "ruptura_gerada"],
    guardrails: "Respostas restritas estritamente aos dados do catálogo sem alucinação de indicadores.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Adoção da API nativa BigQuery Data Agent com Grounding em metadados corporativos.",
    gcpExpansionOpportunity: "Licenciamento de Data Agents para centenas de gerentes de loja e compradores.",
    paybackMonths: 1.7
  }
];

// =========================================================================
// 6. Casos de Uso para Manufatura, Siderurgia & Indústria (ex: Embraer, Gerdau, Suzano, etc.)
// =========================================================================
export const MANUFACTURING_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_mfg_01_oee_realtime",
    assessmentId: "asm_mfg_2026",
    rank: 1,
    title: "OEE Preditivo em Tempo Real & Prevenção de Paradas de Linha Industrial",
    category: "IoT Industrial & Streaming Analytics",
    businessProblem: "Paradas não programadas em linhas de laminação e montagem causam perdas massivas de produtividade e custo elevado de horas-máquina ociosas.",
    solutionDescription: "Ingestão contínua de sensores industriais (PLCs/SCADA via MQTT) no BigQuery Continuous Queries, calculando OEE (Disponibilidade, Performance e Qualidade) a cada 5 segundos.",
    businessCaseRoi: "Elevação de 4.2 pontos no OEE industrial com economia direta de +$4.600.000/ano em paradas evitadas com payback em 1.0 mês.",
    financialGainEstimateUsd: 4600000,
    gcpMonthlyCostUsd: 13200,
    costBreakdown: { bigqueryUsd: 7200, vertexAiUsd: 4300, cloudRunUsd: 1200, storageUsd: 500 },
    requiredTables: ["telemetria_sensores_iot", "ordens_producao_sap", "historico_paradas_maquinas"],
    requiredColumns: ["maquina_id", "temperatura", "vibracao_rms", "velocidade_rpm", "status_linha", "oee_atual"],
    guardrails: "Tratamento de outliers de leitura de sensores e idempotência na gravação de telemetria.",
    confidenceScore: 0.97,
    status: "VALIDATED",
    keyImprovement: "Processamento de telemetria de sensores industriais em escala petabyte com BigQuery Storage Write API.",
    gcpExpansionOpportunity: "BigQuery Slots dedicados + Vertex AI Endpoints dedicados para inferência de alta frequência.",
    paybackMonths: 1.0
  },
  {
    useCaseId: "uc_mfg_02_predictive_maintenance",
    assessmentId: "asm_mfg_2026",
    rank: 2,
    title: "Manutenção Preditiva Causal de Ativos Críticos e Motores Industriais",
    category: "Causal AI & Engenharia de Confiabilidade",
    businessProblem: "Falhas catastróficas em redutores, compressores e fornos com custos milionários de manutenção corretiva emergencial e quebra de componentes caros.",
    solutionDescription: "Modelos causais de sobrevida (Survival Analysis) no Vertex AI prevendo falha iminente com 72 horas de antecedência, disparando ordem automática no SAP PM.",
    businessCaseRoi: "Redução de 44% no custo de manutenção corretiva gerando economia de +$3.800.000/ano com payback em 1.1 meses.",
    financialGainEstimateUsd: 3800000,
    gcpMonthlyCostUsd: 10500,
    costBreakdown: { bigqueryUsd: 5600, vertexAiUsd: 3500, cloudRunUsd: 950, storageUsd: 450 },
    requiredTables: ["historico_manutencoes_sap", "telemetria_sensores_iot", "catalogo_ativos_equipamentos"],
    requiredColumns: ["equipamento_id", "horas_operacao", "nivel_desgaste_estimado", "probabilidade_falha_72h"],
    guardrails: "Supervisão humana obrigatória da equipe de engenharia para ordens de alto custo.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Integração bidirecional do Vertex AI com SAP Plant Maintenance via Cloud Run API.",
    gcpExpansionOpportunity: "Cluster de monitoramento contínuo para milhares de equipamentos em múltiplas plantas.",
    paybackMonths: 1.1
  },
  {
    useCaseId: "uc_mfg_03_energy_efficiency",
    assessmentId: "asm_mfg_2026",
    rank: 3,
    title: "Otimização de Rendimento Térmico & Eficiência Energética de Fornos",
    category: "Sustentabilidade & Redução de Custos",
    businessProblem: "Consumo excessivo de gás natural e energia elétrica em fornos e caldeiras industriais devido a ajustes empíricos manuais dos operadores de turno.",
    solutionDescription: "Otimizador em tempo real com BigQuery ML calibrando a curva estequiométrica de combustão e parâmetros térmicos conforme o lote de matéria-prima.",
    businessCaseRoi: "Redução de 6.5% na conta de gás e energia, economizando +$2.800.000/ano e reduzindo pegada de CO2 com payback em 1.3 meses.",
    financialGainEstimateUsd: 2800000,
    gcpMonthlyCostUsd: 8200,
    costBreakdown: { bigqueryUsd: 4400, vertexAiUsd: 2600, cloudRunUsd: 800, storageUsd: 400 },
    requiredTables: ["consumo_gas_eletricidade", "parametros_quimicos_materia_prima", "qualidade_lote_final"],
    requiredColumns: ["forno_id", "consumo_m3_hora", "temperatura_zona_3", "eficiencia_combustao_pct"],
    guardrails: "Limites de segurança térmica controlados por intertravamento físico em hardware.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Gêmeo digital térmico executado no BigQuery integrado a dashboards Looker em tempo real.",
    gcpExpansionOpportunity: "Armazenamento em escala petabyte de telemetria de processos para auditorias ambientais.",
    paybackMonths: 1.3
  },
  {
    useCaseId: "uc_mfg_04_master_production_sop",
    assessmentId: "asm_mfg_2026",
    rank: 4,
    title: "Planejamento Mestre de Produção (MPS) & S&OP Integrado Multinível",
    category: "Supply Chain & S&OP",
    businessProblem: "Descompasso entre pedidos em carteira e capacidade instalada das plantas fabris, gerando atrasos em entregas para clientes industriais B2B.",
    solutionDescription: "Otimizador matemático de alocação de capacidade de produção no BigQuery cruzando disponibilidade de linhas, matriz de setup e carteira de pedidos.",
    businessCaseRoi: "Melhoria de 16% no índice On-Time In-Full (OTIF) com redução de penalidades contratuais em +$880.000/ano com payback em 1.5 meses.",
    financialGainEstimateUsd: 880000,
    gcpMonthlyCostUsd: 1700,
    costBreakdown: { bigqueryUsd: 900, vertexAiUsd: 550, cloudRunUsd: 180, storageUsd: 70 },
    requiredTables: ["ordens_producao_sap", "carteira_pedidos_b2b", "capacidade_linhas_fabris"],
    requiredColumns: ["pedido_id", "planta_id", "linha_id", "data_entrega_acordada", "otif_status"],
    guardrails: "Regras de restrição de setup mínimo entre famílias de produtos para evitar trocas constantes.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Substituição de planilhas de programação fabril por modelos analíticos executados no BigQuery.",
    gcpExpansionOpportunity: "Consultas analíticas complexas integrando múltiplas plantas globais.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_mfg_05_quality_scrap_reduction",
    assessmentId: "asm_mfg_2026",
    rank: 5,
    title: "Inspeção Automatizada de Qualidade & Redução de Sucata com Computer Vision",
    category: "Qualidade Industrial & Visão Computacional",
    businessProblem: "Detecção tardia de defeitos superficiais em bobinas, chapas ou peças usinadas, gerando toneladas de sucata e retrabalho fabril dispendioso.",
    solutionDescription: "Modelos de Vertex AI Vision inspecionando imagens de câmeras de alta resolução na linha, detectando microtrincas e defeitos em milissegundos.",
    businessCaseRoi: "Redução de 38% no volume de refugo e sucata gerando ganho líquido de +$720.000/ano com payback em 1.6 meses.",
    financialGainEstimateUsd: 720000,
    gcpMonthlyCostUsd: 1300,
    costBreakdown: { bigqueryUsd: 680, vertexAiUsd: 420, cloudRunUsd: 140, storageUsd: 60 },
    requiredTables: ["registros_inspecao_qualidade", "lotes_produzidos", "defeitos_classificados"],
    requiredColumns: ["lote_id", "tipo_defeito", "confianca_modelo", "acao_descarte_retrabalho"],
    guardrails: "Classificação dupla em peças com score de confiança limítrofe com envio para inspetor humano.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Pipeline de anotação e retraining contínuo de modelos no Vertex AI AutoML.",
    gcpExpansionOpportunity: "Google Cloud Storage de arquivo para milhões de imagens de inspeção com Cloud CDN.",
    paybackMonths: 1.6
  },
  {
    useCaseId: "uc_mfg_06_conversational_plant",
    assessmentId: "asm_mfg_2026",
    rank: 6,
    title: "Data Agent de Engenharia & Confiabilidade para Gerentes de Planta",
    category: "GenAI & BigQuery Data Agents",
    businessProblem: "Engenheiros de confiabilidade gastam horas compilando dados de falhas de múltiplos sistemas para auditorias de segurança e relatórios mensais.",
    solutionDescription: "Data Agent corporativo integrado ao BigQuery e Knowledge Catalog respondendo perguntas sobre causa raiz de falhas e histórico de ordens em segundos.",
    businessCaseRoi: "Aumento de 22% na produtividade da equipe de engenharia e rápida resolução de incidentes gerando +$580.000/ano com payback em 1.7 meses.",
    financialGainEstimateUsd: 580000,
    gcpMonthlyCostUsd: 980,
    costBreakdown: { bigqueryUsd: 490, vertexAiUsd: 350, cloudRunUsd: 90, storageUsd: 50 },
    requiredTables: ["historico_manutencoes_sap", "telemetria_sensores_iot", "catalogo_ativos_equipamentos"],
    requiredColumns: ["ordem_manutencao_id", "causa_raiz_falha", "tempo_reparo_mttr", "custo_total"],
    guardrails: "Rigorosa auditoria de permissões por planta industrial garantida por BigQuery RLS.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Uso do BigQuery Property Graph para navegar entre ativos pais e componentes filhos.",
    gcpExpansionOpportunity: "Acesso por dispositivos móveis industriais para centenas de técnicos de campo.",
    paybackMonths: 1.7
  }
];

// =========================================================================
// 7. Casos de Uso para Logística, Frotas & Supply Chain (ex: JSL, Rumo, Localiza, etc.)
// =========================================================================
export const LOGISTICS_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_log_01_dynamic_routing_gis",
    assessmentId: "asm_log_2026",
    rank: 1,
    title: "Roteirização Dinâmica de Frotas & Otimização de Última Milha via BigQuery GIS",
    category: "BigQuery GIS & Otimização Espacial",
    businessProblem: "Rotas fixas ineficientes sujeitas a congestionamentos urbanos, gerando alta quilometragem rodada e consumo excessivo de diesel.",
    solutionDescription: "Otimizador de rotas com BigQuery GIS (ST_DISTANCE, ST_MAKELINE) e algoritmos heurísticos no Cloud Run calculando sequências ideais de paradas em tempo real.",
    businessCaseRoi: "Redução de 14% na distância total percorrida economizando +$4.400.000/ano em combustível e manutenção com payback em 1.1 meses.",
    financialGainEstimateUsd: 4400000,
    gcpMonthlyCostUsd: 12100,
    costBreakdown: { bigqueryUsd: 6300, vertexAiUsd: 4100, cloudRunUsd: 1200, storageUsd: 500 },
    requiredTables: ["telemetria_gps_veiculos", "entregas_pedidos_paradas", "malha_viaria_gis_sp"],
    requiredColumns: ["veiculo_id", "coordenadas_ponto", "horario_estimado_chegada", "ordem_entrega", "consumo_diesel_estimado"],
    guardrails: "Respeito a janelas horárias de descarregamento e restrições de circulação de caminhões municipais.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Uso de funções espaciais nativas do BigQuery GIS para processamento vetorial de milhões de waypoints.",
    gcpExpansionOpportunity: "Processamento de telemetria GPS de 50.000+ veículos em tempo real.",
    paybackMonths: 1.1
  },
  {
    useCaseId: "uc_log_02_tower_eta",
    assessmentId: "asm_log_2026",
    rank: 2,
    title: "Torre de Controle Preditiva de ETA & Gestão Inteligente de Pátios e Docas",
    category: "Streaming & Visibilidade em Tempo Real",
    businessProblem: "Filas de carretas na entrada de armazéns e atrasos imprevistos em docas, gerando custos de estadia e insatisfação de contratantes.",
    solutionDescription: "Torre de controle com BigQuery Streaming prevendo a hora exata de chegada (ETA) dos veículos e escalonando docas automaticamente.",
    businessCaseRoi: "Queda de 42% no tempo de espera em pátio com economia direta de +$3.500.000/ano em taxas de estadia com payback em 1.2 meses.",
    financialGainEstimateUsd: 3500000,
    gcpMonthlyCostUsd: 9600,
    costBreakdown: { bigqueryUsd: 5100, vertexAiUsd: 3100, cloudRunUsd: 950, storageUsd: 450 },
    requiredTables: ["agendamento_docas_armazem", "telemetria_gps_veiculos", "historico_tempos_descarga"],
    requiredColumns: ["viagem_id", "doca_alocada", "eta_previsto", "tempo_fila_minutos", "status_descarga"],
    guardrails: "Reagendamento automático de doca se o atraso do caminhão ultrapassar 30 minutos.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Migração de polling batch para BigQuery Continuous Queries para alertas de atraso em tempo real.",
    gcpExpansionOpportunity: "Visualização em tempo real na torre de controle conectando dezenas de CDs.",
    paybackMonths: 1.2
  },
  {
    useCaseId: "uc_log_03_fleet_telematics_safety",
    assessmentId: "asm_log_2026",
    rank: 3,
    title: "Telemetria Avançada de Direção: Prevenção de Sinistros e Economia de Diesel",
    category: "Telemetria IoT & Segurança Viária",
    businessProblem: "Comportamentos de risco ao volante (frenagens bruscas, excesso de velocidade) elevam o índice de acidentes rodoviários e o prêmio de seguro da frota.",
    solutionDescription: "Processamento de telemetria CAN-bus de acelerômetros no BigQuery, gerando score contínuo de direção defensiva e premiação para motoristas.",
    businessCaseRoi: "Redução de 29% na sinistralidade e 8% no consumo de combustível gerando +$2.900.000/ano com payback em 1.4 meses.",
    financialGainEstimateUsd: 2900000,
    gcpMonthlyCostUsd: 8400,
    costBreakdown: { bigqueryUsd: 4500, vertexAiUsd: 2700, cloudRunUsd: 800, storageUsd: 400 },
    requiredTables: ["telemetria_canbus_veiculos", "cadastro_motoristas", "historico_sinistros_seguro"],
    requiredColumns: ["motorista_id", "veiculo_id", "frenagens_bruscas_km", "excesso_velocidade_segundos", "score_seguranca"],
    guardrails: "Feedback educativo ao motorista sem exposição pública de dados individuais (LGPD).",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Particionamento diário de telemetria com BigQuery Time-Unit Partitioning para controle estrito de custos.",
    gcpExpansionOpportunity: "Integração direta com seguradoras em data clean rooms no BigQuery.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_log_04_fleet_maintenance",
    assessmentId: "asm_log_2026",
    rank: 4,
    title: "Gestão do Ciclo de Vida & Manutenção Preditiva de Frotas/Vagões",
    category: "AI/ML Preditivo de Ativos",
    businessProblem: "Trocas prematuras ou atrasadas de pneus, freios e fluidos geram quebras nas rodovias e custos inflacionados de peças de reposição.",
    solutionDescription: "Modelos preditivos de desgaste de componentes com BigQuery ML determinando o momento ótimo de revisão em oficina para cada placa/vagão.",
    businessCaseRoi: "Economia de +$850.000/ano em compras de pneus e revisões desnecessárias com payback em 1.5 meses.",
    financialGainEstimateUsd: 850000,
    gcpMonthlyCostUsd: 1600,
    costBreakdown: { bigqueryUsd: 850, vertexAiUsd: 500, cloudRunUsd: 180, storageUsd: 70 },
    requiredTables: ["ordens_oficina_manutencao", "telemetria_gps_veiculos", "vida_util_componentes"],
    requiredColumns: ["placa_veiculo", "km_rodados_total", "desgaste_pneu_mm", "km_proxima_revisao"],
    guardrails: "Critérios de segurança mecânica mínima exigidos por lei estritamente respeitados.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Predições automáticas de manutenção geradas via BigQuery ML sem necessidade de cluster Spark externo.",
    gcpExpansionOpportunity: "Conexão com fornecedores de peças e oficinas credenciadas.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_log_05_freight_audit",
    assessmentId: "asm_log_2026",
    rank: 5,
    title: "FinOps de Transportes: Auditoria Automatizada de Fretes e Faturamento",
    category: "FinOps & Conformidade Fiscal",
    businessProblem: "Divergências contratuais em faturas de transportadoras terceirizadas e cobranças indevidas de taxas adicionais (GRIS, pedágio, reentrega).",
    solutionDescription: "Conciliação algorítmica de Conhecimentos de Transporte Eletrônicos (CT-e) contra tabelas acordadas no BigQuery com extração de divergências.",
    businessCaseRoi: "Recuperação de cobranças indevidas de frete no valor de +$710.000/ano com payback em 1.6 meses.",
    financialGainEstimateUsd: 710000,
    gcpMonthlyCostUsd: 1200,
    costBreakdown: { bigqueryUsd: 650, vertexAiUsd: 350, cloudRunUsd: 140, storageUsd: 60 },
    requiredTables: ["faturas_cte_recebidas", "tabelas_frete_contratadas", "comprovantes_entrega"],
    requiredColumns: ["cte_chave", "valor_cobrado", "valor_calculado_contrato", "diferenca_glosa", "status_aprovacao"],
    guardrails: "Glosas com contestação formal documentada para relacionamento saudável com parceiros.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Processamento de XMLs de CT-e em larga escala diretamente no BigQuery com funções JSON nativas.",
    gcpExpansionOpportunity: "Validação fiscal contínua para milhares de transportadoras parceiras.",
    paybackMonths: 1.6
  },
  {
    useCaseId: "uc_log_06_conversational_dispatch",
    assessmentId: "asm_log_2026",
    rank: 6,
    title: "Data Agent Conversacional para Torre de Controle & Gestão de Incidentes",
    category: "GenAI & BigQuery Data Agents",
    businessProblem: "Operadores da torre de controle perdem tempo navegando em múltiplos sistemas legados para responder status de cargas a clientes de grande porte.",
    solutionDescription: "Data Agent conversacional com Gemini 3.8 Flash e BigQuery respondendo instantaneamente em linguagem natural onde está qualquer carga e se há risco de atraso.",
    businessCaseRoi: "Economia operacional de 4.000 horas de atendimento e resposta em 5 segundos gerando +$550.000/ano em retenção de clientes com payback em 1.7 meses.",
    financialGainEstimateUsd: 550000,
    gcpMonthlyCostUsd: 920,
    costBreakdown: { bigqueryUsd: 460, vertexAiUsd: 330, cloudRunUsd: 80, storageUsd: 50 },
    requiredTables: ["telemetria_gps_veiculos", "entregas_pedidos_paradas", "incidentes_rodoviarios"],
    requiredColumns: ["nota_fiscal_id", "cliente_nome", "status_rastreamento", "localizacao_atual", "atraso_minutos"],
    guardrails: "Isolamento de dados por cliente contratante garantido via Row-Level Security no BigQuery.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "BigQuery Data Agent com Grounding em metadados do Knowledge Catalog.",
    gcpExpansionOpportunity: "Disponibilização de autosserviço conversacional para clientes corporativos B2B.",
    paybackMonths: 1.7
  }
];

// =========================================================================
// 8. Casos de Uso para Energia, Utilities & Óleo e Gás (ex: Petrobras, Raízen, CPFL, etc.)
// =========================================================================
export const ENERGY_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_ene_01_load_forecasting",
    assessmentId: "asm_ene_2026",
    rank: 1,
    title: "Previsão de Carga & Demanda em Subestações com BigQuery Time Series",
    category: "AI/ML Preditivo & Séries Temporais",
    businessProblem: "Penalidades regulatórias e compra de energia cara no mercado spot decorrentes de erros na previsão de despacho de carga elétrica por subestação.",
    solutionDescription: "Modelos BigQuery ML ARIMA_PLUS combinando dados de medidores inteligentes (AMI), telemetria climática (Inmet) e sazonalidade regional.",
    businessCaseRoi: "Redução de 32% nos desvios de programação de carga economizando +$4.800.000/ano em penalidades da ONS/CCEE com payback em 1.1 meses.",
    financialGainEstimateUsd: 4800000,
    gcpMonthlyCostUsd: 13500,
    costBreakdown: { bigqueryUsd: 7400, vertexAiUsd: 4400, cloudRunUsd: 1200, storageUsd: 500 },
    requiredTables: ["medicao_subestacoes_carga", "telemetria_meteorologica", "calendario_operacional"],
    requiredColumns: ["subestacao_id", "timestamp", "demanda_ativa_mw", "temperatura_c", "previsao_carga_mw"],
    guardrails: "Auditoria de dados faltantes de medidores com imputação probabilística no BigQuery.",
    confidenceScore: 0.97,
    status: "VALIDATED",
    keyImprovement: "Execução distribuída de 10.000+ séries temporais paralelas com BigQuery ML.",
    gcpExpansionOpportunity: "Processamento de telemetria de medição horária de milhões de consumidores.",
    paybackMonths: 1.1
  },
  {
    useCaseId: "uc_ene_02_non_technical_losses",
    assessmentId: "asm_ene_2026",
    rank: 2,
    title: "Detecção Causal de Perdas Não Técnicas e Furtos em Medidores Inteligentes",
    category: "Causal AI & Detecção de Fraudes",
    businessProblem: "Perdas não técnicas (gatos e adulterações de medidores) sangram receitas de distribuidoras e sobrecarregam transformadores em áreas críticas.",
    solutionDescription: "Detecção de anomalias no padrão de curva de carga com Autoencoders no Vertex AI cruzando dados geográficos e perfil socioeconômico via BigQuery GIS.",
    businessCaseRoi: "Recuperação de +$3.900.000/ano em receitas de energia fraudada com acerto de fiscalização de 78% com payback em 1.2 meses.",
    financialGainEstimateUsd: 3900000,
    gcpMonthlyCostUsd: 10800,
    costBreakdown: { bigqueryUsd: 5800, vertexAiUsd: 3600, cloudRunUsd: 950, storageUsd: 450 },
    requiredTables: ["curva_carga_consumidores", "historico_inspecoes_fraude", "cadastro_unidades_consumidoras"],
    requiredColumns: ["uc_id", "consumo_kwh_mes", "queda_abrupta_flag", "probabilidade_fraude", "status_fiscalizacao"],
    guardrails: "Priorização de inspeção técnica baseada em evidências estatísticas sem viés discriminatório.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Otimização de rotas de equipes de fiscalização de campo com BigQuery GIS.",
    gcpExpansionOpportunity: "BigQuery GIS processando topologia de rede de distribuição em alta resolução.",
    paybackMonths: 1.2
  },
  {
    useCaseId: "uc_ene_03_critical_assets_gis",
    assessmentId: "asm_ene_2026",
    rank: 3,
    title: "Manutenção Preditiva de Linhas de Transmissão e Dutos com Imagens e GIS",
    category: "BigQuery GIS & Visão Computacional",
    businessProblem: "Vegetação próxima a faixas de servidão de linhas de transmissão causa desligamentos não programados e risco de queimadas florestais.",
    solutionDescription: "Cruzamento de imagens de satélite e sobrevoos com drones no BigQuery GIS, calculando a distância tridimensional da copa de árvores em relação aos cabos.",
    businessCaseRoi: "Evitação de interrupções de fornecimento e multas regulatórias no valor de +$3.100.000/ano com payback em 1.3 meses.",
    financialGainEstimateUsd: 3100000,
    gcpMonthlyCostUsd: 8900,
    costBreakdown: { bigqueryUsd: 4800, vertexAiUsd: 2800, cloudRunUsd: 850, storageUsd: 450 },
    requiredTables: ["geometria_linhas_transmissao", "deteccao_vegetacao_satelite", "historico_podas_campo"],
    requiredColumns: ["torre_id", "vao_geometria", "distancia_vegetacao_m", "risco_desligamento", "prioridade_poda"],
    guardrails: "Conformidade ambiental e plano de manejo florestal integrado aos chamados de poda.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Uso do BigQuery GIS e Vertex AI Vision para processamento geoespacial em larga escala.",
    gcpExpansionOpportunity: "Armazenamento em Cloud Storage de centenas de terabytes de ortofotos e voos LiDAR.",
    paybackMonths: 1.3
  },
  {
    useCaseId: "uc_ene_04_energy_trading_acl",
    assessmentId: "asm_ene_2026",
    rank: 4,
    title: "Otimização Preditiva de Portfólio de Energia no Mercado Livre (ACL)",
    category: "Finanças Quantitativas & Trading",
    businessProblem: "Exposição a volatilidade do PLD (Preço de Liquidação das Diferenças) em mesas de comercialização de energia gerando perdas em posições desbalanceadas.",
    solutionDescription: "Simulações de Monte Carlo no BigQuery projetando cenários de afluência hídrica (ENA), preços futuros de energia e despacho térmico.",
    businessCaseRoi: "Maximização de margem de trading e hedge financeiro gerando +$920.000/ano no resultado da comercializadora com payback em 1.5 meses.",
    financialGainEstimateUsd: 920000,
    gcpMonthlyCostUsd: 1800,
    costBreakdown: { bigqueryUsd: 950, vertexAiUsd: 580, cloudRunUsd: 190, storageUsd: 80 },
    requiredTables: ["contratos_compra_venda_energia", "historico_pld_ccee", "projecoes_afluencia_hidrica"],
    requiredColumns: ["contrato_id", "volume_mwh", "preco_pld_previsto", "posicao_exposta_mw", "var_risco"],
    guardrails: "Limites de exposição e VaR (Value at Risk) parametrizados por diretoria de risco.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Execução de cálculos estatísticos de matrizes de risco diretamente em SQL no BigQuery.",
    gcpExpansionOpportunity: "BigQuery BI Engine para dashboards em tempo real na mesa de operações.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_ene_05_esg_carbon_compliance",
    assessmentId: "asm_ene_2026",
    rank: 5,
    title: "Gestão Automatizada de Emissões de Carbono (ESG) & Compliance Regulatório",
    category: "ESG & Governança de Dados",
    businessProblem: "Cálculo manual e descentralizado de emissões de Escopo 1, 2 e 3 em múltiplas unidades industriais com alto risco de autuações e glosas ambientais.",
    solutionDescription: "Motor analítico no BigQuery e Dataplex auditando dados de queima de combustíveis e geração de resíduos, com emissão automatizada de relatórios GHG Protocol.",
    businessCaseRoi: "Economia de +$750.000/ano em auditorias externas e acesso a linhas de crédito verde subsidiadas com payback em 1.6 meses.",
    financialGainEstimateUsd: 750000,
    gcpMonthlyCostUsd: 1300,
    costBreakdown: { bigqueryUsd: 700, vertexAiUsd: 410, cloudRunUsd: 130, storageUsd: 60 },
    requiredTables: ["consumo_combustiveis_fossil", "fatores_emissao_ghg", "certificados_energia_renovavel"],
    requiredColumns: ["planta_id", "tipo_fonte", "emissao_tco2e_calculada", "escopo_classificacao", "status_auditoria"],
    guardrails: "Trilha de auditoria imutável com linhagem completa de dados no Knowledge Catalog.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Linhagem de ponta a ponta garantindo reprodutibilidade das métricas de sustentabilidade.",
    gcpExpansionOpportunity: "Data Clean Room para compartilhamento seguro de metas de descarbonização com investidores.",
    paybackMonths: 1.6
  },
  {
    useCaseId: "uc_ene_06_conversational_grid",
    assessmentId: "asm_ene_2026",
    rank: 6,
    title: "Data Agent Conversacional para Engenharia de Operações de Rede e Dutos",
    category: "GenAI & BigQuery Data Agents",
    businessProblem: "Engenheiros de operação perdem minutos preciosos durante blecautes cruzando diagramas unifilares e relatórios de manobra.",
    solutionDescription: "BigQuery Data Agent alimentado por Gemini 3.8 Flash e Property Graph GQL, permitindo consultas instantâneas sobre interrupções e topologia elétrica.",
    businessCaseRoi: "Redução do tempo médio de restabelecimento (DEC/FEC) com economia de +$590.000/ano em compensações de interrupção com payback em 1.7 meses.",
    financialGainEstimateUsd: 590000,
    gcpMonthlyCostUsd: 980,
    costBreakdown: { bigqueryUsd: 490, vertexAiUsd: 350, cloudRunUsd: 90, storageUsd: 50 },
    requiredTables: ["interrupcoes_fornecimento_dec", "topologia_rede_eletrica", "equipes_manobra_campo"],
    requiredColumns: ["circuito_id", "consumidores_afetados", "causa_desligamento", "tempo_restabelecimento_minutos"],
    guardrails: "Respostas restritas aos protocolos de manobra aprovados pelo centro de operações da rede (COR).",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Representação de redes elétricas em BigQuery Property Graph com travessia ISO GQL.",
    gcpExpansionOpportunity: "Implementação de Data Agents corporativos para centros de operação 24/7.",
    paybackMonths: 1.7
  }
];

// =========================================================================
// 9. Casos de Uso para Agronegócio & Bioenergia (ex: SLC Agrícola, Jalles Machado, etc.)
// =========================================================================
export const AGRO_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_agro_01_crop_yield_satellite",
    assessmentId: "asm_agro_2026",
    rank: 1,
    title: "Previsão de Produtividade Agrícola por Talhão com Imagens de Satélite no BigQuery GIS",
    category: "BigQuery GIS & Sensoriamento Remoto",
    businessProblem: "Estimativas imprecisas de safra e quebras pontuais não detectadas a tempo em fazendas extensas de grãos e cana-de-açúcar.",
    solutionDescription: "Cruzamento de índices de vegetação (NDVI/EVI de satélites Sentinel/Landsat) no BigQuery GIS com histórico de adubação e dados climáticos.",
    businessCaseRoi: "Identificação precoce de estresse hídrico/nutricional preservando +$4.700.000/ano em produtividade de colheita com payback em 1.1 meses.",
    financialGainEstimateUsd: 4700000,
    gcpMonthlyCostUsd: 12800,
    costBreakdown: { bigqueryUsd: 6800, vertexAiUsd: 4300, cloudRunUsd: 1200, storageUsd: 500 },
    requiredTables: ["talhoes_fazendas_gis", "indices_vegetacao_ndvi", "telemetria_estacoes_meteorologicas"],
    requiredColumns: ["talhao_id", "cultura_tipo", "geometria_talhao", "ndvi_medio", "produtividade_estimada_sc_ha"],
    guardrails: "Calibração de índices de satélite com amostragens físicas de solo e biomassa.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Processamento de dados raster e vetoriais em escala massiva usando BigQuery GIS.",
    gcpExpansionOpportunity: "Ingestão de imagens de satélite e dados de telemetria para milhões de hectares.",
    paybackMonths: 1.1
  },
  {
    useCaseId: "uc_agro_02_machinery_routing",
    assessmentId: "asm_agro_2026",
    rank: 2,
    title: "Otimização de Janela de Colheita e Roteirização de Maquinário Agrícola",
    category: "Otimização Operacional & BigQuery GIS",
    businessProblem: "Tratores e colhedoras ociosos ou com sobreposição de passadas em campo, gerando alto consumo de combustível e pisoteio de solo.",
    solutionDescription: "Algoritmos de otimização no BigQuery GIS calculando trajetórias de tráfego controlado e sincronização de transbordos de grãos/cana.",
    businessCaseRoi: "Redução de 12% no consumo de diesel e 15% nas perdas de colheita gerando +$3.600.000/ano com payback em 1.2 meses.",
    financialGainEstimateUsd: 3600000,
    gcpMonthlyCostUsd: 9900,
    costBreakdown: { bigqueryUsd: 5300, vertexAiUsd: 3200, cloudRunUsd: 950, storageUsd: 450 },
    requiredTables: ["telemetria_maquinario_can", "talhoes_fazendas_gis", "programacao_colheita_diaria"],
    requiredColumns: ["maquina_id", "posicao_gps", "taxa_recolhimento_ton_h", "velocidade_kmh", "sobreposicao_flag"],
    guardrails: "Respeito às condições de umidade de solo para evitar compactação severa.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Streaming de telemetria ISO-BUS/CAN diretamente para o BigQuery.",
    gcpExpansionOpportunity: "Gerenciamento de frotas agrícolas de milhares de máquinas conectadas.",
    paybackMonths: 1.2
  },
  {
    useCaseId: "uc_agro_03_grain_storage_logistics",
    assessmentId: "asm_agro_2026",
    rank: 3,
    title: "Gestão Preditiva de Estoque em Silos & Risco de Quebra de Safra",
    category: "Supply Chain do Agro & Séries Temporais",
    businessProblem: "Gargalos de recebimento em silos durante o pico da safra e perdas por deterioração de grãos por umidade excessiva.",
    solutionDescription: "Modelagem de equilíbrio dinâmico entre colheita, capacidade de armazenagem e contratos de frete rodoferroviário no BigQuery.",
    businessCaseRoi: "Eliminação de filas de espera de caminhões em silos e preservação de qualidade gerando +$2.900.000/ano com payback em 1.4 meses.",
    financialGainEstimateUsd: 2900000,
    gcpMonthlyCostUsd: 8300,
    costBreakdown: { bigqueryUsd: 4400, vertexAiUsd: 2700, cloudRunUsd: 800, storageUsd: 400 },
    requiredTables: ["capacidade_silos_armazens", "umidade_temperatura_graos", "contratos_frete_embarque"],
    requiredColumns: ["silo_id", "toneladas_armazenadas", "umidade_grao_pct", "vagoes_alocados", "risco_fermentacao"],
    guardrails: "Sensores de aeração automatizados para evitar focos de aquecimento em silos.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Previsão de congestionamento de embarque com BigQuery ML Time Series.",
    gcpExpansionOpportunity: "Conexão de dezenas de complexos de silos e terminais portuários no BigQuery.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_agro_04_tractor_fleet_maintenance",
    assessmentId: "asm_agro_2026",
    rank: 4,
    title: "Manutenção Preditiva de Tratores e Pulverizadores com Telemetria CAN/IoT",
    category: "IoT & Engenharia de Ativos do Agro",
    businessProblem: "Quebra de pulverizadores durante janelas críticas de aplicação de defensivos, abrindo espaço para infestação de pragas na lavoura.",
    solutionDescription: "Detecção precoce de anomalias em pressão de bicos, óleo hidráulico e rotação de motores agrícolas no BigQuery Streaming.",
    businessCaseRoi: "Queda de 34% em paradas não programadas no campo economizando +$840.000/ano com payback em 1.5 meses.",
    financialGainEstimateUsd: 840000,
    gcpMonthlyCostUsd: 1600,
    costBreakdown: { bigqueryUsd: 850, vertexAiUsd: 500, cloudRunUsd: 180, storageUsd: 70 },
    requiredTables: ["telemetria_maquinario_can", "historico_manutencao_oficinas", "catalogo_pecas_tratores"],
    requiredColumns: ["maquina_id", "temperatura_oleo_c", "pressao_bico_bar", "horas_motor", "alerta_falha"],
    guardrails: "Disponibilização de máquina reserva para talhões prioritários em fase crítica.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Processamento de telemetria CAN em modo assíncrono para regiões com conectividade intermitente.",
    gcpExpansionOpportunity: "BigQuery como repositório central de telemetria de maquinário multimarcas.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_agro_05_esg_deforestation_traceability",
    assessmentId: "asm_agro_2026",
    rank: 5,
    title: "Rastreabilidade Socioambiental & Certificação de Não Desmatamento (EUDR)",
    category: "ESG & Compliance Internacional",
    businessProblem: "Exigência de compliance internacional (regulamento europeu EUDR) com bloqueio de exportação de grãos e carnes sem comprovação de origem sustentável.",
    solutionDescription: "Cruzamento automático dos polígonos CAR (Cadastro Ambiental Rural) contra bases oficiais de desmatamento (Prodes/Inpe) e embargos do Ibama no BigQuery GIS.",
    businessCaseRoi: "Garantia de conformidade para 100% das cargas exportadas, destravando +$680.000/ano em prêmios de sustentabilidade com payback em 1.6 meses.",
    financialGainEstimateUsd: 680000,
    gcpMonthlyCostUsd: 1200,
    costBreakdown: { bigqueryUsd: 650, vertexAiUsd: 350, cloudRunUsd: 140, storageUsd: 60 },
    requiredTables: ["cadastros_propriedades_car", "poligonos_desmatamento_prodes", "embargos_ambientais_ibama"],
    requiredColumns: ["car_codigo", "proprietario_cpf_cnpj", "sobreposicao_desmatamento_ha", "status_conformidade_eudr"],
    guardrails: "Laudos auditáveis com carimbo de data/hora e assinatura digital no Knowledge Catalog.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Auditoria geoespacial de milhões de propriedades em minutos com BigQuery GIS.",
    gcpExpansionOpportunity: "Plataforma de certificação ESG corporativa conectada a traders globais.",
    paybackMonths: 1.6
  },
  {
    useCaseId: "uc_agro_06_conversational_commodities",
    assessmentId: "asm_agro_2026",
    rank: 6,
    title: "Data Agent Conversacional para Gestão de Safra e Comercialização de Grãos",
    category: "GenAI & BigQuery Data Agents",
    businessProblem: "Diretores agrícolas e traders demoram para cruzar dados de campo, custos de insumos e preços de Chicago para travar vendas futuras (hedge).",
    solutionDescription: "BigQuery Data Agent alimentado por Gemini 3.8 Flash respondendo consultas sobre ritmo de colheita, barter de insumos e margem por hectare em segundos.",
    businessCaseRoi: "Melhores janelas de fixação de preços de commodities gerando ganho de +$570.000/ano com payback em 1.7 meses.",
    financialGainEstimateUsd: 570000,
    gcpMonthlyCostUsd: 950,
    costBreakdown: { bigqueryUsd: 480, vertexAiUsd: 340, cloudRunUsd: 80, storageUsd: 50 },
    requiredTables: ["previsao_safra_talhoes", "contratos_venda_futura", "cotacao_commodities_chicago"],
    requiredColumns: ["fazenda_id", "cultura", "volume_fixado_ton", "preco_medio_usd", "margem_liquida_ha"],
    guardrails: "Respostas orientadas estritamente a dados verificados de estoque e colheita.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Interação conversacional com dados geoespaciais e de mercado via BigQuery Data Agent.",
    gcpExpansionOpportunity: "Acesso por tablets e smartphones para agrônomos e gestores de fazenda.",
    paybackMonths: 1.7
  }
];

// =========================================================================
// 10. Mapeamento Universal & Resolução Dinâmica de Casos de Uso
// =========================================================================
export function getCustomerUseCases(customerNameOrId: string, industryOverride?: string): ExtendedUseCase[] {
  const normName = (customerNameOrId || "").toLowerCase();
  const normInd = (industryOverride || "").toLowerCase();
  const targetName = customerNameOrId || "Empresa";

  // Função auxiliar para personalizar o nome do cliente nos casos padrão
  const tailor = (cases: ExtendedUseCase[]): ExtendedUseCase[] => {
    return cases.map(c => ({
      ...c,
      title: c.title.replace(/{{CUSTOMER}}/g, targetName),
      businessProblem: c.businessProblem.replace(/{{CUSTOMER}}/g, targetName),
      solutionDescription: c.solutionDescription.replace(/{{CUSTOMER}}/g, targetName),
      businessCaseRoi: c.businessCaseRoi.replace(/{{CUSTOMER}}/g, targetName)
    }));
  };

  // 1. Clientes com catálogo específico dedicado
  if (normName.includes("digio")) return tailor(DIGIO_USE_CASES);
  if (normName.includes("nubank")) return tailor(NUBANK_USE_CASES);
  if (normName.includes("ambev")) return tailor(AMBEV_USE_CASES);
  if (normName.includes("hypera")) return tailor(HYPERA_USE_CASES);

  // 2. Mapeamento dinâmico baseado em indústria ou nome do cliente
  // A. Farmacêutica & Saúde
  if (
    normInd.includes("farma") || normInd.includes("saúde") || normInd.includes("saude") ||
    normName.includes("farma") || normName.includes("pharma") || normName.includes("drog") ||
    normName.includes("ems") || normName.includes("eurofarma") || normName.includes("neo quimica")
  ) {
    return tailor(HYPERA_USE_CASES);
  }

  // B. Bens de Consumo & CPG / Bebidas
  if (
    normInd.includes("consumo") || normInd.includes("cpg") || normInd.includes("bebida") || normInd.includes("alimento") ||
    normName.includes("heineken") || normName.includes("coca") || normName.includes("nestle") || normName.includes("unilever") ||
    normName.includes("jbs") || normName.includes("brf") || normName.includes("mias")
  ) {
    return tailor(AMBEV_USE_CASES);
  }

  // C. Financeiro & Fintech / Bancos
  if (
    normInd.includes("financ") || normInd.includes("fintech") || normInd.includes("banco") ||
    normName.includes("itau") || normName.includes("bradesco") || normName.includes("santander") ||
    normName.includes("inter") || normName.includes("c6") || normName.includes("stone") ||
    normName.includes("picpay") || normName.includes("pagseguro") || normName.includes("xp")
  ) {
    return tailor(DIGIO_USE_CASES);
  }

  // D. Varejo & E-commerce
  if (
    normInd.includes("varejo") || normInd.includes("e-commerce") || normInd.includes("comercio") ||
    normName.includes("magalu") || normName.includes("mercado livre") || normName.includes("americanas") ||
    normName.includes("renner") || normName.includes("casas bahia") || normName.includes("carrefour")
  ) {
    return tailor(RETAIL_USE_CASES);
  }

  // E. Manufatura & Indústria Pesada / Siderurgia
  if (
    normInd.includes("manufat") || normInd.includes("indústria") || normInd.includes("industria") || normInd.includes("siderurg") ||
    normName.includes("embraer") || normName.includes("gerdau") || normName.includes("usiminas") ||
    normName.includes("suzano") || normName.includes("klabin") || normName.includes("weg") || normName.includes("marcopolo")
  ) {
    return tailor(MANUFACTURING_USE_CASES);
  }

  // F. Logística, Frotas & Supply Chain
  if (
    normInd.includes("logíst") || normInd.includes("logist") || normInd.includes("transport") || normInd.includes("frota") ||
    normName.includes("jsl") || normName.includes("loggi") || normName.includes("rumo") || normName.includes("vli") ||
    normName.includes("localiza") || normName.includes("movida") || normName.includes("tegma") || normName.includes("correios")
  ) {
    return tailor(LOGISTICS_USE_CASES);
  }

  // G. Energia, Utilities & Óleo e Gás
  if (
    normInd.includes("energ") || normInd.includes("utilit") || normInd.includes("oleo") || normInd.includes("óleo") || normInd.includes("gas") || normInd.includes("gás") ||
    normName.includes("petrobras") || normName.includes("raizen") || normName.includes("eletrobras") ||
    normName.includes("cpfl") || normName.includes("equatorial") || normName.includes("vibra") || normName.includes("cosan")
  ) {
    return tailor(ENERGY_USE_CASES);
  }

  // H. Agronegócio & Bioenergia
  if (
    normInd.includes("agro") || normInd.includes("agrícol") || normInd.includes("agricol") || normInd.includes("safra") ||
    normName.includes("slc") || normName.includes("jalles") || normName.includes("adecoagro") ||
    normName.includes("sao martinho") || normName.includes("cargill") || normName.includes("bunge")
  ) {
    return tailor(AGRO_USE_CASES);
  }

  // Padrão de contingência: se for varejo/consumo -> Retail, senão -> Manufacturing
  return tailor(RETAIL_USE_CASES);
}
