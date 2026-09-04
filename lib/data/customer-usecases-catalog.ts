// lib/data/customer-usecases-catalog.ts - Catálogo Especializado de Casos de Uso por Cliente & Indústria
// Projetado para vendedores do Google Cloud e tomadores de decisão C-Level
// Cada caso balanceia: 1) Impacto no Negócio do Cliente ($ EBITDA/Receita) e 2) Consumo na Plataforma GCP (BigQuery, Vertex AI, Cloud Run)

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
    title: "Score Preditivo de Crédito em Tempo Real & Limite Dinâmico",
    category: "AI/ML Preditivo",
    businessProblem: "Modelos legados de score estático com atualização mensal geram rejeição de 24% de bons tomadores e atraso na concessão de limites de cartão.",
    solutionDescription: "Pipeline de feature store no BigQuery com modelos preditivos no Vertex AI integrando histórico transacional, pagamentos via Pix e birôs externos para concessão de limite em sub-segundo.",
    businessCaseRoi: "Redução de 19% no default de 90 dias e aumento de +$580k/ano em margem financeira líquida.",
    financialGainEstimateUsd: 580000,
    gcpMonthlyCostUsd: 520,
    costBreakdown: {
      bigqueryUsd: 280,
      vertexAiUsd: 160,
      cloudRunUsd: 50,
      storageUsd: 30
    },
    requiredTables: ["transacoes_cartao", "cadastro_correntistas", "historico_faturas", "bureaux_score"],
    requiredColumns: ["cpf_hash", "valor_transacao", "score_interno", "limite_disponivel", "status_inadimplencia"],
    guardrails: "Auditoria contínua de viés algorítmico no Vertex Explainable AI; conformidade estrita com resolução Bacen 4.658.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Migrar rotinas batch noturnas para BigQuery Streaming Ingestion e Vertex AI Online Feature Store, reduzindo latência de concessão de 48h para 220ms.",
    gcpExpansionOpportunity: "Consumo de BigQuery Slots dedicados + Vertex AI Prediction Endpoints para 4M+ de avaliações de crédito/mês.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_digio_02_fraud_detection",
    assessmentId: "asm_digio_2026",
    rank: 2,
    title: "Detecção de Anomalias & Prevenção de Fraude Pix/Cartão",
    category: "Causal AI & Segurança",
    businessProblem: "Aumento de fraudes sofisticadas de engenharia social e transações suspeitas fora do perfil de gastos, com custo elevado de estornos (chargebacks).",
    solutionDescription: "Detecção de padrões atípicos com Vertex AI Autoencoders e BigQuery Causal Analytics processando grafos de relacionamento entre contas recebedoras de Pix.",
    businessCaseRoi: "Bloqueio preventivo de $640k/ano em transações fraudulentas com queda de 45% nos falsos positivos de clientes legítimos.",
    financialGainEstimateUsd: 640000,
    gcpMonthlyCostUsd: 610,
    costBreakdown: {
      bigqueryUsd: 340,
      vertexAiUsd: 180,
      cloudRunUsd: 60,
      storageUsd: 30
    },
    requiredTables: ["eventos_pix", "dispositivos_logados", "regras_antifraude", "historico_chargebacks"],
    requiredColumns: ["transacao_id", "device_fingerprint", "ip_geoloc", "valor", "chave_pix_destino"],
    guardrails: "Zero bloqueio sem validação biométrica em fallback; registro idempotente em log imutável no Cloud Logging.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Implementar BigQuery Continuous Queries com CDC do banco transacional para scoring de anomalias em sub-segundo sem onerar o core banking.",
    gcpExpansionOpportunity: "Pipeline corporativo de segurança bancária integrando BigQuery, Cloud Run e Security Command Center.",
    paybackMonths: 1.2
  },
  {
    useCaseId: "uc_digio_03_collections_engine",
    assessmentId: "asm_digio_2026",
    rank: 3,
    title: "Motor Causal de Cobrança & Renegociação Personalizada",
    category: "Causal AI & FinOps",
    businessProblem: "Estratégias homogêneas de cobrança por SMS e call center geram custo elevado de terceirizados e baixa efetividade em faixas de atraso D+15 a D+60.",
    solutionDescription: "Modelos causais de propensão a pagamento (Uplift Modeling) no BigQuery ML que determinam o melhor canal (WhatsApp, push, e-mail) e o percentual de desconto ideal para fechamento imediato de acordo.",
    businessCaseRoi: "Elevação de +22% na recuperação de créditos em atraso e economia de $420k/ano em custos operacionais de contact center.",
    financialGainEstimateUsd: 420000,
    gcpMonthlyCostUsd: 410,
    costBreakdown: {
      bigqueryUsd: 220,
      vertexAiUsd: 120,
      cloudRunUsd: 40,
      storageUsd: 30
    },
    requiredTables: ["historico_cobranca", "acordos_renegociacao", "engajamento_canais", "faturas_atrasadas"],
    requiredColumns: ["contrato_id", "dias_atraso", "canal_acionamento", "faixa_desconto", "status_acordo"],
    guardrails: "Respeito rigoroso aos horários legais de contato (LGPD / Código de Defesa do Consumidor); limite de 1 mensagem/semana.",
    confidenceScore: 0.93,
    status: "VALIDATED",
    keyImprovement: "Clusterização e particionamento das tabelas de faturas por mês contábil e faixa de atraso, cortando custos de query no BigQuery em 68%.",
    gcpExpansionOpportunity: "Crescimento contínuo de dados analíticos no BigQuery com ativação de Vertex AI AutoML.",
    paybackMonths: 1.6
  },
  {
    useCaseId: "uc_digio_04_conversational_agent",
    assessmentId: "asm_digio_2026",
    rank: 4,
    title: "Assistente de Atendimento do Correntista com Grounding no Grafo",
    category: "GenAI & Agentes",
    businessProblem: "Volume massivo de chamados repetitivos de dúvidas sobre faturas, limite, parcelamento e extrato gerando filas e custo por ticket elevado.",
    solutionDescription: "Data Agent conversacional no Cloud Run alimentado por Gemini 3.8 Flash no Vertex AI, com grounding estrito no Knowledge Graph do BigQuery para responder com precisão matemática sobre o histórico da conta.",
    businessCaseRoi: "Deflexão de 42% dos chamados de 1º nível e ganho de produtividade avaliado em $310k/ano.",
    financialGainEstimateUsd: 310000,
    gcpMonthlyCostUsd: 450,
    costBreakdown: {
      bigqueryUsd: 200,
      vertexAiUsd: 180,
      cloudRunUsd: 40,
      storageUsd: 30
    },
    requiredTables: ["enterprise_business_graph", "faq_politicas_banco", "logs_atendimento", "extrato_consolidado"],
    requiredColumns: ["conta_id", "pergunta_usuario", "intencao_detectada", "tabela_grounding", "score_resposta"],
    guardrails: "Isolamento estrito com Row-Level Security (RLS) e mascaramento de dados (Policy Tags) para que o agente nunca exponha PII de outros correntistas.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Implementar Dataplex Policy Tags de mascaramento dinâmico em colunas sensíveis (CPF, dados de cartão, saldos) garantindo conformidade LGPD nativa.",
    gcpExpansionOpportunity: "Porta de entrada para adoção de GenAI corporativa no Vertex AI com 500k+ sessões mensais de chat.",
    paybackMonths: 2.0
  },
  {
    useCaseId: "uc_digio_05_sanctions_pep",
    assessmentId: "asm_digio_2026",
    rank: 5,
    title: "Higienização Cadastral Contínua & Esteira PEPs/Sanções Regulatórias",
    category: "Governança & Compliance",
    businessProblem: "Checagem manual ou em batches esparsos de listas de Pessoas Politicamente Expostas (PEPs) e sanções financeiras (OFAC, CSNU), expondo o banco a multas regulatórias.",
    solutionDescription: "Esteira automatizada no Dataplex cruzando diariamente o cadastro de clientes com tabelas abertas de listas restritivas e gerando alertas imediatos de compliance no BigQuery.",
    businessCaseRoi: "Mitigação de risco regulatório de multas milionárias e economia direta de $280k/ano em auditoria externa e triagem manual.",
    financialGainEstimateUsd: 280000,
    gcpMonthlyCostUsd: 360,
    costBreakdown: {
      bigqueryUsd: 190,
      vertexAiUsd: 110,
      cloudRunUsd: 40,
      storageUsd: 20
    },
    requiredTables: ["cadastro_correntistas", "lista_peps_oficial", "sancoes_ofac", "alertas_compliance"],
    requiredColumns: ["cpf_cnpj", "nome_completo", "grau_parentesco", "fonte_sancao", "data_inclusao"],
    guardrails: "Armazenamento imutável de logs de checagem para auditoria do Banco Central do Brasil; triplo check antes de qualquer bloqueio preventivo.",
    confidenceScore: 0.98,
    status: "VALIDATED",
    keyImprovement: "Ativação do Dataplex Data Profiling e Data Quality Scan automático com publicação de metadados no Knowledge Catalog.",
    gcpExpansionOpportunity: "Adoção de Dataplex Governance Suite como catálogo mestre de dados de todo o ecossistema bancário.",
    paybackMonths: 1.8
  },
  {
    useCaseId: "uc_digio_06_card_churn",
    assessmentId: "asm_digio_2026",
    rank: 6,
    title: "Otimização de Ativação de Cartões & Prevenção de Churn",
    category: "Next-Best-Action",
    businessProblem: "Clientes recebem o cartão de crédito e não realizam o desbloqueio (inativação) ou reduzem drasticamente os gastos após o 3º mês de uso.",
    solutionDescription: "Modelos de Next-Best-Action no BigQuery ML que identificam o momento exato de queda de engajamento e recomendam incentivos personalizados (cashback pontual, aumento temporário de limite, parcerias).",
    businessCaseRoi: "Aumento de 7.4% no volume transacionado por cartão ativo e retenção de receita avaliada em $360k/ano.",
    financialGainEstimateUsd: 360000,
    gcpMonthlyCostUsd: 390,
    costBreakdown: {
      bigqueryUsd: 210,
      vertexAiUsd: 110,
      cloudRunUsd: 40,
      storageUsd: 30
    },
    requiredTables: ["desbloqueio_cartoes", "faturas_mensais", "historico_compras_categorias", "resgate_recompensas"],
    requiredColumns: ["cartao_id", "dias_desde_emissao", "status_desbloqueio", "ticket_medio", "categoria_preferida"],
    guardrails: "Regras de governança de marketing com limite de ofertas por ciclo de fatura para evitar saturação do correntista.",
    confidenceScore: 0.92,
    status: "VALIDATED",
    keyImprovement: "Configuração do BigQuery BI Engine com 10GB de memória para dashboards de acompanhamento executivo de ativação de cartões em sub-segundo.",
    gcpExpansionOpportunity: "Expansão de consumo para Looker e BI Engine acelerando a visualização de métricas da diretoria de produtos.",
    paybackMonths: 1.5
  }
];

// 2. Casos de Uso para HYPERA PHARMA (Farmacêutica & Saúde)
export const HYPERA_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_hypera_01_field_routes",
    assessmentId: "asm_hypera_2026",
    rank: 1,
    title: "Otimização Preditiva de Rotas de Campo & Demanda Causal",
    category: "Causal AI & Demanda",
    businessProblem: "Dispersão de roteiro operacional das equipes em campo gerando ociosidade em setores com alto potencial de prescrição médica não atendido.",
    solutionDescription: "Modelagem causal com Vertex AI cruzando dados de histórico médico, especialidades e sell-out regional para maximizar a conversão de visitas presenciais.",
    businessCaseRoi: "ROI de 340% em 12 meses; elevação de +$540k/ano (~R$ 3.0M) no faturamento de linhas prioritárias.",
    financialGainEstimateUsd: 540000,
    gcpMonthlyCostUsd: 480,
    costBreakdown: {
      bigqueryUsd: 260,
      vertexAiUsd: 140,
      cloudRunUsd: 50,
      storageUsd: 30
    },
    requiredTables: ["Medical_Specialties", "SellOut_Weekly", "Prescriber_Visits"],
    requiredColumns: ["doctor_crm", "territory_id", "visit_date", "specialty_code", "prescribed_units"],
    guardrails: "Respeito aos limites éticos e regulatórios do CFM/Anvisa; zero utilização de dados pessoais não anonimizados.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Particionar tabelas de visitas e sell-out por mês e clusterizar por territory_id no BigQuery, reduzindo o tempo de processamento de rotas de 4h para 8min.",
    gcpExpansionOpportunity: "Integração nativa de BigQuery com Google Maps Platform Route Optimization API gerando pipeline conjunto de dados e mapas.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_hypera_02_huff_gravity",
    assessmentId: "asm_hypera_2026",
    rank: 2,
    title: "Mapeamento Gravitacional de Consumo (Modelo Huff) em PDVs",
    category: "Geomarketing & BQML",
    businessProblem: "Falta de correlação precisa entre os médicos prescritores e as farmácias satélites onde o paciente adquire o medicamento prescrito.",
    solutionDescription: "Algoritmo gravitacional de Huff no BigQuery ML para atribuir probabilidades de compra por ponto de venda em raio de até 5km.",
    businessCaseRoi: "ROI de 410%; redução de 38% na perda de demanda por indisponibilidade local em 447 farmácias satélites.",
    financialGainEstimateUsd: 480000,
    gcpMonthlyCostUsd: 510,
    costBreakdown: {
      bigqueryUsd: 290,
      vertexAiUsd: 130,
      cloudRunUsd: 50,
      storageUsd: 40
    },
    requiredTables: ["Pharmacy_Master", "SellOut_Weekly", "Brick_Territory_Mapping"],
    requiredColumns: ["pharmacy_cnpj", "geo_latitude", "geo_longitude", "weekly_sales_volume", "brick_id"],
    guardrails: "Limitação de raio gravitacional calibrado com base no tráfego urbano real; reprocessamento mensal idempotente.",
    confidenceScore: 0.93,
    status: "VALIDATED",
    keyImprovement: "Utilizar funções geoespaciais BigQuery GIS (ST_GEOHASH, ST_DISTANCE) para cálculos vetoriais in-database sem transferir dados para memória de servidor.",
    gcpExpansionOpportunity: "Uso intensivo de BigQuery GIS e Vertex AI AutoML para calibração contínua dos pesos gravitacionais por CEP.",
    paybackMonths: 1.7
  },
  {
    useCaseId: "uc_hypera_03_anti_rupture",
    assessmentId: "asm_hypera_2026",
    rank: 3,
    title: "Monitoramento de Ruptura de Estoque com Alertas Pró-Ativos",
    category: "Supply Chain & S&OP",
    businessProblem: "Esgotamento imprevisto de SKUs estratégicos nos centros de distribuição regionais e gôndolas de grandes redes de farmácias.",
    solutionDescription: "Previsão de demanda e lead-time logístico com BigQuery Time Series (ARIMA_PLUS) disparando ordens de reposição antes do atingimento do estoque de segurança.",
    businessCaseRoi: "Prevenção de perdas estimadas em +$460k/ano e redução de 28% no tempo médio de reposição.",
    financialGainEstimateUsd: 460000,
    gcpMonthlyCostUsd: 420,
    costBreakdown: {
      bigqueryUsd: 220,
      vertexAiUsd: 120,
      cloudRunUsd: 50,
      storageUsd: 30
    },
    requiredTables: ["Inventory_Distribution", "SellOut_Weekly", "SKU_Master"],
    requiredColumns: ["sku_id", "lead_time_days", "current_stock", "safety_stock_limit"],
    guardrails: "Alertas idempotentes enviados aos canais; execuções repetidas não duplicam pedidos no ERP.",
    confidenceScore: 0.92,
    status: "VALIDATED",
    keyImprovement: "Implementar BigQuery ML ARIMA_PLUS com detecção automática de outliers e feriados nacionais/regionais.",
    gcpExpansionOpportunity: "Migração do planejamento S&OP legado para pipeline moderno baseado em BigQuery e Dataproc Serverless.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_hypera_04_omnichannel_crm",
    assessmentId: "asm_hypera_2026",
    rank: 4,
    title: "Ativação Omnichannel Personalizada Pós-Contato",
    category: "Next-Best-Action",
    businessProblem: "Queda expressiva de recall do médico 7 dias após a interação presencial da equipe de representantes.",
    solutionDescription: "Disparo automatizado de conteúdos científicos e bulários técnicos aprovados via canais digitais com taxa de abertura superior a 60%.",
    businessCaseRoi: "Aumento de 8.3% no recall contínuo de prescrição sustentado ao longo de 90 dias, gerando ganho de $290k/ano.",
    financialGainEstimateUsd: 290000,
    gcpMonthlyCostUsd: 380,
    costBreakdown: {
      bigqueryUsd: 180,
      vertexAiUsd: 140,
      cloudRunUsd: 40,
      storageUsd: 20
    },
    requiredTables: ["Doctor_Registry", "VisitEvents", "Omnichannel_Engagements"],
    requiredColumns: ["doctor_id", "opt_in_whatsapp", "last_visit_date", "specialty_tag"],
    guardrails: "Opt-in obrigatório e auditado em Dataplex; zero envio sem consentimento prévio registrado.",
    confidenceScore: 0.91,
    status: "VALIDATED",
    keyImprovement: "Construção de camada unificada de dados de CRM no BigQuery integrando Veeva, Salesforce e eventos digitais.",
    gcpExpansionOpportunity: "Consumo de Cloud Run e Vertex AI para geração dinâmica de resumos de ensaios clínicos aprovados pelo compliance.",
    paybackMonths: 1.9
  },
  {
    useCaseId: "uc_hypera_05_sku_margin",
    assessmentId: "asm_hypera_2026",
    rank: 5,
    title: "Otimização de Margem de Contribuição & Mix de Produtos",
    category: "FinOps & Cost",
    businessProblem: "Alocação homogênea de investimento promocional e amostras grátis entre produtos com margens financeiras díspares.",
    solutionDescription: "Priorização algorítmica de incentivos comerciais nos produtos com margem de contribuição líquida superior a 40%.",
    businessCaseRoi: "Ganho de +4.2 pontos percentuais na margem média da carteira de medicamentos, representando $340k/ano.",
    financialGainEstimateUsd: 340000,
    gcpMonthlyCostUsd: 290,
    costBreakdown: {
      bigqueryUsd: 150,
      vertexAiUsd: 90,
      cloudRunUsd: 30,
      storageUsd: 20
    },
    requiredTables: ["SKU_Master", "Commercial_Budget", "Sample_Distribution"],
    requiredColumns: ["sku_id", "gross_margin_pct", "promotional_budget", "unit_cost"],
    guardrails: "Queries SQL estritamente otimizadas com partições por ano e mês de fechamento contábil.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Otimização de custos FinOps com particionamento por mês e uso de tabelas de snapshot mensais no BigQuery.",
    gcpExpansionOpportunity: "Ativação de BigQuery Studio Pipelines para cálculo automático de DRE por SKU em D+1.",
    paybackMonths: 1.3
  },
  {
    useCaseId: "uc_hypera_06_data_agent_genie",
    assessmentId: "asm_hypera_2026",
    rank: 6,
    title: "Data Agent Conversacional BigQuery com Grounding em Grafo",
    category: "GenAI & Data Agents",
    businessProblem: "Lentidão e dependência da equipe de BI para líderes comerciais obterem relatórios de sell-out por praça.",
    solutionDescription: "BigQuery Conversational Data Agent baseado em Gemini 3.8 Flash conectado ao Property Graph para responder perguntas de negócio em segundos.",
    businessCaseRoi: "Redução de 85% no tempo de resposta analítica; autosserviço com zero alucinação.",
    financialGainEstimateUsd: 210000,
    gcpMonthlyCostUsd: 320,
    costBreakdown: {
      bigqueryUsd: 120,
      vertexAiUsd: 140,
      cloudRunUsd: 40,
      storageUsd: 20
    },
    requiredTables: ["enterprise_business_graph", "assessment_tables_catalog", "top_use_cases"],
    requiredColumns: ["table_name", "graph_node_id", "business_metric", "kpi_name"],
    guardrails: "Tratamento elegante de empty states; streaming de respostas e limite forçado de 50 linhas em tabelas.",
    confidenceScore: 0.97,
    status: "VALIDATED",
    keyImprovement: "Criação do Property Graph nativo no BigQuery com GRAPH_TABLE para relacionar médicos, farmácias, SKUs e metas.",
    gcpExpansionOpportunity: "Substituição de ferramentas proprietárias de BI conversacional por BigQuery Data Agents nativos no GCP.",
    paybackMonths: 2.1
  }
];

// 3. Casos de Uso para NUBANK (Fintech & Banco Digital)
export const NUBANK_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_nubank_01_realtime_churn",
    assessmentId: "asm_nubank_2026",
    rank: 1,
    title: "Prevenção de Churn & Retenção Preditiva de Clientes Alta Renda",
    category: "Causal AI & Retenção",
    businessProblem: "Migração silenciosa de saldos e transações de clientes Ultravioleta para outros bancos digitais antes do encerramento formal da conta.",
    solutionDescription: "Monitoramento de micro-sinais de desengajamento (redução na frequência de abertura do app, estagnação de Pix) com modelos causais no Vertex AI.",
    businessCaseRoi: "Retenção de $720k/ano em receita de intercâmbio e investimentos com intervenções automatizadas em D+3.",
    financialGainEstimateUsd: 720000,
    gcpMonthlyCostUsd: 680,
    costBreakdown: {
      bigqueryUsd: 380,
      vertexAiUsd: 190,
      cloudRunUsd: 70,
      storageUsd: 40
    },
    requiredTables: ["eventos_navegacao_app", "saldos_diarios", "transacoes_ultravioleta", "pesquisas_csat"],
    requiredColumns: ["customer_id", "delta_saldo_30d", "dias_sem_pix", "segmento_renda"],
    guardrails: "Opt-out de campanhas e governança estrita de privacidade sob LGPD.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Implementação de BigQuery BI Engine e Vertex AI Vector Search para cálculo em tempo real de embeddings de comportamento do cliente.",
    gcpExpansionOpportunity: "Consumo de BigQuery Slots para streaming analytics em 50M+ de eventos diários.",
    paybackMonths: 1.3
  },
  {
    useCaseId: "uc_nubank_02_instant_credit",
    assessmentId: "asm_nubank_2026",
    rank: 2,
    title: "Esteira de Crédito Pré-Aprovado & Ajuste Algorítmico de Limite",
    category: "AI/ML Preditivo",
    businessProblem: "Limites estáticos de cartão de crédito não acompanham a evolução de renda instantânea dos usuários, gerando recusas em compras de alto valor.",
    solutionDescription: "Modelos preditivos in-database no BigQuery ML com avaliação contínua de capacidade de pagamento e ampliação segura de limites.",
    businessCaseRoi: "Expansão de 14% no faturamento total de cartões com incremento de $610k/ano em margem líquida.",
    financialGainEstimateUsd: 610000,
    gcpMonthlyCostUsd: 590,
    costBreakdown: {
      bigqueryUsd: 320,
      vertexAiUsd: 180,
      cloudRunUsd: 60,
      storageUsd: 30
    },
    requiredTables: ["faturas_consolidadas", "entradas_pix_recorrentes", "limites_historicos", "score_credito"],
    requiredColumns: ["user_uuid", "renda_estimada_ia", "limite_atual", "taxa_utilizacao_90d"],
    guardrails: "Testes A/B rigorosos com grupos de controle para medição de risco e inadimplência marginal.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Substituição de pipelines externos em Python por BigQuery ML in-database, eliminando custos de transferência e acelerando retreinamento.",
    gcpExpansionOpportunity: "Consumo contínuo de Vertex AI Feature Store e BigQuery ML para milhões de correntistas.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_nubank_03_fraud_graph",
    assessmentId: "asm_nubank_2026",
    rank: 3,
    title: "Grafo de Risco Transacional & Prevenção de Contas Laranjas",
    category: "Graph Analytics & GQL",
    businessProblem: "Criação de redes de contas de passagem usadas para pulverização de quantias de golpes e fraudes bancárias.",
    solutionDescription: "BigQuery Property Graph utilizando sintaxe nativa GQL para identificar anéis de relacionamento e contas receptoras com alta centralidade de risco.",
    businessCaseRoi: "Bloqueio de $510k/ano em prejuízos financeiros e redução drástica de notificações judiciais.",
    financialGainEstimateUsd: 510000,
    gcpMonthlyCostUsd: 540,
    costBreakdown: {
      bigqueryUsd: 310,
      vertexAiUsd: 140,
      cloudRunUsd: 50,
      storageUsd: 40
    },
    requiredTables: ["enterprise_business_graph", "transferencias_pix", "dispositivos_vinculados", "denuncias_bacen"],
    requiredColumns: ["conta_origem", "conta_destino", "valor_pix", "timestamp_transacao", "score_grafo"],
    guardrails: "Quarentena temporária de fundos com comprovação documental em menos de 1 hora.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Adoção de BigQuery Property Graph DDL com GRAPH_TABLE para substituir bancos de grafos proprietários de alto custo de licença.",
    gcpExpansionOpportunity: "Grande vitrine para o recurso de Property Graph do BigQuery no setor financeiro da América Latina.",
    paybackMonths: 1.6
  },
  {
    useCaseId: "uc_nubank_04_support_agent",
    assessmentId: "asm_nubank_2026",
    rank: 4,
    title: "Agente IA Autônomo para Resolução de Disputas de Fatura",
    category: "GenAI & Agentes",
    businessProblem: "Tempo excessivo de análise humana para chargebacks não reconhecidos pelo cliente, gerando atrito e custo operacional.",
    solutionDescription: "Agente inteligente construído no Cloud Run com Gemini 3.8 Flash para conciliação automática de comprovantes de pagamento e regras de bandeira.",
    businessCaseRoi: "Resolução de 58% das disputas em menos de 3 minutos, com economia operacional de $380k/ano.",
    financialGainEstimateUsd: 380000,
    gcpMonthlyCostUsd: 430,
    costBreakdown: {
      bigqueryUsd: 190,
      vertexAiUsd: 170,
      cloudRunUsd: 50,
      storageUsd: 20
    },
    requiredTables: ["disputas_fatura", "logs_transacoes_adquirente", "regras_bandeira_mastercard", "comprovantes_gcs"],
    requiredColumns: ["disputa_id", "motivo_contestacao", "status_bandeira", "evidencias_aceitas"],
    guardrails: "Decisões de estorno acima de R$ 5.000 passam por validação humana em 2ª instância.",
    confidenceScore: 0.93,
    status: "VALIDATED",
    keyImprovement: "Grounding estrito do Gemini no BigQuery com resposta em streaming para reduzir latência de percepção do usuário.",
    gcpExpansionOpportunity: "Volume massivo de requisições de Vertex AI Gemini 3.8 Flash e Cloud Run.",
    paybackMonths: 1.7
  },
  {
    useCaseId: "uc_nubank_05_finops_dataplex",
    assessmentId: "asm_nubank_2026",
    rank: 5,
    title: "Governança FinOps & Otimização de Armazenamento/Slots BigQuery",
    category: "FinOps & Infraestrutura",
    businessProblem: "Crescimento exponencial de dados analíticos sem políticas automatizadas de particionamento e ciclo de vida, elevando custos de nuvem.",
    solutionDescription: "Auditoria contínua de consultas e tabelas com Dataplex e BigQuery INFORMATION_SCHEMA, identificando queries ineficientes e tabelas frias para migração ao BigQuery Long-Term Storage.",
    businessCaseRoi: "Economia anual direta de $440k em custos de processamento analítico com 0 perda de performance.",
    financialGainEstimateUsd: 440000,
    gcpMonthlyCostUsd: 310,
    costBreakdown: {
      bigqueryUsd: 170,
      vertexAiUsd: 80,
      cloudRunUsd: 30,
      storageUsd: 30
    },
    requiredTables: ["INFORMATION_SCHEMA_JOBS_BY_PROJECT", "TABLE_STORAGE_USAGE", "QUERY_HISTORY"],
    requiredColumns: ["job_id", "total_bytes_billed", "query_text", "cache_hit", "referenced_tables"],
    guardrails: "Nenhuma tabela é arquivada sem aprovação prévia do time de engenharia de dados responsável.",
    confidenceScore: 0.97,
    status: "VALIDATED",
    keyImprovement: "Aplicação das boas práticas oficiais de particionamento e clustering do BigQuery para reduzir bytes faturados em mais de 50%.",
    gcpExpansionOpportunity: "Migração para o modelo de BigQuery Editions (Enterprise Plus) com slots flexíveis e autoscaling de computação.",
    paybackMonths: 1.1
  },
  {
    useCaseId: "uc_nubank_06_investments_nba",
    assessmentId: "asm_nubank_2026",
    rank: 6,
    title: "Recomendação Personalizada de Produtos de Investimento (NuInvest)",
    category: "Next-Best-Action",
    businessProblem: "Baixa taxa de conversão de clientes com saldo ocioso em conta corrente para produtos de renda fixa e fundos imobiliários.",
    solutionDescription: "Motor de Next-Best-Action no BigQuery ML que analisa perfil de risco, liquidez necessária e metas financeiras para ofertar o produto mais adequado.",
    businessCaseRoi: "Aumento de 21% na captação líquida de novos ativos sob custódia (AuC), representando ganho de $330k/ano.",
    financialGainEstimateUsd: 330000,
    gcpMonthlyCostUsd: 370,
    costBreakdown: {
      bigqueryUsd: 190,
      vertexAiUsd: 110,
      cloudRunUsd: 40,
      storageUsd: 30
    },
    requiredTables: ["perfil_suitability", "catalogo_investimentos", "saldos_ociosos", "historico_aportes"],
    requiredColumns: ["cliente_id", "perfil_risco", "patrimonio_total", "prazo_almejado"],
    guardrails: "Conformidade obrigatória com suitability da CVM e Anbima; produtos de risco nunca são ofertados a clientes conservadores.",
    confidenceScore: 0.94,
    status: "VALIDATED",
    keyImprovement: "Criação de views analíticas de clientes com zero custo de query através de Materialized Views com atualização incremental no BigQuery.",
    gcpExpansionOpportunity: "Expansão de BigQuery e Looker para relatórios de conformidade regulatória para órgãos fiscalizadores.",
    paybackMonths: 1.5
  }
];

// 4. Casos de Uso para AMBEV (Bens de Consumo & CPG)
export const AMBEV_USE_CASES: ExtendedUseCase[] = [
  {
    useCaseId: "uc_ambev_01_sellout_forecast",
    assessmentId: "asm_ambev_2026",
    rank: 1,
    title: "Previsão de Sell-Out & Reposição Dinâmica para Bares e Restaurantes (BEES)",
    category: "Supply Chain & Demanda",
    businessProblem: "Ruptura de estoque de marcas premium em fins de semana e feriados em estabelecimentos comerciais parceiros.",
    solutionDescription: "Previsão hiperlocal de consumo no BigQuery ML integrando clima, eventos esportivos e histórico de compras da plataforma BEES.",
    businessCaseRoi: "Aumento de 6.8% no sell-out mensal e ganho financeiro estimado em $680k/ano.",
    financialGainEstimateUsd: 680000,
    gcpMonthlyCostUsd: 620,
    costBreakdown: {
      bigqueryUsd: 340,
      vertexAiUsd: 180,
      cloudRunUsd: 60,
      storageUsd: 40
    },
    requiredTables: ["pedidos_bees", "cadastro_pontos_venda", "previsao_meteorologica", "calendario_eventos"],
    requiredColumns: ["pdv_id", "sku_cerveja", "volume_grade", "temperatura_prevista", "fim_de_semana"],
    guardrails: "Respeito às janelas de entrega de centros de distribuição locais e capacidade de carga da frota.",
    confidenceScore: 0.95,
    status: "VALIDATED",
    keyImprovement: "Uso de BigQuery Time-Series Forecasting (ARIMA_PLUS) com agregação automática de feriados municipais.",
    gcpExpansionOpportunity: "Conexão direta do ecossistema B2B BEES com BigQuery e Vertex AI para pedidos preditivos.",
    paybackMonths: 1.4
  },
  {
    useCaseId: "uc_ambev_02_logistics_routing",
    assessmentId: "asm_ambev_2026",
    rank: 2,
    title: "Otimização de Roteirização de Distribuição & Redução de Carbono",
    category: "Logística & ESG",
    businessProblem: "Custo elevado de combustível e quilometragem rodada da frota de distribuição pesada em grandes regiões metropolitanas.",
    solutionDescription: "Otimização combinatória com Vertex AI e BigQuery GIS gerando rotas eficientes com menor emissão de CO2.",
    businessCaseRoi: "Economia anual de combustível e manutenção calculada em $590k/ano.",
    financialGainEstimateUsd: 590000,
    gcpMonthlyCostUsd: 540,
    costBreakdown: {
      bigqueryUsd: 290,
      vertexAiUsd: 160,
      cloudRunUsd: 50,
      storageUsd: 40
    },
    requiredTables: ["frota_caminhoes", "pontos_entrega_geoloc", "restricoes_horario_cidade", "custos_diesel"],
    requiredColumns: ["veiculo_id", "capacidade_paletes", "latitude_pdv", "longitude_pdv", "janela_descarga"],
    guardrails: "Conformidade com leis trabalhistas de descanso de motoristas e restrições de tráfego de caminhões municipais.",
    confidenceScore: 0.93,
    status: "VALIDATED",
    keyImprovement: "Implementar funções nativas do BigQuery GIS (ST_CLUSTERDBSCAN) para agrupamento geográfico de cargas em tempo real.",
    gcpExpansionOpportunity: "Integração conjunta de BigQuery, Cloud Run e Google Maps Platform.",
    paybackMonths: 1.5
  },
  {
    useCaseId: "uc_ambev_03_pricing_b2b",
    assessmentId: "asm_ambev_2026",
    rank: 3,
    title: "Precificação Dinâmica B2B & Maximização de Margem por Praça",
    category: "FinOps & Receita",
    businessProblem: "Tabelas de preço estáticas desconsideram elasticidade de demanda local e pressão de concorrentes regionais.",
    solutionDescription: "Modelos de elasticidade de preço causal no BigQuery ajustando descontos e incentivos comerciais por categoria e região.",
    businessCaseRoi: "Aumento de +3.1 pontos percentuais na margem de contribuição média, gerando ganho de $470k/ano.",
    financialGainEstimateUsd: 470000,
    gcpMonthlyCostUsd: 460,
    costBreakdown: {
      bigqueryUsd: 250,
      vertexAiUsd: 130,
      cloudRunUsd: 50,
      storageUsd: 30
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
    title: "Prevenção de Perdas por Vencimento & Giro de Estoque em CDs",
    category: "Supply Chain & S&OP",
    businessProblem: "Descartes de lotes de bebidas em centros de distribuição decorrentes de descompasso entre fabricação e giro de vendas.",
    solutionDescription: "Monitoramento de shelf-life com BigQuery Analytics acionando campanhas de escoamento no BEES para lotes com proximidade de vencimento.",
    businessCaseRoi: "Redução de 41% no descarte de produtos e recuperação de $390k/ano em custos de perda de produto.",
    financialGainEstimateUsd: 390000,
    gcpMonthlyCostUsd: 380,
    costBreakdown: {
      bigqueryUsd: 200,
      vertexAiUsd: 110,
      cloudRunUsd: 40,
      storageUsd: 30
    },
    requiredTables: ["estoque_lotes_cds", "shelf_life_produtos", "giro_vendas_recentes", "campanhas_promocionais"],
    requiredColumns: ["lote_id", "sku_codigo", "data_fabricacao", "data_validade", "quantidade_paletes"],
    guardrails: "Produtos com validade inferior a 30 dias não são ofertados para venda regular.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Automação de pipelines com BigQuery Studio Pipelines e alertas idempotentes para a equipe de trade marketing.",
    gcpExpansionOpportunity: "Modernização das esteiras de dados com BigQuery e Dataplex Data Lineage para rastreabilidade de lotes.",
    paybackMonths: 1.2
  },
  {
    useCaseId: "uc_ambev_05_trade_marketing",
    assessmentId: "asm_ambev_2026",
    rank: 5,
    title: "Auditoria Visual de Gôndolas & Geladeiras com Vertex AI Vision",
    category: "Visão Computacional & IA",
    businessProblem: "Dificuldade para aferir conformidade de planogramas de geladeiras e presença de marcas concorrentes nos pontos de venda.",
    solutionDescription: "Classificação automática de fotos de geladeiras enviadas pelos promotores usando modelos de Gemini 3.8 Flash Multimodal no Vertex AI.",
    businessCaseRoi: "Elevação de 18% no cumprimento de contratos de visibilidade de gôndola, gerando $320k/ano.",
    financialGainEstimateUsd: 320000,
    gcpMonthlyCostUsd: 410,
    costBreakdown: {
      bigqueryUsd: 160,
      vertexAiUsd: 180,
      cloudRunUsd: 40,
      storageUsd: 30
    },
    requiredTables: ["fotos_gondolas_gcs", "contratos_visibilidade_pdv", "reconhecimento_skus_ia", "auditorias_campo"],
    requiredColumns: ["foto_uri", "pdv_id", "share_of_shelf_detectado", "concorrentes_detectados", "data_auditoria"],
    guardrails: "Rosto de pessoas presentes nas imagens é automaticamente borrado antes da análise para proteção de privacidade.",
    confidenceScore: 0.92,
    status: "VALIDATED",
    keyImprovement: "Processamento de imagens diretamente do Cloud Storage chamando Vertex AI Gemini 3.8 Multimodal com persistência de metadados no BigQuery.",
    gcpExpansionOpportunity: "Consumo maciço de tokens multimodais do Gemini no Vertex AI para dezenas de milhares de promotores de campo.",
    paybackMonths: 1.8
  },
  {
    useCaseId: "uc_ambev_06_conversational_bees",
    assessmentId: "asm_ambev_2026",
    rank: 6,
    title: "Data Agent de Insights para Gerentes de Vendas e Trade",
    category: "GenAI & Data Agents",
    businessProblem: "Gerentes regionais levam horas consultando múltiplos relatórios para identificar quais rotas estão abaixo da meta.",
    solutionDescription: "Data Agent conversacional no BigQuery com interface em linguagem natural, respondendo perguntas como 'quais cidades de MG tiveram maior queda de cerveja puro malte esta semana?'.",
    businessCaseRoi: "Ganho de agilidade comercial e economia de 15.000 horas/ano da liderança de vendas ($260k/ano).",
    financialGainEstimateUsd: 260000,
    gcpMonthlyCostUsd: 350,
    costBreakdown: {
      bigqueryUsd: 150,
      vertexAiUsd: 130,
      cloudRunUsd: 40,
      storageUsd: 30
    },
    requiredTables: ["enterprise_business_graph", "metas_vendas_regionais", "faturamento_diario_skus"],
    requiredColumns: ["gerente_id", "territorio_nome", "meta_volume", "volume_realizado", "gap_meta"],
    guardrails: "Isolamento de dados por território garantido por Row-Level Security no BigQuery.",
    confidenceScore: 0.96,
    status: "VALIDATED",
    keyImprovement: "Conexão do Data Agent ao BigQuery Property Graph para entendimento semântico de hierarquias de produtos e canais de distribuição.",
    gcpExpansionOpportunity: "Demonstração de liderança de GenAI corporativa com BigQuery Data Agents em larga escala.",
    paybackMonths: 2.0
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
