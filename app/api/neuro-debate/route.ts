// app/api/neuro-debate/route.ts - Execução e Streaming do Debate Multi-Agente NC-MAD
import { NextRequest, NextResponse } from "next/server";
import { runNeuroDebatePipeline } from "@/lib/agents/neuro-debate-orchestrator";
import { runOptimizedBigQueryQuery } from "@/lib/gcp/bigquery";
import { PROJECT_ID, DATASET_ID } from "@/lib/gcp/auth";
import { CustomerAssessment, TableCatalogItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assessment, tables } = body;

    let targetAssessment: CustomerAssessment = assessment;
    let targetTables: TableCatalogItem[] = tables || [];

    // Se tabelas não foram passadas no corpo, busca do BigQuery
    if (!targetTables || targetTables.length === 0) {
      const bqSql = `
        SELECT 
          table_key, assessment_id, project_id, dataset_id, table_name,
          table_type, table_description, column_count, documented_columns,
          estimated_rows, estimated_bytes, dataplex_profile_scan_active
        FROM \`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\`
        WHERE assessment_id = '${targetAssessment?.assessmentId || ""}'
        ORDER BY estimated_rows DESC
        LIMIT 50;
      `;
      try {
        const rows = await runOptimizedBigQueryQuery(bqSql, "Fetch Catalog for Debate");
        targetTables = rows.map((r: any) => ({
          tableKey: r.table_key,
          assessmentId: r.assessment_id,
          projectId: r.project_id,
          datasetId: r.dataset_id,
          tableName: r.table_name,
          tableType: r.table_type,
          tableDescription: r.table_description,
          columnCount: r.column_count,
          documentedColumns: r.documented_columns,
          estimatedRows: r.estimated_rows,
          estimatedBytes: r.estimated_bytes,
          dataplexProfileScanActive: r.dataplex_profile_scan_active
        }));
      } catch (e) {
        console.warn("Não foi possível carregar tabelas do BigQuery, usando fallback:", e);
      }
    }

    if (!targetAssessment) {
      return NextResponse.json({ error: "Assessment não fornecido para o debate." }, { status: 400 });
    }

    // Execução do pipeline NC-MAD completo com Gemini 3.8 Flash
    const debateResult = await runNeuroDebatePipeline(targetAssessment, targetTables);

    return NextResponse.json({
      success: true,
      turns: debateResult.turns,
      topUseCases: debateResult.topUseCases,
      salienceMatrix: debateResult.salienceMatrix,
      auditTargets: debateResult.auditTargets
    });
  } catch (error: any) {
    console.error("Erro no debate multi-agente:", error);
    return NextResponse.json({ error: error.message || "Falha na orquestração do debate" }, { status: 500 });
  }
}
