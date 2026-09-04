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
  // 1. Popula as 5 tabelas de arestas relacionais no BigQuery
  try {
    // 1. edge_customer_assessment
    await runOptimizedBigQueryQuery(`
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.edge_customer_assessment\` (id, customer_id, assessment_id)
      SELECT 
          GENERATE_UUID() AS id,
          '${assessment.customerId}',
          '${assessment.assessmentId}'
      FROM (SELECT 1)
      WHERE NOT EXISTS (
          SELECT 1 FROM \`${PROJECT_ID}.${DATASET_ID}.edge_customer_assessment\`
          WHERE customer_id = '${assessment.customerId}' AND assessment_id = '${assessment.assessmentId}'
      );
    `, "Populate edge_customer_assessment").catch(e => console.warn("Notice edge_customer_assessment:", e));

    // 2. edge_assessment_table
    await runOptimizedBigQueryQuery(`
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.edge_assessment_table\` (id, assessment_id, table_key)
      SELECT 
          GENERATE_UUID() AS id,
          '${assessment.assessmentId}',
          t.table_key
      FROM \`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\` t
      WHERE t.assessment_id = '${assessment.assessmentId}'
        AND NOT EXISTS (
          SELECT 1 FROM \`${PROJECT_ID}.${DATASET_ID}.edge_assessment_table\` e
          WHERE e.assessment_id = '${assessment.assessmentId}' AND e.table_key = t.table_key
      )
      LIMIT 200;
    `, "Populate edge_assessment_table").catch(e => console.warn("Notice edge_assessment_table:", e));

    // 3. edge_customer_usecase
    await runOptimizedBigQueryQuery(`
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.edge_customer_usecase\` (id, customer_id, use_case_id)
      SELECT 
          GENERATE_UUID() AS id,
          '${assessment.customerId}',
          u.use_case_id
      FROM \`${PROJECT_ID}.${DATASET_ID}.top_use_cases\` u
      WHERE u.assessment_id = '${assessment.assessmentId}'
        AND NOT EXISTS (
          SELECT 1 FROM \`${PROJECT_ID}.${DATASET_ID}.edge_customer_usecase\` e
          WHERE e.customer_id = '${assessment.customerId}' AND e.use_case_id = u.use_case_id
      );
    `, "Populate edge_customer_usecase").catch(e => console.warn("Notice edge_customer_usecase:", e));

    // 4. edge_persona_usecase
    await runOptimizedBigQueryQuery(`
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.edge_persona_usecase\` (id, debate_id, use_case_id)
      SELECT 
          GENERATE_UUID() AS id,
          d.debate_id,
          u.use_case_id
      FROM \`${PROJECT_ID}.${DATASET_ID}.neuro_debates\` d
      CROSS JOIN \`${PROJECT_ID}.${DATASET_ID}.top_use_cases\` u
      WHERE d.assessment_id = '${assessment.assessmentId}' AND u.assessment_id = '${assessment.assessmentId}'
        AND d.phase = 'CEN_EXECUTIVE_VALIDATION'
        AND NOT EXISTS (
          SELECT 1 FROM \`${PROJECT_ID}.${DATASET_ID}.edge_persona_usecase\` e
          WHERE e.debate_id = d.debate_id AND e.use_case_id = u.use_case_id
      )
      LIMIT 30;
    `, "Populate edge_persona_usecase").catch(e => console.warn("Notice edge_persona_usecase:", e));

    // 5. edge_table_usecase
    await runOptimizedBigQueryQuery(`
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.edge_table_usecase\` (id, table_key, use_case_id)
      SELECT 
          GENERATE_UUID() AS id,
          t.table_key,
          u.use_case_id
      FROM \`${PROJECT_ID}.${DATASET_ID}.top_use_cases\` u,
      UNNEST(u.required_tables) AS req_tbl
      JOIN \`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\` t 
        ON t.table_name = req_tbl OR t.table_key = req_tbl
      WHERE u.assessment_id = '${assessment.assessmentId}'
        AND NOT EXISTS (
          SELECT 1 FROM \`${PROJECT_ID}.${DATASET_ID}.edge_table_usecase\` e
          WHERE e.table_key = t.table_key AND e.use_case_id = u.use_case_id
      )
      LIMIT 50;
    `, "Populate edge_table_usecase").catch(e => console.warn("Notice edge_table_usecase:", e));
  } catch (e) {
    console.warn("Aviso ao sincronizar arestas relacionais:", e);
  }

  // 2. Gera dados de nós e arestas para a visualização e para o Property Graph
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
    }
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

  useCases.forEach(uc => {
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
  });

  // 3. Persistência real e idempotente no BigQuery (graph_nodes e graph_edges)
  try {
    await persistGraphToBigQuery(nodes, edges);
  } catch (err) {
    console.error("Erro ao persistir Property Graph no BigQuery:", err);
  }

  return { nodes, edges };
}

async function persistGraphToBigQuery(nodes: PropertyGraphNode[], edges: PropertyGraphEdge[]): Promise<void> {
  // 1. Insere Nós via MERGE idempotente
  if (nodes.length > 0) {
    const nodeSelects = nodes.map(n => {
      const escId = n.id.replace(/'/g, "\\'");
      const escType = n.nodeType.replace(/'/g, "\\'");
      const escName = (n.name || "").replace(/'/g, "\\'").replace(/\n/g, " ");
      const escCat = (n.category || "").replace(/'/g, "\\'").replace(/\n/g, " ");
      const escProps = JSON.stringify(n.properties || {}).replace(/'/g, "\\'");
      return `SELECT '${escId}' AS id, '${escType}' AS node_type, '${escName}' AS name, '${escCat}' AS category, '${escProps}' AS properties_json`;
    }).join("\nUNION ALL\n");

    const mergeNodesSql = `
      MERGE INTO \`${PROJECT_ID}.${DATASET_ID}.graph_nodes\` T
      USING (
        ${nodeSelects}
      ) S
      ON T.id = S.id
      WHEN MATCHED THEN
        UPDATE SET name = S.name, category = S.category, properties_json = S.properties_json
      WHEN NOT MATCHED THEN
        INSERT (id, node_type, name, category, properties_json)
        VALUES (S.id, S.node_type, S.name, S.category, S.properties_json);
    `;
    await runOptimizedBigQueryQuery(mergeNodesSql, "Merge Graph Nodes");
  }

  // 2. Insere Arestas via MERGE idempotente
  if (edges.length > 0) {
    const edgeSelects = edges.map(e => {
      const escEdgeId = e.edgeId.replace(/'/g, "\\'");
      const escSourceId = e.sourceId.replace(/'/g, "\\'");
      const escDestId = e.destinationId.replace(/'/g, "\\'");
      const escEdgeType = e.edgeType.replace(/'/g, "\\'");
      const escProps = JSON.stringify(e.properties || {}).replace(/'/g, "\\'");
      return `SELECT '${escEdgeId}' AS edge_id, '${escSourceId}' AS source_id, '${escDestId}' AS destination_id, '${escEdgeType}' AS edge_type, CAST(${e.weight} AS FLOAT64) AS weight, '${escProps}' AS properties_json`;
    }).join("\nUNION ALL\n");

    const mergeEdgesSql = `
      MERGE INTO \`${PROJECT_ID}.${DATASET_ID}.graph_edges\` T
      USING (
        ${edgeSelects}
      ) S
      ON T.edge_id = S.edge_id
      WHEN MATCHED THEN
        UPDATE SET edge_type = S.edge_type, weight = S.weight, properties_json = S.properties_json
      WHEN NOT MATCHED THEN
        INSERT (edge_id, source_id, destination_id, edge_type, weight, properties_json)
        VALUES (S.edge_id, S.source_id, S.destination_id, S.edge_type, S.weight, S.properties_json);
    `;
    await runOptimizedBigQueryQuery(mergeEdgesSql, "Merge Graph Edges");
  }
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
    FROM GRAPH_TABLE(
      \`${PROJECT_ID}.${DATASET_ID}.enterprise_business_graph\`
      MATCH (src:Node)-[e:Edge]->(dst:Node)
      COLUMNS (
        src.name AS source_name,
        src.node_type AS source_type,
        e.edge_type AS relationship,
        dst.name AS destination_name,
        dst.node_type AS destination_type,
        e.weight AS connection_weight
      )
    )
    LIMIT 100;
  `;

  return await runOptimizedBigQueryQuery(gql, "GQL GRAPH_TABLE Match Query");
}
