// app/api/sample/route.ts - Carregamento do arquivo de exemplo de assessment
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { uploadAssessmentPackage } from "@/lib/gcp/storage";
import { parseAssessmentZip } from "@/lib/parser/metadata-parser";
import { saveAssessmentToBigQuery, logStructuredStep } from "@/lib/gcp/bigquery";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const customerName = body.customerName || "Hypera Pharma (Exemplo)";
    const industry = body.industry || "";
    const websiteUrl = body.websiteUrl || "";
    const additionalInfo = body.additionalInfo || "";

    const homeDir = os.homedir();
    const samplePaths = [
      path.join(homeDir, "Downloads", "metadata_assessment_organization.zip"),
      "/Users/rafaelpaes/Downloads/metadata_assessment_organization.zip"
    ];

    let samplePath = "";
    for (const p of samplePaths) {
      if (fs.existsSync(p)) {
        samplePath = p;
        break;
      }
    }

    if (!samplePath) {
      return NextResponse.json({
        error: "Arquivo de exemplo não localizado em Downloads/metadata_assessment_organization.zip."
      }, { status: 404 });
    }

    const zipBuffer = fs.readFileSync(samplePath);

    // Extração em memória
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

    // Upload para GCS
    const gcsResult = await uploadAssessmentPackage(customerName, zipBuffer, extractedFiles);

    // Parsing com industryOverride
    const parsedData = await parseAssessmentZip(customerName, zipBuffer, gcsResult.archiveUri, industry || undefined);

    // Gravação no BigQuery
    await saveAssessmentToBigQuery(parsedData.assessment, parsedData.tables);

    logStructuredStep({
      severity: "INFO",
      phase: "INGESTION",
      toolAction: "load_sample_assessment_success",
      thought: `Exemplo carregado para ${customerName}: ${parsedData.tables.length} tabelas indexadas.`
    });

    return NextResponse.json({
      success: true,
      assessment: parsedData.assessment,
      gcsResult,
      topTablesSample: parsedData.tables.slice(0, 30)
    });
  } catch (error: any) {
    console.error("Erro ao carregar sample:", error);
    return NextResponse.json({ error: error.message || "Erro no carregamento do sample" }, { status: 500 });
  }
}
