import re

with open("lib/gcp/bigquery.ts", "r") as f:
    content = f.read()

# Substituir a função populatePropertyGraph por uma versão que popula as 5 tabelas de arestas e nós
rich_populate_code = '''
export async function populatePropertyGraph(
  assessment: CustomerAssessment,
  useCases: TopUseCase[],
  tables: TableCatalogItem[]
): Promise<PropertyGraphData> {
  // 1. Popula as tabelas de arestas dedicadas para o Property Graph Enterprise de 5 Nós
  const populateEdgesSql = `
    -- 1. edge_customer_assessment
    INSERT INTO \\\`${PROJECT_ID}.${DATASET_ID}.edge_customer_assessment\\\` (id, customer_id, assessment_id)
    SELECT 
        GENERATE_UUID() AS id,
        '${assessment.customerId}',
        '${assessment.assessmentId}'
    WHERE NOT EXISTS (
        SELECT 1 FROM \\\`${PROJECT_ID}.${DATASET_ID}.edge_customer_assessment\\\`
        WHERE customer_id = '${assessment.customerId}' AND assessment_id = '${assessment.assessmentId}'
    );

    -- 2. edge_assessment_table
    INSERT INTO \\\`${PROJECT_ID}.${DATASET_ID}.edge_assessment_table\\\` (id, assessment_id, table_key)
    SELECT 
        GENERATE_UUID() AS id,
        '${assessment.assessmentId}',
        t.table_key
    FROM \\\`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\\\` t
    WHERE t.assessment_id = '${assessment.assessmentId}'
      AND NOT EXISTS (
        SELECT 1 FROM \\\`${PROJECT_ID}.${DATASET_ID}.edge_assessment_table\\\` e
        WHERE e.assessment_id = '${assessment.assessmentId}' AND e.table_key = t.table_key
    )
    LIMIT 200;

    -- 3. edge_customer_usecase
    INSERT INTO \\\`${PROJECT_ID}.${DATASET_ID}.edge_customer_usecase\\\` (id, customer_id, use_case_id)
    SELECT 
        GENERATE_UUID() AS id,
        '${assessment.customerId}',
        u.use_case_id
    FROM \\\`${PROJECT_ID}.${DATASET_ID}.top_use_cases\\\` u
    WHERE u.assessment_id = '${assessment.assessmentId}'
      AND NOT EXISTS (
        SELECT 1 FROM \\\`${PROJECT_ID}.${DATASET_ID}.edge_customer_usecase\\\` e
        WHERE e.customer_id = '${assessment.customerId}' AND e.use_case_id = u.use_case_id
    );

    -- 4. edge_persona_usecase
    INSERT INTO \\\`${PROJECT_ID}.${DATASET_ID}.edge_persona_usecase\\\` (id, debate_id, use_case_id)
    SELECT 
        GENERATE_UUID() AS id,
        d.debate_id,
        u.use_case_id
    FROM \\\`${PROJECT_ID}.${DATASET_ID}.neuro_debates\\\` d
    CROSS JOIN \\\`${PROJECT_ID}.${DATASET_ID}.top_use_cases\\\` u
    WHERE d.assessment_id = '${assessment.assessmentId}' AND u.assessment_id = '${assessment.assessmentId}'
      AND d.phase = 'CEN_EXECUTIVE_VALIDATION'
      AND NOT EXISTS (
        SELECT 1 FROM \\\`${PROJECT_ID}.${DATASET_ID}.edge_persona_usecase\\\` e
        WHERE e.debate_id = d.debate_id AND e.use_case_id = u.use_case_id
    )
    LIMIT 30;

    -- 5. edge_table_usecase
    INSERT INTO \\\`${PROJECT_ID}.${DATASET_ID}.edge_table_usecase\\\` (id, table_key, use_case_id)
    SELECT 
        GENERATE_UUID() AS id,
        t.table_key,
        u.use_case_id
    FROM \\\`${PROJECT_ID}.${DATASET_ID}.top_use_cases\\\` u,
    UNNEST(u.required_tables) AS req_tbl
    JOIN \\\`${PROJECT_ID}.${DATASET_ID}.assessment_tables_catalog\\\` t 
      ON t.table_name = req_tbl OR t.table_key = req_tbl
    WHERE u.assessment_id = '${assessment.assessmentId}'
    LIMIT 50;
  `;

  try {
    await runOptimizedBigQueryQuery(populateEdgesSql, "Populate 5 Distinct Edge Tables");
  } catch (e) {
    console.warn("Aviso ao popular arestas distintas:", e);
  }

  // Gera dados em memória para a visualização gráfica
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
    }
  ];

  const edges: PropertyGraphEdge[] = [
    {
      edgeId: "e_cust_ass",
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
      edgeId: `e_cen_${ucId}`,
      sourceId: "agent_cen",
      destinationId: ucId,
      edgeType: "VALIDATED_BY",
      weight: 1.0,
      properties: {}
    });
  });

  tables.slice(0, 8).forEach(t => {
    const tblId = `tbl_${t.datasetId}_${t.tableName}`.replace(/[^a-zA-Z0-9_]/g, "_");
    nodes.push({
      id: tblId,
      nodeType: "Table",
      name: `${t.datasetId}.${t.tableName}`,
      category: t.tableType,
      properties: { rows: t.estimatedRows, bytes: t.estimatedBytes }
    });
    edges.push({
      edgeId: `e_ass_${tblId}`,
      sourceId: `ass_${assessment.assessmentId}`,
      destinationId: tblId,
      edgeType: "EXTRACTED_FROM",
      weight: 0.8,
      properties: {}
    });
  });

  return { nodes, edges };
}
'''

# Replace populatePropertyGraph and persistGraphToBigQuery
pattern = r"export async function populatePropertyGraph\(.*?return \{ nodes, edges \};\n\}"
content = re.sub(pattern, rich_populate_code.strip(), content, flags=re.DOTALL)

with open("lib/gcp/bigquery.ts", "w") as f:
    f.write(content)

print("lib/gcp/bigquery.ts updated with rich multi-node graph population!")
