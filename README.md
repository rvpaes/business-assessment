# 🚀 Google Cloud Business Assessment Intelligence

> **Plataforma Executiva de Avaliação Estratégica, Priorização Multi-Agente (NC-MAD) e Grafo de Negócios (BigQuery GQL)**, impulsionada pelo **Gemini 3.8 Flash** e **Google Cloud Storage**.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Powered by Google Cloud](https://img.shields.io/badge/Google%20Cloud-BigQuery%20%26%20Vertex%20AI-4285F4?style=flat-square&logo=googlecloud)](https://cloud.google.com)
[![Model](https://img.shields.io/badge/AI%20Model-Gemini%203.8%20Flash-indigo?style=flat-square)](https://cloud.google.com/vertex-ai)
[![Property Graph](https://img.shields.io/badge/Knowledge%20Graph-BigQuery%20GQL-violet?style=flat-square)](https://cloud.google.com/bigquery)

---

## 📌 Visão Geral do Projeto

A **Google Cloud Business Assessment Intelligence Platform** é uma solução corporativa de alta performance projetada para Diretores, C-Levels e Arquitetos de Solução. A plataforma automatiza a leitura e interpretação de assessments de maturidade em GCP, orquestra um debate multi-agente inspirado na neurociência cognitiva (**NC-MAD: Triple Network Model**) e prioriza os **Top 6 Casos de Uso** com base estrita nos dados reais do cliente existentes no BigQuery.

---

## 🌟 Principais Módulos da Solução

### 1. 📥 Ingestão & Storage GCS
- **Identificação do Cliente**: Entrada padronizada do nome corporativo do cliente.
- **Upload de ZIP de Metadados**: Área drag-and-drop para envio do pacote compactado gerado no ambiente do cliente.
- **Armazenamento no GCS**: Gravação estruturada em `gs://dass-2026/business_assessment/YYYYMMDD_HHMMSS_{nome_cliente}/`.
- **Processamento In-Memory**: Descompactação e agregação 100% em memória, compatível com ambientes efêmeros (Cloud Run).

### 2. 🧠 Neuro-Debate Studio (NC-MAD / `/neuro_debate`)
Debate dialético em 3 fases especializadas:
- **Fase 1: Agente DMN (Default Mode Network - O Explorador Divergente)**: Dr. Leonardo Cruz explora lateralmente o espaço de hipóteses (`thinking_level="HIGH"`) sem autocensura prévia, formulando propostas em Rotas de Flexibilidade e Persistência.
- **Fase 2: Agente SN / Arbiter (Salience Network - O Árbitro de Saliência)**: Beatriz Alvarenga filtra alucinações, calcula a **Matriz de Saliência** (Viabilidade na Stack, Razão Exploração/Otimização, Complexidade, Risco Operacional) e define **Alvos de Auditoria**.
- **Fase 3: Agente CEN (Central Executive Network - O Engenheiro Executivo & FinOps)**: Marcos Mendonça audita vulnerabilidades, calcula o **Business Case (BC) com ROI** e a estimativa de custos de infraestrutura GCP (BigQuery, Vertex AI, Cloud Run, GCS), consolidando os **Top 6 Casos de Uso**.

### 3. 💎 Top 6 Casos de Uso com Benchmarking & Custos GCP
- **Grounding Rigoroso**: Conexão comprovada com tabelas e colunas reais do BigQuery.
- **Business Case (BC)**: Retorno percentual do investimento (ROI), ganho financeiro anual estimado em USD e R$.
- **FinOps GCP**: Detalhamento mensal do custo de nuvem por serviço.
- **Guardrails Mandatórios**: Política estrita de zero-alucinação; caso uma query retorne 0 linhas, a plataforma declara a ausência de dados sem inferir estimativas internas.

### 4. 🕸️ BigQuery Knowledge Graph (GQL)
- Modelagem nativa de **Property Graph**:
  ```sql
  CREATE OR REPLACE PROPERTY GRAPH business_assessment_customer.enterprise_business_graph
    NODE TABLES (graph_nodes KEY (id) LABEL Node PROPERTIES (...))
    EDGE TABLES (graph_edges KEY (edge_id) SOURCE KEY (source_id) REFERENCES graph_nodes (id) ...);
  ```
- Consultas nativas via **GQL**:
  ```sql
  SELECT * FROM GRAPH_TABLE(
    `rafaelpaes-477-20240820125418.business_assessment_customer.enterprise_business_graph`
    MATCH (src:Node)-[e:Edge]->(dst:Node)
    COLUMNS (src.name, e.edge_type, dst.name)
  );
  ```
- Canvas visual interativo com inspeção detalhada de nós e arestas.

### 5. 💬 Consultor Conversacional (Gemini 3.8 Flash)
- Chat corporativo com efeito máquina de escrever (streaming visual).
- Respostas contextualizadas com logging estruturado no Cloud Logging.

---

## 🏛️ Arquitetura de Dados no BigQuery

Dataset: `rafaelpaes-477-20240820125418.business_assessment_customer`

| Tabela / Objeto | Tipo | Descrição |
|---|---|---|
| `customers` | BASE TABLE | Clientes cadastrados e vínculo ao último assessment |
| `customer_assessments` | BASE TABLE | Sumário de maturidade, contagem de ativos e caminho no GCS |
| `assessment_tables_catalog` | BASE TABLE | Dicionário de tabelas, contagem de linhas e status Dataplex |
| `top_use_cases` | BASE TABLE | Top 6 casos de uso com ROI, ganhos e custos mensais GCP |
| `neuro_debates` | BASE TABLE | Registro dialético das fases DMN, SN e CEN |
| `graph_nodes` | BASE TABLE | Nós do grafo (Cliente, Assessment, Tabelas, Casos de Uso, Personas) |
| `graph_edges` | BASE TABLE | Arestas com pesos e tipologias de relacionamento |
| `enterprise_business_graph` | PROPERTY GRAPH | Grafo de propriedades nativo consultável via GQL |

---

## 💻 Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **IA & Modelos**: Gemini 3.8 Flash Enterprise (`publishers/google/models/gemini-3.8-flash`) com `thinking_level`
- **Banco de Dados & Grafo**: Google BigQuery REST API, BigQuery Property Graph (GQL)
- **Armazenamento**: Google Cloud Storage (GCS JSON API / Node.js)
- **Autenticação**: Google Application Default Credentials (ADC) com fallback para gcloud CLI

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Inicializar o esquema e Property Graph no BigQuery
npm run setup:bq

# 3. Executar o servidor de desenvolvimento
npm run dev
# Ou compilar e rodar em modo produção:
npm run build && npm start
```

---

## 🛡️ Governança & Boas Práticas

- **Conformidade LGPD**: Extração estrita de metadados sem dados pessoais sensíveis (PII).
- **Tratamento de Empty States**: Telas elegantes para ausência de dados, prevenindo alucinações.
- **Logs Estruturados**: Todas as etapas do agente são registradas em JSON para o Cloud Logging.
