// components/views/IntelligentChatView.tsx - Chat Executivo Grounded com Gemini 3.8 Flash
"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquareText, Send, Sparkles, User, Bot, 
  ShieldCheck, RefreshCw, CornerDownLeft, Database
} from "lucide-react";
import { CustomerAssessment } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  thought?: string;
  timestamp: string;
}

interface IntelligentChatViewProps {
  assessment: CustomerAssessment | null;
}

export const IntelligentChatView: React.FC<IntelligentChatViewProps> = ({
  assessment
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Olá! Sou o Consultor Executivo de IA da Google Cloud para o assessment de **${assessment?.customerName || "seu cliente"}**.\n\nEstou conectado ao modelo **Gemini 3.8 Flash** e groundeado diretamente nas tabelas reais do BigQuery e nos Top 6 Casos de Uso priorizados no debate NC-MAD.\n\nComo posso ajudar na tomada de decisão estratégica ou análise de custos?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  const quickPrompts = [
    "Quais dos 6 casos de uso possuem o maior ROI estimado?",
    "Qual a estimativa de custo mensal em GCP e como é o breakdown?",
    "Como os dados do BigQuery comprovam a viabilidade dos casos?",
    "Quais tabelas possuem maior volumetria no assessment?"
  ];

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
        throw new Error(data.error || "Falha na resposta do assistente.");
      }

      const fullReply = data.reply || "Não obtive resposta do modelo.";
      
      // Efeito Máquina de Escrever (Streaming visual conforme regra do usuário)
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < fullReply.length) {
          setTypingText(fullReply.slice(0, idx + 4));
          idx += 4;
        } else {
          clearInterval(interval);
          setMessages(prev => [
            ...prev,
            {
              id: `ast_${Date.now()}`,
              role: "assistant",
              text: fullReply,
              thought: data.thought,
              timestamp: new Date().toISOString()
            }
          ]);
          setTypingText("");
          setIsLoading(false);
        }
      }, 15);

    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          text: `Desculpe, ocorreu um erro ao consultar o Gemini 3.8 Flash: ${err.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header do Módulo */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquareText className="w-6 h-6 text-amber-600" />
          Consultor Estratégico Conversacional (Gemini 3.8 Flash)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Assistente de diálogo executivo estritamente groundeado no BigQuery com guardrails ativos de zero-alucinação.
        </p>
      </div>

      {/* 2. Chat Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[560px]">
        {/* Lista de Mensagens */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-200/50 dark:border-indigo-800/50">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800"
                }`}
              >
                {msg.thought && (
                  <div className="mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 italic">
                    <strong>Raciocínio Interno:</strong> {msg.thought}
                  </div>
                )}
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`mt-1.5 text-[10px] text-right ${
                    msg.role === "user" ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Mensagem em digitação (Streaming visual) */}
          {typingText && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="max-w-2xl p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 text-xs leading-relaxed border border-slate-100 dark:border-slate-800">
                <div className="whitespace-pre-line">{typingText}</div>
                <span className="inline-block w-1.5 h-3.5 bg-indigo-500 animate-pulse ml-1 align-middle" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugestões Rápidas de Prompt */}
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-50/40 dark:bg-slate-900/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
            Sugestões:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Caixa de Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Faça uma pergunta sobre o assessment, custos GCP ou os Top 6 casos de uso..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-all shadow-sm flex-shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Grounded no BQ: Se 0 rows forem encontradas, o agente declara ausência de dados sem alucinações.
            </span>
            <span>Pressione Enter para enviar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
