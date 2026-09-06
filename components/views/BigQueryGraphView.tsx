// components/views/BigQueryGraphView.tsx - Visualizador Executivo de Property Graph BigQuery (ISO GQL)
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Network, Database, RefreshCw, Terminal, Layers, 
  ExternalLink, ShieldCheck, Sparkles, Filter, CheckCircle2,
  TrendingUp, DollarSign, Cloud, ArrowRight, Info, Eye, Cpu
} from "lucide-react";
import { PropertyGraphNode, PropertyGraphEdge, PropertyGraphData } from "@/lib/types";

interface BigQueryGraphViewProps {
  initialGraphData?: PropertyGraphData;
}

type ViewMode = "valuestream" | "usecase_focus" | "topology";

export const BigQueryGraphView: React.FC<BigQueryGraphViewProps> = ({
  initialGraphData
}) => {
  const [graphData, setGraphData] = useState<PropertyGraphData>(initialGraphData || { nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<PropertyGraphNode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("valuestream");
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isExecutingGql, setIsExecutingGql] = useState(false);
  const [gqlError, setGqlError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "gql">("visual");

  const [gqlQuery, setGqlQuery] = useState(`SELECT 
  u.title AS use_case_title,
  s.service_name AS gcp_service_name,
  e.monthly_cost_usd AS monthly_cost_usd
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (u:UseCase)-[e:CONSUMES_GCP_SERVICE]->(s:GcpService)
  COLUMNS (
    u.title,
    s.service_name,
    e.monthly_cost_usd
  )
)
ORDER BY monthly_cost_usd DESC
LIMIT 10;`);
  const [gqlResults, setGqlResults] = useState<any[]>([]);

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

  const rawNodes = graphData.nodes || [];
  const rawEdges = graphData.edges || [];

  // Filtro inteligente de nós para evitar o "hairball" de centenas de tabelas brutas
  const useCaseNodes = useMemo(() => rawNodes.filter(n => n.nodeType === "UseCase"), [rawNodes]);
  const goalNodes = useMemo(() => rawNodes.filter(n => n.nodeType === "StrategicGoal"), [rawNodes]);
  const serviceNodes = useMemo(() => rawNodes.filter(n => n.nodeType === "GcpService"), [rawNodes]);
  const actionNodes = useMemo(() => rawNodes.filter(n => n.nodeType === "ModernizationAction"), [rawNodes]);
  const customerNodes = useMemo(() => rawNodes.filter(n => n.nodeType === "Customer"), [rawNodes]);

  // Se estiver no modo foco de caso de uso
  const filteredData = useMemo(() => {
    if (viewMode === "usecase_focus" && selectedUseCaseId !== "all") {
      const targetUc = useCaseNodes.find(u => u.id === selectedUseCaseId);
      if (!targetUc) return { nodes: rawNodes, edges: rawEdges };

      const connectedEdges = rawEdges.filter(
        e => e.sourceId === selectedUseCaseId || e.destinationId === selectedUseCaseId
      );
      const connectedNodeIds = new Set<string>([selectedUseCaseId]);
      connectedEdges.forEach(e => {
        connectedNodeIds.add(e.sourceId);
        connectedNodeIds.add(e.destinationId);
      });

      const filteredNodes = rawNodes.filter(n => connectedNodeIds.has(n.id));
      return { nodes: filteredNodes, edges: connectedEdges };
    }

    if (viewMode === "valuestream") {
      // No modo Value Stream, removemos os nós de tabelas brutas individuais para exibir uma esteira executiva limpa
      const nonTableNodes = rawNodes.filter(n => n.nodeType !== "TableCatalog" && n.nodeType !== "Table");
      const cleanNodeIds = new Set(nonTableNodes.map(n => n.id));
      const cleanEdges = rawEdges.filter(e => cleanNodeIds.has(e.sourceId) && cleanNodeIds.has(e.destinationId));
      return { nodes: nonTableNodes, edges: cleanEdges };
    }

    // Topologia geral: limita tabelas brutas a no máximo 15 nós para manter o canvas 100% legível
    const tableNodes = rawNodes.filter(n => n.nodeType === "TableCatalog" || n.nodeType === "Table").slice(0, 12);
    const nonTableNodes = rawNodes.filter(n => n.nodeType !== "TableCatalog" && n.nodeType !== "Table");
    const safeNodes = [...nonTableNodes, ...tableNodes];
    const safeIds = new Set(safeNodes.map(n => n.id));
    const safeEdges = rawEdges.filter(e => safeIds.has(e.sourceId) && safeIds.has(e.destinationId));

    return { nodes: safeNodes, edges: safeEdges };
  }, [viewMode, selectedUseCaseId, rawNodes, rawEdges, useCaseNodes]);

  const activeNodes = filteredData.nodes;
  const activeEdges = filteredData.edges;

  // Dimensões do Canvas SVG
  const width = 940;
  const height = 520;

  // Posicionamento Colunar Inteligente para o Modo "Cadeia de Valor (Value Stream)"
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();

    if (viewMode === "valuestream") {
      // 5 Colunas Lógicas:
      // Col 1 (x: 80): Cliente
      // Col 2 (x: 270): Metas Estratégicas
      // Col 3 (x: 480): Casos de Uso
      // Col 4 (x: 690): Serviços GCP
      // Col 5 (x: 870): Ações de Modernização
      
      customerNodes.forEach((n, idx) => {
        const total = customerNodes.length;
        const y = height / 2 + (idx - (total - 1) / 2) * 90;
        map.set(n.id, { x: 70, y: Math.max(80, Math.min(height - 80, y)) });
      });

      goalNodes.forEach((n, idx) => {
        const total = goalNodes.length;
        const spacing = Math.min(90, (height - 120) / Math.max(total - 1, 1));
        const y = (height / 2) + (idx - (total - 1) / 2) * spacing;
        map.set(n.id, { x: 250, y });
      });

      useCaseNodes.forEach((n, idx) => {
        const total = useCaseNodes.length;
        const spacing = Math.min(75, (height - 100) / Math.max(total - 1, 1));
        const y = 60 + idx * spacing;
        map.set(n.id, { x: 470, y });
      });

      serviceNodes.forEach((n, idx) => {
        const total = serviceNodes.length;
        const spacing = Math.min(75, (height - 100) / Math.max(total - 1, 1));
        const y = 60 + idx * spacing;
        map.set(n.id, { x: 690, y });
      });

      actionNodes.forEach((n, idx) => {
        const total = actionNodes.length;
        const spacing = Math.min(90, (height - 120) / Math.max(total - 1, 1));
        const y = (height / 2) + (idx - (total - 1) / 2) * spacing;
        map.set(n.id, { x: 870, y });
      });

    } else if (viewMode === "usecase_focus") {
      // Centraliza o Caso de Uso selecionado e organiza dependências ao redor
      const targetUc = useCaseNodes.find(u => u.id === selectedUseCaseId) || useCaseNodes[0];
      if (targetUc) {
        map.set(targetUc.id, { x: width / 2, y: height / 2 });

        // Metas à esquerda
        const connectedGoals = activeNodes.filter(n => n.nodeType === "StrategicGoal");
        connectedGoals.forEach((n, idx) => {
          const y = height / 2 + (idx - (connectedGoals.length - 1) / 2) * 110;
          map.set(n.id, { x: 180, y });
        });

        // Serviços GCP à direita
        const connectedServices = activeNodes.filter(n => n.nodeType === "GcpService");
        connectedServices.forEach((n, idx) => {
          const y = height / 2 + (idx - (connectedServices.length - 1) / 2) * 80;
          map.set(n.id, { x: width - 180, y });
        });

        // Ações e Cliente no topo e rodapé
        const otherNodes = activeNodes.filter(
          n => n.nodeType !== "StrategicGoal" && n.nodeType !== "GcpService" && n.id !== targetUc.id
        );
        otherNodes.forEach((n, idx) => {
          const isAction = n.nodeType === "ModernizationAction";
          map.set(n.id, { x: width / 2 + (idx % 2 === 0 ? -120 : 120), y: isAction ? height - 70 : 70 });
        });
      }
    } else {
      // Topologia Radial com órbitas espaçadas
      const centerX = width / 2;
      const centerY = height / 2;

      customerNodes.forEach(n => map.set(n.id, { x: centerX, y: centerY }));

      goalNodes.forEach((n, idx) => {
        const angle = (idx / Math.max(goalNodes.length, 1)) * Math.PI - (Math.PI / 2);
        map.set(n.id, { x: centerX + Math.cos(angle) * 330, y: centerY + Math.sin(angle) * 200 });
      });

      useCaseNodes.forEach((n, idx) => {
        const angle = (idx / Math.max(useCaseNodes.length, 1)) * Math.PI * 2;
        map.set(n.id, { x: centerX + Math.cos(angle) * 210, y: centerY + Math.sin(angle) * 140 });
      });

      serviceNodes.forEach((n, idx) => {
        const angle = (idx / Math.max(serviceNodes.length, 1)) * Math.PI + (Math.PI / 2);
        map.set(n.id, { x: centerX + Math.cos(angle) * 350, y: centerY + Math.sin(angle) * 210 });
      });

      actionNodes.forEach((n, idx) => {
        map.set(n.id, { x: 100 + idx * 220, y: height - 50 });
      });
    }

    return map;
  }, [viewMode, selectedUseCaseId, customerNodes, goalNodes, useCaseNodes, serviceNodes, actionNodes, activeNodes]);

  // Cores por tipo de nó (Paleta Google Cloud Clean)
  const getNodeConfig = (type: string) => {
    switch (type) {
      case "Customer":
        return { bg: "bg-blue-50", border: "border-blue-500", fill: "#2563eb", text: "text-blue-700", label: "Cliente" };
      case "StrategicGoal":
        return { bg: "bg-teal-50", border: "border-teal-500", fill: "#0d9488", text: "text-teal-700", label: "Meta C-Level" };
      case "UseCase":
        return { bg: "bg-indigo-50", border: "border-indigo-600", fill: "#4f46e5", text: "text-indigo-700", label: "Caso de Uso" };
      case "GcpService":
        return { bg: "bg-amber-50", border: "border-amber-500", fill: "#d97706", text: "text-amber-700", label: "Serviço GCP" };
      case "ModernizationAction":
        return { bg: "bg-cyan-50", border: "border-cyan-500", fill: "#0891b2", text: "text-cyan-700", label: "Ação de Modernização" };
      case "TableCatalog":
      case "Table":
        return { bg: "bg-slate-50", border: "border-slate-400", fill: "#64748b", text: "text-slate-700", label: "Tabela BigQuery" };
      default:
        return { bg: "bg-slate-50", border: "border-slate-400", fill: "#475569", text: "text-slate-700", label: "Entidade" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* 1. BANNER EXECUTIVO DE IMPORTÂNCIA ESTRATÉGICA */}
      <div className="bg-white border border-[#E8F1F8] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#074878] flex items-center justify-center font-bold shadow-2xs">
                <Network className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                BigQuery Knowledge Graph • Cadeia de Valor & ISO GQL
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Property Graph Ativo
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Por que este Grafo é estratégico?</strong> Ele modela a <strong className="text-[#074878]">Cadeia de Valor Ponta a Ponta</strong> da modernização: conecta os ativos de dados legados às <strong>Metas C-Level</strong>, aos <strong>6 Casos de Uso Prioritários</strong> e ao <strong>Consumo Mensal de Nuvem (ARR em GCP)</strong>. Permite ao vendedor e arquiteto justificar cada centavo de nuvem com base no ROI e na linhagem real das tabelas.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("visual")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "visual"
                    ? "bg-white text-[#074878] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Visualizador de Cadeia ({activeNodes.length} nós)
              </button>
              <button
                onClick={() => setActiveTab("gql")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "gql"
                    ? "bg-white text-[#074878] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Consulta GQL Live
              </button>
            </div>

            <button
              onClick={fetchGraph}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
              title="Sincronizar com BigQuery"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#074878]" : ""}`} />
            </button>
          </div>
        </div>

        {/* 3 Pilares de Importância */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-5 border-t border-slate-100 mt-5">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <TrendingUp className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">1. Alinhamento C-Level</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Associa metas de negócio (Bacen, EBITDA, Prevenção de Fraude) aos casos prioritários.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <DollarSign className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">2. Dimensionamento de ARR</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Calcula o consumo mensal de cada serviço GCP (BigQuery, Vertex AI, Dataplex) por caso.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <Cpu className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">3. Auditoria Nativa GQL</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Executa queries GRAPH_TABLE nativas no BigQuery com sintaxe padrão ISO GQL.</p>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "visual" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna do Grafo (8 colunas) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Controles de Modo de Visualização */}
            <div className="bg-white border border-[#E8F1F8] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Modo de Visualização:
                </span>
                
                <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                  <button
                    onClick={() => { setViewMode("valuestream"); setSelectedUseCaseId("all"); }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === "valuestream" ? "bg-white text-[#074878] shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    🌊 Cadeia de Valor (Value Stream)
                  </button>
                  <button
                    onClick={() => { setViewMode("usecase_focus"); if (selectedUseCaseId === "all" && useCaseNodes[0]) setSelectedUseCaseId(useCaseNodes[0].id); }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === "usecase_focus" ? "bg-white text-[#074878] shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    🎯 Foco no Caso de Uso
                  </button>
                  <button
                    onClick={() => setViewMode("topology")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      viewMode === "topology" ? "bg-white text-[#074878] shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    🌐 Topologia Rede
                  </button>
                </div>
              </div>

              {/* Seletor do Caso de Uso Específico (Se no modo de foco) */}
              {viewMode === "usecase_focus" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700">Caso:</span>
                  <select
                    value={selectedUseCaseId}
                    onChange={(e) => setSelectedUseCaseId(e.target.value)}
                    className="px-3 py-1.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 outline-none cursor-pointer"
                  >
                    {useCaseNodes.map(uc => (
                      <option key={uc.id} value={uc.id}>
                        {uc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Canvas SVG Interativo Limpo */}
            <div className="bg-white rounded-2xl border border-[#E8F1F8] shadow-xs p-4 relative overflow-hidden">
              {/* Legenda de Colunas no Modo Value Stream */}
              {viewMode === "valuestream" && (
                <div className="grid grid-cols-5 text-center text-[11px] font-bold text-slate-500 pb-3 mb-2 border-b border-slate-100">
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <span className="w-2 h-2 rounded-full bg-blue-600" /> 1. Cliente
                  </div>
                  <div className="flex items-center justify-center gap-1 text-teal-600">
                    <span className="w-2 h-2 rounded-full bg-teal-600" /> 2. Metas C-Level
                  </div>
                  <div className="flex items-center justify-center gap-1 text-indigo-600">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" /> 3. Casos de Uso
                  </div>
                  <div className="flex items-center justify-center gap-1 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> 4. Serviços GCP
                  </div>
                  <div className="flex items-center justify-center gap-1 text-cyan-600">
                    <span className="w-2 h-2 rounded-full bg-cyan-600" /> 5. Modernização
                  </div>
                </div>
              )}

              <div className="relative w-full h-[540px] bg-slate-50/40 rounded-xl border border-slate-100 flex items-center justify-center">
                {activeNodes.length > 0 ? (
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
                    <defs>
                      <marker
                        id="arrow-clean"
                        viewBox="0 0 10 10"
                        refX="22"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                      </marker>

                      <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>

                    {/* Arestas Conectoras Limpas */}
                    {activeEdges.map((edge, idx) => {
                      const src = positions.get(edge.sourceId);
                      const dst = positions.get(edge.destinationId);
                      if (!src || !dst) return null;

                      const isHighlighted = selectedNode && (selectedNode.id === edge.sourceId || selectedNode.id === edge.destinationId);

                      return (
                        <g key={idx}>
                          <line
                            x1={src.x}
                            y1={src.y}
                            x2={dst.x}
                            y2={dst.y}
                            stroke={isHighlighted ? "#2563eb" : "#cbd5e1"}
                            strokeWidth={isHighlighted ? 2.5 : 1.2}
                            strokeOpacity={isHighlighted ? 1 : 0.6}
                            markerEnd="url(#arrow-clean)"
                          />
                        </g>
                      );
                    })}

                    {/* Nós Renderizados com Alta Legibilidade */}
                    {activeNodes.map(node => {
                      const pos = positions.get(node.id) || { x: width / 2, y: height / 2 };
                      const isSelected = selectedNode?.id === node.id;
                      const cfg = getNodeConfig(node.nodeType);

                      const shortName = node.name.length > 20 ? node.name.slice(0, 18) + "..." : node.name;

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${pos.x}, ${pos.y})`}
                          onClick={() => setSelectedNode(node)}
                          className="cursor-pointer transition-all hover:opacity-90 group"
                        >
                          {/* Sombra de Seleção */}
                          {isSelected && (
                            <circle
                              r={22}
                              fill="none"
                              stroke={cfg.fill}
                              strokeWidth={3}
                              strokeDasharray="4 2"
                              className="animate-spin-slow"
                            />
                          )}

                          {/* Círculo do Nó */}
                          <circle
                            r={isSelected ? 16 : 13}
                            fill={cfg.fill}
                            stroke="#ffffff"
                            strokeWidth={2.5}
                            className="shadow-sm transition-transform group-hover:scale-110"
                          />

                          {/* Rótulo de Texto Legível */}
                          <text
                            y={24}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill="#1e293b"
                            className="pointer-events-none drop-shadow-xs"
                          >
                            {shortName}
                          </text>

                          {/* Badge de Categoria/Custo */}
                          {node.nodeType === "GcpService" && node.properties?.monthly_cost_usd && (
                            <text
                              y={35}
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight="600"
                              fill="#d97706"
                              className="pointer-events-none font-mono"
                            >
                              ${Number(node.properties.monthly_cost_usd).toLocaleString()}/mês
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="text-center text-xs text-slate-400">
                    Carregando topologia do BigQuery...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Painel Lateral: Inspetor de Entidade & Decisão de Negócio (4 colunas) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8F1F8] shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#074878]" />
                  Inspetor de Entidade do Grafo
                </h3>
                {selectedNode && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {selectedNode.nodeType}
                  </span>
                )}
              </div>

              {selectedNode ? (
                <div className="space-y-4 text-xs">
                  {/* Card do Nome & Tipo */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Entidade Selecionada
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {selectedNode.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Categoria: <strong>{selectedNode.category || "Geral"}</strong>
                    </span>
                  </div>

                  {/* Atributos Estratégicos Formatados */}
                  {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Métricas de Negócio & Nuvem:
                      </span>
                      <div className="space-y-1.5">
                        {Object.entries(selectedNode.properties).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 font-mono text-[11px]">
                            <span className="text-slate-500 font-sans">{key}:</span>
                            <span className="font-bold text-slate-800">
                              {typeof val === "number" ? val.toLocaleString() : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conexões GQL Desta Entidade */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Conexões no BigQuery (Property Graph):
                    </span>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      {activeEdges
                        .filter(e => e.sourceId === selectedNode.id || e.destinationId === selectedNode.id)
                        .slice(0, 5)
                        .map((edge, i) => (
                          <div key={i} className="flex items-center gap-1.5 p-1.5 rounded bg-blue-50/60 text-[#074878] font-mono text-[10px]">
                            <span className="font-bold">{edge.edgeType}</span>
                            <span className="text-slate-400">➔</span>
                            <span>{edge.sourceId === selectedNode.id ? edge.destinationId : edge.sourceId}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Botão de Atalho para Query GQL */}
                  <button
                    onClick={() => {
                      setActiveTab("gql");
                      setGqlQuery(`SELECT * FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (n)-[e]->(m)
  WHERE n.name = '${selectedNode.name.replace(/'/g, "\\'")}' OR m.name = '${selectedNode.name.replace(/'/g, "\\'")}'
  COLUMNS (n.name AS origem, e.monthly_cost_usd, m.name AS destino)
) LIMIT 10;`);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#074878] font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Auditar este Nó via GRAPH_TABLE</span>
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <Info className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-medium">
                    Clique em qualquer nó do grafo para visualizar seu impacto financeiro, metas vinculadas e linhagem de dados no BigQuery.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ABA DE CONSULTA GQL LIVE */
        <div className="bg-white rounded-2xl border border-[#E8F1F8] shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#074878]" />
                Consulta Nativa GoogleSQL GQL (GRAPH_TABLE)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Executa consultas de grafo padrão ISO GQL diretamente no dataset <code className="font-mono text-slate-700 font-bold">business_assessment_customer.enterprise_business_graph</code>.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-[#074878] border border-blue-200 font-bold self-start sm:self-auto">
              BigQuery GQL Engine
            </span>
          </div>

          {/* Queries Prontas Estratégicas para Vendedores */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Consultas Rápidas de Vendas:
            </span>
            <button
              onClick={() => {
                const q = `SELECT 
  u.title AS use_case,
  s.service_name AS gcp_service,
  e.monthly_cost_usd AS monthly_cost_usd
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (u:UseCase)-[e:CONSUMES_GCP_SERVICE]->(s:GcpService)
  COLUMNS (u.title, s.service_name, e.monthly_cost_usd)
)
ORDER BY monthly_cost_usd DESC
LIMIT 10;`;
                setGqlQuery(q);
                executeCustomGql(q);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#074878] font-medium transition-colors cursor-pointer"
            >
              Consumo Mensal GCP por Caso
            </button>

            <button
              onClick={() => {
                const q = `SELECT 
  u.title AS use_case,
  g.goal_name AS strategic_goal,
  e.expected_annual_gain_usd AS annual_gain_usd
FROM GRAPH_TABLE(
  \`rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph\`
  MATCH (u:UseCase)-[e:ACHIEVES_GOAL]->(g:StrategicGoal)
  COLUMNS (u.title, g.goal_name, e.expected_annual_gain_usd)
)
LIMIT 10;`;
                setGqlQuery(q);
                executeCustomGql(q);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#074878] font-medium transition-colors cursor-pointer"
            >
              Casos que Atingem Metas Estratégicas
            </button>
          </div>

          {/* Editor de Query */}
          <div className="space-y-2">
            <textarea
              value={gqlQuery}
              onChange={(e) => setGqlQuery(e.target.value)}
              rows={6}
              className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Sintaxe oficial: <code className="font-mono text-slate-600">GRAPH_TABLE(graph MATCH (...) COLUMNS (...))</code>
              </span>
              <button
                onClick={() => executeCustomGql()}
                disabled={isExecutingGql}
                className="px-4 py-2 rounded-xl bg-[#074878] hover:bg-[#053456] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {isExecutingGql ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                <span>Executar Consulta GQL no BigQuery</span>
              </button>
            </div>
          </div>

          {/* Erro de Execução se houver */}
          {gqlError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {gqlError}
            </div>
          )}

          {/* Tabela de Resultados GQL */}
          {gqlResults.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Resultados Retornados ({gqlResults.length} registros)</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Executado com sucesso no BigQuery
                </span>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      {Object.keys(gqlResults[0] || {}).map((col, idx) => (
                        <th key={idx} className="px-3 py-2 border-r border-slate-200 last:border-none">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gqlResults.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70">
                        {Object.values(row).map((val: any, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 border-r border-slate-100 last:border-none font-mono text-slate-800">
                            {val !== null && val !== undefined ? String(val) : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
