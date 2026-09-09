// app/api/use-cases/roundtable/route.ts - Endpoint para a Mesa Redonda Executiva dos 5 ADKs
import { NextRequest, NextResponse } from "next/server";
import { runExecutiveRoundTable } from "@/lib/agents/executive-roundtable-orchestrator";
import { CustomerAssessment, TopUseCase } from "@/lib/types";
import { logStructuredStep } from "@/lib/gcp/bigquery";

export const maxDuration = 120; // 2 minutos para orquestração de 5 agentes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assessment, useCase } = body as {
      assessment: CustomerAssessment;
      useCase: TopUseCase;
    };

    if (!assessment || !useCase) {
      return NextResponse.json(
        { error: "Assessment e Caso de Uso são obrigatórios para a Mesa Redonda." },
        { status: 400 }
      );
    }

    logStructuredStep({
      severity: "INFO",
      phase: "CEN_EXECUTION",
      toolAction: "api_executive_roundtable_start",
      thought: `Recebida requisição para Mesa Redonda Executiva do caso "${useCase.title}" (${assessment.customerName}).`
    });

    const result = await runExecutiveRoundTable(assessment, useCase);

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error("Erro na Mesa Redonda Executiva ADK:", error);
    logStructuredStep({
      severity: "ERROR",
      phase: "CEN_EXECUTION",
      toolAction: "api_executive_roundtable_error",
      outputSummary: error.message || "Erro desconhecido na mesa redonda"
    });
    return NextResponse.json(
      { error: error.message || "Falha na execução da Mesa Redonda Executiva." },
      { status: 500 }
    );
  }
}
