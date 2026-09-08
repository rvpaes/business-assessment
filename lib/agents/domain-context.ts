// lib/agents/domain-context.ts - Inteligência de Domínio e Contexto Setorial para Agentes NC-MAD
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

export function getCustomerDomainContext(
  customerName: string,
  industryOverride?: string,
  additionalInfo?: string
): IndustryDomainContext {
  const normName = (customerName || "").toLowerCase();
  const normInd = (industryOverride || "").toLowerCase();

  // 1. Farmacêutica & Saúde (ex: Hypera Pharma, EMS, Eurofarma, etc.)
  if (
    normName.includes("hypera") ||
    normName.includes("farma") ||
    normName.includes("pharma") ||
    normName.includes("saude") ||
    normName.includes("saúde") ||
    normName.includes("neo quimica") ||
    normName.includes("drog") ||
    normInd.includes("farma") ||
    normInd.includes("saúde") ||
    normInd.includes("saude")
  ) {
    return {
      industry: "Farmacêutica & Saúde",
      companyProfile: `${customerName || "Hypera Pharma"} é uma das maiores empresas farmacêuticas e de cuidados com a saúde da América Latina, líder de mercado em medicamentos isentos de prescrição (OTC), genéricos e similares (ex: Neo Química), dermocosméticos (ex: Mantecorp Skincare) e medicamentos de prescrição médica com marcas consagradas (Benegrip, Neosaldina, Engov, Doril, Epocler, Estomazil, Coristina d, Alivium, Rinosoro, Vitasay).`,
      coreStrategicPillars: [
        "Previsão hiperlocal de demanda e erradicação de ruptura de estoque (out-of-stock) em mais de 85.000 farmácias e drogarias (PDVs) em todo o Brasil.",
        "Otimização algorítmica de S&OP e abastecimento multinível entre plantas industriais (ex: complexo de Anápolis), 14 centros de distribuição regionais e grandes redes (Raia Drogasil, Pague Menos, Panvel, DPSP).",
        "Eficácia da força de vendas e representantes de campo: inteligência causal para roteirização e aumento de conversão de prescrições médicas por especialidade (pediatria, cardiologia, clínica médica).",
        "Geomarketing prescritivo (Modelo Gravitacional de Huff): correlação espacial entre consultórios médicos, fluxo urbano e farmácias satélites onde o paciente compra o medicamento prescrito.",
        "Otimização de margem de contribuição por SKU e alocação de verba promocional/bonificações para grandes redes e distribuidores.",
        "Engajamento omnichannel e CRM científico com a classe médica e farmácias independentes, com conformidade rigorosa com normas do CFM, Anvisa, regulação CMED e LGPD.",
        "Data Agents de autosserviço com BigQuery para a diretoria comercial consultar sell-out, market share e inventário em sub-segundo."
      ],
      ecosystem: "Redes farmacêuticas (Abrafarma), distribuidores atacadistas, farmácias independentes, hospitais, médicos prescritores e órgãos reguladores (Anvisa / CMED).",
      suggestedDomainTables: [
        { name: "SellOut_Weekly", desc: "Volume de vendas diárias e semanais de medicamentos na ponta por farmácia/PDV", domain: "Vendas Sell-Out" },
        { name: "Pharmacy_Master", desc: "Cadastro nacional de 85.000+ farmácias e drogarias (CNPJ, endereço, rede, coordenadas GIS)", domain: "Cadastros PDV" },
        { name: "Doctor_Registry", desc: "Cadastro de médicos prescritores (CRM, UF, especialidade médica, potencial de prescrição)", domain: "Classe Médica" },
        { name: "Prescriber_Visits", desc: "Histórico de visitas da força de vendas de campo a médicos e clínicas", domain: "Força de Vendas" },
        { name: "Inventory_Distribution", desc: "Estoque disponível, em trânsito e ponto de ressuprimento por Centro de Distribuição", domain: "Supply Chain & Estoque" },
        { name: "SKU_Master", desc: "Catálogo de medicamentos, posologia, margem de contribuição, princípio ativo e linha", domain: "Portfólio de Produtos" },
        { name: "Commercial_Budget", desc: "Alocação de verbas comerciais, descontos contratuais e bonificações por rede", domain: "Finanças Comerciais" }
      ],
      forbiddenKeywords: [
        "aposta", "apostas", "apostador", "ludopatia", "cassino", "casino", "igaming", "bet", "bets", "odds",
        "salvaguarda social de apostas", "cartão de crédito", "correntista", "pix fraudulento", "adquirência"
      ],
      referenceUseCases: getCustomerUseCases("Hypera Pharma")
    };
  }

  // 2. Bens de Consumo & CPG (ex: Ambev, Heineken, Nestlé, Unilever, etc.)
  if (
    normName.includes("ambev") ||
    normName.includes("heineken") ||
    normName.includes("coca") ||
    normName.includes("nestle") ||
    normName.includes("unilever") ||
    normName.includes("jbs") ||
    normName.includes("brf") ||
    normInd.includes("consumo") ||
    normInd.includes("cpg") ||
    normInd.includes("bebida") ||
    normInd.includes("alimento")
  ) {
    return {
      industry: "Bens de Consumo & CPG",
      companyProfile: `${customerName || "Ambev"} é líder no setor de bens de consumo massivo e bebidas, operando complexa cadeia de abastecimento direto (DSD) e plataforma B2B (ex: BEES) para centenas de milhares de pontos de venda (bares, restaurantes, supermercados e conveniências).`,
      coreStrategicPillars: [
        "Previsão de demanda hiperlocal considerando sazonalidade climática, eventos esportivos e histórico de sell-out.",
        "Otimização logística e roteirização da frota própria e terceirizada de distribuição direta (DSD).",
        "Recomendações personalizadas de Next-Best-Action (NBA) e elasticidade de preço na plataforma B2B para pequenos e médios varejistas.",
        "Monitoramento de ativos conectados (geladeiras e chopeiras IoT) para manutenção preditiva e redução do consumo elétrico.",
        "FinOps e consolidação de terabytes de telemetria analítica no BigQuery com particionamento inteligente."
      ],
      ecosystem: "Pontos de venda (PDVs B2B), centros de distribuição, frotas de entrega, plataformas digitais B2B e consumidores finais.",
      suggestedDomainTables: [
        { name: "SellOut_PDV", desc: "Histórico de compras e consumo por ponto de venda", domain: "Vendas" },
        { name: "Logistica_Rotas", desc: "Telemetria de entregas, tempos de parada e consumo de combustível", domain: "Logística" },
        { name: "Catalogo_SKU", desc: "Produtos, marcas, embalagens e custos unitários", domain: "Produtos" },
        { name: "BEES_Engagement", desc: "Interações, carrinho abandonado e pedidos no marketplace B2B", domain: "Digital B2B" }
      ],
      forbiddenKeywords: [
        "aposta", "apostador", "ludopatia", "cassino", "casino", "igaming", "bet", "prescrição médica", "crm médico"
      ],
      referenceUseCases: getCustomerUseCases("Ambev")
    };
  }

  // 3. Financeiro & Fintech (ex: Digio, Nubank, Itaú, Bradesco, Santander, etc.)
  if (
    normName.includes("digio") ||
    normName.includes("nubank") ||
    normName.includes("inter") ||
    normName.includes("c6") ||
    normName.includes("itau") ||
    normName.includes("bradesco") ||
    normName.includes("santander") ||
    normName.includes("banco") ||
    normName.includes("bank") ||
    normInd.includes("financ") ||
    normInd.includes("fintech")
  ) {
    return {
      industry: "Financeiro & Fintech",
      companyProfile: `${customerName || "Digio"} é uma instituição financeira digital de ponta, focada em crédito pessoal, cartões de crédito, contas digitais, meios de pagamento Pix e soluções bancárias omnichannel.`,
      coreStrategicPillars: [
        "Score preditivo de crédito em tempo real e concessão dinâmica de limite de cartão baseada em comportamento transacional.",
        "Motor de detecção de anomalias e prevenção contra fraudes em Pix, cartões virtuais e tentativas de engenharia social.",
        "Modelagem causal de cobrança e renegociação personalizada de dívidas (Uplift Modeling) por múltiplos canais digitais.",
        "Triagem automatizada de Pessoas Expostas Politicamente (PEP) e sanções com conformidade BACEN e Coaf.",
        "Otimização FinOps de consultas SQL pesadas de faturas e histórico transacional no BigQuery."
      ],
      ecosystem: "Correntistas, birôs de crédito (Serasa/Boa Vista), arranjos de pagamento (Mastercard/Visa), canais digitais e reguladores (Bacen).",
      suggestedDomainTables: [
        { name: "Transacoes_Cartao", desc: "Histórico detalhado de compras, estabelecimentos e valores", domain: "Transacional" },
        { name: "Eventos_Pix", desc: "Transferências instantâneas, chaves de destino e timestamps", domain: "Pagamentos" },
        { name: "Cadastro_Clientes", desc: "Dados cadastrais, score de birô e limites vigentes", domain: "Cadastro" },
        { name: "Historico_Cobranca", desc: "Acionamentos de cobrança, faturas em atraso e acordos", domain: "Crédito & Cobrança" }
      ],
      forbiddenKeywords: [
        "aposta", "apostas", "ludopatia", "cassino", "igaming", "prescrição médica", "farmácia satélite", "bulário"
      ],
      referenceUseCases: getCustomerUseCases("Digio")
    };
  }

  // 4. Varejo & E-commerce (ex: Magazine Luiza, Mercado Livre, etc.)
  if (
    normName.includes("magalu") ||
    normName.includes("mercado livre") ||
    normName.includes("americanas") ||
    normName.includes("casas bahia") ||
    normName.includes("renner") ||
    normInd.includes("varejo") ||
    normInd.includes("e-commerce")
  ) {
    return {
      industry: "Varejo & E-commerce",
      companyProfile: `${customerName} é uma rede líder em comércio varejista físico e plataforma de e-commerce / marketplace, operando milhões de SKUs com entrega expressa e canais digitais integrados.`,
      coreStrategicPillars: [
        "Sistemas de recomendação de produtos em tempo real (Next-Best-Offer) e personalização de vitrine.",
        "Precificação dinâmica competitiva e elasticidade de preço por praça geográfica.",
        "Previsão de demanda em centros de distribuição e mitigação de ruptura de estoque.",
        "Prevenção de churn de sellers no marketplace e detecção de fraudes em pedidos.",
        "Data Agents para autosserviço da equipe comercial e categoria de produtos."
      ],
      ecosystem: "Consumidores finais, sellers do marketplace, fornecedores industriais, transportadoras e lojas físicas.",
      suggestedDomainTables: [
        { name: "Pedidos_Vendas", desc: "Transações de vendas no app, site e lojas físicas", domain: "Vendas" },
        { name: "Navegacao_Cliques", desc: "Eventos de navegação, visualizações de produto e buscas", domain: "Clickstream" },
        { name: "Estoque_CD", desc: "Disponibilidade de produtos por centro de distribuição", domain: "Logística" },
        { name: "Cadastro_Sellers", desc: "Sellers do marketplace, reputação e catálogo", domain: "Marketplace" }
      ],
      forbiddenKeywords: [
        "aposta", "ludopatia", "cassino", "igaming", "prescrição médica", "crm médico"
      ],
      referenceUseCases: getCustomerUseCases("Hypera Pharma")
    };
  }

  // 5. Caso padrão / Genérico Corporativo
  return {
    industry: industryOverride || "Serviços Corporativos & Tecnologia",
    companyProfile: `${customerName} é uma organização corporativa orientada a dados, focada em excelência operacional, digitalização de processos e geração de valor de negócio com inteligência analítica no Google Cloud.`,
    coreStrategicPillars: [
      "Otimização de processos operacionais com modelos preditivos e causais no BigQuery ML.",
      "Engenharia de decisão com Agentes de IA Generativa integrados ao Knowledge Catalog.",
      "Governança de dados com Dataplex, controle de acessos (RLS) e conformidade LGPD.",
      "FinOps contínuo com particionamento de tabelas e otimização de custos de nuvem.",
      "Autosserviço analítico para tomadores de decisão C-Level."
    ],
    ecosystem: "Clientes corporativos, colaboradores, fornecedores e plataformas em nuvem.",
    suggestedDomainTables: [
      { name: "Faturamento_Diario", desc: "Receitas, transações e métricas financeiras", domain: "Financeiro" },
      { name: "Operacoes_Clientes", desc: "Volume operacional, clientes ativos e status de atendimento", domain: "Operações" },
      { name: "Logs_Telemetria", desc: "Eventos de uso, logs de sistema e telemetria analítica", domain: "Telemetria" }
    ],
    forbiddenKeywords: [
      "aposta", "ludopatia", "cassino", "igaming"
    ],
    referenceUseCases: getCustomerUseCases(customerName)
  };
}
