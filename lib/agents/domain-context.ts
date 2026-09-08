// lib/agents/domain-context.ts - Inteligência de Domínio Universal para Agentes NC-MAD
import { TopUseCase } from "@/lib/types";
import { getCustomerUseCases } from "@/lib/data/customer-usecases-catalog";

export interface IndustryDomainContext {
  industry: string;
  companyProfile: string;
  coreStrategicPillars: string[];
  ecosystem: string;
  suggestedDomainTables: { name: string; desc: string; domain: string }[];
  forbiddenKeywords: string[];
  referenceUseCases: TopUseCase[];
}

interface SectorOntologyDefinition {
  industry: string;
  defaultProfileTemplate: (name: string, info?: string) => string;
  coreStrategicPillarsTemplate: (name: string) => string[];
  ecosystem: string;
  suggestedDomainTables: { name: string; desc: string; domain: string }[];
  forbiddenKeywords: string[];
}

const GLOBAL_BETTING_KEYWORDS = [
  "aposta", "apostas", "apostador", "ludopatia", "cassino", "casino", "igaming", "bet", "bets", "odds", "jogo de azar"
];

const SECTOR_ONTOLOGIES: Record<string, SectorOntologyDefinition> = {
  "Farmacêutica & Saúde": {
    industry: "Farmacêutica & Saúde",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma organização de ponta no setor farmacêutico e de saúde${info ? `, atuando em ${info}` : ", abrangendo medicamentos de prescrição, isentos de prescrição (OTC), genéricos e dermocosméticos"}, com ampla rede de distribuição em farmácias, hospitais e clínicas médicas.`,
    coreStrategicPillarsTemplate: (name) => [
      `Previsão hiperlocal de demanda e erradicação de ruptura de estoque (OOS) na rede de farmácias e distribuidores de ${name}.`,
      "Otimização algorítmica de S&OP multinível conectando complexos fabris, centros de distribuição e grandes redes varejistas.",
      "Eficácia da força de vendas médica: inteligência causal para roteirização e engajamento científico com médicos prescritores.",
      "Geomarketing prescritivo (Modelo Gravitacional de Huff no BigQuery GIS) correlacionando consultórios e pontos de venda.",
      "Otimização de margem de contribuição por SKU e gestão de bonificações contratuais para canais farmacêuticos.",
      "Conformidade rigorosa com normas do CFM, Anvisa, regulação CMED e proteção de dados sensíveis (LGPD)."
    ],
    ecosystem: "Redes farmacêuticas, distribuidoras de medicamentos, farmácias independentes, clínicas, médicos e órgãos reguladores (Anvisa/CMED).",
    suggestedDomainTables: [
      { name: "SellOut_Weekly", desc: "Volume de vendas diárias e semanais de medicamentos na ponta por farmácia/PDV", domain: "Vendas Sell-Out" },
      { name: "Pharmacy_Master", desc: "Cadastro de farmácias e drogarias parceiras (CNPJ, rede, coordenadas GIS)", domain: "Cadastros PDV" },
      { name: "Doctor_Registry", desc: "Cadastro de médicos prescritores (CRM, especialidade, potencial de prescrição)", domain: "Classe Médica" },
      { name: "Prescriber_Visits", desc: "Histórico de visitas da força de vendas médica de campo", domain: "Força de Vendas" },
      { name: "Inventory_Distribution", desc: "Estoque disponível, em trânsito e ponto de ressuprimento por Centro de Distribuição", domain: "Supply Chain" },
      { name: "SKU_Master", desc: "Catálogo de medicamentos, posologia, margem e princípio ativo", domain: "Portfólio de Produtos" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "cartão de crédito", "correntista", "pix fraudulento", "adquirência"
    
    ]
  },

  "Bens de Consumo & CPG": {
    industry: "Bens de Consumo & CPG",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma empresa de liderança em bens de consumo massivo e produtos de alto giro (CPG)${info ? `, com foco em ${info}` : ", operando ampla capilaridade logística e distribuição direta (DSD) e B2B"} para milhares de pontos de venda no varejo tradicional e alimentar.`,
    coreStrategicPillarsTemplate: (name) => [
      `Previsão hiperlocal de demanda de ${name} integrando fatores climáticos, sazonalidade e histórico de sell-out por PDV.`,
      "Roteirização inteligente da frota de distribuição direta (DSD) e redução de quilometragem rodada.",
      "Recomendações Next-Best-Action (NBA) e elasticidade de preço em plataformas B2B para pequenos e médios varejistas.",
      "Monitoramento de ativos no ponto de venda (refrigeradores/chopeiras IoT) e telemetria de consumo energético.",
      "FinOps e consolidação analítica de terabytes de telemetria no BigQuery com particionamento otimizado."
    ],
    ecosystem: "Pontos de venda (PDVs alimentares, bares, restaurantes), centros de distribuição, distribuidores regionais e frotas de entrega.",
    suggestedDomainTables: [
      { name: "SellOut_PDV", desc: "Histórico de compras e consumo por ponto de venda parceiro", domain: "Vendas" },
      { name: "Logistica_Rotas", desc: "Telemetria de entregas, tempos de parada e consumo de diesel", domain: "Logística" },
      { name: "Catalogo_SKU", desc: "Produtos, marcas, embalagens e custos unitários", domain: "Produtos" },
      { name: "Digital_B2B_Orders", desc: "Pedidos e engajamento no marketplace/app B2B", domain: "Canais Digitais" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "prescrição médica", "crm médico"
    
    ]
  },

  "Financeiro & Fintech": {
    industry: "Financeiro & Fintech",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma instituição financeira/fintech orientada a dados${info ? `, especializada em ${info}` : ", com atuação em crédito, contas digitais, meios de pagamento e investimentos"}, com rigorosa observância às normas do Banco Central (Bacen).`,
    coreStrategicPillarsTemplate: (name) => [
      `Score preditivo de crédito em tempo real e concessão dinâmica de limite para clientes de ${name}.`,
      "Motor causal de anomalias e prevenção contra fraudes em transações Pix, cartões virtuais e canais móveis em sub-segundo.",
      "Modelagem de cobrança e renegociação personalizada de dívidas (Uplift Modeling) por múltiplos canais digitais.",
      "Triagem automatizada de Pessoas Expostas Politicamente (PEP) e prevenção à lavagem de dinheiro (PLD-FT).",
      "Otimização FinOps de consultas SQL analíticas de extratos e histórico transacional no BigQuery."
    ],
    ecosystem: "Correntistas, birôs de crédito (Serasa/Boa Vista), arranjos de pagamento (Mastercard/Visa), bancos parceiros e reguladores (Bacen/Coaf).",
    suggestedDomainTables: [
      { name: "Transacoes_Cartao", desc: "Histórico detalhado de transações, estabelecimentos e valores", domain: "Transacional" },
      { name: "Eventos_Pix", desc: "Transferências instantâneas, chaves de destino e timestamps", domain: "Pagamentos" },
      { name: "Cadastro_Clientes", desc: "Dados cadastrais, score de birô e limites de crédito", domain: "Cadastro" },
      { name: "Historico_Cobranca", desc: "Faturas em atraso, acionamentos de cobrança e acordos", domain: "Crédito" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "prescrição médica", "farmácia satélite", "bulário"
    
    ]
  },

  "Varejo & E-commerce": {
    industry: "Varejo & E-commerce",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma rede de destaque no comércio varejista físico e plataforma de e-commerce${info ? `, especializada em ${info}` : ", integrando lojas físicas, marketplace e múltiplos centros de distribuição"} para milhões de consumidores.`,
    coreStrategicPillarsTemplate: (name) => [
      `Motor de recomendação personalizada (Next-Best-Offer) em tempo real no app e site de ${name}.`,
      "Precificação dinâmica competitiva e otimização de margem por microrregião e categoria de produtos.",
      "Previsão de demanda omnicanal e alocação equilibrada de inventário entre centros de distribuição e lojas físicas.",
      "Detecção precoce de abandono de clientes e campanhas automatizadas de retenção e reengajamento.",
      "Data Agents de autosserviço para compradores e gestores de categorias comerciais."
    ],
    ecosystem: "Consumidores finais, sellers de marketplace, fornecedores industriais, transportadoras e redes de lojas.",
    suggestedDomainTables: [
      { name: "Pedidos_Vendas", desc: "Transações de vendas em lojas físicas, app e e-commerce", domain: "Vendas" },
      { name: "Navegacao_Clickstream", desc: "Eventos de navegação, visualizações de produto e buscas", domain: "Clickstream" },
      { name: "Estoque_Lojas_CDs", desc: "Disponibilidade de produtos por centro de distribuição e filial", domain: "Logística" },
      { name: "Catalogo_Produtos", desc: "Catálogo de SKUs, categorias, fornecedores e custos", domain: "Produtos" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "prescrição médica", "crm médico"
    
    ]
  },

  "Manufatura & Indústria": {
    industry: "Manufatura & Indústria",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma referência no setor industrial e de manufatura pesada${info ? `, atuando em ${info}` : ", com complexas plantas de produção, linhas contínuas de transformação e cadeia integrada de suprimentos"}.`,
    coreStrategicPillarsTemplate: (name) => [
      `OEE preditivo em tempo real e prevenção de paradas não programadas em linhas fabris de ${name}.`,
      "Manutenção preditiva causal de ativos críticos, motores e fornos industriais com telemetria IoT.",
      "Otimização de rendimento de matéria-prima e eficiência energética de processos de alta temperatura.",
      "Planejamento Mestre de Produção (MPS) e S&OP integrado multinível para atendimento à carteira de pedidos.",
      "Inspeção automatizada de qualidade superficial e redução de refugo/sucata com Visão Computacional."
    ],
    ecosystem: "Plantas industriais, fornecedores de matéria-prima, distribuidores B2B, concessionárias de energia e operadores logísticos.",
    suggestedDomainTables: [
      { name: "Telemetria_Sensores_IoT", desc: "Leituras contínuas de vibração, temperatura e rotação de motores", domain: "IoT Industrial" },
      { name: "Ordens_Producao_SAP", desc: "Ordens de fabricação, apontamentos de turno e lotes concluídos", domain: "Produção" },
      { name: "Historico_Manutencoes_SAP", desc: "Ordens de manutenção corretiva e preventiva de equipamentos", domain: "Manutenção" },
      { name: "Registros_Qualidade", desc: "Laudos de inspeção de qualidade, testes laboratoriais e refugos", domain: "Qualidade" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "cartão de crédito", "correntista", "prescrição médica"
    
    ]
  },

  "Logística & Supply Chain": {
    industry: "Logística & Supply Chain",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma operadora logística e de transportes de alta performance${info ? `, especializada em ${info}` : ", gerenciando frotas rodoviárias, multimodais, centros de distribuição e armazenagem avançada"}.`,
    coreStrategicPillarsTemplate: (name) => [
      `Roteirização dinâmica de frotas e otimização de última milha via BigQuery GIS para ${name}.`,
      "Torre de controle preditiva de ETA e gestão dinâmica de fluxo em pátios e docas de carregamento.",
      "Telemetria de frotas em tempo real: prevenção de sinistros e monitoramento de consumo de diesel.",
      "Gestão do ciclo de vida e manutenção preditiva de frotas e veículos pesados.",
      "FinOps de fretes: auditoria automatizada de Conhecimentos de Transporte (CT-e) e faturamento."
    ],
    ecosystem: "Embarcadores de carga, motoristas próprios e agregados, concessionárias de rodovias, terminais portuários e seguradoras.",
    suggestedDomainTables: [
      { name: "Telemetria_GPS_Veiculos", desc: "Waypoints, velocidade, paradas e coordenadas geoespaciais", domain: "Telemetria" },
      { name: "Entregas_Pedidos_Paradas", desc: "Notas fiscais, janelas de entrega e status de descarga", domain: "Operações" },
      { name: "Agendamento_Docas", desc: "Agendamentos de carregamento e tempos de permanência em armazém", domain: "Armazém" },
      { name: "Faturas_CTe", desc: "Conhecimentos de transporte, valores de frete e pedágios", domain: "Finanças" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "prescrição médica", "crm médico"
    
    ]
  },

  "Energia & Utilities": {
    industry: "Energia & Utilities",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma das principais empresas do setor de energia e infraestrutura${info ? `, com forte presença em ${info}` : ", atuando em geração, transmissão, distribuição de energia ou óleo, gás e biocombustíveis"}.`,
    coreStrategicPillarsTemplate: (name) => [
      `Previsão de carga e despacho em subestações com BigQuery Time Series para ${name}.`,
      "Detecção causal de perdas não técnicas e fraudes em medidores inteligentes IoT.",
      "Manutenção preditiva de linhas de transmissão, dutos e turbinas com BigQuery GIS e imagens de satélite.",
      "Otimização preditiva de portfólio no Mercado Livre de Energia (ACL) e cálculo de risco de mercado.",
      "Gestão automatizada de emissões de carbono (ESG) e conformidade regulatória contínua perante órgãos fiscalizadores."
    ],
    ecosystem: "Consumidores livres e cativos, operadora nacional do sistema (ONS), câmara de comercialização (CCEE) e órgãos reguladores.",
    suggestedDomainTables: [
      { name: "Medicao_Carga_Subestacoes", desc: "Telemetria horária de demanda ativa e reativa por circuito", domain: "Operações de Rede" },
      { name: "Curva_Carga_Consumidores", desc: "Consumo de medidores inteligentes de unidades consumidoras", domain: "Medição" },
      { name: "Geometria_Linhas_Transmissao", desc: "Traçados GIS de linhas, torres, dutos e faixas de servidão", domain: "Ativos Espaciais" },
      { name: "Contratos_Energia_CCEE", desc: "Volumes contratados, liquidação financeira e histórico de PLD", domain: "Trading" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "prescrição médica", "carrinho abandonado"
    
    ]
  },

  "Telecom & Mídia": {
    industry: "Telecom & Mídia",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma operadora de telecomunicações e serviços digitais de larga escala${info ? `, prestando serviços de ${info}` : ", com redes móveis 5G, fibra óptica, conectividade corporativa e plataformas de mídia"}.`,
    coreStrategicPillarsTemplate: (name) => [
      `Prevenção preditiva de churn e retenção omnicanal na base de assinantes de ${name}.`,
      "Otimização geoespacial de cobertura de células 5G e qualidade de sinal com BigQuery GIS.",
      "Motor de Next-Best-Offer (NBA) para upgrades de planos no app e canais de atendimento.",
      "Detecção de anomalias em tempo real no tráfego de rede e mitigação de degradação de SLA.",
      "FinOps contínuo de capacidade de rede e auditoria de contratos de interconexão."
    ],
    ecosystem: "Assinantes pessoa física, clientes corporativos B2B, canais de call center, parceiros de conteúdo e agência reguladora.",
    suggestedDomainTables: [
      { name: "Trafego_Torres_Celulares", desc: "Volume de dados, chamadas caídas e taxa de ocupação de células", domain: "Engenharia de Rede" },
      { name: "Base_Assinantes_Planos", desc: "Cadastro de clientes, plano contratado, tenure e histórico de faturas", domain: "Cadastro" },
      { name: "Interacoes_Atendimento_URA", desc: "Chamadas no call center, tickets de suporte e pesquisas de NPS", domain: "Customer Care" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "prescrição médica", "talhão agrícola", "colhedora"
    
    ]
  },

  "Agronegócio & Bioenergia": {
    industry: "Agronegócio & Bioenergia",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma das principais empresas do agronegócio e produção sustentável${info ? `, especializada em ${info}` : ", operando extensas fazendas de grãos, cana-de-açúcar, algodão ou complexos de bioenergia e açúcar/etanol"}.`,
    coreStrategicPillarsTemplate: (name) => [
      `Previsão de produtividade agrícola por talhão com imagens de satélite (Sentinel) no BigQuery GIS para ${name}.`,
      "Otimização de janela de colheita e roteirização de maquinário agrícola no campo.",
      "Gestão preditiva de estoques de grãos em silos e planejamento de frete rodoferroviário de escoamento.",
      "Manutenção preditiva de frotas de tratores e colhedoras com telemetria CAN/IoT em tempo real.",
      "Rastreabilidade socioambiental e certificação de não desmatamento (EUDR/CAR) no Knowledge Catalog."
    ],
    ecosystem: "Fazendas produtoras, cooperativas agrícolas, complexos de silos, tradings globais de grãos e terminais de exportação.",
    suggestedDomainTables: [
      { name: "Talhoes_Fazendas_GIS", desc: "Polígonos geoespaciais de cada talhão, cultura plantada e área em hectares", domain: "Geomarketing & Campo" },
      { name: "Indices_Vegetacao_NDVI", desc: "Séries temporais de índices de biomassa e sanidade vegetal por satélite", domain: "Sensoriamento Remoto" },
      { name: "Telemetria_Maquinario_CAN", desc: "Consumo de combustível, rotação de motor e velocidade de colheita", domain: "Maquinário" },
      { name: "Capacidade_Silos_Estoques", desc: "Volume armazenado, teor de umidade de grãos e contratos de embarque", domain: "Logística" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "cartão de crédito", "correntista", "prescrição médica", "bulário"
    
    ]
  },

  "Tecnologia & SaaS": {
    industry: "Tecnologia & SaaS",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma empresa de tecnologia e plataforma de software como serviço (SaaS)${info ? `, com foco em ${info}` : ", fornecendo soluções digitais escaláveis para milhares de clientes corporativos e usuários ativos"}.`,
    coreStrategicPillarsTemplate: (name) => [
      `Predição causal de expansão de contas (Net Retention Rate) e mitigação de churn de assinaturas de ${name}.`,
      "Telemetria de uso de produto e detecção em tempo real de gargalos de performance com BigQuery Continuous Queries.",
      "Motor de recomendação de features e upsell baseado no comportamento analítico do usuário na plataforma.",
      "FinOps contínuo de custos de infraestrutura multi-tenant com mensuração de margem bruta por cliente.",
      "Governança automatizada de APIs, logs de segurança e conformidade LGPD/SOC-2 com Dataplex."
    ],
    ecosystem: "Usuários finais, administradores de contas, desenvolvedores parceiros, marketplaces de integrações e infraestrutura cloud.",
    suggestedDomainTables: [
      { name: "Eventos_Telemetria_App", desc: "Cliques, fluxos de uso de funcionalidades e tempo de resposta de API", domain: "Telemetria de Produto" },
      { name: "Contratos_Assinaturas_MRR", desc: "Planos contratados, MRR/ARR, histórico de upgrades e cancelamentos", domain: "Receita Recorrente" },
      { name: "Custos_Infraestrutura_Tenant", desc: "Consumo de CPU, banco de dados e armazenamento por organização", domain: "FinOps" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "prescrição médica", "talhão agrícola", "forno de laminação"
    
    ]
  },

  "Educação & Serviços": {
    industry: "Educação & Serviços",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma instituição de ensino e prestação de serviços de grande porte${info ? `, atuando em ${info}` : ", abrangendo ensino superior presencial, polos de educação a distância (EAD) e programas executivos"}.`,
    coreStrategicPillarsTemplate: (name) => [
      `Modelo preditivo de evasão universitária e intervenção pedagógica antecipada em ${name}.`,
      "Captação dinâmica de alunos e otimização de alocação de investimentos em mídia de performance.",
      "Otimização algorítmica de enturmação e alocação do corpo docente em salas físicas e virtuais.",
      "Personalização de trilhas de aprendizagem e recomendação adaptativa de materiais didáticos.",
      "Gestão preditiva de inadimplência e réguas automatizadas de renegociação financeira digital."
    ],
    ecosystem: "Alunos, corpo docente, coordenadores de curso, polos educacionais, fornecedores de conteúdo e Ministério da Educação (MEC).",
    suggestedDomainTables: [
      { name: "Matriculas_Alunos", desc: "Histórico acadêmico, notas, frequência em aulas e status financeiro", domain: "Acadêmico" },
      { name: "Interacoes_Ambiente_EAD", desc: "Acessos ao LMS, visualização de videoaulas e entrega de trabalhos", domain: "Engajamento EAD" },
      { name: "Campanhas_Vestibular_Captacao", desc: "Leads inscritos, custo por aquisição e taxa de conversão de matrícula", domain: "Comercial" }
    ],
    forbiddenKeywords: [
      ...GLOBAL_BETTING_KEYWORDS,
      "forno industrial", "talhão agrícola"
    
    ]
  },

  "iGaming & Apostas Regulamentadas": {
    industry: "iGaming & Apostas Regulamentadas",
    defaultProfileTemplate: (name, info) => 
      `${name} é uma operadora de apostas esportivas e jogos online devidamente credenciada perante o Ministério da Fazenda e a Secretaria de Prêmios e Apostas (SPA)${info ? `, especializada em ${info}` : ""}, com rigoroso compromisso com a integridade esportiva e o jogo responsável.`,
    coreStrategicPillarsTemplate: (name) => [
      `Detecção precoce de comportamento de risco e intervenção proativa em jogo responsável para clientes de ${name}.`,
      "Prevenção contra lavagem de dinheiro (PLD), uso de contas laranjas e triagem automatizada de PEPs.",
      "Monitoramento em tempo real de padrões anômalos de apostas para salvaguarda da integridade esportiva.",
      "Otimização de campanhas promocionais e retenção sustentável com governança de limites financeiros.",
      "Geração automatizada de relatórios regulatórios e trilhas de auditoria para o Ministério da Fazenda e SPA."
    ],
    ecosystem: "Apostadores cadastrados, provedores de jogos homologados, birôs de KYC, arranjos de pagamento Pix e órgãos reguladores (SPA/MF).",
    suggestedDomainTables: [
      { name: "Transacoes_Apostas_Pix", desc: "Depósitos, saques e transferências de saldos via Pix", domain: "Pagamentos" },
      { name: "Historico_Apostas_Eventos", desc: "Apostas realizadas, odds, modalidades esportivas e desfecho", domain: "Apostas" },
      { name: "Cadastro_Apostadores_KYC", desc: "Validação biométrica, CPF, status PEP e limites de autoexclusão", domain: "Conformidade" }
    ],
    forbiddenKeywords: [
      "prescrição médica", "crm médico", "talhão agrícola", "forno siderúrgico", "leito hospitalar", "abastecimento de farmácias"
    ]
  }
};

/**
 * Motor de resolução de setor ultra-preciso baseado em ontologia semântica
 */
function detectIndustry(
  customerName: string,
  industryOverride?: string,
  additionalInfo?: string,
  websiteUrl?: string
): string {
  if (industryOverride && SECTOR_ONTOLOGIES[industryOverride]) {
    return industryOverride;
  }

  const combined = `${customerName || ""} ${industryOverride || ""} ${additionalInfo || ""} ${websiteUrl || ""}`.toLowerCase();

  if (combined.includes("farma") || combined.includes("pharma") || combined.includes("saúde") || combined.includes("saude") || combined.includes("medic") || combined.includes("drog") || combined.includes("hypera") || combined.includes("ems") || combined.includes("eurofarma")) {
    return "Farmacêutica & Saúde";
  }
  if (combined.includes("bebida") || combined.includes("consumo") || combined.includes("cpg") || combined.includes("alimento") || combined.includes("ambev") || combined.includes("heineken") || combined.includes("coca") || combined.includes("nestle") || combined.includes("jbs")) {
    return "Bens de Consumo & CPG";
  }
  if (combined.includes("banco") || combined.includes("bank") || combined.includes("finan") || combined.includes("fintech") || combined.includes("credito") || combined.includes("crédito") || combined.includes("cartao") || combined.includes("cartão") || combined.includes("digio") || combined.includes("nubank") || combined.includes("itau") || combined.includes("bradesco") || combined.includes("santander") || combined.includes("stone") || combined.includes("picpay")) {
    return "Financeiro & Fintech";
  }
  if (combined.includes("varejo") || combined.includes("e-commerce") || combined.includes("comercio") || combined.includes("magalu") || combined.includes("mercado livre") || combined.includes("americanas") || combined.includes("renner") || combined.includes("lojas")) {
    return "Varejo & E-commerce";
  }
  if (combined.includes("manufat") || combined.includes("industria") || combined.includes("indústria") || combined.includes("fabril") || combined.includes("siderurg") || combined.includes("aco") || combined.includes("aço") || combined.includes("embraer") || combined.includes("gerdau") || combined.includes("usiminas") || combined.includes("suzano") || combined.includes("klabin") || combined.includes("weg")) {
    return "Manufatura & Indústria";
  }
  if (combined.includes("logíst") || combined.includes("logist") || combined.includes("transporte") || combined.includes("frota") || combined.includes("entrega") || combined.includes("jsl") || combined.includes("loggi") || combined.includes("rumo") || combined.includes("vli") || combined.includes("localiza") || combined.includes("movida")) {
    return "Logística & Supply Chain";
  }
  if (combined.includes("energ") || combined.includes("oleo") || combined.includes("óleo") || combined.includes("gas") || combined.includes("gás") || combined.includes("petrobras") || combined.includes("eletro") || combined.includes("raizen") || combined.includes("cpfl") || combined.includes("solar") || combined.includes("eolica") || combined.includes("eólica")) {
    return "Energia & Utilities";
  }
  if (combined.includes("telecom") || combined.includes("celular") || combined.includes("5g") || combined.includes("fibra") || combined.includes("vivo") || combined.includes("claro") || combined.includes("tim") || combined.includes("midia") || combined.includes("mídia") || combined.includes("globo")) {
    return "Telecom & Mídia";
  }
  if (combined.includes("agro") || combined.includes("agricol") || combined.includes("agrícol") || combined.includes("fazenda") || combined.includes("grao") || combined.includes("grão") || combined.includes("soja") || combined.includes("milho") || combined.includes("cana") || combined.includes("safra") || combined.includes("slc") || combined.includes("jalles")) {
    return "Agronegócio & Bioenergia";
  }
  if (combined.includes("saas") || combined.includes("software") || combined.includes("tecnologia") || combined.includes("app") || combined.includes("plataforma") || combined.includes("totvs") || combined.includes("ifood") || combined.includes("locaweb")) {
    return "Tecnologia & SaaS";
  }
  if (combined.includes("educa") || combined.includes("ensino") || combined.includes("escola") || combined.includes("faculdade") || combined.includes("universidade") || combined.includes("ead") || combined.includes("aluno") || combined.includes("estacio") || combined.includes("cogna") || combined.includes("yduqs")) {
    return "Educação & Serviços";
  }
  if (combined.includes("aposta") || combined.includes("bet") || combined.includes("cassino") || combined.includes("casino") || combined.includes("igaming") || combined.includes("odd") || combined.includes("ludopat") || combined.includes("betano") || combined.includes("betfair") || combined.includes("estrelabet")) {
    return "iGaming & Apostas Regulamentadas";
  }

  // Padrão geral de negócios corporativos
  return "Manufatura & Indústria";
}

/**
 * Função Universal de Contexto de Domínio:
 * Resolve dinamicamente o perfil, pilares estratégicos, tabelas canônicas e guardrails
 * para QUALQUER cliente corporativo no Brasil ou no mundo.
 */
export function getCustomerDomainContext(
  customerName: string,
  industryOverride?: string,
  additionalInfo?: string,
  websiteUrl?: string
): IndustryDomainContext {
  const targetName = (customerName || "").trim() || "Empresa Corporativa";
  const matchedIndustry = detectIndustry(targetName, industryOverride, additionalInfo, websiteUrl);
  const ontology = SECTOR_ONTOLOGIES[matchedIndustry] || SECTOR_ONTOLOGIES["Manufatura & Indústria"];

  const companyProfile = ontology.defaultProfileTemplate(targetName, additionalInfo);
  const coreStrategicPillars = ontology.coreStrategicPillarsTemplate(targetName);
  const referenceUseCases = getCustomerUseCases(targetName, matchedIndustry);

  return {
    industry: matchedIndustry,
    companyProfile,
    coreStrategicPillars,
    ecosystem: ontology.ecosystem,
    suggestedDomainTables: ontology.suggestedDomainTables,
    forbiddenKeywords: ontology.forbiddenKeywords,
    referenceUseCases
  };
}
