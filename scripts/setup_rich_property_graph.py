import subprocess
from google.oauth2.credentials import Credentials
from google.cloud import bigquery

PROJECT_ID = "rafaelpaes-477-20240820125418"
DATASET_ID = "business_assessment_customer"

def get_client():
    token = subprocess.check_output(["gcloud", "auth", "print-access-token"]).decode().strip()
    creds = Credentials(token)
    return bigquery.Client(project=PROJECT_ID, credentials=creds)

client = get_client()

ddl_stmts = [
    # 1. edge_customer_assessment
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.edge_customer_assessment` (
        id STRING NOT NULL,
        customer_id STRING NOT NULL,
        assessment_id STRING NOT NULL
    );
    """,

    # 2. edge_assessment_table
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.edge_assessment_table` (
        id STRING NOT NULL,
        assessment_id STRING NOT NULL,
        table_key STRING NOT NULL
    );
    """,

    # 3. edge_table_usecase
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.edge_table_usecase` (
        id STRING NOT NULL,
        table_key STRING NOT NULL,
        use_case_id STRING NOT NULL
    );
    """,

    # 4. edge_persona_usecase
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.edge_persona_usecase` (
        id STRING NOT NULL,
        debate_id STRING NOT NULL,
        use_case_id STRING NOT NULL
    );
    """,

    # 5. edge_customer_usecase
    f"""
    CREATE TABLE IF NOT EXISTS `{PROJECT_ID}.{DATASET_ID}.edge_customer_usecase` (
        id STRING NOT NULL,
        customer_id STRING NOT NULL,
        use_case_id STRING NOT NULL
    );
    """
]

def main():
    print("Creating distinct Edge Tables in BigQuery...")
    for s in ddl_stmts:
        client.query(s).result()
    print("Edge tables created. Now populating edges with existing data...")

    populate_sql = f"""
    -- 1. edge_customer_assessment
    INSERT INTO `{PROJECT_ID}.{DATASET_ID}.edge_customer_assessment` (id, customer_id, assessment_id)
    SELECT 
        GENERATE_UUID() AS id,
        customer_id,
        assessment_id
    FROM `{PROJECT_ID}.{DATASET_ID}.customer_assessments`
    WHERE (customer_id, assessment_id) NOT IN (
        SELECT (customer_id, assessment_id) FROM `{PROJECT_ID}.{DATASET_ID}.edge_customer_assessment`
    );

    -- 2. edge_assessment_table
    INSERT INTO `{PROJECT_ID}.{DATASET_ID}.edge_assessment_table` (id, assessment_id, table_key)
    SELECT 
        GENERATE_UUID() AS id,
        assessment_id,
        table_key
    FROM `{PROJECT_ID}.{DATASET_ID}.assessment_tables_catalog`
    WHERE (assessment_id, table_key) NOT IN (
        SELECT (assessment_id, table_key) FROM `{PROJECT_ID}.{DATASET_ID}.edge_assessment_table`
    )
    LIMIT 200;

    -- 3. edge_customer_usecase
    INSERT INTO `{PROJECT_ID}.{DATASET_ID}.edge_customer_usecase` (id, customer_id, use_case_id)
    SELECT 
        GENERATE_UUID() AS id,
        a.customer_id,
        u.use_case_id
    FROM `{PROJECT_ID}.{DATASET_ID}.top_use_cases` u
    JOIN `{PROJECT_ID}.{DATASET_ID}.customer_assessments` a ON u.assessment_id = a.assessment_id
    WHERE (a.customer_id, u.use_case_id) NOT IN (
        SELECT (customer_id, use_case_id) FROM `{PROJECT_ID}.{DATASET_ID}.edge_customer_usecase`
    );

    -- 4. edge_persona_usecase
    INSERT INTO `{PROJECT_ID}.{DATASET_ID}.edge_persona_usecase` (id, debate_id, use_case_id)
    SELECT 
        GENERATE_UUID() AS id,
        d.debate_id,
        u.use_case_id
    FROM `{PROJECT_ID}.{DATASET_ID}.neuro_debates` d
    CROSS JOIN `{PROJECT_ID}.{DATASET_ID}.top_use_cases` u
    WHERE d.assessment_id = u.assessment_id AND d.phase = 'CEN_EXECUTIVE_VALIDATION'
    LIMIT 30;

    -- 5. edge_table_usecase
    INSERT INTO `{PROJECT_ID}.{DATASET_ID}.edge_table_usecase` (id, table_key, use_case_id)
    SELECT 
        GENERATE_UUID() AS id,
        t.table_key,
        u.use_case_id
    FROM `{PROJECT_ID}.{DATASET_ID}.top_use_cases` u,
    UNNEST(u.required_tables) AS req_tbl
    JOIN `{PROJECT_ID}.{DATASET_ID}.assessment_tables_catalog` t 
      ON t.table_name = req_tbl OR t.table_key = req_tbl
    LIMIT 50;
    """

    print("Populating edge tables...")
    client.query(populate_sql).result()
    print("Populated. Now recreating enterprise_business_graph with 5 Node Tables and 5 Edge Tables...")

    rich_graph_ddl = f"""
    CREATE OR REPLACE PROPERTY GRAPH `{PROJECT_ID}.{DATASET_ID}.enterprise_business_graph`
      NODE TABLES (
        `{PROJECT_ID}.{DATASET_ID}.customers` AS customer
          KEY (customer_id)
          LABEL Customer
          PROPERTIES (customer_id, name, industry),

        `{PROJECT_ID}.{DATASET_ID}.customer_assessments` AS assessment
          KEY (assessment_id)
          LABEL Assessment
          PROPERTIES (assessment_id, customer_name, total_tables, total_columns, doc_percentage),

        `{PROJECT_ID}.{DATASET_ID}.assessment_tables_catalog` AS table_catalog
          KEY (table_key)
          LABEL TableCatalog
          PROPERTIES (table_key, table_name, dataset_id, table_type, estimated_rows, estimated_bytes),

        `{PROJECT_ID}.{DATASET_ID}.top_use_cases` AS use_case
          KEY (use_case_id)
          LABEL UseCase
          PROPERTIES (use_case_id, rank, title, category, financial_gain_estimate_usd, gcp_monthly_cost_usd, business_case_roi),

        `{PROJECT_ID}.{DATASET_ID}.neuro_debates` AS persona
          KEY (debate_id)
          LABEL PersonaDebate
          PROPERTIES (debate_id, phase, agent_role, agent_name, verdict)
      )
      EDGE TABLES (
        `{PROJECT_ID}.{DATASET_ID}.edge_customer_assessment` AS customer_has_assessment
          KEY (id)
          SOURCE KEY (customer_id) REFERENCES customer (customer_id)
          DESTINATION KEY (assessment_id) REFERENCES assessment (assessment_id)
          LABEL HAS_ASSESSMENT,

        `{PROJECT_ID}.{DATASET_ID}.edge_assessment_table` AS assessment_audited_table
          KEY (id)
          SOURCE KEY (assessment_id) REFERENCES assessment (assessment_id)
          DESTINATION KEY (table_key) REFERENCES table_catalog (table_key)
          LABEL AUDITED_TABLE,

        `{PROJECT_ID}.{DATASET_ID}.edge_table_usecase` AS table_empowers_usecase
          KEY (id)
          SOURCE KEY (table_key) REFERENCES table_catalog (table_key)
          DESTINATION KEY (use_case_id) REFERENCES use_case (use_case_id)
          LABEL EMPOWERS_USE_CASE,

        `{PROJECT_ID}.{DATASET_ID}.edge_persona_usecase` AS persona_validated_usecase
          KEY (id)
          SOURCE KEY (debate_id) REFERENCES persona (debate_id)
          DESTINATION KEY (use_case_id) REFERENCES use_case (use_case_id)
          LABEL VALIDATED_USE_CASE,

        `{PROJECT_ID}.{DATASET_ID}.edge_customer_usecase` AS customer_invests_usecase
          KEY (id)
          SOURCE KEY (customer_id) REFERENCES customer (customer_id)
          DESTINATION KEY (use_case_id) REFERENCES use_case (use_case_id)
          LABEL INVESTS_IN
      );
    """

    client.query(rich_graph_ddl).result()
    print("✅ Rich Enterprise Property Graph successfully created in BigQuery with 5 Nodes & 5 Edges!")

if __name__ == "__main__":
    main()
