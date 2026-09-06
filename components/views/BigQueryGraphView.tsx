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
  const [isExecutingGql, setIsExecutingGql] = useState(false);
  const [gqlError, setGqlError] = useState<string | null>(null);
  const [gqlQuery, setGqlQuery] = useState(`SELECT 
  customer_name,
  use_case_title,
  gcp_service_name,
  monthly_cost_usd
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (c:Customer)-[:INVESTS_IN]->(u:UseCase)-[e:CONSUMES_GCP_SERVICE]->(s:GcpService)
  COLUMNS (
    c.name AS customer_name,
    u.title AS use_case_title,
    s.service_name AS gcp_service_name,
    e.monthly_cost_usd AS monthly_cost_usd
  )
)
ORDER BY monthly_cost_usd DESC
LIMIT 10;`);
  const [gqlResults, setGqlResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"visual" | "gql">("visual");

  const fetchGraph = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bigquery/graph");
      const data = await res.json();
      if (data.graph) {
        setGraphData(data.graph);
        if (data.gqlMatches && data.gqlMatches.length > 0) {
          setGqlResults(data.gqlMatches);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar grafo:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCustomGql = async (queryToRun?: string) => {
    const q = (queryToRun || gqlQuery).trim();
    if (!q) return;
    setIsExecutingGql(true);
    setGqlError(null);
    try {
      const res = await fetch("/api/bigquery/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Falha na execução da consulta GQL");
      }
      setGqlResults(data.results || []);
    } catch (err: any) {
      setGqlError(err.message || "Erro desconhecido na execução GQL");
    } finally {
      setIsExecutingGql(false);
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
      case "PersonaDebate":
      case "AgentPersona":
      case "Agent":
        return { bg: "bg-purple-600", stroke: "#9333ea", text: "text-purple-600" };
      case "UseCase":
        return { bg: "bg-indigo-600", stroke: "#4f46e5", text: "text-indigo-600" };
      case "GcpService":
        return { bg: "bg-amber-500", stroke: "#f59e0b", text: "text-amber-500" };
      case "StrategicGoal":
        return { bg: "bg-teal-600", stroke: "#0d9488", text: "text-teal-600" };
      case "ModernizationAction":
        return { bg: "bg-cyan-600", stroke: "#0891b2", text: "text-cyan-600" };
      case "TableCatalog":
      case "Table":
        return { bg: "bg-slate-600", stroke: "#475569", text: "text-slate-600" };
      default:
        return { bg: "bg-slate-500", stroke: "#64748b", text: "text-slate-500" };
    }
  };

  // Posicionamento estático / circular para visualização estável
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];

  const width = 920;
  const height = 560;
  const centerX = width / 2;
  const centerY = height / 2;

  // Mapa de posições
  const nodePositions = new Map<string, { x: number; y: number }>();

  nodes.forEach((node, idx) => {
    if (node.nodeType === "Customer") {
      nodePositions.set(node.id, { x: centerX - 160, y: centerY });
    } else if (node.nodeType === "Assessment") {
      nodePositions.set(node.id, { x: centerX + 160, y: centerY });
    } else if (node.nodeType === "PersonaDebate" || node.nodeType === "AgentPersona" || node.nodeType === "Agent") {
      const pNodes = nodes.filter(n => n.nodeType === "PersonaDebate" || n.nodeType === "AgentPersona" || n.nodeType === "Agent");
      const aIdx = pNodes.indexOf(node);
      const span = pNodes.length > 1 ? (aIdx / (pNodes.length - 1)) * 480 - 240 : 0;
      nodePositions.set(node.id, { x: centerX + span, y: 50 });
    } else if (node.nodeType === "StrategicGoal") {
      const gNodes = nodes.filter(n => n.nodeType === "StrategicGoal");
      const gIdx = gNodes.indexOf(node);
      const angle = Math.PI * 0.75 + (gIdx * 0.35);
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * 310,
        y: centerY + Math.sin(angle) * 200
      });
    } else if (node.nodeType === "GcpService") {
      const sNodes = nodes.filter(n => n.nodeType === "GcpService");
      const sIdx = sNodes.indexOf(node);
      const angle = -Math.PI * 0.28 + (sIdx * 0.28);
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * 320,
        y: centerY + Math.sin(angle) * 210
      });
    } else if (node.nodeType === "ModernizationAction") {
      const mNodes = nodes.filter(n => n.nodeType === "ModernizationAction");
      const mIdx = mNodes.indexOf(node);
      const span = mNodes.length > 1 ? (mIdx / (mNodes.length - 1)) * 520 - 260 : 0;
      nodePositions.set(node.id, {
        x: centerX + span,
        y: height - 50
      });
    } else if (node.nodeType === "UseCase") {
      const uNodes = nodes.filter(n => n.nodeType === "UseCase");
      const uIdx = uNodes.indexOf(node);
      const angle = (uIdx / Math.max(uNodes.length, 1)) * Math.PI * 2;
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * 210,
        y: centerY + Math.sin(angle) * 140
      });
    } else {
      // TableCatalog / Tabelas
      const tNodes = nodes.filter(n => n.nodeType === "TableCatalog" || n.nodeType === "Table");
      const tIdx = tNodes.indexOf(node);
      const angle = (tIdx / Math.max(tNodes.length, 1)) * Math.PI * 2;
      nodePositions.set(node.id, {
        x: centerX + Math.cos(angle) * 110,
        y: centerY + Math.sin(angle) * 75
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

      {/* 2. Barra de Insights Executivos do Grafo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Topologia Ativa</span>
          <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">
            {nodes.length} Nós • {edges.length} Arestas
          </span>
          <span className="text-[10px] text-blue-600 font-semibold">100% BigQuery GQL</span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Plataforma Google Cloud</span>
          <span className="text-base font-extrabold text-amber-600 mt-0.5 block">
            {nodes.filter(n => n.nodeType === "GcpService").length || 4} Serviços Centrais
          </span>
          <span className="text-[10px] text-slate-500">BigQuery + Vertex AI</span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Alinhamento Estratégico</span>
          <span className="text-base font-extrabold text-teal-600 mt-0.5 block">
            {nodes.filter(n => n.nodeType === "StrategicGoal").length || 3} Metas de Negócio
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">C-Level Impact</span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Modernização Recomendada</span>
          <span className="text-base font-extrabold text-cyan-600 mt-0.5 block">
            {nodes.filter(n => n.nodeType === "ModernizationAction").length || 4} Ações Chave
          </span>
          <span className="text-[10px] text-slate-500">Particionamento & Agents</span>
        </div>
      </div>

      {/* 3. Visualizador SVG do Grafo de Conhecimento */}
      {activeTab === "visual" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 relative overflow-hidden">
            {/* Legenda de Tipos de Nós */}
            <div className="flex flex-wrap items-center gap-3 text-xs mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Cliente
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Metas Estratégicas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Casos de Negócio
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Serviços GCP
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" /> Modernização
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Tabelas BQ
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Personas IA
              </span>
            </div>

            {/* Canvas SVG Interativo */}
            <div className="relative w-full h-[520px] bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-violet-600" />
              Consulta Nativa GQL no BigQuery (GRAPH_TABLE)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 font-semibold self-start sm:self-auto">
              ISO GQL / BigQuery Graph Nativo
            </span>
          </div>

          {/* Botões de Queries Prontas para Sellers & Arquitetos */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => {
                const q = `SELECT 
  customer_name,
  use_case_title,
  gcp_service_name,
  monthly_cost_usd
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (c:Customer)-[:INVESTS_IN]->(u:UseCase)-[e:CONSUMES_GCP_SERVICE]->(s:GcpService)
  COLUMNS (
    c.name AS customer_name,
    u.title AS use_case_title,
    s.service_name AS gcp_service_name,
    e.monthly_cost_usd AS monthly_cost_usd
  )
)
ORDER BY monthly_cost_usd DESC
LIMIT 10;`;
                setGqlQuery(q);
                executeCustomGql(q);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              1. Casos de Uso & Serviços GCP (MRR)
            </button>

            <button
              onClick={() => {
                const q = `SELECT 
  customer_name,
  goal_name,
  target_metric,
  use_case_title
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (c:Customer)-[:TARGETS_GOAL]->(g:StrategicGoal)<-[:ACHIEVES_GOAL]-(u:UseCase)
  COLUMNS (
    c.name AS customer_name,
    g.goal_name AS goal_name,
    g.target_metric AS target_metric,
    u.title AS use_case_title
  )
)
LIMIT 10;`;
                setGqlQuery(q);
                executeCustomGql(q);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              2. Metas Estratégicas C-Level
            </button>

            <button
              onClick={() => {
                const q = `SELECT 
  use_case_title,
  action_title,
  expected_gain,
  table_name,
  gcp_service_name
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (u:UseCase)-[:RECOMMENDS_ACTION]->(m:ModernizationAction),
        (t:TableCatalog)-[:GOVERNED_BY]->(s:GcpService)
  COLUMNS (
    u.title AS use_case_title,
    m.title AS action_title,
    m.expected_gain AS expected_gain,
    t.table_name AS table_name,
    s.service_name AS gcp_service_name
  )
)
LIMIT 10;`;
                setGqlQuery(q);
                executeCustomGql(q);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              3. Ações de Modernização & Governança
            </button>

            <button
              onClick={() => {
                const q = `SELECT 
  agent_name,
  agent_role,
  use_case_title,
  recommendation_focus
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (a:PersonaDebate)-[v:VALIDATED_USE_CASE]->(u:UseCase)
  COLUMNS (
    a.agent_name AS agent_name,
    a.role AS agent_role,
    u.title AS use_case_title,
    v.recommendation_focus AS recommendation_focus
  )
)
LIMIT 10;`;
                setGqlQuery(q);
                executeCustomGql(q);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              4. Validação por Personas Google Advisory
            </button>

            <button
              onClick={() => {
                const q = `GRAPH \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
MATCH (c:Customer)-[:INVESTS_IN]->(u:UseCase)
RETURN c.name AS customer, u.title AS use_case
LIMIT 10;`;
                setGqlQuery(q);
                executeCustomGql(q);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              5. Standalone ISO GQL (Nativo)
            </button>
          </div>

          {/* Editor de GQL com Ação de Execução */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Query GQL (Editável):</span>
              <button
                onClick={() => executeCustomGql()}
                disabled={isExecutingGql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <Terminal className={`w-3.5 h-3.5 ${isExecutingGql ? "animate-spin" : ""}`} />
                {isExecutingGql ? "Executando no BigQuery..." : "Executar Consulta no BigQuery"}
              </button>
            </div>

            <textarea
              value={gqlQuery}
              onChange={(e) => setGqlQuery(e.target.value)}
              rows={8}
              className="w-full p-3.5 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono border border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium leading-relaxed resize-y"
            />
          </div>

          {gqlError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              <strong>Erro na execução GQL:</strong> {gqlError}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resultados Retornados pelo BigQuery ({gqlResults.length} linhas casadas)
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Dataset: business_assessment_customer
              </span>
            </div>

            {gqlResults.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                    <tr>
                      {Object.keys(gqlResults[0]).map((colKey) => (
                        <th key={colKey} className="p-3 capitalize font-mono text-[11px]">
                          {colKey.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {gqlResults.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        {Object.keys(gqlResults[0]).map((colKey) => {
                          const val = row[colKey];
                          const isNumeric = typeof val === "number";
                          const isCurrency = colKey.includes("usd") || colKey.includes("cost") || colKey.includes("consumption");

                          return (
                            <td key={colKey} className="p-3 text-slate-800 dark:text-slate-200 font-medium">
                              {isCurrency && isNumeric ? (
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                                  ${val.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                </span>
                              ) : isNumeric ? (
                                <span className="font-mono text-slate-700 dark:text-slate-300">
                                  {val.toLocaleString("en-US")}
                                </span>
                              ) : (
                                String(val ?? "-")
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Nenhum nó conectado retornado para esta consulta GQL. Clique em um dos botões acima para executar uma consulta pré-configurada.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
