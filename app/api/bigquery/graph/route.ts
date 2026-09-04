// app/api/bigquery/graph/route.ts - Endpoint de Consulta ao Grafo de Conhecimento BigQuery (GQL)
import { NextRequest, NextResponse } from "next/server";
import { runOptimizedBigQueryQuery, queryGraphTableGQL } from "@/lib/gcp/bigquery";
import { PROJECT_ID, DATASET_ID } from "@/lib/gcp/auth";
import { PropertyGraphNode, PropertyGraphEdge } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    // 1. Executa consulta GQL oficial via GRAPH_TABLE para provar funcionalidade de Graph no BigQuery
    let gqlResults: any[] = [];
    try {
      gqlResults = await queryGraphTableGQL();
    } catch (gqlErr) {
      console.warn("GQL GRAPH_TABLE query notice:", gqlErr);
    }

    // 2. Busca os nós e arestas cadastrados
    const nodesSql = `
      SELECT id, node_type, name, category, properties_json
      FROM \`${PROJECT_ID}.${DATASET_ID}.graph_nodes\`
      LIMIT 150;
    `;
    const edgesSql = `
      SELECT edge_id, source_id, destination_id, edge_type, weight, properties_json
      FROM \`${PROJECT_ID}.${DATASET_ID}.graph_edges\`
      LIMIT 250;
    `;

    const [nodesRows, edgesRows] = await Promise.all([
      runOptimizedBigQueryQuery(nodesSql, "Fetch Graph Nodes").catch(() => []),
      runOptimizedBigQueryQuery(edgesSql, "Fetch Graph Edges").catch(() => [])
    ]);

    const nodes: PropertyGraphNode[] = nodesRows.map((r: any) => {
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

    const edges: PropertyGraphEdge[] = edgesRows.map((r: any) => {
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
