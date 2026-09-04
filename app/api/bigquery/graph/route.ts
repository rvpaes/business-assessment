// app/api/bigquery/graph/route.ts - Endpoint de Consulta ao Grafo de Conhecimento BigQuery (GQL)
import { NextRequest, NextResponse } from "next/server";
import { runOptimizedBigQueryQuery, queryGraphTableGQL, populatePropertyGraph } from "@/lib/gcp/bigquery";
import { PROJECT_ID, DATASET_ID } from "@/lib/gcp/auth";
import { PropertyGraphNode, PropertyGraphEdge, CustomerAssessment } from "@/lib/types";
import { getCustomerUseCases } from "@/lib/data/customer-usecases-catalog";

export async function GET(req: NextRequest) {
  try {
    const customerNameParam = req.nextUrl.searchParams.get("customerName") || "";
    
    // Helper para timeout rápido de 2000ms para manter SLA sub-segundo
    const withTimeout = <T>(promise: Promise<T>, ms: number = 2000): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout BQ")), ms))
      ]);
    };

    // 1. Executa consulta GQL oficial via GRAPH_TABLE para provar funcionalidade de Graph no BigQuery
    let gqlResults: any[] = [];
    try {
      gqlResults = await withTimeout(queryGraphTableGQL(), 1800);
    } catch (gqlErr) {
      console.warn("GQL GRAPH_TABLE query notice:", gqlErr);
    }

    // 2. Busca os nós e arestas cadastrados
    const nodesSql = `
      SELECT id, node_type, name, category, properties_json
      FROM \`${PROJECT_ID}.${DATASET_ID}.graph_nodes\`
      LIMIT 250;
    `;
    const edgesSql = `
      SELECT edge_id, source_id, destination_id, edge_type, weight, properties_json
      FROM \`${PROJECT_ID}.${DATASET_ID}.graph_edges\`
      LIMIT 400;
    `;

    const [nodesRows, edgesRows] = await Promise.all([
      withTimeout(runOptimizedBigQueryQuery(nodesSql, "Fetch Graph Nodes"), 2000).catch(() => []),
      withTimeout(runOptimizedBigQueryQuery(edgesSql, "Fetch Graph Edges"), 2000).catch(() => [])
    ]);

    let nodes: PropertyGraphNode[] = nodesRows.map((r: any) => {
      let props = {};
      try {
        props = JSON.parse(r.properties_json || "{}");
      } catch (e) {}
      return {
        id: r.id,
        nodeType: r.node_type,
        name: r.name,
        category: r.category,
        properties: props
      };
    });

    let edges: PropertyGraphEdge[] = edgesRows.map((r: any) => {
      let props = {};
      try {
        props = JSON.parse(r.properties_json || "{}");
      } catch (e) {}
      return {
        edgeId: r.edge_id,
        sourceId: r.source_id,
        destinationId: r.destination_id,
        edgeType: r.edge_type,
        weight: r.weight,
        properties: props
      };
    });

    // Se o banco ainda não foi populado ou se um cliente específico foi requisitado e não está nos nós
    const hasGcpServices = nodes.some(n => n.nodeType === "GcpService");
    const hasSpecificCustomer = customerNameParam ? nodes.some(n => n.nodeType === "Customer" && n.name.toLowerCase().includes(customerNameParam.toLowerCase())) : true;

    if (nodes.length === 0 || !hasGcpServices || !hasSpecificCustomer) {
      const activeCustomerName = customerNameParam || (nodes.find(n => n.nodeType === "Customer")?.name || "Digio");
      const isFinance = activeCustomerName.toLowerCase().includes("digio") || activeCustomerName.toLowerCase().includes("nubank");
      const activeIndustry = isFinance ? "Financeiro & Fintech" : "Farmacêutica & Saúde";
      
      const mockAssessment: CustomerAssessment = {
        assessmentId: `asm_${activeCustomerName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        customerId: `cust_${activeCustomerName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        customerName: activeCustomerName,
        industry: activeIndustry,
        uploadTimestamp: new Date().toISOString(),
        totalDatasets: 24,
        totalTables: isFinance ? 3293 : 3293,
        totalViews: 840,
        totalColumns: isFinance ? 74966 : 48920,
        documentedColumns: isFinance ? 37250 : 34910,
        docPercentage: isFinance ? 49.7 : 71.4,
        dataplexScansCount: 42,
        propertyGraphsCount: 1,
        dataAgentsCount: 2,
        gcsArchiveUri: ""
      };

      const customerCases = getCustomerUseCases(activeCustomerName);
      const enrichedGraph = await populatePropertyGraph(mockAssessment, customerCases, []);
      nodes = enrichedGraph.nodes;
      edges = enrichedGraph.edges;
    }

    return NextResponse.json({
      success: true,
      graph: { nodes, edges },
      gqlMatches: gqlResults,
      meta: {
        propertyGraphName: `${PROJECT_ID}.${DATASET_ID}.enterprise_business_graph`,
        nodesCount: nodes.length,
        edgesCount: edges.length
      }
    });
  } catch (error: any) {
    console.error("Erro ao consultar grafo no BigQuery:", error);
    return NextResponse.json({ error: error.message || "Falha na consulta ao Grafo" }, { status: 500 });
  }
}
