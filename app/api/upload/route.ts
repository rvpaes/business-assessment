// app/api/upload/route.ts - Endpoint de Upload de ZIP e Ingestão no GCS + BigQuery
import { NextRequest, NextResponse } from "next/server";
import { uploadAssessmentPackage } from "@/lib/gcp/storage";
import { parseAssessmentZip } from "@/lib/parser/metadata-parser";
import { saveAssessmentToBigQuery, logStructuredStep } from "@/lib/gcp/bigquery";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const customerName = (formData.get("customerName") as string) || "Cliente Não Informado";
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo ZIP não enviado." }, { status: 400 });
    }

    logStructuredStep({
      severity: "INFO",
      phase: "INGESTION",
      toolAction: "upload_zip_received",
      thought: `Recebido arquivo ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) para cliente ${customerName}.`
    });

    const arrayBuffer = await file.arrayBuffer();
    const zipBuffer = Buffer.from(arrayBuffer);

    // 1. Extração dos arquivos em memória
    const zip = await JSZip.loadAsync(zipBuffer);
    const extractedFiles: { name: string; buffer: Buffer; contentType: string }[] = [];

    const manifestFile = zip.file("metadata_assessment_manifest.json");
    if (manifestFile) {
      extractedFiles.push({
        name: "metadata_assessment_manifest.json",
        buffer: Buffer.from(await manifestFile.async("arraybuffer")),
        contentType: "application/json"
      });
    }

    const dictFile = zip.file("data_catalog_dictionary.csv");
    if (dictFile) {
      extractedFiles.push({
        name: "data_catalog_dictionary.csv",
        buffer: Buffer.from(await dictFile.async("arraybuffer")),
        contentType: "text/csv"
      });
    }

    const summaryFile = zip.file("executive_assessment_summary.md");
    if (summaryFile) {
      extractedFiles.push({
        name: "executive_assessment_summary.md",
        buffer: Buffer.from(await summaryFile.async("arraybuffer")),
        contentType: "text/markdown"
      });
    }

    // 2. Upload para o GCS no padrão: gs://dass-2026/business_assessment/{datahoje_hora_nome_cliente}/
    const gcsResult = await uploadAssessmentPackage(customerName, zipBuffer, extractedFiles);

    // 3. Parser e agregação dos metadados
    const parsedData = await parseAssessmentZip(customerName, zipBuffer, gcsResult.archiveUri);

    // 4. Gravação no BigQuery
    await saveAssessmentToBigQuery(parsedData.assessment, parsedData.tables);

    logStructuredStep({
      severity: "INFO",
      phase: "INGESTION",
      toolAction: "upload_ingestion_complete",
      thought: `Assessment ${parsedData.assessment.assessmentId} gravado com sucesso no BigQuery e GCS (${gcsResult.folderUri}).`
    });

    return NextResponse.json({
      success: true,
      assessment: parsedData.assessment,
      gcsResult,
      topTablesSample: parsedData.tables.slice(0, 20)
    });
  } catch (error: any) {
    console.error("Erro no processamento do upload:", error);
    logStructuredStep({
      severity: "ERROR",
      phase: "INGESTION",
      toolAction: "upload_failed",
      outputSummary: error.message
    });
    return NextResponse.json({ error: error.message || "Falha interna no upload" }, { status: 500 });
  }
}
