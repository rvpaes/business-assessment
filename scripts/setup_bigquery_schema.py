import sys
import subprocess
from google.oauth2.credentials import Credentials
from google.cloud import bigquery

PROJECT_ID = "rafaelpaes-477-20240820125418"
DATASET_ID = "business_assessment_customer"

def get_client():
    try:
        from google.auth import default
        from google.auth.transport.requests import Request
        creds, _ = default()
        creds.refresh(Request())
        return bigquery.Client(project=PROJECT_ID, credentials=creds)
    except Exception as e:
        # Fallback to gcloud active access token
        token = subprocess.check_output(["gcloud", "auth", "print-access-token"]).decode().strip()
        creds = Credentials(token)
        return bigquery.Client(project=PROJECT_ID, credentials=creds)

client = get_client()

ddl_statements = [
    # 1. customers
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.customers` (
        customer_id STRING NOT NULL,
        name STRING NOT NULL,
        industry STRING,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        last_assessment_id STRING,
        gcs_folder_uri STRING
    )
    OPTIONS(description="Tabela mestra de clientes cadastrados no portal de business assessment.");
    """,

    # 2. customer_assessments
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.customer_assessments` (
        assessment_id STRING NOT NULL,
        customer_id STRING NOT NULL,
        customer_name STRING NOT NULL,
        industry STRING,
        upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        total_datasets INT64,
        total_tables INT64,
        total_views INT64,
        total_columns INT64,
        documented_columns INT64,
        doc_percentage FLOAT64,
        dataplex_scans_count INT64,
        property_graphs_count INT64,
        data_agents_count INT64,
        gcs_archive_uri STRING,
        summary_markdown STRING
    )
    OPTIONS(description="Histórico de assessments de clientes processados com métricas de maturidade.");
    """,

    # 3. assessment_tables_catalog
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.assessment_tables_catalog` (
        table_key STRING NOT NULL,
        assessment_id STRING NOT NULL,
        project_id STRING,
        dataset_id STRING,
        table_name STRING,
        table_type STRING,
        table_description STRING,
        column_count INT64,
        documented_columns INT64,
        estimated_rows INT64,
        estimated_bytes INT64,
        dataplex_profile_scan_active BOOL
    )
    OPTIONS(description="Catálogo de tabelas auditadas por assessment com estatísticas de linhas, bytes e governança.");
    """,

    # 4. top_use_cases
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.top_use_cases` (
        use_case_id STRING NOT NULL,
        assessment_id STRING NOT NULL,
        rank INT64,
        title STRING NOT NULL,
        category STRING,
        business_problem STRING,
        solution_description STRING,
        business_case_roi STRING,
        financial_gain_estimate_usd FLOAT64,
        gcp_monthly_cost_usd FLOAT64,
        cost_breakdown_bq_usd FLOAT64,
        cost_breakdown_vertex_usd FLOAT64,
        cost_breakdown_cloudrun_usd FLOAT64,
        cost_breakdown_storage_usd FLOAT64,
        required_tables ARRAY<STRING>,
        required_columns ARRAY<STRING>,
        guardrails STRING,
        confidence_score FLOAT64,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
    )
    OPTIONS(description="Top 6 casos de uso priorizados via debate multi-agente NC-MAD com grounding estrito no BigQuery.");
    """,

    # 5. neuro_debates
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.neuro_debates` (
        debate_id STRING NOT NULL,
        assessment_id STRING NOT NULL,
        cycle INT64,
        phase STRING,
        agent_role STRING,
        agent_name STRING,
        thought_log STRING,
        output_text STRING,
        salience_matrix_json STRING,
        verdict STRING,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
    )
    OPTIONS(description="Registro dialético do debate neurocognitivo das personas (DMN, SN, CEN) para auditoria e explicabilidade.");
    """,

    # 6. graph_nodes
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.graph_nodes` (
        id STRING NOT NULL,
        node_type STRING NOT NULL,
        name STRING NOT NULL,
        category STRING,
        properties_json STRING
    )
    OPTIONS(description="Nós do Property Graph BigQuery (Clientes, Datasets, Tabelas, Casos de Uso, Personas).");
    """,

    # 7. graph_edges
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.graph_edges` (
        edge_id STRING NOT NULL,
        source_id STRING NOT NULL,
        destination_id STRING NOT NULL,
        edge_type STRING NOT NULL,
        weight FLOAT64,
        properties_json STRING
    )
    OPTIONS(description="Arestas do Property Graph BigQuery conectando entidades de metadados a casos de uso.");
    """,

    # 8. Property Graph DDL
    f"""
    CREATE OR REPLACE PROPERTY GRAPH `{PROJECT_ID}.{DATASET_ID}.enterprise_business_graph`
      NODE TABLES (
        `{PROJECT_ID}.{DATASET_ID}.graph_nodes`
          KEY (id)
          LABEL Node
          PROPERTIES (id, node_type, name, category, properties_json)
      )
      EDGE TABLES (
        `{PROJECT_ID}.{DATASET_ID}.graph_edges`
          KEY (edge_id)
          SOURCE KEY (source_id) REFERENCES graph_nodes (id)
          DESTINATION KEY (destination_id) REFERENCES graph_nodes (id)
          LABEL Edge
          PROPERTIES (edge_id, edge_type, weight, properties_json)
      );
    """
]

def main():
    print(f"Provisioning BigQuery schema in `{PROJECT_ID}.{DATASET_ID}`...")
    for idx, stmt in enumerate(ddl_statements, 1):
        print(f"[{idx}/{len(ddl_statements)}] Executing DDL...")
        query_job = client.query(stmt)
        query_job.result()
    print("✅ BigQuery schema and Property Graph successfully created!")

if __name__ == "__main__":
    main()
