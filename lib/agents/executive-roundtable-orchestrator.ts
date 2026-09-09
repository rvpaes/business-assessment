// lib/agents/executive-roundtable-orchestrator.ts - Orquestrador Multi-Agente ADK da Mesa Redonda Executiva
import {
  ExecutiveAgentCEO,
  ExecutiveAgentCTO,
  ExecutiveAgentCFO,
  ExecutiveAgentCMO,
  ExecutiveAgentModerator,
  ExecutiveContext
} from "./adk-executive-personas";
import { logStructuredStep } from "../gcp/bigquery";
import { 
  CustomerAssessment, 
  TopUseCase, 
  ExecutiveRoundTableResult, 
  ExecutiveRoundTableTurn 
} from "../types";

export type RoundTableProgressCallback = (update: {
  phase: "OPENING" | "APPRAISAL" | "CROSS_DEBATE" | "SYNTHESIS";
  currentRole?: string;
  turn?: ExecutiveRoundTableTurn;
  message: string;
}) => void;

export async function runExecutiveRoundTable(
  assessment: CustomerAssessment,
  useCase: TopUseCase,
  onProgress?: RoundTableProgressCallback
): Promise<ExecutiveRoundTableResult> {
  const turns: ExecutiveRoundTableTurn[] = [];

  const ctx: ExecutiveContext = {
    assessment,
    useCase
  };

  logStructuredStep({
    severity: "INFO",
    phase: "CEN_EXECUTION",
    toolAction: "start_executive_roundtable",
    thought: `Iniciando Mesa Redonda com os 5 Agentes ADK Executivos para "${useCase.title}" (${assessment.customerName}).`
  });

  // Instanciação dos 5 Agentes ADK Individuais
  const moderator = new ExecutiveAgentModerator();
  const ceoAgent = new ExecutiveAgentCEO();
  const ctoAgent = new ExecutiveAgentCTO();
  const cfoAgent = new ExecutiveAgentCFO();
  const cmoAgent = new ExecutiveAgentCMO();

  // =========================================================================
  // FASE 1: Abertura da Sessão pelo Moderador (Rodada 1)
  // =========================================================================
  onProgress?.({
    phase: "OPENING",
    currentRole: "MODERATOR",
    message: "🏛️ Moderador abrindo a Sessão Extraordinária do Board Executivo..."
  });

  const openingTurn = await moderator.openSession(ctx);
  turns.push(openingTurn);

  onProgress?.({
    phase: "OPENING",
    currentRole: "MODERATOR",
    turn: openingTurn,
    message: "✅ Abertura concluída. Solicitando pareceres técnicos, financeiros e de mercado dos diretores."
  });

  // =========================================================================
  // FASE 2: Pareceres Individuais C-Level (Rodada 2)
  // Executados de forma concorrente via Gemini 3.8 Flash para máxima performance
  // =========================================================================
  onProgress?.({
    phase: "APPRAISAL",
    message: "📊 Executivos ADK analisando o caso sob as diretrizes de persona_adk.pdf..."
  });

  const [ceoInitial, ctoInitial, cfoInitial, cmoInitial] = await Promise.all([
    ceoAgent.evaluateInitial(ctx),
    ctoAgent.evaluateInitial(ctx),
    cfoAgent.evaluateInitial(ctx),
    cmoAgent.evaluateInitial(ctx)
  ]);

  turns.push(ceoInitial, ctoInitial, cfoInitial, cmoInitial);

  onProgress?.({
    phase: "APPRAISAL",
    message: "✅ Pareceres individuais de CEO, CTO, CFO e CMO consolidados com sucesso."
  });

  // =========================================================================
  // FASE 3: Debate Cruzado & Confronto Executivo (Rodada 3)
  // Os executivos reagem aos pareceres e restrições dos colegas de diretoria
  // =========================================================================
  onProgress?.({
    phase: "CROSS_DEBATE",
    message: "⚔️ Rodada de debate cruzado e confronto entre as diretorias..."
  });

  const previousForDebate = [ceoInitial, ctoInitial, cfoInitial, cmoInitial];

  const [ceoDebate, ctoDebate, cfoDebate, cmoDebate] = await Promise.all([
    ceoAgent.reactInDebate(ctx, previousForDebate),
    ctoAgent.reactInDebate(ctx, previousForDebate),
    cfoAgent.reactInDebate(ctx, previousForDebate),
    cmoAgent.reactInDebate(ctx, previousForDebate)
  ]);

  turns.push(ceoDebate, ctoDebate, cfoDebate, cmoDebate);

  onProgress?.({
    phase: "CROSS_DEBATE",
    message: "✅ Debate cruzado finalizado com alinhamento de trade-offs e condicionantes."
  });

  // =========================================================================
  // FASE 4: Síntese e Ata Final do Board (Rodada 4)
  // =========================================================================
  onProgress?.({
    phase: "SYNTHESIS",
    currentRole: "MODERATOR",
    message: "📋 Moderador compilando a Ata Executiva, Consenso do Board e Checklist de Sabatina GCP..."
  });

  const { synthesisTurn, summary } = await moderator.synthesizeBoard(ctx, turns);
  turns.push(synthesisTurn);

  onProgress?.({
    phase: "SYNTHESIS",
    currentRole: "MODERATOR",
    turn: synthesisTurn,
    message: "🎉 Mesa Redonda Concluída com Veredito e Sabatina GCP prontos."
  });

  logStructuredStep({
    severity: "INFO",
    phase: "CEN_EXECUTION",
    toolAction: "complete_executive_roundtable",
    thought: `Mesa Redonda finalizada para "${useCase.title}". Veredito Geral: ${summary.overallVerdict} (Alinhamento: ${summary.alignmentScore}%).`
  });

  return {
    caseId: useCase.useCaseId,
    caseTitle: useCase.title,
    customerName: assessment.customerName,
    industry: assessment.industry,
    turns,
    summary
  };
}
