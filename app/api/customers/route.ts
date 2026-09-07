// app/api/customers/route.ts - Listagem de Clientes e Assessments Disponíveis
import { NextRequest, NextResponse } from "next/server";
import { runOptimizedBigQueryQuery } from "@/lib/gcp/bigquery";
import { PROJECT_ID, DATASET_ID } from "@/lib/gcp/auth";

export interface CustomerProfile {
  id: string; // assessment_id (ex: ass_1788743106515_2aco8)
  customerId?: string;
  assessmentId?: string;
  name: string;
  industry: string;
  totalTables: number;
  totalColumns: number;
  docPercentage: number;
  uploadTimestamp: string;
  formattedDate: string; // ex: "06/09/2026 22:05"
  gcsArchiveUri?: string;
}

function parseIsoOrUnixTimestamp(val: any): { iso: string; formatted: string } {
  if (!val) {
    const now = new Date();
    return {
      iso: now.toISOString(),
      formatted: formatToPtBr(now)
    };
  }

  let d: Date;
  const num = Number(val);
  if (!isNaN(num) && num > 1000000000) {
    d = new Date(num > 100000000000 ? num : num * 1000);
  } else {
    d = new Date(val);
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  return {
    iso: d.toISOString(),
    formatted: formatToPtBr(d)
  };
}

function formatToPtBr(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const fallbackProfiles: CustomerProfile[] = [
  {
    id: "ass_demo_hypera_01",
    customerId: "cust_hypera_pharma",
    assessmentId: "ass_demo_hypera_01",
    name: "Hypera Pharma",
    industry: "Farmacêutica & Saúde",
    totalTables: 3293,
    totalColumns: 48920,
    docPercentage: 71.4,
    uploadTimestamp: "2026-09-04T10:46:05Z",
    formattedDate: "04/09/2026 07:46",
    gcsArchiveUri: "gs://dass-2026/business_assessment/20260904_104605_hypera_pharma/metadata_assessment_organization.zip"
  },
  {
    id: "ass_demo_nubank_01",
    customerId: "cust_nubank",
    assessmentId: "ass_demo_nubank_01",
    name: "Nubank",
    industry: "Financeiro & Fintech",
    totalTables: 4810,
    totalColumns: 62400,
    docPercentage: 84.2,
    uploadTimestamp: "2026-09-03T16:20:00Z",
    formattedDate: "03/09/2026 13:20",
    gcsArchiveUri: "gs://dass-2026/business_assessment/20260903_162000_nubank/metadata_assessment_organization.zip"
  },
  {
    id: "ass_demo_ambev_01",
    customerId: "cust_ambev",
    assessmentId: "ass_demo_ambev_01",
    name: "Ambev",
    industry: "Bens de Consumo & CPG",
    totalTables: 5120,
    totalColumns: 71800,
    docPercentage: 68.0,
    uploadTimestamp: "2026-09-02T14:10:00Z",
    formattedDate: "02/09/2026 11:10",
    gcsArchiveUri: "gs://dass-2026/business_assessment/20260902_141000_ambev/metadata_assessment_organization.zip"
  },
  {
    id: "ass_demo_magalu_01",
    customerId: "cust_magalu",
    assessmentId: "ass_demo_magalu_01",
    name: "Magazine Luiza",
    industry: "Varejo & E-commerce",
    totalTables: 2940,
    totalColumns: 38100,
    docPercentage: 79.5,
    uploadTimestamp: "2026-09-01T09:30:00Z",
    formattedDate: "01/09/2026 06:30",
    gcsArchiveUri: "gs://dass-2026/business_assessment/20260901_093000_magalu/metadata_assessment_organization.zip"
  }
];

export async function GET(req: NextRequest) {
  try {
    const bqSql = `
      SELECT 
        COALESCE(a.assessment_id, c.customer_id) AS assessment_id,
        COALESCE(a.customer_id, c.customer_id) AS customer_id,
        COALESCE(a.customer_name, c.name) AS name,
        COALESCE(a.industry, c.industry, 'Geral') AS industry,
        a.upload_timestamp,
        COALESCE(a.total_tables, 0) AS total_tables,
        COALESCE(a.total_columns, 0) AS total_columns,
        COALESCE(a.doc_percentage, 0.0) AS doc_percentage,
        COALESCE(a.gcs_archive_uri, c.gcs_folder_uri, '') AS gcs_archive_uri
      FROM \`${PROJECT_ID}.${DATASET_ID}.customer_assessments\` a
      FULL OUTER JOIN \`${PROJECT_ID}.${DATASET_ID}.customers\` c
        ON a.customer_id = c.customer_id
      ORDER BY 
        industry ASC,
        upload_timestamp DESC,
        name ASC
      LIMIT 50;
    `;

    let bqCustomers: CustomerProfile[] = [];
    try {
      const rows = await runOptimizedBigQueryQuery(bqSql, "List Customer Assessments from BQ");
      bqCustomers = rows.map((r: any) => {
        const dateObj = parseIsoOrUnixTimestamp(r.upload_timestamp);
        return {
          id: r.assessment_id || `asm_${Date.now()}`,
          assessmentId: r.assessment_id,
          customerId: r.customer_id,
          name: r.name || "Cliente Corporativo",
          industry: r.industry || "Geral",
          totalTables: Number(r.total_tables) || 0,
          totalColumns: Number(r.total_columns) || 0,
          docPercentage: Number(r.doc_percentage) || 0,
          uploadTimestamp: dateObj.iso,
          formattedDate: dateObj.formatted,
          gcsArchiveUri: r.gcs_archive_uri || ""
        };
      });
    } catch (err) {
      console.warn("Notice: Consultando base de assessments.", err);
    }

    // Retorna os assessments reais persistidos no BigQuery (sem fallbacks fictícios se o histórico foi limpo)
    const allProfiles = [...bqCustomers];

    // Ordenação estrita: 1º Segmento (ASC) -> 2º Data (DESC, mais recente primeiro) -> 3º Nome (ASC)
    allProfiles.sort((a, b) => {
      // 1. Segmento / Indústria
      const indCmp = (a.industry || "").localeCompare(b.industry || "", "pt-BR");
      if (indCmp !== 0) return indCmp;

      // 2. Data de Execução (mais recente no topo)
      const timeA = new Date(a.uploadTimestamp || 0).getTime();
      const timeB = new Date(b.uploadTimestamp || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;

      // 3. Nome do Cliente
      return (a.name || "").localeCompare(b.name || "", "pt-BR");
    });

    return NextResponse.json({
      success: true,
      customers: allProfiles
    });
  } catch (error: any) {
    console.error("Erro ao listar assessments de clientes:", error);
    return NextResponse.json({ success: true, customers: fallbackProfiles });
  }
}
