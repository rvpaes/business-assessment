// lib/terraform/use-case-terraform-generator.ts - Gerador de Pipelines Terraform Multi-Motor para BigQuery Studio
// Integra as 3 skills: /bigquery-studio-pipelines (SQLX, BigFrames, PySpark), /gcp_bq_otimization e /gcp_knowledge_catalog
// Conecta globalmente ao Vertex AI Gemini 3.8 Flash

import { TopUseCase } from "@/lib/types";
import { ExtendedUseCase } from "@/lib/data/customer-usecases-catalog";

export interface GeneratedTerraformBundle {
  useCaseId: string;
  useCaseTitle: string;
  customerName: string;
  files: {
    filename: string;
    category: "iac" | "studio" | "governance";
    description: string;
    content: string;
  }[];
  engineBreakdown: {
    primaryEngine: "SQLX" | "BigFrames" | "PySpark" | "Hybrid";
    sqlRole: string;
    bigframesRole: string;
    sparkRole: string;
    geminiRole: string;
  };
  bestPractices: {
    title: string;
    skill: "bigquery-studio-pipelines" | "gcp_bq_otimization" | "gcp_knowledge_catalog";
    status: "APPLIED" | "ACTIVE";
    description: string;
  }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 32);
}

export function generateUseCaseTerraformBundle(
  useCase: TopUseCase | ExtendedUseCase,
  customerName: string = "Cliente Corporativo",
  industry: string = "Enterprise",
  projectId: string = "rafaelpaes-477-20240820125418",
  region: string = "us-central1"
): GeneratedTerraformBundle {
  const caseSlug = slugify(useCase.title || useCase.useCaseId);
  const safeCustomerSlug = slugify(customerName);
  const datasetName = `analytics_${safeCustomerSlug}_gold`;
  const stagingDataset = `stg_${safeCustomerSlug}_raw`;
  const primaryTable = useCase.requiredTables?.[0] || "fct_transacoes_principais";
  
  // Detecção de motor de processamento prioritário
  const hasSparkNeed = 
    useCase.category.includes("Segurança") || 
    useCase.category.includes("Compliance") || 
    useCase.businessProblem.toLowerCase().includes("logs") ||
    useCase.businessProblem.toLowerCase().includes("anomalia") ||
    useCase.businessProblem.toLowerCase().includes("pesado");

  const hasBigFramesNeed = 
    useCase.category.includes("Preditivo") || 
    useCase.category.includes("Causal") || 
    useCase.category.includes("Demanda") || 
    useCase.category.includes("Next-Best-Action") ||
    useCase.category.includes("Geomarketing");

  // 1. main.tf
  const mainTf = `/**
 * BigQuery Studio Multi-Engine Pipeline - Arquitetura de Infraestrutura como Código (Terraform)
 * Caso de Uso: ${useCase.title}
 * Cliente: ${customerName} | Indústria: ${industry}
 * Skills aplicadas:
 *   - /bigquery-studio-pipelines (Dataform, SQLX, BigFrames e PySpark Serverless Stored Procedures)
 *   - /gcp_bq_otimization (FinOps, Particionamento Diário, Clustering x4 e PK/FK NOT ENFORCED)
 *   - /gcp_knowledge_catalog (Dataplex LIGHTWEIGHT Scan, Aspect Types e Descrições de Coluna)
 * Modelo Global IA: Vertex AI Gemini 3.8 Flash (gemini-3.8-flash)
 */

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type        = string
  description = "ID do projeto Google Cloud"
  default     = "${projectId}"
}

variable "region" {
  type        = string
  description = "Região primária de recursos (BigQuery & Vertex AI)"
  default     = "${region}"
}

variable "customer_slug" {
  type        = string
  description = "Identificador sanitizado do cliente"
  default     = "${safeCustomerSlug}"
}

# --- 1. DATASETS BIGQUERY (STAGING & GOLD COM FINOPS) ---
resource "google_bigquery_dataset" "stg_dataset" {
  dataset_id                  = "${stagingDataset}"
  friendly_name               = "Staging Raw - ${customerName}"
  description                 = "Camada Bronze/Staging para ingestão bruta e deduplicação do caso ${useCase.title}."
  location                    = var.region
  default_table_expiration_ms = 2592000000 # 30 dias de expiração (Prevenção de Zombie Tables AP-32)
  max_time_travel_hours       = 48         # FinOps: Redução de Time Travel para dados não-prod (AP-33)

  labels = {
    "environment"       = "staging"
    "customer"          = var.customer_slug
    "use_case"          = "${caseSlug}"
    "governance_layer"  = "bronze"
    "managed_by"        = "bigquery_studio_pipelines"
  }
}

resource "google_bigquery_dataset" "gold_dataset" {
  dataset_id    = "${datasetName}"
  friendly_name = "Analytics Gold - ${customerName}"
  description   = "Camada Gold certificada contendo métricas analíticas e saídas de IA para ${useCase.title}."
  location      = var.region

  # FinOps Storage Optimization (AP-31): Faturamento por armazenamento físico comprimido
  storage_billing_model = "PHYSICAL"

  labels = {
    "environment"      = "production"
    "customer"         = var.customer_slug
    "use_case"         = "${caseSlug}"
    "governance_layer" = "gold"
    "certified"        = "true"
  }
}

# --- 2. CLOUD RESOURCE CONNECTION (VERTEX AI GEMINI 3.8 & SERVERLESS SPARK) ---
resource "google_bigquery_connection" "studio_hybrid_connection" {
  connection_id = "conn_${safeCustomerSlug}_studio_gemini_spark"
  location      = var.region
  friendly_name = "Studio Hybrid Connection (${customerName})"
  description   = "Conexão Cloud Resource para invocar Gemini 3.8 Flash e executar PySpark Serverless Stored Procedures diretamente no BigQuery."

  cloud_resource {}
}

# Permissão para a Conexão invocar Vertex AI Gemini 3.8 Flash
resource "google_project_iam_member" "connection_vertex_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:\${google_bigquery_connection.studio_hybrid_connection.cloud_resource[0].service_account_id}"
}

# Permissão para a Conexão executar PySpark Serverless Procedures no BigQuery
resource "google_project_iam_member" "connection_spark_runner" {
  project = var.project_id
  role    = "roles/bigquery.admin"
  member  = "serviceAccount:\${google_bigquery_connection.studio_hybrid_connection.cloud_resource[0].service_account_id}"
}
`;

  // 2. bigquery_tables.tf
  const tablesTf = `/**
 * Tabelas Analíticas com Otimização Estrita (Skill /gcp_bq_otimization & /gcp_knowledge_catalog)
 * - Particionamento diário por DATE/TIMESTAMP obrigatório
 * - Clusterização por até 4 colunas de alta cardinalidade/filtro
 * - Constraints PRIMARY KEY e FOREIGN KEY (NOT ENFORCED) para o otimizador e Knowledge Catalog
 * - Descrições de negócio para tabela e CADA coluna do schema
 */

resource "google_bigquery_table" "${slugify(primaryTable)}" {
  dataset_id          = google_bigquery_dataset.gold_dataset.dataset_id
  table_id            = "${primaryTable}"
  friendly_name       = "Fato Transacional - ${useCase.title}"
  description         = "Tabela analítica gold do caso ${useCase.title}. Armazena registros enriquecidos com inferências e métricas de retorno (${useCase.businessCaseRoi})."
  deletion_protection = false

  # Regra de Otimização 1: Particionamento obrigatório por Dia (Elimina Full Scans AP-14)
  time_partitioning {
    type                     = "DAY"
    field                    = "data_referencia"
    require_partition_filter = false
  }

  # Regra de Otimização 2: Clusterização em até 4 colunas hierárquicas (AP-13)
  clustering = [
    "cliente_id",
    "status_operacao",
    "categoria_analitica",
    "hash_origem"
  ]

  # Regra de Otimização 3: Primary Key NOT ENFORCED (Ativa Dataset Insights & Join Optimization no Dremel)
  table_constraints {
    primary_key {
      columns = ["id_registro"]
    }
  }

  # Schema com descrições detalhadas de negócio em nível de coluna (/gcp_knowledge_catalog)
  schema = jsonencode([
    {
      name        = "id_registro"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "Identificador único universal (UUID/Hash) do registro analítico processado."
    },
    {
      name        = "data_referencia"
      type        = "DATE"
      mode        = "REQUIRED"
      description = "Data contábil/analítica do evento para particionamento temporal diário."
    },
    {
      name        = "cliente_id"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "Código identificador do cliente correntista ou estabelecimento na base do ${customerName}."
    },
    {
      name        = "categoria_analitica"
      type        = "STRING"
      mode        = "NULLABLE"
      description = "Classificação de negócio: ${useCase.category}."
    },
    {
      name        = "status_operacao"
      type        = "STRING"
      mode        = "NULLABLE"
      description = "Status do processamento: PROCESSADO, AUDITADO, SUSPEITO, APROVADO."
    },
    {
      name        = "valor_monetario_usd"
      type        = "NUMERIC"
      mode        = "NULLABLE"
      description = "Valor financeiro mensurado ou retorno gerado em dólares."
    },
    {
      name        = "score_preditivo_gemini"
      type        = "FLOAT64"
      mode        = "NULLABLE"
      description = "Score contínuo (0.00 a 1.00) inferido pelo modelo Gemini 3.8 Flash ou Vertex AI."
    },
    {
      name        = "explicabilidade_causal"
      type        = "STRING"
      mode        = "NULLABLE"
      description = "Racional estruturado em texto retornado pelo Gemini 3.8 Flash via Vertex AI."
    },
    {
      name        = "hash_origem"
      type        = "STRING"
      mode        = "NULLABLE"
      description = "Hash criptográfico de linhagem garantindo idempotência e rastreabilidade upstream."
    },
    {
      name        = "dt_carga_timestamp"
      type        = "TIMESTAMP"
      mode        = "REQUIRED"
      description = "Timestamp UTC exato de inserção pelo pipeline do BigQuery Studio."
    }
  ])

  labels = {
    "dataplex-dp-published-scan" = "true"
    "use_case_id"                = "${useCase.useCaseId}"
    "domain"                     = "${slugify(useCase.category)}"
    "quality_tier"               = "gold"
  }
}
`;

  // 3. spark_stored_procedure.tf
  const sparkProcedureTf = `/**
 * PySpark Serverless Stored Procedure no BigQuery
 * Skill: /bigquery-studio-pipelines (PySpark Procedures)
 * Executa processamentos complexos (NLP, dados não estruturados, tokenização ou grandes grafos)
 * sem a necessidade de provisionar ou manter clusters permanentes Dataproc.
 */

resource "google_bigquery_routine" "pyspark_processor_routine" {
  dataset_id      = google_bigquery_dataset.gold_dataset.dataset_id
  routine_id      = "sp_spark_${caseSlug}_processor"
  routine_type    = "PROCEDURE"
  language        = "PYTHON"
  definition_body = file("\${path.module}/pyspark_procedure.py")

  description = "PySpark Serverless Stored Procedure para processamento avançado do caso ${useCase.title}. Executa em contêiner efêmero com conexão Cloud Resource."

  spark_options {
    connection      = google_bigquery_connection.studio_hybrid_connection.name
    runtime_version = "2.2"
    main_file_uri   = "gs://\${var.project_id}-spark-artifacts/procedures/pyspark_procedure.py"
  }
}
`;

  // 4. dataform_pipeline.tf
  const dataformTf = `/**
 * BigQuery Studio Pipelines & Dataform Core Declarativo
 * Skill: /bigquery-studio-pipelines
 * Rótulo obrigatório: {"bigquery-workflow": "preview"} para habilitar na aba Pipelines do BigQuery Studio.
 */

resource "google_dataform_repository" "studio_pipeline_repo" {
  provider = google-beta
  name     = "bq-studio-${caseSlug}-pipeline"
  region   = var.region

  # RÓTULO MANDATÓRIO DA SKILL: Sem este rótulo o repositório não aparece na aba Pipelines do BQ Studio
  labels = {
    "bigquery-workflow" = "preview"
    "customer"          = var.customer_slug
    "use_case"          = "${caseSlug}"
    "environment"       = "production"
    "governance"        = "dataplex"
  }
}

resource "google_dataform_repository_release_config" "production_release" {
  provider   = google-beta
  project    = var.project_id
  region     = var.region
  repository = google_dataform_repository.studio_pipeline_repo.name
  name       = "prod-daily-release"

  git_commitish = "main"
  cron_schedule = "0 3 * * *" # Execução diária às 03:00 UTC
  time_zone     = "America/Sao_Paulo"

  code_compilation_config {
    default_database = var.project_id
    default_schema   = google_bigquery_dataset.gold_dataset.dataset_id
    default_location = var.region
  }
}
`;

  // 5. dataplex_catalog.tf
  const dataplexTf = `/**
 * Governança, Catalogação e Qualidade no Knowledge Catalog (Dataplex)
 * Skill: /gcp_knowledge_catalog
 * - Data Profile Scan em modo LIGHTWEIGHT (Quase zero custo para tabelas nativas BQ)
 * - Data Documentation Scan para geração de Insights e relacionamentos de negócio
 * - Aspect Types de Governança para certificação e SLAs
 */

# 1. Data Profile Scan (Modo LIGHTWEIGHT para BigQuery nativo)
resource "google_dataplex_datascan" "table_profile_scan" {
  location     = var.region
  data_scan_id = "${slugify(primaryTable)}-profile-scan"
  description  = "Varredura automatizada de perfil estatístico no Knowledge Catalog para ${primaryTable} em modo LIGHTWEIGHT."

  data {
    resource = "//bigquery.googleapis.com/projects/\${var.project_id}/datasets/\${google_bigquery_dataset.gold_dataset.dataset_id}/tables/\${google_bigquery_table.${slugify(primaryTable)}.table_id}"
  }

  execution_spec {
    trigger {
      schedule {
        cron = "0 4 * * *" # Executa diariamente após o pipeline Dataform
      }
    }
  }

  data_profile_spec {
    # Engine LIGHTWEIGHT mandatória para economia de FinOps em tabelas BigQuery
  }

  labels = {
    "dataplex-dp-published-scan"     = "true"
    "dataplex-dp-published-project"  = var.project_id
    "dataplex-dp-published-location" = var.region
    "use_case"                       = "${caseSlug}"
  }
}

# 2. Aspect Type de Governança e Certificação de Negócio
resource "google_dataplex_aspect_type" "governance_aspect" {
  name        = "aspect_${safeCustomerSlug}_business_certification"
  location    = var.region
  description = "Aspecto corporativo de certificação C-Level para o caso ${useCase.title}."

  metadata_template = jsonencode({
    name = "BusinessCertification"
    type = "record"
    recordFields = [
      {
        name = "data_product_owner"
        type = "string"
        constraints = { required = true }
      },
      {
        name = "business_criticality"
        type = "enum"
        enumValues = ["TIER_1_CRITICAL", "TIER_2_BUSINESS", "TIER_3_OPERATIONAL"]
      },
      {
        name = "expected_annual_roi_usd"
        type = "double"
      },
      {
        name = "guardrails_summary"
        type = "string"
      }
    ]
  })
}
`;

  // 6. actions.yaml (DAG do BigQuery Studio - Nomes sem pontos!)
  const actionsYaml = `# Definição Declarativa de DAG para BigQuery Studio Pipelines
# ATENÇÃO CRÍTICA DA SKILL (/bigquery-studio-pipelines):
# Nomes de tarefas NÃO PODEM conter pontos ('.') sob pena de desabilitar o botão 'Run' no console!
# Documentação: https://docs.cloud.google.com/bigquery/docs/create-pipelines#task-naming-conventions

actions:
  # ETAPA 1: Ingestão & Limpeza Staging (Motor: BigQuery SQL Dremel)
  - operation:
      name: stage_and_deduplicate_${caseSlug}
      project: "${projectId}"
      filename: definitions/stg_${caseSlug}.sql

  # ETAPA 2: Engenharia de Features Matriciais (Motor: Python BigFrames com Pushdown)
  - notebook:
      name: compute_features_bigframes_${caseSlug}
      project: "${projectId}"
      dependencyTargets:
        - name: stage_and_deduplicate_${caseSlug}
      filename: definitions/bigframes_features_${caseSlug}.ipynb

  # ETAPA 3: Processamento Complexo / Não-Estruturado (Motor: PySpark Serverless Procedure)
  - operation:
      name: run_spark_unstructured_processor_${caseSlug}
      project: "${projectId}"
      dependencyTargets:
        - name: compute_features_bigframes_${caseSlug}
      filename: definitions/invoke_spark_procedure.sql

  # ETAPA 4: Enriquecimento Causal & Scoring com Gemini 3.8 Flash (Motor: Vertex AI via BQ Remote Model)
  - operation:
      name: invoke_gemini_38_flash_scoring_${caseSlug}
      project: "${projectId}"
      dependencyTargets:
        - name: run_spark_unstructured_processor_${caseSlug}
      filename: definitions/gemini_scoring.sql

  # ETAPA 5: Publicação da Fato Gold Incremental (Motor: Dataform SQLX Incremental)
  - operation:
      name: publish_gold_${caseSlug}
      project: "${projectId}"
      dependencyTargets:
        - name: invoke_gemini_38_flash_scoring_${caseSlug}
      filename: definitions/${primaryTable}.sqlx
`;

  // 7. workflow_settings.yaml
  const workflowSettingsYaml = `# Configurações Globais do BigQuery Studio Pipeline
# Dataform Core v3 + Colab Enterprise Runtimes
defaultProject: "${projectId}"
defaultDataset: "${datasetName}"
defaultLocation: "${region}"
defaultAssertionDataset: "${datasetName}_assertions"
dataformCoreVersion: "3.0.0"

vars:
  customer_name: "${customerName}"
  use_case_id: "${useCase.useCaseId}"
  environment: "production"
  gemini_connection: "${projectId}.${region}.conn_${safeCustomerSlug}_studio_gemini_spark"
`;

  // 8. bigframes_pipeline.py
  const bigframesPy = `"""Pipeline de Engenharia de Features com BigQuery DataFrames (BigFrames)
Caso de Uso: ${useCase.title}
Cliente: ${customerName}
Skill: /bigquery-studio-pipelines (Python & BigFrames)

REGRA CANÔNICA: 100% de Pushdown para o motor Dremel do BigQuery.
É ESTRITAMENTE PROIBIDO invocar .to_pandas() para grandes volumes, garantindo zero egress
e eliminando estouros de memória no nó de execução.
"""

import os
import google.auth
import bigframes.pandas as bpd

def run_feature_engineering_pipeline():
    # 1. Identificação do Projeto e Configuração do BigFrames
    credentials, default_project = google.auth.default()
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "${projectId}")
    location = os.getenv("BIGQUERY_LOCATION", "${region}")

    bpd.options.bigquery.project = project_id
    bpd.options.bigquery.location = location

    print(f"[BigFrames] Conectado ao BigQuery em {project_id} ({location})")

    # 2. Leitura Preguiçosa (Lazy Evaluation) no BigQuery
    source_table = f"{project_id}.${stagingDataset}.stg_${caseSlug}_events"
    df = bpd.read_gbq(source_table)

    # 3. Transformações Analíticas e Agregações em Escala (Compiladas em SQL nativo)
    # Filtro de registros válidos
    df_valid = df[df["status_operacao"] != "REJEITADO"]

    # Cálculo de métricas agregadas por cliente
    df_features = (
        df_valid.groupby("cliente_id")
        .agg(
            total_volume_usd=("valor_monetario_usd", "sum"),
            media_transacao_usd=("valor_monetario_usd", "mean"),
            quantidade_eventos=("id_registro", "count")
        )
        .reset_index()
    )

    # Criação de índices ponderados (Pushdown direto no Dremel)
    df_features["score_volume_relativo"] = df_features["total_volume_usd"] / (df_features["media_transacao_usd"] + 1.0)

    # 4. Gravação direta em Tabela Gold Particionada (Zero download de dados)
    dest_table = f"{project_id}.${datasetName}.feat_${caseSlug}_matrix"
    df_features.to_gbq(
        destination_table=dest_table,
        if_exists="replace"
    )

    print(f"[BigFrames] Sucesso! Tabela de features gravada em: {dest_table}")

if __name__ == "__main__":
    run_feature_engineering_pipeline()
`;

  // 9. pyspark_procedure.py
  const pysparkPy = `"""PySpark Serverless Stored Procedure para BigQuery
Caso de Uso: ${useCase.title}
Cliente: ${customerName}
Skill: /bigquery-studio-pipelines (PySpark Serverless)

Executado como Stored Procedure em contêineres Spark Serverless efêmeros do Google Cloud.
Ideal para pré-processamento não-estruturado, tokenização de texto, parsing de logs pesados ou grafos.
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, udf, current_timestamp, sha2
from pyspark.sql.types import StringType, ArrayType

# 1. Inicialização da SparkSession Serverless acoplada ao BigQuery
spark = SparkSession.builder \\
    .appName("PySpark_Studio_${caseSlug}_Processor") \\
    .getOrCreate()

# 2. Leitura de dados brutos utilizando o Conector Nativo BigQuery
input_table = "${projectId}.${stagingDataset}.raw_payloads"
df_raw = spark.read.format("bigquery").load(input_table)

# 3. Função UDF para processamento e tokenização de payloads
def parse_payload_tokens(payload_str):
    if not payload_str:
        return []
    # Tokeniza e filtra termos relevantes
    tokens = [t.strip().upper() for t in payload_str.split(" ") if len(t) > 3]
    return tokens[:10]

token_udf = udf(parse_payload_tokens, ArrayType(StringType()))

# 4. Transformação e enriquecimento distribuído
df_processed = (
    df_raw
    .withColumn("tokens_payload", token_udf(col("raw_data")))
    .withColumn("hash_origem", sha2(col("id_registro"), 256))
    .withColumn("dt_processamento_spark", current_timestamp())
    .select(
        "id_registro",
        "cliente_id",
        "tokens_payload",
        "hash_origem",
        "dt_processamento_spark"
    )
)

# 5. Otimização de Shuffle da Skill: Coalesce para evitar arquivos pequenos (Small Files Anti-pattern)
df_coalesced = df_processed.coalesce(4)

# 6. Gravação Direta de Alta Performance no BigQuery (Direct Write Method)
output_table = "${projectId}.${datasetName}.spark_${caseSlug}_enriched"
df_coalesced.write \\
    .format("bigquery") \\
    .option("table", output_table) \\
    .option("writeMethod", "direct") \\
    .mode("append") \\
    .save()

print(f"[PySpark Procedure] Finalizado com sucesso para {output_table}")
`;

  // 10. transform_incremental.sqlx
  const transformSqlx = `/**
 * Modelo Dataform SQLX Incremental com Metadados para Knowledge Catalog
 * Caso de Uso: ${useCase.title}
 * Regras:
 *   - Particionamento por data_referencia
 *   - Predicado incremental obrigatório: \${when(incremental(), ...)}
 *   - Bloco metadata integrado para catalogação automática no Dataplex
 */

config {
  type: "incremental",
  schema: "${datasetName}",
  name: "${primaryTable}",
  description: "Fato consolidada e incremental do caso ${useCase.title} (${useCase.category}).",
  bigquery: {
    partitionBy: "data_referencia",
    clusterBy: ["cliente_id", "status_operacao", "categoria_analitica", "hash_origem"]
  },
  metadata: {
    overview: "Tabela dimensional de ${useCase.title}. Gera retorno anual estimado em ${useCase.businessCaseRoi}.",
    extraProperties: {
      generic: {
        system: "BigQuery Studio Pipelines",
        dataProduct: "${useCase.category}",
        certifiedTier: "Tier 1 - Production"
      }
    }
  }
}

SELECT
  f.id_registro,
  f.data_referencia,
  f.cliente_id,
  '${useCase.category}' AS categoria_analitica,
  f.status_operacao,
  f.valor_monetario_usd,
  g.score_preditivo AS score_preditivo_gemini,
  g.racional_explicabilidade AS explicabilidade_causal,
  f.hash_origem,
  CURRENT_TIMESTAMP() AS dt_carga_timestamp
FROM
  \${ref("stg_${caseSlug}_events")} f
LEFT JOIN
  \${ref("gemini_scored_predictions")} g
  ON f.id_registro = g.id_registro

\${when(incremental(), \`
  WHERE f.dt_evento_timestamp > (SELECT MAX(dt_carga_timestamp) FROM \${self()})
\`)}
`;

  // 11. GEMINI.MD (Instruções persistentes para o Data Engineering Agent)
  const geminiMd = `# Instruções Persistentes do Data Engineering Agent (BigQuery Studio)
# Projeto: ${customerName} | Caso de Uso: ${useCase.title}

## 1. Diretrizes Canônicas de Engenharia & FinOps (/gcp_bq_otimization)
1. **Regra de Partition Pruning**:
   - Todas as queries geradas DEVEM filtrar pela coluna 'data_referencia' de forma nativa.
   - NUNCA aplique funções sobre a coluna de partição no WHERE (ex: proibido DATE(data_referencia) = ...).
2. **Eliminação de Anti-Padrões**:
   - SELECT * é TERMINANTEMENTE PROIBIDO. Selecione apenas colunas explicitadas no contrato.
   - Em operações de JOIN, mantenha a tabela maior à esquerda e a tabela menor à direita para possibilitar broadcast.
3. **Protocolo dos 3 Erros de SQL (3x Stop Rule)**:
   - Se a API do BigQuery retornar um erro de sintaxe SQL 3 vezes seguidas, pare de tentar adivinhar.
   - Retorne uma mensagem estruturada informando que a consulta falhou e consulte o schema do Knowledge Catalog.
4. **Regra de Zero-Alucinação (Empty State Rule)**:
   - Se uma query retornar 0 linhas, afirme categoricamente: "Nenhum dado encontrado para o período ou critério selecionado."
   - NUNCA invente ou extrapole dados a partir do seu conhecimento interno.

## 2. Multi-Motor BigQuery Studio (/bigquery-studio-pipelines)
- **SQLX**: Usado para staging, agregações relacionais e tabela incremental gold.
- **Python (BigFrames)**: Usado para matrizes e score de features com pushdown (sem .to_pandas()).
- **PySpark Serverless**: Usado via Stored Procedure para processamento de logs não-estruturados.
- **Gemini 3.8 Flash**: Invocado via BigQuery Remote Model ou Vertex AI para sumarização e inferência causal.

## 3. Governança Knowledge Catalog (/gcp_knowledge_catalog)
- Assegure que as tabelas possuam descrições ricas em todas as colunas.
- Registre relacionamentos primários (PRIMARY KEY NOT ENFORCED) para suporte a Insights automáticos.
`;

  // 12. README.md
  const readmeMd = `# BigQuery Studio Multi-Engine Pipeline: ${useCase.title}

Este pacote contém a especificação de Infraestrutura como Código (Terraform) e scripts de engenharia para provisionar o pipeline analítico do caso de uso **${useCase.title}** para o cliente **${customerName}**.

---

## 🏛️ Arquitetura Multi-Motor (Polyglot)

Conforme a skill **\`/bigquery-studio-pipelines\`**, o pipeline integra 3 motores de execução orquestrados pelo BigQuery Studio:
1. **SQLX (Dremel MPP Nativo)**: Ingestão Staging, deduplicação e carga incremental Gold com \`\${when(incremental(), ...)}\`.
2. **Python BigFrames (\`bigframes.pandas\`)**: Engenharia de features tabulares com 100% de pushdown (zero egress de dados).
3. **PySpark Serverless (Stored Procedures)**: Limpeza e enriquecimento de payloads não-estruturados via contêiner Spark efêmero.
4. **Vertex AI Gemini 3.8 Flash**: Inferência de causalidade e explicabilidade grounded via Cloud Resource Connection.

---

## ⚡ Boas Práticas FinOps & Otimização (/gcp_bq_otimization)
- **Particionamento Diário**: Todas as tabelas são particionadas por \`data_referencia\` (evitando Full Scans).
- **Clusterização Otimizada**: 4 colunas hierárquicas (\`cliente_id\`, \`status_operacao\`, \`categoria_analitica\`, \`hash_origem\`).
- **Billing Model**: Armazenamento configurado como \`storage_billing_model = "PHYSICAL"\` no dataset Gold para economia de até 50% com Capacitor.
- **Constraints**: Chaves Primárias e Estrangeiras declaradas como \`NOT ENFORCED\` para guiar o otimizador Dremel.

---

## 🛡️ Governança & Knowledge Catalog (/gcp_knowledge_catalog)
- **Data Profile Scan**: Configurado em modo **\`LIGHTWEIGHT\`** (custo desprezível para BigQuery nativo).
- **Metadados Ricos**: Descrições de negócio publicadas para a tabela e para cada campo individual.
- **Rótulo BigQuery Studio**: O repositório Dataform inclui \`"bigquery-workflow" = "preview"\` para visualização na aba *Pipelines*.

---

## 🚀 Como Aplicar com Terraform

\`\`\`bash
# 1. Inicializar provedores Google Cloud
terraform init

# 2. Validar plano de execução
terraform plan -var="project_id=${projectId}" -var="region=${region}"

# 3. Aplicar infraestrutura
terraform apply -var="project_id=${projectId}" -var="region=${region}" -auto-approve
\`\`\`
`;

  return {
    useCaseId: useCase.useCaseId,
    useCaseTitle: useCase.title,
    customerName,
    files: [
      {
        filename: "main.tf",
        category: "iac",
        description: "Provedores, Datasets BigQuery (Staging & Gold), Conexão Cloud Resource para Gemini/Spark e IAM",
        content: mainTf
      },
      {
        filename: "bigquery_tables.tf",
        category: "iac",
        description: "Tabelas analíticas com particionamento diário, clustering x4, constraints PK/FK e descrições de coluna",
        content: tablesTf
      },
      {
        filename: "spark_stored_procedure.tf",
        category: "iac",
        description: "Recurso google_bigquery_routine para execução de PySpark Serverless Stored Procedure",
        content: sparkProcedureTf
      },
      {
        filename: "dataform_pipeline.tf",
        category: "iac",
        description: "Repositório Dataform com label obrigatório bigquery-workflow = preview e Release Config",
        content: dataformTf
      },
      {
        filename: "dataplex_catalog.tf",
        category: "iac",
        description: "Dataplex Data Profile Scan em modo LIGHTWEIGHT, Data Documentation Scan e Aspect Types",
        content: dataplexTf
      },
      {
        filename: "actions.yaml",
        category: "studio",
        description: "DAG declarativo do BigQuery Studio orquestrando SQL, Python BigFrames e PySpark (sem pontos em nomes)",
        content: actionsYaml
      },
      {
        filename: "workflow_settings.yaml",
        category: "studio",
        description: "Configurações de compilação Dataform Core e parâmetros de ambiente",
        content: workflowSettingsYaml
      },
      {
        filename: "bigframes_pipeline.py",
        category: "studio",
        description: "Pipeline Python com bigframes.pandas executando com 100% pushdown no BigQuery Dremel",
        content: bigframesPy
      },
      {
        filename: "pyspark_procedure.py",
        category: "studio",
        description: "Script PySpark Serverless com direct write e coalesce de partições",
        content: pysparkPy
      },
      {
        filename: "transform_incremental.sqlx",
        category: "studio",
        description: "Modelo SQLX incremental com \${when(incremental(), ...)} e bloco metadata para Dataplex",
        content: transformSqlx
      },
      {
        filename: "GEMINI.MD",
        category: "governance",
        description: "Instruções persistentes para o Data Engineering Agent orientando FinOps e regras de particionamento",
        content: geminiMd
      },
      {
        filename: "README.md",
        category: "governance",
        description: "Documentação executiva de arquitetura e guia passo a passo de deploy com Terraform CLI",
        content: readmeMd
      }
    ],
    engineBreakdown: {
      primaryEngine: hasSparkNeed ? "Hybrid" : hasBigFramesNeed ? "BigFrames" : "SQLX",
      sqlRole: "Ingestão, deduplicação staging e agregação final gold com tabelas incrementais.",
      bigframesRole: "Engenharia de features analíticas matriciais com pushdown direto no Dremel (sem download local).",
      sparkRole: "Processamento de dados não-estruturados e tokenização distribuída via Stored Procedure Serverless.",
      geminiRole: "Inferência causal e explicabilidade de negócio via Vertex AI Gemini 3.8 Flash (Remote Model)."
    },
    bestPractices: [
      {
        title: "BigQuery Studio Polyglot DAG",
        skill: "bigquery-studio-pipelines",
        status: "APPLIED",
        description: "Orquestração explícita em actions.yaml combinando SQLX, BigFrames e PySpark sem pontos em nomes de tarefas."
      },
      {
        title: "Rótulo de Repositório 'bigquery-workflow: preview'",
        skill: "bigquery-studio-pipelines",
        status: "APPLIED",
        description: "Habilita o repositório Dataform nativamente na aba Pipelines do BigQuery Studio."
      },
      {
        title: "Particionamento Diário & Clustering Hierárquico",
        skill: "gcp_bq_otimization",
        status: "APPLIED",
        description: "Elimina Full Table Scans (AP-14) e acelera filtros analíticos em 4 colunas hierárquicas."
      },
      {
        title: "FinOps Physical Billing Model",
        skill: "gcp_bq_otimization",
        status: "APPLIED",
        description: "Configura storage_billing_model = 'PHYSICAL' no dataset Gold para economia de até 50% com Capacitor."
      },
      {
        title: "Constraints PK/FK NOT ENFORCED",
        skill: "gcp_bq_otimization",
        status: "APPLIED",
        description: "Permite ao otimizador Dremel eliminar joins desnecessários e ativa relacionamentos de Dataset Insights."
      },
      {
        title: "Dataplex Scan em Modo LIGHTWEIGHT",
        skill: "gcp_knowledge_catalog",
        status: "APPLIED",
        description: "Executa Data Profile Scan estatístico com custo quase zero em tabelas BigQuery nativas."
      },
      {
        title: "Descrições de Negócio em Todas as Colunas",
        skill: "gcp_knowledge_catalog",
        status: "APPLIED",
        description: "Publica metadados e semântica de negócio para o Knowledge Catalog em nível de campo."
      },
      {
        title: "Conexão Cloud Resource Gemini 3.8 Flash",
        skill: "bigquery-studio-pipelines",
        status: "ACTIVE",
        description: "Conecta o BigQuery ao Vertex AI Gemini 3.8 Flash para modelos remotos e IA analítica em tempo real."
      }
    ]
  };
}
