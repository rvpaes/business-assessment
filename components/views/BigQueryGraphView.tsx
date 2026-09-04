// components/views/BigQueryGraphView.tsx - Visualizador Interativo de Property Graph BigQuery (GQL)
"use client";

import React, { useState, useEffect } from "react";
import { 
  Network, Database, RefreshCw, Terminal, Layers, 
  ExternalLink, ZoomIn, ZoomOut, Maximize2, ShieldCheck
} from "lucide-react";
import { PropertyGraphNode, PropertyGraphEdge, PropertyGraphData } from "@/lib/types";

interface BigQueryGraphViewProps {
  initialGraphData?: PropertyGraphData;
}

export const BigQueryGraphView: React.FC<BigQueryGraphViewProps> = ({
  initialGraphData
}) => {
  const [graphData, setGraphData] = useState<PropertyGraphData>(initialGraphData || { nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<PropertyGraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gqlQuery, setGqlQuery] = useState(`SELECT 
  src.name AS source_name,
  src.node_type AS source_type,
  e.edge_type AS relationship,
  dst.name AS destination_name,
  dst.node_type AS destination_type,
  e.weight AS connection_weight
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (src:Node)-[e:Edge]->(dst:Node)
  COLUMNS (src, e, dst)
)
LIMIT 50;`);
  const [gqlResults, setGqlResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"visual" | "gql">("visual");

  const fetchGraph = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bigquery/graph");
      const data = await res.json();
      if (data.graph) {
        setGraphData(data.graph);
        if (data.gqlMatches) {
          setGqlResults(data.gqlMatches);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar grafo:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialGraphData?.nodes?.length) {
      fetchGraph();
    }
  }, []);

  // Cores por tipo de nó
  const getNodeColor = (type: string) => {
    switch (type) {
      case "Customer":
        return { bg: "bg-blue-600", stroke: "#2563eb", text: "text-blue-600" };
      case "Assessment":
        return { bg: "bg-emerald-600", stroke: "#059669", text: "text-emerald-600" };
      case "AgentPersona":
        return { bg: "bg-purple-600", stroke: "#9333ea", text: "text-purple-600" };
      case "UseCase":
        return { bg: "bg-indigo-600", stroke: "#4f46e5", text: "text-indigo-600" };
      case "Table":
        return { bg: "bg-amber-600", stroke: "#d97706", text: "text-amber-600" };
      default:
        return { bg: "bg-slate-600", stroke: "#475569", text: "text-slate-600" };
    }
  };

  // Posicionamento estático / circular para visualização estável
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];

  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  // Mapa de posições
  const nodePositions = new Map<string, { x: number; y: number }>();

  nodes.forEach((node, idx) => {
    if (node.nodeType === "Customer") {
      nodePositions.set(node.id, { x: centerX - 120, y: centerY });
    } else if (node.nodeType === "Assessment") {
      nodePositions.set(node.id, { x: centerX + 120, y: centerY });
    } else if (node.nodeType === "AgentPersona") {
      const offset = (idx % 3) * 80 - 80;
      nodePositions.set(node.id, { x: centerX, y: 80 + offset });
    } else if (node.nodeType === "UseCase") {
      const angle = (idx / 6) * Math.PI * 2;
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * 260,
        y: centerY + Math.sin(angle) * 180
      });
    } else {
      // Tabelas
      const angle = (idx / 10) * Math.PI * 2;
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * 190,
        y: centerY + Math.sin(angle) * 140
      });
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Network className="w-6 h-6 text-violet-600" />
            BigQuery Knowledge Graph (Property Graph & GQL)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visualização topológica alimentada diretamente pelo Property Graph nativo do BigQuery (
            <code className="text-xs font-mono text-violet-600 dark:text-violet-400">
              enterprise_business_graph
            </code>
            ) consultável em linguagem padrão GQL com <code className="text-xs font-mono">GRAPH_TABLE</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("visual")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "visual"
                  ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Grafo Visual ({nodes.length} nós)
            </button>
            <button
              onClick={() => setActiveTab("gql")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "gql"
                  ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Consulta GQL Live
            </button>
          </div>

          <button
            onClick={fetchGraph}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            title="Sincronizar com BigQuery"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-violet-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Visualizador SVG do Grafo de Conhecimento */}
      {activeTab === "visual" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 relative overflow-hidden">
            {/* Legenda de Tipos de Nós */}
            <div className="flex flex-wrap items-center gap-3 text-xs mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" /> Cliente
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600" /> Assessment
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600" /> Persona IA (NC-MAD)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600" /> Top Caso de Uso
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-600" /> Tabela BQ
              </span>
            </div>

            {/* Canvas SVG Interativo */}
            <div className="relative w-full h-[500px] bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
              {nodes.length > 0 ? (
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="20"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                    </marker>
                  </defs>

                  {/* Arestas */}
                  {edges.map((edge, idx) => {
                    const src = nodePositions.get(edge.sourceId);
                    const dst = nodePositions.get(edge.destinationId);
                    if (!src || !dst) return null;
                    return (
                      <line
                        key={idx}
                        x1={src.x}
                        y1={src.y}
                        x2={dst.x}
                        y2={dst.y}
                        stroke="#cbd5e1"
                        strokeWidth={edge.weight * 2 || 1.5}
                        strokeDasharray={edge.edgeType === "DEBATED_BY" ? "4" : undefined}
                        markerEnd="url(#arrow)"
                        className="dark:stroke-slate-700"
                      />
                    );
                  })}

                  {/* Nós */}
                  {nodes.map(node => {
                    const pos = nodePositions.get(node.id) || { x: centerX, y: centerY };
                    const isSelected = selectedNode?.id === node.id;
                    const colors = getNodeColor(node.nodeType);

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={() => setSelectedNode(node)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <circle
                          r={isSelected ? 18 : 14}
                          fill={colors.stroke}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 3 : 2}
                          className="shadow-sm"
                        />
                        <text
                          y={26}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="600"
                          fill="currentColor"
                          className="text-slate-700 dark:text-slate-300 pointer-events-none select-none"
                        >
                          {node.name.length > 18 ? node.name.slice(0, 16) + "..." : node.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="text-center text-xs text-slate-400">
                  Execute o debate para popular o Property Graph no BigQuery.
                </div>
              )}
            </div>
          </div>

          {/* Painel Lateral: Detalhes do Nó Selecionado */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" />
              Inspetor de Entidade do Grafo
            </h3>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400">
                    Tipo do Nó (Label)
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedNode.nodeType}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] break-all mt-1">
                    ID: {selectedNode.id}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Nome da Entidade:
                  </label>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                    {selectedNode.name}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Propriedades Mapeadas (JSON):
                  </label>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(selectedNode.properties, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Clique em qualquer nó do grafo para inspecionar seus atributos, estatísticas de linhas e conexões GQL.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Aba 2: Inspetor GQL Live */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-violet-600" />
              Consulta Nativa GQL no BigQuery (GRAPH_TABLE)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 font-semibold">
              GQL Match Operacional
            </span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800">
            {gqlQuery}
          </pre>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Resultados Retornados pelo BigQuery ({gqlResults.length} linhas casadas)
            </h4>
            {gqlResults.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                    <tr>
                      <th className="p-3">Origem (src.name)</th>
                      <th className="p-3">Tipo Origem</th>
                      <th className="p-3">Relacionamento (e.edge_type)</th>
                      <th className="p-3">Destino (dst.name)</th>
                      <th className="p-3">Tipo Destino</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {gqlResults.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{r.source_name}</td>
                        <td className="p-3 text-slate-500">{r.source_type}</td>
                        <td className="p-3 font-mono text-violet-600 dark:text-violet-400 font-bold">{r.relationship}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{r.destination_name}</td>
                        <td className="p-3 text-slate-500">{r.destination_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Nenhum nó conectado retornado ainda na consulta GQL. Popule o grafo executando o debate.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
