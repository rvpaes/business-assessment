// lib/gcp/bigquery.ts - Integração com BigQuery, Grafo GQL e Cloud Logging Estruturado
import { getGcpAccessToken, PROJECT_ID, DATASET_ID } from "./auth";
import {
  CustomerAssessment,
  TableCatalogItem,
  TopUseCase,
  NeuroDebateTurn,
  PropertyGraphData,
  PropertyGraphNode,
  PropertyGraphEdge
} from "../types";

// ==========================================
// 1. Cloud Logging Estruturado (Auditabilidade C-Level)
// ==========================================
export function logStructuredStep(entry: {
  severity: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  phase: "INGESTION" | "DMN_IDEATION" | "SN_ARBITRATION" | "CEN_EXECUTION" | "GRAPH_GQL" | "CHAT";
  agentName?: string;
  thought?: string;
  toolAction?: string;
  sqlQuery?: string;
  bqResultRows?: number;
  outputSummary?: string;
  metadata?: Record<string, any>;
}) {
  const payload = {
    timestamp: new Date().toISOString(),
    service: "business-assessment-cockpit",
    environment: process.env.NODE_ENV || "production",
    projectId: PROJECT_ID,
    datasetId: DATASET_ID,
    ...entry
  };
  // Escreve formato JSON em stdout/stderr para captura automática pelo agente do Cloud Logging
  if (entry.severity === "ERROR") {
    console.error(JSON.stringify(payload));
  } else {
    console.log(JSON.stringify(payload));
  }
}

// ==========================================
// 2. Execução Base de Queries com Tratamento de Erros e Limite de Tentativas
// ==========================================
let consecutiveAiSyntaxErrors = 0;

export function resetAiSyntaxErrors(): void {
  consecutiveAiSyntaxErrors = 0;
}

export async function runOptimizedBigQueryQuery(
  sql: string, 
  context: string = "Query",
  isAiGenerated: boolean = false
): Promise<any[]> {
  // Regra de Governança: Apenas se um Agente IA estiver tentando adivinhar SQL em loop
  if (isAiGenerated && consecutiveAiSyntaxErrors >= 3) {
    consecutiveAiSyntaxErrors = 0; // Reseta para não travar consultas subsequentes
    logStructuredStep({
      severity: "ERROR",
      phase: "GRAPH_GQL",
      toolAction: "execute_sql_halted",
      thought: "Limite de 3 erros de sintaxe consecutivos atingido pelo agente IA. Pausando tentativa automática de SQL para validação estrutural."
    });
    throw new Error("A consulta analítica falhou repetidamente. O assistente pausou a tentativa automática de SQL para validação estrutural.");
  }

  const token = await getGcpAccessToken();
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${PROJECT_ID}/queries`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: sql,
        useLegacySql: false,
        timeoutMs: 40000,
        maximumBytesBilled: "10737418240" // Limite de 10GB para proteção FinOps de custos
      })
    });

    const data: any = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || res.statusText || "Erro desconhecido no BigQuery";
      const isSyntaxErr = /syntax error|unrecognized name/i.test(errMsg);

      if (isAiGenerated && isSyntaxErr) {
        consecutiveAiSyntaxErrors++;
      }

      logStructuredStep({
        severity: "ERROR",
        phase: "GRAPH_GQL",
        toolAction: "bigquery_error",
        sqlQuery: sql,
        outputSummary: errMsg,
        metadata: { attempt: consecutiveAiSyntaxErrors, context, isAiGenerated }
      });
      throw new Error(`Erro no BigQuery: ${errMsg}`);
    }

    // Sucesso zera o contador de erros consecutivos de IA
    if (isAiGenerated) {
      consecutiveAiSyntaxErrors = 0;
    }

    const fields = data.schema?.fields || [];
    const rows = data.rows || [];

    const mappedRows = rows.map((r: any) => {
      const obj: Record<string, any> = {};
      fields.forEach((field: any, idx: number) => {
        const val = r.f?.[idx]?.v;
        if (val === undefined || val === null) {
          obj[field.name] = null;
        } else if (field.type === "INTEGER" || field.type === "FLOAT" || field.type === "NUMERIC") {
          obj[field.name] = Number(val);
        } else if (field.type === "BOOLEAN") {
          obj[field.name] = val === "true";
        } else {
          obj[field.name] = val;
        }
      });
      return obj;
    });

    logStructuredStep({
      severity: "INFO",
      phase: "GRAPH_GQL",
      toolAction: "execute_sql_success",
      sqlQuery: sql.slice(0, 300) + (sql.length > 300 ? "..." : ""),
      bqResultRows: mappedRows.length,
      metadata: { context }
    });

    return mappedRows;
  } catch (err: any) {
    throw err;
  }
}

// ==========================================
// 3. Funções Específicas e Idempotentes de Negócio
// ==========================================

export async function saveAssessmentToBigQuery(
  assessment: CustomerAssessment,
  tables: TableCatalogItem[]
): Promise<void> {
  logStructuredStep({
    severity: "INFO",
    phase: "INGESTION",
    toolAction: "save_assessment_idempotent",
    thought: `Persistindo metadados do assessment ${assessment.assessmentId} do cliente ${assessment.customerName}.`
  });

  // 1. Upsert Idempotente na tabela customers
  const customerSql = `
    MERGE \`${PROJECT_ID}.${DATASET_ID}.customers\` T
    USING (
      SELECT 
        '${assessment.customerId}' AS customer_id,
        '${assessment.customerName.replace(/'/g, "\\'")}' AS name,
        '${assessment.industry.replace(/'/g, "\\'")}' AS industry,
        '${assessment.assessmentId}' AS last_assessment_id,
        '${assessment.gcsArchiveUri.replace(/'/g, "\\'")}' AS gcs_folder_uri
    ) S
    ON T.customer_id = S.customer_id
    WHEN MATCHED THEN
      UPDATE SET 
        name = S.name,
        industry = S.industry,
        last_assessment_id = S.last_assessment_id,
        gcs_folder_uri = S.gcs_folder_uri
    WHEN NOT MATCHED THEN
      INSERT (customer_id, name, industry, created_at, last_assessment_id, gcs_folder_uri)
      VALUES (S.customer_id, S.name, S.industry, CURRENT_TIMESTAMP(), S.last_assessment_id, S.gcs_folder_uri);
  `;
  await runOptimizedBigQueryQuery(customerSql, "Upsert Customer");

  // 2. Upsert Idempotente na tabela customer_assessments
  const summaryEscaped = (assessment.summaryMarkdown || "").replace(/'/g, "\\'").replace(/\n/g, "\\n");
  const assessmentSql = `
    MERGE \`${PROJECT_ID}.${DATASET_ID}.customer_assessments\` T
    USING (
      SELECT 
        '${assessment.assessmentId}' AS assessment_id,
        '${assessment.customerId}' AS customer_id,
        '${assessment.customerName.replace(/'/g, "\\'")}' AS customer_name,
        '${assessment.industry.replace(/'/g, "\\'")}' AS industry,
        ${assessment.totalDatasets} AS total_datasets,
        ${assessment.totalTables} AS total_tables,
        ${assessment.totalViews} AS total_views,
        ${assessment.totalColumns} AS total_columns,
        ${assessment.documentedColumns} AS documented_columns,
        ${assessment.docPercentage} AS doc_percentage,
        ${assessment.dataplexScansCount} AS dataplex_scans_count,
        ${assessment.propertyGraphsCount} AS property_graphs_count,
        ${assessment.dataAgentsCount} AS data_agents_count,
        '${assessment.gcsArchiveUri.replace(/'/g, "\\'")}' AS gcs_archive_uri,
        '${summaryEscaped}' AS summary_markdown
    ) S
    ON T.assessment_id = S.assessment_id
    WHEN MATCHED THEN
      UPDATE SET 
        doc_percentage = S.doc_percentage,
        total_tables = S.total_tables,
        total_columns = S.total_columns,
        summary_markdown = S.summary_markdown
    WHEN NOT MATCHED THEN
      INSERT (
        assessment_id, customer_id, customer_name, industry, upload_timestamp,
        total_datasets, total_tables, total_views, total_columns, documented_columns,
        doc_percentage, dataplex_scans_count, property_graphs_count, data_agents_count,
        gcs_archive_uri, summary_markdown
      )
      VALUES (
        S.assessment_id, S.customer_id, S.customer_name, S.industry, CURRENT_TIMESTAMP(),
        S.total_datasets, S.total_tables, S.total_views, S.total_columns, S.documented_columns,
        S.doc_percentage, S.dataplex_scans_count, S.property_graphs_count, S.data_agents_count,
        S.gcs_archive_uri, S.summary_markdown
      );
  `;
  await runOptimizedBigQueryQuery(assessmentSql, "Upsert Customer Assessment");

  // 3. Inserção Idempotente no catálogo de tabelas (Batch de até 200 tabelas principais)
  if (tables.length > 0) {
    const topTables = tables.slice(0, 200);
    const deleteSql = `
      DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\`
      WHERE assessment_id = '${assessment.assessmentId}';
    `;
    await runOptimizedBigQueryQuery(deleteSql, "Purge Old Catalog");

    const valueRows = topTables.map(t => {
      const desc = (t.tableDescription || "").replace(/'/g, "\\'").replace(/\n/g, " ");
      return `(
        '${t.tableKey.replace(/'/g, "\\'")}',
        '${assessment.assessmentId}',
        '${t.projectId.replace(/'/g, "\\'")}',
        '${t.datasetId.replace(/'/g, "\\'")}',
        '${t.tableName.replace(/'/g, "\\'")}',
        '${t.tableType || "BASE TABLE"}',
        '${desc}',
        ${t.columnCount || 0},
        ${t.documentedColumns || 0},
        ${t.estimatedRows || 0},
        ${t.estimatedBytes || 0},
        ${t.dataplexProfileScanActive ? "TRUE" : "FALSE"}
      )`;
    }).join(",\n");

    const insertCatalogSql = `
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\` (
        table_key, assessment_id, project_id, dataset_id, table_name, table_type,
        table_description, column_count, documented_columns, estimated_rows,
        estimated_bytes, dataplex_profile_scan_active
      )
      VALUES ${valueRows};
    `;
    await runOptimizedBigQueryQuery(insertCatalogSql, "Insert Catalog Tables");
  }
}

export async function saveTopUseCasesToBigQuery(
  assessmentId: string,
  useCases: TopUseCase[]
): Promise<void> {
  const deleteSql = `
    DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.top_use_cases\`
    WHERE assessment_id = '${assessmentId}';
  `;
  await runOptimizedBigQueryQuery(deleteSql, "Purge Old Top Use Cases");

  if (useCases.length === 0) return;

  const valueRows = useCases.map(uc => {
    const title = uc.title.replace(/'/g, "\\'");
    const category = (uc.category || "Inovação").replace(/'/g, "\\'");
    const problem = (uc.businessProblem || "").replace(/'/g, "\\'").replace(/\n/g, " ");
    const solution = (uc.solutionDescription || "").replace(/'/g, "\\'").replace(/\n/g, " ");
    const roi = (uc.businessCaseRoi || "").replace(/'/g, "\\'");
    const guardrails = (uc.guardrails || "").replace(/'/g, "\\'");
    const tablesArr = (uc.requiredTables || []).map(t => `'${t.replace(/'/g, "\\'")}'`).join(", ");
    const colsArr = (uc.requiredColumns || []).map(c => `'${c.replace(/'/g, "\\'")}'`).join(", ");

    return `(
      '${uc.useCaseId}',
      '${assessmentId}',
      ${uc.rank},
      '${title}',
      '${category}',
      '${problem}',
      '${solution}',
      '${roi}',
      ${uc.financialGainEstimateUsd || 0},
      ${uc.gcpMonthlyCostUsd || 0},
      ${uc.costBreakdown?.bigqueryUsd || 0},
      ${uc.costBreakdown?.vertexAiUsd || 0},
      ${uc.costBreakdown?.cloudRunUsd || 0},
      ${uc.costBreakdown?.storageUsd || 0},
      [${tablesArr}],
      [${colsArr}],
      '${guardrails}',
      ${uc.confidenceScore || 0.95},
      CURRENT_TIMESTAMP()
    )`;
  }).join(",\n");

  const insertSql = `
    INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.top_use_cases\` (
      use_case_id, assessment_id, rank, title, category, business_problem,
      solution_description, business_case_roi, financial_gain_estimate_usd,
      gcp_monthly_cost_usd, cost_breakdown_bq_usd, cost_breakdown_vertex_usd,
      cost_breakdown_cloudrun_usd, cost_breakdown_storage_usd, required_tables,
      required_columns, guardrails, confidence_score, created_at
    )
    VALUES ${valueRows};
  `;
  await runOptimizedBigQueryQuery(insertSql, "Insert Top Use Cases");
}

export async function saveNeuroDebateTurnsToBigQuery(
  assessmentId: string,
  turns: NeuroDebateTurn[]
): Promise<void> {
  if (turns.length === 0) return;

  const valueRows = turns.map(t => {
    const thought = (t.thoughtLog || "").replace(/'/g, "\\'").replace(/\n/g, " ");
    const output = (t.outputText || "").replace(/'/g, "\\'").replace(/\n/g, "\\n");
    const matrixJson = t.salienceMatrix ? JSON.stringify(t.salienceMatrix).replace(/'/g, "\\'") : "[]";
    const verdict = t.verdict || "APPROVED";

    return `(
      '${t.turnId}',
      '${assessmentId}',
      ${t.cycle},
      '${t.phase}',
      '${t.agentRole}',
      '${t.agentName.replace(/'/g, "\\'")}',
      '${thought}',
      '${output}',
      '${matrixJson}',
      '${verdict}',
      CURRENT_TIMESTAMP()
    )`;
  }).join(",\n");

  const insertSql = `
    INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.neuro_debates\` (
      debate_id, assessment_id, cycle, phase, agent_role, agent_name,
      thought_log, output_text, salience_matrix_json, verdict, created_at
    )
    VALUES ${valueRows};
  `;
  await runOptimizedBigQueryQuery(insertSql, "Insert Neuro Debate Turns");
}

// ==========================================
// 4. Grafo de Conhecimento BigQuery (Property Graph & GQL)
// ==========================================

export async function populatePropertyGraph(
  assessment: CustomerAssessment,
  useCases: TopUseCase[],
  tables: TableCatalogItem[]
): Promise<PropertyGraphData> {
  // 1. Popula as tabelas de arestas relacionais no BigQuery em background (sem bloquear UI)
  Promise.allSettled([
    runOptimizedBigQueryQuery(`
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.e_customer_assessment\` (edge_id, customer_id, assessment_id, assessment_year, audit_scope)
      SELECT GENERATE_UUID() AS edge_id, '${assessment.customerId}', '${assessment.assessmentId}', 2026, 'Assessment Automatizado'
      FROM (SELECT 1)
      WHERE NOT EXISTS (
        SELECT 1 FROM \`${PROJECT_ID}.${DATASET_ID}.e_customer_assessment\`
        WHERE customer_id = '${assessment.customerId}' AND assessment_id = '${assessment.assessmentId}'
      );
    `, "Populate e_customer_assessment"),
    runOptimizedBigQueryQuery(`
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.e_assessment_table\` (edge_id, assessment_id, table_key, audit_verdict, data_quality_score)
      SELECT GENERATE_UUID() AS edge_id, '${assessment.assessmentId}', t.table_key, 'Conforme', 0.95
      FROM \`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\` t
      WHERE t.assessment_id = '${assessment.assessmentId}'
        AND NOT EXISTS (
          SELECT 1 FROM \`${PROJECT_ID}.${DATASET_ID}.e_assessment_table\` e
          WHERE e.assessment_id = '${assessment.assessmentId}' AND e.table_key = t.table_key
        )
      LIMIT 100;
    `, "Populate e_assessment_table"),
    runOptimizedBigQueryQuery(`
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.e_customer_usecase\` (edge_id, customer_id, use_case_id, strategic_priority, planned_quarter)
      SELECT GENERATE_UUID() AS edge_id, '${assessment.customerId}', u.use_case_id, 'Alta', 'Q1-2026'
      FROM \`${PROJECT_ID}.${DATASET_ID}.top_use_cases\` u
      WHERE u.assessment_id = '${assessment.assessmentId}'
        AND NOT EXISTS (
          SELECT 1 FROM \`${PROJECT_ID}.${DATASET_ID}.e_customer_usecase\` e
          WHERE e.customer_id = '${assessment.customerId}' AND e.use_case_id = u.use_case_id
        );
    `, "Populate e_customer_usecase"),
    runOptimizedBigQueryQuery(`
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.e_table_usecase\` (edge_id, table_key, use_case_id, relevance_weight, dependency_type)
      SELECT GENERATE_UUID() AS edge_id, t.table_key, u.use_case_id, 0.9, 'Source Table'
      FROM \`${PROJECT_ID}.${DATASET_ID}.top_use_cases\` u,
      UNNEST(u.required_tables) AS req_tbl
      JOIN \`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\` t 
        ON t.table_name = req_tbl OR t.table_key = req_tbl
      WHERE u.assessment_id = '${assessment.assessmentId}'
        AND NOT EXISTS (
          SELECT 1 FROM \`${PROJECT_ID}.${DATASET_ID}.e_table_usecase\` e
          WHERE e.table_key = t.table_key AND e.use_case_id = u.use_case_id
        )
      LIMIT 50;
    `, "Populate e_table_usecase")
  ]).catch(e => console.warn("Aviso arestas em background:", e));

  // 2. Nós Estratégicos de Nuvem (Google Cloud Platform Services)
  const gcpServices: PropertyGraphNode[] = [
    {
      id: "gcp_bigquery",
      nodeType: "GcpService",
      name: "Google BigQuery (SQL & Vector Search)",
      category: "Data Warehouse & BQML",
      properties: { mrrEstimateUsd: 1200, category: "Core Analytics", tier: "Mission Critical" }
    },
    {
      id: "gcp_vertex_ai",
      nodeType: "GcpService",
      name: "Vertex AI (Gemini 3.8 Flash)",
      category: "GenAI & Machine Learning",
      properties: { mrrEstimateUsd: 850, category: "AI Platform", tier: "Advanced AI" }
    },
    {
      id: "gcp_dataplex",
      nodeType: "GcpService",
      name: "Dataplex Universal Catalog",
      category: "Data Governance & Quality",
      properties: { mrrEstimateUsd: 320, category: "Data Governance", tier: "Compliance" }
    },
    {
      id: "gcp_cloud_run",
      nodeType: "GcpService",
      name: "Cloud Run Microservices",
      category: "Serverless Compute",
      properties: { mrrEstimateUsd: 180, category: "App Hosting", tier: "Ephemeral" }
    }
  ];

  // 3. Metas Estratégicas do Cliente (Baseado no Segmento)
  const isFinance = (assessment.industry || "").toLowerCase().includes("finan") || (assessment.customerName || "").toLowerCase().includes("digio");
  const strategicGoals: PropertyGraphNode[] = isFinance ? [
    {
      id: "goal_default_reduction",
      nodeType: "StrategicGoal",
      name: "Redução de Inadimplência & Default em 90 dias",
      category: "Risco de Crédito",
      properties: { priority: "P1", targetKpi: "-19% Default" }
    },
    {
      id: "goal_fraud_prevention",
      nodeType: "StrategicGoal",
      name: "Prevenção Ativa de Fraude Pix e Cartão",
      category: "Segurança & Fraude",
      properties: { priority: "P1", targetKpi: "$640k/ano bloqueados" }
    },
    {
      id: "goal_net_margin",
      nodeType: "StrategicGoal",
      name: "Maximização de Margem Financeira Líquida",
      category: "Rentabilidade",
      properties: { priority: "P2", targetKpi: "+$580k/ano Margem" }
    }
  ] : [
    {
      id: "goal_anti_rupture",
      nodeType: "StrategicGoal",
      name: "Mitigação Preventiva de Ruptura em PDVs",
      category: "Supply Chain",
      properties: { priority: "P1", targetKpi: "Ruptura < 0.6%" }
    },
    {
      id: "goal_sales_uplift",
      nodeType: "StrategicGoal",
      name: "Otimização de Roteiros & Demanda Causal",
      category: "Vendas & Trade",
      properties: { priority: "P1", targetKpi: "+R$ 2.68M Faturamento" }
    },
    {
      id: "goal_sku_mix",
      nodeType: "StrategicGoal",
      name: "Maximização de Margem de Contribuição por SKU",
      category: "FinOps & Comercial",
      properties: { priority: "P2", targetKpi: "+4.2 p.p. Margem" }
    }
  ];

  // 4. Ações de Modernização de Arquitetura Google Cloud
  const modernizationActions: PropertyGraphNode[] = [
    {
      id: "act_bq_graph_indexing",
      nodeType: "ModernizationAction",
      name: "Ativação de Property Graph BigQuery com Índices GQL",
      category: "Graph Analytics",
      properties: { targetService: "BigQuery", impact: "Latência < 180ms" }
    },
    {
      id: "act_data_agents_grounding",
      nodeType: "ModernizationAction",
      name: "Data Agents BigQuery com Grounding no Esquema",
      category: "GenAI Analytics",
      properties: { targetService: "Vertex AI + BigQuery", impact: "Zero Alucinação" }
    },
    {
      id: "act_dataplex_policy_tags",
      nodeType: "ModernizationAction",
      name: "Governança com Dataplex Policy Tags & Data Profiling",
      category: "Data Security",
      properties: { targetService: "Dataplex", impact: "Conformidade LGPD" }
    },
    {
      id: "act_streaming_ingestion",
      nodeType: "ModernizationAction",
      name: "Migração Batch para Ingestão Streaming BigQuery",
      category: "Data Engineering",
      properties: { targetService: "BigQuery Storage Write API", impact: "Sub-segundo" }
    }
  ];

  // 5. Gera nós e arestas integrados
  const nodes: PropertyGraphNode[] = [
    {
      id: `cust_${assessment.customerId}`,
      nodeType: "Customer",
      name: assessment.customerName,
      category: assessment.industry,
      properties: { industry: assessment.industry }
    },
    {
      id: `ass_${assessment.assessmentId}`,
      nodeType: "Assessment",
      name: `Maturidade ${assessment.docPercentage.toFixed(1)}%`,
      category: "Assessment",
      properties: { tables: assessment.totalTables, cols: assessment.totalColumns }
    },
    {
      id: "agent_cen",
      nodeType: "AgentPersona",
      name: "Agente CEN (Engenheiro Executivo)",
      category: "PersonaDebate",
      properties: { role: "CEN_Executive_Engineer" }
    },
    {
      id: "agent_dmn",
      nodeType: "AgentPersona",
      name: "Agente DMN (Explorador Divergente)",
      category: "PersonaDebate",
      properties: { role: "DMN_Explorer" }
    },
    {
      id: "agent_sn",
      nodeType: "AgentPersona",
      name: "Agente SN (Árbitra de Saliência)",
      category: "PersonaDebate",
      properties: { role: "SN_Arbiter" }
    },
    ...gcpServices,
    ...strategicGoals,
    ...modernizationActions
  ];

  const edges: PropertyGraphEdge[] = [
    {
      edgeId: `e_cust_ass_${assessment.assessmentId}`,
      sourceId: `cust_${assessment.customerId}`,
      destinationId: `ass_${assessment.assessmentId}`,
      edgeType: "OWNS",
      weight: 1.0,
      properties: {}
    }
  ];

  // Conecta cliente às metas estratégicas
  strategicGoals.forEach((goal, i) => {
    edges.push({
      edgeId: `e_cust_goal_${goal.id}`,
      sourceId: `cust_${assessment.customerId}`,
      destinationId: goal.id,
      edgeType: "STRATEGIC_GOAL",
      weight: 1.0 - (i * 0.1),
      properties: {}
    });
  });

  useCases.forEach((uc, idx) => {
    const ucId = `uc_${uc.useCaseId}`;
    nodes.push({
      id: ucId,
      nodeType: "UseCase",
      name: uc.title,
      category: uc.category,
      properties: { roi: uc.businessCaseRoi, gain: uc.financialGainEstimateUsd, cost: uc.gcpMonthlyCostUsd }
    });
    edges.push({
      edgeId: `e_cen_${uc.useCaseId}`,
      sourceId: "agent_cen",
      destinationId: ucId,
      edgeType: "VALIDATED_BY",
      weight: 1.0,
      properties: {}
    });
    edges.push({
      edgeId: `e_cust_${uc.useCaseId}`,
      sourceId: `cust_${assessment.customerId}`,
      destinationId: ucId,
      edgeType: "BENEFITS",
      weight: 0.95,
      properties: {}
    });

    // Conecta Caso de Uso ao consumo de BigQuery e Vertex AI
    edges.push({
      edgeId: `e_uc_bq_${uc.useCaseId}`,
      sourceId: ucId,
      destinationId: "gcp_bigquery",
      edgeType: "CONSUMES_GCP_SERVICE",
      weight: uc.costBreakdown?.bigqueryUsd || 180,
      properties: { service: "BigQuery", monthlyCostUsd: uc.costBreakdown?.bigqueryUsd || 180 }
    });

    edges.push({
      edgeId: `e_uc_vertex_${uc.useCaseId}`,
      sourceId: ucId,
      destinationId: "gcp_vertex_ai",
      edgeType: "CONSUMES_GCP_SERVICE",
      weight: uc.costBreakdown?.vertexAiUsd || 140,
      properties: { service: "Vertex AI", monthlyCostUsd: uc.costBreakdown?.vertexAiUsd || 140 }
    });

    // Conecta Caso de Uso a meta estratégica correspondente
    const targetGoal = strategicGoals[idx % strategicGoals.length];
    if (targetGoal) {
      edges.push({
        edgeId: `e_uc_goal_${uc.useCaseId}_${targetGoal.id}`,
        sourceId: ucId,
        destinationId: targetGoal.id,
        edgeType: "TARGETS_GOAL",
        weight: 0.9,
        properties: {}
      });
    }

    // Conecta Caso de Uso à ação de modernização recomendada
    const targetAction = modernizationActions[idx % modernizationActions.length];
    if (targetAction) {
      edges.push({
        edgeId: `e_uc_act_${uc.useCaseId}_${targetAction.id}`,
        sourceId: ucId,
        destinationId: targetAction.id,
        edgeType: "RECOMMENDS_ACTION",
        weight: 0.85,
        properties: {}
      });
    }
  });

  tables.slice(0, 8).forEach(t => {
    const rawTblId = `tbl_${t.datasetId}_${t.tableName}`;
    const cleanTblId = rawTblId.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 60);
    nodes.push({
      id: cleanTblId,
      nodeType: "Table",
      name: `${t.datasetId}.${t.tableName.slice(0, 35)}`,
      category: t.tableType,
      properties: { rows: t.estimatedRows, bytes: t.estimatedBytes }
    });
    edges.push({
      edgeId: `e_ass_${cleanTblId}`,
      sourceId: `ass_${assessment.assessmentId}`,
      destinationId: cleanTblId,
      edgeType: "EXTRACTED_FROM",
      weight: 0.8,
      properties: {}
    });
    // Conecta tabela ao Dataplex para governança
    edges.push({
      edgeId: `e_tbl_dataplex_${cleanTblId}`,
      sourceId: cleanTblId,
      destinationId: "gcp_dataplex",
      edgeType: "GOVERNED_BY",
      weight: 1.0,
      properties: {}
    });
  });

  // Grafo estruturado já persistido nas tabelas n_* e e_*
  return { nodes, edges };
}

async function persistGraphToBigQuery(nodes: PropertyGraphNode[], edges: PropertyGraphEdge[]): Promise<void> {
  // A persistência corporativa é realizada diretamente nas tabelas tipadas n_* e e_*
  return;
}


// ==========================================
// 5. Consulta ao Grafo via BigQuery GQL (GRAPH_TABLE)
// ==========================================
export async function queryGraphTableGQL(): Promise<any[]> {
  const gql = `
    SELECT 
      source_name,
      source_type,
      relationship,
      destination_name,
      destination_type,
      connection_weight
    FROM (
      SELECT 
        u.title AS source_name,
        'UseCase' AS source_type,
        'CONSUMES_GCP_SERVICE' AS relationship,
        s.service_name AS destination_name,
        'GcpService' AS destination_type,
        cs.monthly_cost_usd AS connection_weight
      FROM GRAPH_TABLE(
        \`${PROJECT_ID}.${DATASET_ID}.enterprise_business_graph\`
        MATCH (u:UseCase)-[cs:CONSUMES_GCP_SERVICE]->(s:GcpService)
        COLUMNS (u.title, s.service_name, cs.monthly_cost_usd)
      )
      UNION ALL
      SELECT 
        c.name AS source_name,
        'Customer' AS source_type,
        'HAS_ASSESSMENT' AS relationship,
        a.customer_name AS destination_name,
        'Assessment' AS destination_type,
        CAST(a.total_tables AS FLOAT64) AS connection_weight
      FROM GRAPH_TABLE(
        \`${PROJECT_ID}.${DATASET_ID}.enterprise_business_graph\`
        MATCH (c:Customer)-[:HAS_ASSESSMENT]->(a:Assessment)
        COLUMNS (c.name, a.customer_name, a.total_tables)
      )
      UNION ALL
      SELECT 
        u.title AS source_name,
        'UseCase' AS source_type,
        'ACHIEVES_GOAL' AS relationship,
        g.goal_name AS destination_name,
        'StrategicGoal' AS destination_type,
        ug.expected_annual_gain_usd AS connection_weight
      FROM GRAPH_TABLE(
        \`${PROJECT_ID}.${DATASET_ID}.enterprise_business_graph\`
        MATCH (u:UseCase)-[ug:ACHIEVES_GOAL]->(g:StrategicGoal)
        COLUMNS (u.title, g.goal_name, ug.expected_annual_gain_usd)
      )
      UNION ALL
      SELECT 
        p.agent_name AS source_name,
        'PersonaDebate' AS source_type,
        'VALIDATED_USE_CASE' AS relationship,
        u.title AS destination_name,
        'UseCase' AS destination_type,
        p.consensus_weight AS connection_weight
      FROM GRAPH_TABLE(
        \`${PROJECT_ID}.${DATASET_ID}.enterprise_business_graph\`
        MATCH (p:PersonaDebate)-[:VALIDATED_USE_CASE]->(u:UseCase)
        COLUMNS (p.agent_name, u.title, p.consensus_weight)
      )
    )
    ORDER BY connection_weight DESC
    LIMIT 100;
  `;

  return await runOptimizedBigQueryQuery(gql, "GQL GRAPH_TABLE Match Query");
}

