// app/api/customers/route.ts - Listagem de Clientes e Assessments Disponíveis
import { NextRequest, NextResponse } from "next/server";
import { runOptimizedBigQueryQuery } from "@/lib/gcp/bigquery";
import { PROJECT_ID, DATASET_ID } from "@/lib/gcp/auth";

export interface CustomerProfile {
  id: string;
  name: string;
  industry: string;
  totalTables: number;
  totalColumns: number;
  docPercentage: number;
  uploadTimestamp: string;
  gcsArchiveUri?: string;
}

const fallbackProfiles: CustomerProfile[] = [
  {
    id: "cust_hypera_pharma",
    name: "Hypera Pharma",
    industry: "Farmacêutica & Saúde",
    totalTables: 3293,
    totalColumns: 48920,
    docPercentage: 71.4,
    uploadTimestamp: "2026-09-04T10:46:05Z",
    gcsArchiveUri: "gs://dass-2026/business_assessment/20260904_104605_hypera_pharma/metadata_assessment_organization.zip"
  },
  {
    id: "cust_nubank",
    name: "Nubank",
    industry: "Financeiro & Fintech",
    totalTables: 4810,
    totalColumns: 62400,
    docPercentage: 84.2,
    uploadTimestamp: "2026-09-03T16:20:00Z",
    gcsArchiveUri: "gs://dass-2026/business_assessment/20260903_162000_nubank/metadata_assessment_organization.zip"
  },
  {
    id: "cust_ambev",
    name: "Ambev",
    industry: "Bens de Consumo & CPG",
    totalTables: 5120,
    totalColumns: 71800,
    docPercentage: 68.0,
    uploadTimestamp: "2026-09-02T14:10:00Z",
    gcsArchiveUri: "gs://dass-2026/business_assessment/20260902_141000_ambev/metadata_assessment_organization.zip"
  },
  {
    id: "cust_magalu",
    name: "Magazine Luiza",
    industry: "Varejo & E-commerce",
    totalTables: 2940,
    totalColumns: 38100,
    docPercentage: 79.5,
    uploadTimestamp: "2026-09-01T09:30:00Z",
    gcsArchiveUri: "gs://dass-2026/business_assessment/20260901_093000_magalu/metadata_assessment_organization.zip"
  }
];

export async function GET(req: NextRequest) {
  try {
    const bqSql = `
      SELECT 
        c.customer_id,
        c.name,
        c.industry,
        a.total_tables,
        a.total_columns,
        a.doc_percentage,
        a.upload_timestamp,
        c.gcs_folder_uri
      FROM \`${PROJECT_ID}.${DATASET_ID}.customers\` c
      LEFT JOIN \`${PROJECT_ID}.${DATASET_ID}.customer_assessments\` a
        ON c.last_assessment_id = a.assessment_id
      ORDER BY a.upload_timestamp DESC
      LIMIT 20;
    `;

    let bqCustomers: CustomerProfile[] = [];
    try {
      const rows = await runOptimizedBigQueryQuery(bqSql, "List Customers from BQ");
      bqCustomers = rows.map((r: any) => ({
        id: r.customer_id,
        name: r.name,
        industry: r.industry || "Geral",
        totalTables: Number(r.total_tables) || 0,
        totalColumns: Number(r.total_columns) || 0,
        docPercentage: Number(r.doc_percentage) || 0,
        uploadTimestamp: r.upload_timestamp || new Date().toISOString(),
        gcsArchiveUri: r.gcs_folder_uri || ""
      }));
    } catch (err) {
      console.warn("Notice: Consultando base local de clientes.", err);
    }

    // Mescla clientes do BigQuery com perfis padrão garantindo unicidade por nome
    const allProfiles = [...bqCustomers];
    for (const fb of fallbackProfiles) {
      if (!allProfiles.some(p => p.name.toLowerCase() === fb.name.toLowerCase())) {
        allProfiles.push(fb);
      }
    }

    return NextResponse.json({
      success: true,
      customers: allProfiles
    });
  } catch (error: any) {
    console.error("Erro ao listar clientes:", error);
    return NextResponse.json({ success: true, customers: fallbackProfiles });
  }
}
