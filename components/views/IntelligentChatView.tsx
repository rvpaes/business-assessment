// components/views/IntelligentChatView.tsx - BigQuery Data Agent (Conversational Analytics API)
"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquareText, Send, Sparkles, User, Bot, 
  ShieldCheck, RefreshCw, Database, Terminal, 
  Table, ChevronDown, ChevronRight, Copy, Check,
  ExternalLink, Layers, ArrowUpRight
} from "lucide-react";
import { CustomerAssessment } from "@/lib/types";
import { VERIFIED_QUERIES, VerifiedQueryItem } from "@/lib/constants/verified-queries";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  thoughts?: string[];
  generatedSql?: string;
  queryResults?: any[];
  querySchema?: any[];
  catalogMetadata?: any[];
  followupQuestions?: string[];
  source?: "bigquery_data_agent" | "gemini_3_8_fallback";
  jobId?: string;
  timestamp: string;
}

interface IntelligentChatViewProps {
  assessment: CustomerAssessment | null;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const IntelligentChatView: React.FC<IntelligentChatViewProps> = ({
  assessment,
  initialPrompt,
  onClearInitialPrompt
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Olá! Sou o **BigQuery Data Agent** oficial da Google Cloud (Conversational Analytics API), conectado diretamente ao **Grafo de Propriedades Corporativo** (\`enterprise_business_graph\`) de **${assessment?.customerName || "seu cliente"}**.\n\nMinha inteligência analítica opera 100% via consultas nativas **ISO GQL (GRAPH_TABLE)** com **28 Verified Queries** validadas e guardrails de zero-alucinação. Meu foco é analisar o retorno financeiro do cliente (sempre superior ao custo GCP), governança e metadados no **Knowledge Catalog** e consumo de serviços Google Cloud.\n\nComo posso apoiar a tomada de decisão executiva ou validação de casos de uso hoje?`,
      source: "bigquery_data_agent",
      followupQuestions: [
        "Quais são os casos de uso prioritários no Grafo Corporativo?",
        "Qual a comparação entre retorno financeiro anual do cliente e custo de nuvem anual de GCP no Grafo?",
        "Qual a linhagem entre tabelas do catálogo e mecanismos de governança do Knowledge Catalog?"
      ],
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [copiedSqlId, setCopiedSqlId] = useState<string | null>(null);
  const [expandedSql, setExpandedSql] = useState<Record<string, boolean>>({});
  const [expandedTable, setExpandedTable] = useState<Record<string, boolean>>({});
  const [expandedThought, setExpandedThought] = useState<Record<string, boolean>>({});
  const [showAllVerified, setShowAllVerified] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  const quickPrompts = [
    "Quais casos de uso conectam diretamente à meta de maior retorno no Grafo?",
    "Qual o consumo mensal de serviços GCP (BigQuery, Agent Platform, Knowledge Catalog) no Grafo?",
    "Como o Knowledge Catalog audita as tabelas e protege dados com PII?",
    "Quais tabelas do catálogo alimentam o Caso 1 prioritário?"
  ];

  const toggleSql = (msgId: string) => {
    setExpandedSql(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const toggleTable = (msgId: string) => {
    setExpandedTable(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const toggleThought = (msgId: string) => {
    setExpandedThought(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSqlId(id);
    setTimeout(() => setCopiedSqlId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setTypingText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          customerName: assessment?.customerName,
          assessmentId: assessment?.assessmentId,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha na resposta do BigQuery Data Agent.");
      }

      const fullReply = data.reply || "Não obtive resposta do modelo.";
      
      // Efeito Máquina de Escrever (Streaming visual conforme diretriz do usuário)
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < fullReply.length) {
          setTypingText(fullReply.slice(0, idx + 6));
          idx += 6;
        } else {
          clearInterval(interval);
          setMessages(prev => [
            ...prev,
            {
              id: `ast_${Date.now()}`,
              role: "assistant",
              text: fullReply,
              thoughts: data.thoughts,
              generatedSql: data.generatedSql,
              queryResults: data.queryResults,
              querySchema: data.querySchema,
              catalogMetadata: data.catalogMetadata,
              followupQuestions: data.followupQuestions,
              source: data.source,
              jobId: data.jobId,
              timestamp: new Date().toISOString()
            }
          ]);
          setTypingText("");
          setIsLoading(false);
        }
      }, 12);

    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          text: `Desculpe, ocorreu uma falha na consulta analítica do BigQuery Data Agent: ${err.message}. A consulta padrão falhou e os guardrails de zero-alucinação foram acionados.`,
          timestamp: new Date().toISOString()
        }
      ]);
      setIsLoading(false);
    }
  };

  // Dispara automaticamente quando receber um caso de uso para detalhamento
  const triggeredPromptRef = useRef<string | null>(null);
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && triggeredPromptRef.current !== initialPrompt) {
      triggeredPromptRef.current = initialPrompt;
      handleSend(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* 1. Header do Módulo com Identidade BigQuery Data Agent */}
      <div className="bg-white border border-[#E8F1F8] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#074878] flex items-center justify-center font-bold shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  BigQuery Data Agent • Conversational Analytics
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#074878] border border-blue-200">
                  Google Cloud Official API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Agente conversacional nativo do BigQuery focado nos <strong className="text-slate-800">Casos de Uso de Negócio</strong>, TCO e impacto financeiro C-Level para <span className="font-bold text-[#074878]">{assessment?.customerName || "o Cliente"}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Data Agent Ativo: <code className="font-mono text-[11px] text-[#074878] font-bold">gda-7ebe8c68</code></span>
          </div>
          <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Hallucination</span>
          </div>
        </div>
      </div>

      {/* 2. Prompts Rápidos e 28 Verified Queries */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Sugestões Rápidas:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 text-slate-700 hover:text-[#074878] transition-all text-left shadow-2xs cursor-pointer font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAllVerified(!showAllVerified)}
            className="text-xs px-3 py-1.5 rounded-xl bg-[#074878] text-white hover:bg-[#063860] transition-all flex items-center gap-1.5 font-bold shadow-xs cursor-pointer shrink-0"
          >
            <span>💡 28 Verified Queries do Grafo</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-extrabold">
              {showAllVerified ? "Ocultar" : "Explorar"}
            </span>
          </button>
        </div>

        {/* Gaveta Expansível com as 28 Verified Queries Oficiais */}
        {showAllVerified && (
          <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#074878]" />
                  Verified Queries Publicadas no BigQuery Data Agent (ISO GQL • enterprise_business_graph)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Todas as 28 consultas foram auditadas diretamente contra o grafo e retornam resultados válidos (sem NULL). Clique para executar no chat.
                </p>
              </div>

              {/* Filtros por Categoria */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "Todas (28)" },
                  { id: "roi", label: "🎯 Casos & ROI (6)" },
                  { id: "customers", label: "🏢 Clientes (5)" },
                  { id: "gcp", label: "☁️ Consumo GCP (6)" },
                  { id: "governance", label: "🛡️ Knowledge Catalog (6)" },
                  { id: "roadmap", label: "🚀 Metas & Roadmap (5)" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-[#074878] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid com as Queries Verificadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto p-1">
              {VERIFIED_QUERIES
                .filter(q => selectedCategory === "all" || q.category === selectedCategory)
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleSend(item.question);
                    }}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-[#074878] leading-tight">
                        {item.question}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#074878] shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#074878]">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {item.sqlSnippet}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Container Principal do Chat */}
      <div className="bg-white rounded-2xl border border-[#E8F1F8] shadow-xs flex flex-col h-[600px] sm:h-[650px] max-h-[85vh] overflow-hidden">
        {/* Lista de Mensagens */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 bg-slate-50/30">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#074878] flex items-center justify-center shrink-0 mt-1 border border-blue-200 shadow-2xs font-bold">
                  <Database className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[95%] sm:max-w-[85%] space-y-2.5`}>
                {/* 1. Pensamento Analítico do Data Agent (Collapsible) */}
                {msg.thoughts && msg.thoughts.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Terminal className="w-3.5 h-3.5 text-blue-600" />
                        Raciocínio do Data Agent ({msg.thoughts.length} passos)
                      </span>
                      {expandedThought[msg.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    {expandedThought[msg.id] && (
                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 space-y-1 font-mono text-[11px] text-slate-700">
                        {msg.thoughts.map((th, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{th}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Metadados Knowledge Catalog */}
                {msg.catalogMetadata && msg.catalogMetadata.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50/70 border border-violet-200 text-violet-900 text-[11px] font-medium">
                    <span className="font-bold flex items-center gap-1 text-violet-700">
                      <Layers className="w-3.5 h-3.5" /> Knowledge Catalog:
                    </span>
                    <span>{msg.catalogMetadata.length} tabelas auditadas</span>
                    <span className="text-violet-400">•</span>
                    <span className="text-violet-700 font-mono text-[10px]">
                      {msg.catalogMetadata.slice(0, 3).map((c: any) => c.tableName).join(", ")}
                      {msg.catalogMetadata.length > 3 ? ` (+${msg.catalogMetadata.length - 3})` : ""}
                    </span>
                  </div>
                )}

                {/* 2. GQL / SQL Gerado no BigQuery pelo Data Agent (Collapsible) */}
                {msg.generatedSql && (
                  <div className="border border-blue-200 rounded-xl overflow-hidden bg-white text-xs shadow-2xs">
                    <div className="px-3 py-2 bg-blue-50/80 flex items-center justify-between">
                      <button
                        onClick={() => toggleSql(msg.id)}
                        className="flex items-center gap-2 text-xs font-bold text-[#074878] hover:text-blue-900 cursor-pointer"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>
                          {msg.generatedSql.includes("GRAPH_TABLE") 
                            ? "Consulta ISO GQL no Property Graph (BigQuery)" 
                            : "SQL Nativo Gerado pelo Data Agent (BigQuery)"}
                        </span>
                        {expandedSql[msg.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#074878] border border-blue-200">
                          {msg.generatedSql.includes("GRAPH_TABLE") ? "ISO GQL (Graph)" : "SQL"}
                        </span>
                        <button
                          onClick={() => copyToClipboard(msg.generatedSql!, msg.id)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedSqlId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSqlId === msg.id ? "Copiado" : "Copiar"}</span>
                        </button>
                      </div>
                    </div>

                    {expandedSql[msg.id] && (
                      <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-56">
                        {msg.generatedSql}
                      </pre>
                    )}
                  </div>
                )}

                {/* 3. Tabela de Dados Brutos Retornados do BigQuery (Collapsible) */}
                {msg.queryResults && msg.queryResults.length > 0 && (
                  <div className="border border-emerald-200 rounded-xl overflow-hidden bg-white text-xs shadow-2xs">
                    <button
                      onClick={() => toggleTable(msg.id)}
                      className="w-full px-3 py-2 bg-emerald-50/80 flex items-center justify-between text-xs font-bold text-emerald-900 hover:bg-emerald-100/50 cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <Table className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Dados Brutos do BigQuery ({msg.queryResults.length} linhas retornadas)</span>
                      </span>
                      {expandedTable[msg.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    {expandedTable[msg.id] && (
                      <div className="overflow-x-auto max-h-56 border-t border-emerald-100">
                        <table className="w-full text-[11px] text-left border-collapse">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                            <tr>
                              {Object.keys(msg.queryResults[0] || {}).map((col, idx) => (
                                <th key={idx} className="px-3 py-1.5 border-r border-slate-200 last:border-none">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {msg.queryResults.slice(0, 20).map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50">
                                {Object.values(row).map((val: any, cIdx) => (
                                  <td key={cIdx} className="px-3 py-1 border-r border-slate-100 last:border-none font-mono text-slate-800">
                                    {val !== null && val !== undefined ? String(val) : "—"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Corpo Principal da Mensagem */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#074878] text-white rounded-br-none shadow-xs font-medium"
                      : "bg-white text-slate-800 rounded-bl-none border border-[#E8F1F8] shadow-xs"
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>
                </div>

                {/* 5. Perguntas de Follow-up Inteligentes do Data Agent */}
                {msg.followupQuestions && msg.followupQuestions.length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      Perguntas sugeridas pelo Data Agent:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.followupQuestions.map((fq, fqIdx) => (
                        <button
                          key={fqIdx}
                          onClick={() => handleSend(fq)}
                          disabled={isLoading}
                          className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#074878] border border-blue-200/80 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{fq}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] text-slate-400 font-medium ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {msg.source === "bigquery_data_agent" && " • BigQuery Data Agent"}
                  {msg.source === "gemini_3_8_fallback" && " • Gemini 3.8 Flash Grounded"}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Estado de Carregamento & Streaming Visual */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#074878] flex items-center justify-center shrink-0 mt-1 border border-blue-200 shadow-2xs animate-pulse">
                <Database className="w-4 h-4" />
              </div>

              <div className="max-w-[95%] sm:max-w-[80%] space-y-2">
                <div className="p-4 rounded-2xl bg-white border border-[#E8F1F8] shadow-xs text-xs sm:text-sm text-slate-800 rounded-bl-none">
                  {typingText ? (
                    <div className="whitespace-pre-line">{typingText}</div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>BigQuery Data Agent consultando catálogo de casos de uso e gerando SQL...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Campo de Input */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E8F1F8]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Pergunte sobre casos de uso, ROI ou tabelas de ${assessment?.customerName || "seu cliente"}...`}
              disabled={isLoading}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#074878] focus:ring-2 focus:ring-blue-500/10 transition-all"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#074878] hover:bg-[#053456] disabled:bg-slate-200 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Perguntar</span>
            </button>
          </form>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Grounding estrito no dataset <code className="font-mono text-slate-600">business_assessment_customer</code>. Nenhuma alucinação é permitida.</span>
            <span className="hidden md:inline">Google Cloud Conversational Analytics API (v1alpha)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
