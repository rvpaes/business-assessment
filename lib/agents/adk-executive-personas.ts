// lib/agents/adk-executive-personas.ts - Agentes ADK Executivos Individuais (persona_adk.pdf)
import { callGemini38Flash } from "../gcp/gemini-3-8";
import { logStructuredStep } from "../gcp/bigquery";
import { 
  ExecutiveRole, 
  ExecutivePersonaInfo, 
  ExecutiveRoundTableTurn, 
  TopUseCase,
  CustomerAssessment 
} from "../types";
import { EXECUTIVE_PERSONAS } from "../constants/executive-personas";
export { EXECUTIVE_PERSONAS };

export interface ExecutiveContext {
  assessment: CustomerAssessment;
  useCase: TopUseCase;
  domainContext?: any;
}

function buildCaseAndCustomerPromptSnippet(ctx: ExecutiveContext): string {
  const { assessment, useCase } = ctx;
  const annualGain = useCase.financialGainEstimateUsd || 0;
  const monthlyCost = useCase.gcpMonthlyCostUsd || 0;
  const annualCost = monthlyCost * 12;

  return `
========================================================================
CONTEXTO CORPORATIVO DA EMPRESA:
========================================================================
- Nome da Organização: ${assessment.customerName}
- Indústria / Segmento: ${assessment.industry}
${assessment.websiteUrl ? `- Website: ${assessment.websiteUrl}\n` : ""}- Total de Tabelas Catalogadas: ${assessment.totalTables} (${assessment.totalColumns} colunas, ${assessment.docPercentage}% documentadas)
${assessment.additionalInfo ? `- Informações Estratégicas: ${assessment.additionalInfo}\n` : ""}

========================================================================
CASO DE USO SOB AVALIAÇÃO DO BOARD:
========================================================================
- Título do Caso: ${useCase.title}
- Categoria Estratégica: ${useCase.category}
- Problema / Gargalo de Negócio:
  ${useCase.businessProblem}
- Solução Técnica Proposta (Google Cloud):
  ${useCase.solutionDescription}
- Retorno Financeiro Estimado para o Cliente:
  $${annualGain.toLocaleString("en-US")} USD/ano (~R$ ${(annualGain * 5.6).toLocaleString("pt-BR")}/ano)
- Consumo Mensal Google Cloud:
  $${monthlyCost.toLocaleString("en-US")} USD/mês (Anualizado: $${annualCost.toLocaleString("en-US")} USD/ano)
- Discriminação de Custos GCP:
  • BigQuery: $${useCase.costBreakdown?.bigqueryUsd || 0}/mês
  • Vertex AI / Gemini: $${useCase.costBreakdown?.vertexAiUsd || 0}/mês
  • Cloud Run: $${useCase.costBreakdown?.cloudRunUsd || 0}/mês
  • Cloud Storage: $${useCase.costBreakdown?.storageUsd || 0}/mês
- Racional de ROI / Payback: ${useCase.businessCaseRoi}
- Tabelas Analíticas Utilizadas: ${(useCase.requiredTables || []).join(", ") || "Catálogo Corporativo BigQuery"}
- Guardrails e Conformidade: ${useCase.guardrails}
========================================================================
`;
}

// =========================================================================
// 1. CEO ADK (Chief Executive Officer)
// =========================================================================
export class ExecutiveAgentCEO {
  private systemInstruction = `Você atua como o Chief Executive Officer (CEO) da organização. Sua responsabilidade é determinar se este caso de uso fortalece a vantagem competitiva, defende o market share e gera valor duradouro aos acionistas, evitando iniciativas que drenem recursos sem retorno real.
DIRETRIZES DE ANÁLISE:
1. Impacto no Negócio e Valoração da Empresa:
- Identifique como o projeto impacta o Enterprise Value (EV) e a tese de crescimento da empresa (abertura de novos fluxos de receita, aumento de valuation ou retenção de clientes críticos).
- Avalie o Custo de Oportunidade: o que a liderança e a empresa deixarão de fazer se decidirem alocar largura de banda executiva nesta iniciativa?
2. Atritos Operacionais e Mudança de Cultura:
- Aponte a resistência interna esperada (adoção por times de ponta, silos departamentais e curva de aprendizado).
- Mapeie riscos de reputação, continuidade de negócios e governança se a implementação falhar ou atrasar.
3. Perguntas Críticas & Sabatina para a Google Cloud:
- Quais garantias contratuais de SLA e continuidade de suporte sênior a Google Cloud oferece durante o período de rollout crítico?
- Que cases de clientes de porte e setor semelhantes vocês possuem, demonstrando não apenas sucesso técnico, mas aumento real de margem de lucro?
- Como a Google Cloud se compromete contratualmente contra lock-in excessivo ou aumentos agressivos de preço pós-adoção?
FORMATO OBRIGATÓRIO DE RESPOSTA:
- **Tese Estratégica & Impacto no Valor do Negócio**: Análise direta do caso e seu efeito multiplicador no mercado.
- **Fricções de Execução & Riscos Macro**: Principais impedimentos organizacionais e estratégicos.
- **Perguntas Executivas para a Google Cloud**: Sabatina direcionada ao time de contas da GCP.
- **Veredito do CEO**: [APROVADO / REPROVADO / APROVADO COM CONDICIONANTES] acompanhado da justificativa executiva.`;

  async evaluateInitial(ctx: ExecutiveContext): Promise<ExecutiveRoundTableTurn> {
    logStructuredStep({
      severity: "INFO",
      phase: "CEN_EXECUTION",
      agentName: "CEO_ADK",
      thought: `CEO iniciando avaliação estratégica do caso "${ctx.useCase.title}" para ${ctx.assessment.customerName}.`
    });

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

Você está abrindo a rodada de pareceres do Board como Chief Executive Officer (CEO).
Analise o caso de uso estritamente segundo suas diretrizes e preencha todos os campos obrigatórios.
Sua postura é executiva, estratégica e vigilante em relação a valor acionário e governança.

Responda em formato JSON com o seguinte schema:
{
  "content": "Texto executivo completo da sua fala contendo os tópicos obrigatórios formatados em Markdown",
  "strategicThesis": "Síntese da Tese Estratégica & Impacto no Valor do Negócio",
  "executionFrictions": "Síntese das Fricções de Execução & Riscos Macro",
  "googleCloudQuestions": [
    "Pergunta 1 de sabatina para o time de contas da Google Cloud",
    "Pergunta 2 de sabatina para o time de contas da Google Cloud",
    "Pergunta 3 de sabatina para o time de contas da Google Cloud"
  ],
  "verdict": "APROVADO" | "REPROVADO" | "APROVADO COM CONDICIONANTES",
  "verdictJustification": "Justificativa executiva do veredito"
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "MEDIUM",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = {
        content: res.text,
        verdict: "APROVADO COM CONDICIONANTES",
        strategicThesis: "Alinhamento com a agenda de inteligência e valor acionário.",
        executionFrictions: "Curva de capacitação interna e adoção pelas áreas operacionais.",
        googleCloudQuestions: [
          "Garantias de SLA e suporte sênior durante rollout?",
          "Cases auditados do mesmo porte demonstrando aumento real de margem de lucro?",
          "Cláusulas contra aumentos agressivos de preço e proteção de lock-in?"
        ]
      };
    }

    return {
      turnId: `turn_ceo_${Date.now()}`,
      role: "CEO",
      agentName: "Chief Executive Officer (CEO)",
      title: "Parecer Executivo & Impacto Estratégico",
      round: 2,
      phaseName: "Parecer Individual C-Level",
      content: parsed.content || res.text,
      verdict: parsed.verdict || "APROVADO COM CONDICIONANTES",
      structuredSections: {
        strategicThesis: parsed.strategicThesis,
        executionFrictions: parsed.executionFrictions,
        googleCloudQuestions: parsed.googleCloudQuestions
      },
      thoughtLog: res.thoughtText || "Avaliando Enterprise Value, custo de oportunidade e risco de reputação.",
      timestamp: new Date().toISOString()
    };
  }

  async reactInDebate(ctx: ExecutiveContext, previousTurns: ExecutiveRoundTableTurn[]): Promise<ExecutiveRoundTableTurn> {
    const debateSummary = previousTurns.map(t => `${t.role} (${t.agentName}): ${t.content.slice(0, 400)}... Veredito: ${t.verdict || "N/A"}`).join("\n\n");

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

HISTÓRICO DA DISCUSSÃO DO BOARD ATÉ O MOMENTO:
${debateSummary}

Como CEO, você ouviu os pareceres do CTO, CFO e CMO.
Agora, na rodada de debate cruzado e confronto executivo:
- Responda às preocupações financeiras do CFO e às ressalvas de débito técnico/FinOps do CTO.
- Pondere se os ganhos comerciais apontados pelo CMO justificam os riscos de execução.
- Reafirme sua postura de liderança executiva e posicione a organização diante da equipe da Google Cloud.

Responda em formato JSON:
{
  "content": "Sua fala direta na mesa redonda debatendo com os demais diretores (em Markdown, tom C-Level altivo e resolutivo)",
  "verdict": "APROVADO" | "REPROVADO" | "APROVADO COM CONDICIONANTES"
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "LOW",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = { content: res.text, verdict: "APROVADO COM CONDICIONANTES" };
    }

    return {
      turnId: `turn_ceo_debate_${Date.now()}`,
      role: "CEO",
      agentName: "Chief Executive Officer (CEO)",
      title: "Posicionamento no Debate Cruzado",
      round: 3,
      phaseName: "Debate Cruzado & Confronto Executivo",
      content: parsed.content || res.text,
      verdict: parsed.verdict || "APROVADO COM CONDICIONANTES",
      thoughtLog: res.thoughtText || "Harmonizando a balança entre apetite de risco acionário e prudência financeira.",
      timestamp: new Date().toISOString()
    };
  }
}

// =========================================================================
// 2. CTO ADK (Chief Technology Officer)
// =========================================================================
export class ExecutiveAgentCTO {
  private systemInstruction = `Você atua como o Chief Technology Officer (CTO) da organização. Sua avaliação é técnica, profunda e pragmaticamente cética. Você não se deixa levar por hype: analisa arquitetura, segurança, esforço de engenharia, débito técnico e a fatura de nuvem (FinOps).
DIRETRIZES DE ANÁLISE:
1. Análise Financeira sob a Ótica de Engenharia (FinOps):
- Avalie a previsibilidade de custos da infraestrutura GCP envolvida (compute, storage, egress, inferência de LLMs/Vertex AI, BigQuery, licenças).
- Identifique riscos de explosão orçamentária não planejada (ex.: queries ineficientes, picos de requisições, retenção de dados e tráfego de rede entre regiões).
2. Complexidade de Integração e Débito Técnico:
- Mapeie a fricção entre a stack de nuvem legada/on-premise e os serviços propostos da Google Cloud.
- Avalie a disponibilidade de talentos internos: o time tem proficiência técnica nos serviços nativos da GCP ou precisaremos de squads externas caras de consultoria técnica?
- Analise segurança: gestão de identidade (IAM), criptografia de chaves (CMEK), soberania de dados e conformidade (LGPD/GDPR/SOC2).
3. Perguntas Críticas & Sabatina para a Google Cloud:
- Em caso de picos inesperados de consumo de infraestrutura/tokens/APIs, que salvaguardas e hard-limits a GCP fornece para evitar faturas infladas?
- Qual é a arquitetura de referência exata e o diagrama de topologia recomendado para o nosso throughput e requisitos de latência?
- Como funciona o suporte de Enterprise Architect e suporte de engenharia nível 3 (L3) da Google Cloud durante o ciclo de implementação?
- Quais são as cotas de serviço (quotas) padrão e garantias de disponibilidade para os serviços críticos selecionados (ex.: Vertex AI, BigQuery, GKE)?
FORMATO OBRIGATÓRIO DE RESPOSTA:
- **Diagnóstico Técnico & Impacto FinOps**: Projeção de viabilidade, gargalos de rede/latência e custos computacionais.
- **Matriz de Riscos de Engenharia & Segurança**: Débito técnico, vulnerabilidades e complexidade de integração.
- **Sabatina Técnica de Arquitetura para a Google Cloud**: Perguntas duras sobre infraestrutura, escalabilidade e garantias contratuais.
- **Recomendação do CTO**: [VIÁVEL / INVIÁVEL / VIÁVEL COM RESTRIÇÕES ARQUITETURAIS].`;

  async evaluateInitial(ctx: ExecutiveContext): Promise<ExecutiveRoundTableTurn> {
    logStructuredStep({
      severity: "INFO",
      phase: "CEN_EXECUTION",
      agentName: "CTO_ADK",
      thought: `CTO auditando arquitetura, FinOps e débito técnico para "${ctx.useCase.title}".`
    });

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

Você está emitindo seu parecer no Board como Chief Technology Officer (CTO).
Analise o caso de uso sob a ótica estrita de engenharia, segurança da informação, FinOps e integração técnica.
Seja rigoroso, técnico e focado em governança real.

Responda em formato JSON com o seguinte schema:
{
  "content": "Texto executivo completo da sua fala contendo os tópicos obrigatórios formatados em Markdown",
  "technicalDiagnosisFinOps": "Síntese do Diagnóstico Técnico & Impacto FinOps",
  "riskMatrixSecurity": "Síntese da Matriz de Riscos de Engenharia & Segurança",
  "googleCloudQuestions": [
    "Pergunta 1 de sabatina técnica sobre hard-limits e contenção de faturas infladas",
    "Pergunta 2 de sabatina técnica sobre arquitetura de referência e latência",
    "Pergunta 3 de sabatina técnica sobre suporte de Enterprise Architect L3 e cotas de serviço"
  ],
  "verdict": "VIÁVEL" | "INVIÁVEL" | "VIÁVEL COM RESTRIÇÕES ARQUITETURAIS",
  "recommendationJustification": "Justificativa da recomendação técnica"
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "MEDIUM",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = {
        content: res.text,
        verdict: "VIÁVEL COM RESTRIÇÕES ARQUITETURAIS",
        technicalDiagnosisFinOps: "Arquitetura viável no BigQuery e Vertex AI, exigindo cotas reservadas e controle de slots.",
        riskMatrixSecurity: "Necessidade de criptografia CMEK e adequação de papéis IAM com princípio de menor privilégio.",
        googleCloudQuestions: [
          "Quais salvaguardas nativas e hard-limits o GCP oferece para evitar surpresas na fatura de tokens/queries?",
          "Qual o diagrama de arquitetura de referência recomendado para atender o throughput sem degradação de SLA?",
          "Como será estruturado o suporte L3 e o acompanhamento de Enterprise Architecture durante a homologação?"
        ]
      };
    }

    return {
      turnId: `turn_cto_${Date.now()}`,
      role: "CTO",
      agentName: "Chief Technology Officer (CTO)",
      title: "Diagnóstico Técnico, FinOps & Arquitetura",
      round: 2,
      phaseName: "Parecer Individual C-Level",
      content: parsed.content || res.text,
      verdict: parsed.verdict || "VIÁVEL COM RESTRIÇÕES ARQUITETURAIS",
      structuredSections: {
        technicalDiagnosisFinOps: parsed.technicalDiagnosisFinOps,
        riskMatrixSecurity: parsed.riskMatrixSecurity,
        googleCloudQuestions: parsed.googleCloudQuestions
      },
      thoughtLog: res.thoughtText || "Analisando volumetria de queries BigQuery, cotas Vertex AI e integridade de IAM.",
      timestamp: new Date().toISOString()
    };
  }

  async reactInDebate(ctx: ExecutiveContext, previousTurns: ExecutiveRoundTableTurn[]): Promise<ExecutiveRoundTableTurn> {
    const debateSummary = previousTurns.map(t => `${t.role} (${t.agentName}): ${t.content.slice(0, 400)}... Veredito: ${t.verdict || "N/A"}`).join("\n\n");

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

HISTÓRICO DA DISCUSSÃO DO BOARD ATÉ O MOMENTO:
${debateSummary}

Como CTO, você está ouvindo os anseios de expansão do CEO, as exigências de contenção de custos do CFO e a pressão de time-to-market do CMO.
No debate cruzado:
- Esclareça para o CFO como a arquitetura do BigQuery (Slots sob demanda vs edições reservadas) e Cloud Run manterão os custos previstos.
- Exponha para o CMO os limites de SLA e latência de inferência de IA Generativa.
- Confirme ao CEO o plano de contenção de riscos e o playbook de contingência.

Responda em formato JSON:
{
  "content": "Sua fala direta na mesa redonda respondendo tecnicamente às provocações (em Markdown)",
  "verdict": "VIÁVEL" | "INVIÁVEL" | "VIÁVEL COM RESTRIÇÕES ARQUITETURAIS"
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "LOW",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = { content: res.text, verdict: "VIÁVEL COM RESTRIÇÕES ARQUITETURAIS" };
    }

    return {
      turnId: `turn_cto_debate_${Date.now()}`,
      role: "CTO",
      agentName: "Chief Technology Officer (CTO)",
      title: "Contraposição Técnica & Defesa de Arquitetura",
      round: 3,
      phaseName: "Debate Cruzado & Confronto Executivo",
      content: parsed.content || res.text,
      verdict: parsed.verdict || "VIÁVEL COM RESTRIÇÕES ARQUITETURAIS",
      thoughtLog: res.thoughtText || "Equacionando latência de pipelines analíticos e salvaguardas de orçamento de nuvem.",
      timestamp: new Date().toISOString()
    };
  }
}

// =========================================================================
// 3. CFO ADK (Chief Financial Officer)
// =========================================================================
export class ExecutiveAgentCFO {
  private systemInstruction = `Você atua como o Chief Financial Officer (CFO) da organização. Seu dever é zelar pela disciplina de capital, margens operacionais (EBITDA), fluxo de caixa e mitigação de passivos financeiros. Seu padrão de aprovação é fundamentado em dados numéricos e retorno quantificável.
DIRETRIZES DE ANÁLISE:
1. Análise Financeira Estrita (ROI, Payback & TCO):
- Mapeie o TCO (Total Cost of Ownership) em horizontes de 12, 24 e 36 meses, separando CapEx (migração, capacitação, setup) de OpEx recorrente (fatura Google Cloud, manutenção).
- Exija o cálculo de Payback (em quantos meses o capital se paga?) e o ROI projetado (redução direta de despesas ou receita incremental líquida).
- Analise o impacto em Unit Economics: a implementação diminui o custo unitário por transação/cliente ou encarece a operação marginal?
2. Gargalos e Riscos de Fluxo de Caixa:
- Aponte custos invisíveis: tempo ocioso de equipe em treinamento, multas contratuais com vendors legados substituídos e potenciais estouramentos de prazo.
- Avalie a exposição cambial (caso a precificação de serviços GCP seja atrelada ao dólar ou sofra variações tributárias locais).
3. Perguntas Críticas & Sabatina para a Google Cloud:
- Que volume de Cloud Credits (créditos de inovação/migração) e programas de co-investimento (como PSO ou fundos de migração) a Google Cloud disponibilizará para cobrir o custo de transição?
- Quais são os descontos por compromisso de uso contínuo (Committed Use Discounts - CUDs) e quais as multas de saída se não atingirmos o compromisso projetado?
- O faturamento pode ser estruturado localmente para evitar retenções de impostos de importação e volatilidade cambial?
- Qual a flexibilidade contratual para renegociar commitments caso o cenário macroeconômico degrade?
FORMATO OBRIGATÓRIO DE RESPOSTA:
- **Modelo Financeiro & Impacto em EBITDA/Unit Economics**: Avaliação de TCO, ROI e sensibilidade do fluxo de caixa.
- **Ressalvas Orçamentárias & Custos Ocultos**: Pontos de vazamento financeiro e risco de capex/opex.
- **Interrogatório Financeiro/Contratual para a Google Cloud**: Exigências de crédito, descontos e proteções cambiais.
- **Veredito Financeiro**: [APROVADO / REPROVADO / CONDICIONADO A CRÉDITOS E LIMITES CONTRATUAIS].`;

  async evaluateInitial(ctx: ExecutiveContext): Promise<ExecutiveRoundTableTurn> {
    logStructuredStep({
      severity: "INFO",
      phase: "CEN_EXECUTION",
      agentName: "CFO_ADK",
      thought: `CFO calculando modelagem econômica, TCO e unit economics para "${ctx.useCase.title}".`
    });

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

Você está emitindo seu parecer no Board como Chief Financial Officer (CFO).
Examine os números frios: ganho projetado de $${(ctx.useCase.financialGainEstimateUsd || 0).toLocaleString()} USD/ano vs custo de nuvem de $${(ctx.useCase.gcpMonthlyCostUsd || 0).toLocaleString()} USD/mês.
Calcule o payback, TCO em 12, 24 e 36 meses, impacto no EBITDA e os custos invisíveis de capacitação e transição.

Responda em formato JSON com o seguinte schema:
{
  "content": "Texto executivo completo da sua fala contendo os tópicos obrigatórios formatados em Markdown",
  "financialModelEbitda": "Síntese do Modelo Financeiro & Impacto em EBITDA/Unit Economics",
  "budgetaryCaveats": "Síntese das Ressalvas Orçamentárias & Custos Ocultos",
  "googleCloudQuestions": [
    "Pergunta 1 de sabatina financeira sobre Cloud Credits e fundos de co-investimento/PSO",
    "Pergunta 2 de sabatina financeira sobre Committed Use Discounts (CUDs) e multas de saída",
    "Pergunta 3 de sabatina financeira sobre faturamento em moeda local (BRL) e proteções tributárias"
  ],
  "verdict": "APROVADO" | "REPROVADO" | "CONDICIONADO A CRÉDITOS E LIMITES CONTRATUAIS",
  "financialJustification": "Justificativa financeira do veredito"
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "MEDIUM",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = {
        content: res.text,
        verdict: "CONDICIONADO A CRÉDITOS E LIMITES CONTRATUAIS",
        financialModelEbitda: "O business case apresenta ROI positivo expressivo, com payback projetado em curto prazo.",
        budgetaryCaveats: "Riscos cambiais de fatura dolarizada e custos ocultos de curva de aprendizado da equipe.",
        googleCloudQuestions: [
          "Qual o volume de créditos de inovação (Cloud Credits / PSO) que a Google Cloud aportará no onboarding?",
          "Quais são os descontos por compromisso contínuo (CUDs) e a flexibilidade caso o volume oscile?",
          "O faturamento pode ser faturado em reais (BRL) via Google Brasil para neutralizar risco cambial e tributos?"
        ]
      };
    }

    return {
      turnId: `turn_cfo_${Date.now()}`,
      role: "CFO",
      agentName: "Chief Financial Officer (CFO)",
      title: "Modelagem Econômica, Payback & Disciplina de Capital",
      round: 2,
      phaseName: "Parecer Individual C-Level",
      content: parsed.content || res.text,
      verdict: parsed.verdict || "CONDICIONADO A CRÉDITOS E LIMITES CONTRATUAIS",
      structuredSections: {
        financialModelEbitda: parsed.financialModelEbitda,
        budgetaryCaveats: parsed.budgetaryCaveats,
        googleCloudQuestions: parsed.googleCloudQuestions
      },
      thoughtLog: res.thoughtText || "Auditando payback, taxa interna de retorno e contingências tributárias locais.",
      timestamp: new Date().toISOString()
    };
  }

  async reactInDebate(ctx: ExecutiveContext, previousTurns: ExecutiveRoundTableTurn[]): Promise<ExecutiveRoundTableTurn> {
    const debateSummary = previousTurns.map(t => `${t.role} (${t.agentName}): ${t.content.slice(0, 400)}... Veredito: ${t.verdict || "N/A"}`).join("\n\n");

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

HISTÓRICO DA DISCUSSÃO DO BOARD ATÉ O MOMENTO:
${debateSummary}

Como CFO, você assiste aos argumentos de inovação do CEO e CTO.
No debate cruzado:
- Exija do CTO compromissos rígidos de governança FinOps (orçamentos automatizados, quotas e alertas de billing).
- Relembre ao CMO que as metas de receita incremental precisam de comprovação contábil para compor o EBITDA.
- Estabeleça as condições inegociáveis para liberar a assinatura do contrato com a Google Cloud.

Responda em formato JSON:
{
  "content": "Sua fala direta na mesa redonda com tom firme de controladoria e disciplina de capital (em Markdown)",
  "verdict": "APROVADO" | "REPROVADO" | "CONDICIONADO A CRÉDITOS E LIMITES CONTRATUAIS"
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "LOW",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = { content: res.text, verdict: "CONDICIONADO A CRÉDITOS E LIMITES CONTRATUAIS" };
    }

    return {
      turnId: `turn_cfo_debate_${Date.now()}`,
      role: "CFO",
      agentName: "Chief Financial Officer (CFO)",
      title: "Intervenção de Disciplina de Capital & FinOps Guardrails",
      round: 3,
      phaseName: "Debate Cruzado & Confronto Executivo",
      content: parsed.content || res.text,
      verdict: parsed.verdict || "CONDICIONADO A CRÉDITOS E LIMITES CONTRATUAIS",
      thoughtLog: res.thoughtText || "Exigindo garantias de hedging cambial e travas contratuais de overconsumption.",
      timestamp: new Date().toISOString()
    };
  }
}

// =========================================================================
// 4. CMO ADK (Chief Marketing Officer)
// =========================================================================
export class ExecutiveAgentCMO {
  private systemInstruction = `Você atua como o Chief Marketing Officer (CMO) da organização. Sua lente avalia a jornada do cliente, o posicionamento competitivo de marca, a geração de demanda e a rentabilidade por usuário.
DIRETRIZES DE ANÁLISE:
1. Impacto Financeiro Comercial (CAC, LTV e Churn):
- Como este caso de uso reduz o Custo de Aquisição de Clientes (CAC) ou encurta o ciclo de vendas (Sales Cycle)?
- Avalie o impacto direto no Lifetime Value (LTV), Net Revenue Retention (NRR) e na mitigação de cancelamentos (Churn).
- Identifique a contribuição marginal direta para novas receitas decorrentes de personalização ou melhoria no produto/serviço.
2. Dificuldades de Mercado e Adoção pelo Usuário:
- Aponte os atritos na experiência do usuário (UX): a solução cria complexidade desnecessária para o cliente final?
- Mapeie o risco de percepção de marca (ex.: uso invasivo de dados, desconfiança de automações, perda de toque humano).
3. Perguntas Críticas & Sabatina para a Google Cloud:
- Que dados analíticos e modelos preditivos nativos da Google Cloud podem ser integrados diretamente ao nosso stack de CRM e automação de marketing para acelerar o tempo de retorno (Time-to-Value)?
- Como as ferramentas de IA e dados da GCP nos diferenciam comprovadamente dos concorrentes que usam outros provedores de nuvem?
- A Google Cloud oferece programas de co-marketing, divulgação de case studies conjuntos ou suporte de canais para impulsionar a credibilidade da nossa marca no lançamento?
FORMATO OBRIGATÓRIO DE RESPOSTA:
- **Impacto em Métricas Comerciais (CAC, LTV, Churn)**: Análise de tração e retorno em receita na ponta do cliente.
- **Atritos de Mercado & Fricção do Usuário**: Riscos de adoção, usabilidade e imagem de marca.
- **Questionamentos Comerciais e GTM para a Google Cloud**: Demandas sobre aceleração de Time-to-Value e diferenciais de mercado.
- **Posicionamento do CMO**: [APOIO TOTAL / APOIO COM RESSALVAS / NÃO PRIORITÁRIO COMERCIALMENTE].`;

  async evaluateInitial(ctx: ExecutiveContext): Promise<ExecutiveRoundTableTurn> {
    logStructuredStep({
      severity: "INFO",
      phase: "CEN_EXECUTION",
      agentName: "CMO_ADK",
      thought: `CMO avaliando impacto comercial, LTV/CAC e percepção de marca para "${ctx.useCase.title}".`
    });

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

Você está emitindo seu parecer no Board como Chief Marketing Officer (CMO).
Avalie o caso sob a perspectiva do cliente, go-to-market, impacto em CAC, LTV, churn e diferencial competitivo em relação ao mercado.

Responda em formato JSON com o seguinte schema:
{
  "content": "Texto executivo completo da sua fala contendo os tópicos obrigatórios formatados em Markdown",
  "commercialMetricsImpact": "Síntese do Impacto em Métricas Comerciais (CAC, LTV, Churn)",
  "marketFrictions": "Síntese dos Atritos de Mercado & Fricção do Usuário",
  "googleCloudQuestions": [
    "Pergunta 1 de sabatina sobre integração com stack de CRM/Marketing e aceleração de Time-to-Value",
    "Pergunta 2 de sabatina sobre diferenciação competitiva comprovada frente a outros provedores",
    "Pergunta 3 de sabatina sobre programas de co-marketing e apoio no lançamento de cases conjuntos"
  ],
  "verdict": "APOIO TOTAL" | "APOIO COM RESSALVAS" | "NÃO PRIORITÁRIO COMERCIALMENTE",
  "cmoJustification": "Justificativa do posicionamento do CMO"
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "MEDIUM",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = {
        content: res.text,
        verdict: "APOIO TOTAL",
        commercialMetricsImpact: "Aumento de fidelização, encurtamento do ciclo de conversão e elevação do LTV.",
        marketFrictions: "A interface com o cliente precisa ser fluida, sem jargões de IA ou perda do contato humano.",
        googleCloudQuestions: [
          "Como os modelos analíticos do GCP se integram aos nossos canais de engajamento para acelerar o time-to-value?",
          "Qual o diferencial concreto de IA do Google Cloud frente à concorrência para melhorar a experiência do cliente?",
          "O Google Cloud disponibiliza suporte de co-marketing e divulgação de case studies de sucesso?"
        ]
      };
    }

    return {
      turnId: `turn_cmo_${Date.now()}`,
      role: "CMO",
      agentName: "Chief Marketing Officer (CMO)",
      title: "Impacto Comercial, Experiência do Cliente & GTM",
      round: 2,
      phaseName: "Parecer Individual C-Level",
      content: parsed.content || res.text,
      verdict: parsed.verdict || "APOIO TOTAL",
      structuredSections: {
        commercialMetricsImpact: parsed.commercialMetricsImpact,
        marketFrictions: parsed.marketFrictions,
        googleCloudQuestions: parsed.googleCloudQuestions
      },
      thoughtLog: res.thoughtText || "Analisando jornada do cliente, elasticidade de retenção e time-to-market.",
      timestamp: new Date().toISOString()
    };
  }

  async reactInDebate(ctx: ExecutiveContext, previousTurns: ExecutiveRoundTableTurn[]): Promise<ExecutiveRoundTableTurn> {
    const debateSummary = previousTurns.map(t => `${t.role} (${t.agentName}): ${t.content.slice(0, 400)}... Veredito: ${t.verdict || "N/A"}`).join("\n\n");

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

HISTÓRICO DA DISCUSSÃO DO BOARD ATÉ O MOMENTO:
${debateSummary}

Como CMO, você ouviu os receios técnicos do CTO e as travas de caixa do CFO.
No debate cruzado:
- Defenda a urgência comercial: a inação custa market share para os competidores.
- Exija do CTO uma experiência do usuário impecável (baixa latência, design intuitivo, sem telas confusas).
- Assegure ao CFO que o incremento em retenção e cross-sell pagará o investimento nos primeiros trimestres.

Responda em formato JSON:
{
  "content": "Sua fala direta na mesa redonda defendendo a tração de mercado com paixão e números (em Markdown)",
  "verdict": "APOIO TOTAL" | "APOIO COM RESSALVAS" | "NÃO PRIORITÁRIO COMERCIALMENTE"
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "LOW",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = { content: res.text, verdict: "APOIO TOTAL" };
    }

    return {
      turnId: `turn_cmo_debate_${Date.now()}`,
      role: "CMO",
      agentName: "Chief Marketing Officer (CMO)",
      title: "Defesa de Mercado, Time-to-Market & Tração",
      round: 3,
      phaseName: "Debate Cruzado & Confronto Executivo",
      content: parsed.content || res.text,
      verdict: parsed.verdict || "APOIO TOTAL",
      thoughtLog: res.thoughtText || "Defendendo velocidade de implementação para assegurar vantagem de mercado.",
      timestamp: new Date().toISOString()
    };
  }
}

// =========================================================================
// 5. MODERATOR ADK (Executive Round Table Moderator & Strategic Synthesizer)
// =========================================================================
export class ExecutiveAgentModerator {
  private systemInstruction = `Você é o Moderador da Mesa Redonda Executiva & Principal Strategic Advisor do Conselho de Administração. Sua missão é orquestrar o debate de alto nível entre os executivos (CEO, CTO, CFO, CMO), instigar as provocações necessárias entre áreas e sintetizar a ata executiva final com o Consenso do Board, a Matriz Consolidada de Sabatina para a Google Cloud e o Plano de Decisão.`;

  async openSession(ctx: ExecutiveContext): Promise<ExecutiveRoundTableTurn> {
    logStructuredStep({
      severity: "INFO",
      phase: "CEN_EXECUTION",
      agentName: "Moderator_ADK",
      thought: `Moderador abrindo a Mesa Redonda Executiva para o caso "${ctx.useCase.title}".`
    });

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

Você está abrindo oficialmente a Sessão Extraordinária do Board Executivo da empresa ${ctx.assessment.customerName}.
Abra a mesa redonda destacando:
1. A relevância da iniciativa no setor de ${ctx.assessment.industry}.
2. Os números-chave do caso: Investimento Google Cloud vs Retorno Projetado para o Cliente.
3. As expectativas em relação aos pareceres do CEO, CTO, CFO e CMO, com ênfase na preparação para a sabatina técnica e comercial com a equipe da Google Cloud.

Responda em formato JSON com o schema:
{
  "content": "Texto de abertura oficial da mesa redonda em Markdown elegante e executivo",
  "openingRemarks": "Resumo das diretrizes da sessão"
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "LOW",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = { content: res.text };
    }

    return {
      turnId: `turn_mod_open_${Date.now()}`,
      role: "MODERATOR",
      agentName: "Moderador da Mesa Redonda",
      title: "Abertura Oficial da Sessão do Board",
      round: 1,
      phaseName: "Abertura & Contextualização",
      content: parsed.content || res.text,
      thoughtLog: res.thoughtText || "Contextualizando caso de negócio e objetivos do conselho executivo.",
      timestamp: new Date().toISOString()
    };
  }

  async synthesizeBoard(ctx: ExecutiveContext, allTurns: ExecutiveRoundTableTurn[]): Promise<{
    synthesisTurn: ExecutiveRoundTableTurn;
    summary: {
      overallVerdict: string;
      alignmentScore: number;
      keyAgreements: string[];
      criticalContentions: string[];
      gcpSabatinaChecklist: { fromRole: ExecutiveRole; category: string; question: string }[];
      actionPlan: string[];
    };
  }> {
    logStructuredStep({
      severity: "INFO",
      phase: "CEN_EXECUTION",
      agentName: "Moderator_ADK",
      thought: `Moderador sintetizando ata e consenso do conselho executivo para "${ctx.useCase.title}".`
    });

    const debateHistory = allTurns.map(t => `[${t.role} - ${t.agentName}] (Rodada ${t.round}):\n${t.content}\n${t.verdict ? `Veredito: ${t.verdict}\n` : ""}`).join("\n\n---\n\n");

    const prompt = `
${buildCaseAndCustomerPromptSnippet(ctx)}

HISTÓRICO COMPLETO DA MESA REDONDA:
${debateHistory}

Como Moderador e Strategic Advisor, sua tarefa é consolidar a ATA OFICIAL DO CONSELHO EXECUTIVO:
1. Formular o Parecer de Síntese Final (Consenso do Board).
2. Definir o Veredito Geral Unificado: [CONSELHO FAVORÁVEL / CONSELHO FAVORÁVEL COM CONDICIONANTES / PROJETO POSTERGADO].
3. Consolidar o CHECKLIST UNIFICADO DE SABATINA PARA A GOOGLE CLOUD (agrupando as perguntas essenciais do CEO, CTO, CFO e CMO para a próxima reunião com o Account Executive e Customer Engineer da GCP).
4. Estabelecer o Plano de Ação Imediato em 4 etapas.

Responda em formato JSON rigoroso com o schema:
{
  "content": "Ata Executiva Completa de Síntese em Markdown de alta elegância",
  "overallVerdict": "CONSELHO FAVORÁVEL" | "CONSELHO FAVORÁVEL COM CONDICIONANTES" | "PROJETO POSTERGADO",
  "alignmentScore": 92,
  "keyAgreements": [
    "Ponto de convergência 1 entre os diretores",
    "Ponto de convergência 2 entre os diretores",
    "Ponto de convergência 3 entre os diretores"
  ],
  "criticalContentions": [
    "Ponto de atrito ou preocupação mitigada 1",
    "Ponto de atrito ou preocupação mitigada 2"
  ],
  "gcpSabatinaChecklist": [
    { "fromRole": "CEO", "category": "Estratégia & Contrato", "question": "Pergunta para o time da Google Cloud" },
    { "fromRole": "CTO", "category": "Arquitetura & FinOps", "question": "Pergunta para o time da Google Cloud" },
    { "fromRole": "CFO", "category": "Modelagem & Créditos", "question": "Pergunta para o time da Google Cloud" },
    { "fromRole": "CMO", "category": "Go-to-Market & Diferencial", "question": "Pergunta para o time da Google Cloud" }
  ],
  "actionPlan": [
    "Passo 1: Alinhamento de pré-requisitos internos de dados e IAM",
    "Passo 2: Condução da reunião de sabatina com o time de contas da Google Cloud",
    "Passo 3: Negociação de créditos de migração (PSO) e limites de faturamento",
    "Passo 4: Kick-off do MVP com governança no Knowledge Catalog"
  ]
}
`;

    const res = await callGemini38Flash(prompt, {
      thinkingLevel: "MEDIUM",
      responseMimeType: "application/json",
      systemInstruction: this.systemInstruction
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(res.text);
    } catch {
      parsed = {
        content: res.text,
        overallVerdict: "CONSELHO FAVORÁVEL COM CONDICIONANTES",
        alignmentScore: 90,
        keyAgreements: [
          "O retorno financeiro anual esperado é expressivamente superior aos custos de infraestrutura.",
          "A adoção de BigQuery e Gemini 3.8 Flash posiciona a empresa com clara vantagem analítica.",
          "O conselho aprova o avanço para a fase de sabatina formal com a Google Cloud."
        ],
        criticalContentions: [
          "Necessidade de travas contratuais de FinOps e salvaguardas de billing.",
          "Garantia de que a fatura e tributos sejam liquidados em moeda local."
        ],
        gcpSabatinaChecklist: [
          { fromRole: "CEO", category: "Governança & SLA", question: "Quais as garantias contratuais de SLA e mitigação de lock-in pós-adoção?" },
          { fromRole: "CTO", category: "Arquitetura & Hard-limits", question: "Quais hard-limits e quotas serão aplicados para blindar o orçamento de tokens e queries?" },
          { fromRole: "CFO", category: "Créditos & CUDs", question: "Qual montante de Cloud Credits e suporte de engenharia (PSO) será disponibilizado?" },
          { fromRole: "CMO", category: "Integração & Time-to-Value", question: "Qual a velocidade de integração com ferramentas de CRM e suporte de co-marketing?" }
        ],
        actionPlan: [
          "Enviar formalmente o checklist de sabatina ao time de contas da Google Cloud.",
          "Auditar o catálogo de dados no BigQuery para assegurar zero alucinação no MVP.",
          "Validar modelo contratual com proteção cambial e CUDs pré-acordados."
        ]
      };
    }

    const synthesisTurn: ExecutiveRoundTableTurn = {
      turnId: `turn_mod_synthesis_${Date.now()}`,
      role: "MODERATOR",
      agentName: "Moderador da Mesa Redonda",
      title: "Consenso do Board & Veredito Final",
      round: 4,
      phaseName: "Síntese Executiva & Ata de Decisão",
      content: parsed.content || res.text,
      verdict: parsed.overallVerdict || "CONSELHO FAVORÁVEL COM CONDICIONANTES",
      structuredSections: {
        executiveConsensus: parsed.overallVerdict
      },
      thoughtLog: res.thoughtText || "Compilando ata oficial, alinhamento percentual e checklist de sabatina GCP.",
      timestamp: new Date().toISOString()
    };

    return {
      synthesisTurn,
      summary: {
        overallVerdict: parsed.overallVerdict || "CONSELHO FAVORÁVEL COM CONDICIONANTES",
        alignmentScore: parsed.alignmentScore || 90,
        keyAgreements: parsed.keyAgreements || [],
        criticalContentions: parsed.criticalContentions || [],
        gcpSabatinaChecklist: parsed.gcpSabatinaChecklist || [],
        actionPlan: parsed.actionPlan || []
      }
    };
  }
}
