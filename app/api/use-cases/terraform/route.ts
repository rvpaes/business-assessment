// app/api/use-cases/terraform/route.ts - API de Geração e Refinamento de Pipelines Terraform
// Integração global com Agent Platform Gemini 3.8 Flash (gemini-3.8-flash)
import { NextRequest, NextResponse } from "next/server";
import { generateUseCaseTerraformBundle } from "@/lib/terraform/use-case-terraform-generator";
import { callGemini38Flash } from "@/lib/gcp/gemini-3-8";
import { logStructuredStep } from "@/lib/gcp/bigquery";
import { PROJECT_ID } from "@/lib/gcp/auth";
import { DIGIO_USE_CASES, HYPERA_USE_CASES } from "@/lib/data/customer-usecases-catalog";
import { TopUseCase } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      useCaseId, 
      customerName = "Cliente Corporativo", 
      industry = "Enterprise", 
      customPrompt, 
      useGeminiThinking = false,
      useCaseData 
    } = body;

    if (!useCaseId && !useCaseData) {
      return NextResponse.json(
        { error: "useCaseId ou useCaseData é obrigatório." },
        { status: 400 }
      );
    }

    // Localiza o caso de uso no catálogo ou usa o enviado no corpo
    let targetUseCase: TopUseCase = useCaseData;
    if (!targetUseCase && useCaseId) {
      const allCases = [...DIGIO_USE_CASES, ...HYPERA_USE_CASES];
      targetUseCase = allCases.find(c => c.useCaseId === useCaseId) as TopUseCase;
    }

    if (!targetUseCase) {
      return NextResponse.json(
        { error: `Caso de uso '${useCaseId}' não localizado.` },
        { status: 404 }
      );
    }

    // 1. Gera o feixe determinístico em conformidade com as 3 skills
    const baseBundle = generateUseCaseTerraformBundle(
      targetUseCase,
      customerName,
      industry,
      PROJECT_ID,
      "us-central1"
    );

    // Se o usuário não pediu refinamento ou personalização com IA, retorna o feixe base imediato
    if (!customPrompt && !useGeminiThinking) {
      return NextResponse.json({
        success: true,
        bundle: baseBundle,
        thoughtText: null,
        mode: "deterministic_standard"
      });
    }

    // 2. Se o usuário solicitou refinamento com Gemini 3.8 Flash
    logStructuredStep({
      severity: "INFO",
      phase: "CEN_EXECUTION",
      toolAction: "refine_terraform_pipeline_gemini_38",
      thought: `Refinando pipeline Terraform para ${targetUseCase.title} (${customerName}) com Gemini 3.8 Flash e prompt customizado.`
    });

    const aiPrompt = `Você é o Arquiteto Principal de Google Cloud especializado nas skills:
1. /bigquery-studio-pipelines (SQLX, Python BigFrames com pushdown e PySpark Serverless Stored Procedures)
2. /gcp_bq_otimization (FinOps, Particionamento Diário, Clustering x4, PK/FK NOT ENFORCED)
3. /gcp_knowledge_catalog (Knowledge Catalog LIGHTWEIGHT Scan, Data Documentation Scan, Aspect Types e Descrições de Coluna)

CASO DE USO:
- Título: ${targetUseCase.title}
- Categoria: ${targetUseCase.category}
- Cliente: ${customerName} (${industry})
- Problema: ${targetUseCase.businessProblem}
- Solução: ${targetUseCase.solutionDescription}
- Retorno Esperado: ${targetUseCase.businessCaseRoi}

SOLICITAÇÃO DE AJUSTE / REFINAMENTO DO USUÁRIO:
"${customPrompt || "Aprimore a esteira com foco em resiliência, observabilidade e governança profunda."}"

ARQUIVOS BASE ATUAIS:
${baseBundle.files.map(f => `--- ${f.filename} ---
${f.content.slice(0, 500)}... (truncated for brevity)
`).join("\n")}

DIRETRIZ FINOPS MANDATÓRIA:
O dimensionamento do pipeline e a arquitetura proposta devem sempre garantir que o valor do retorno financeiro para o cliente supere com folga o custo de consumo GCP.

INSTRUÇÃO:
Analise a solicitação do usuário e retorne uma resposta JSON estrita com o seguinte formato:
{
  "thoughtSummary": "Explicação técnica sucinta das alterações realizadas",
  "recommendedEngine": "SQLX | BigFrames | PySpark | Hybrid",
  "updatedFiles": [
    {
      "filename": "nome_do_arquivo",
      "content": "conteúdo completo atualizado do arquivo em Terraform HCL, YAML ou Python"
    }
  ]
}
`;

    try {
      const geminiRes = await callGemini38Flash(aiPrompt, {
        thinkingLevel: "HIGH",
        responseMimeType: "application/json",
        systemInstruction: "Você é um arquiteto sênior de dados GCP focado em BigQuery Studio Pipelines, FinOps e Knowledge Catalog. Regra mandatória: o valor do retorno financeiro para o cliente deve sempre superar com folga o consumo de nuvem GCP. Retorne estritamente JSON válido."
      });

      let parsed: any = null;
      try {
        parsed = JSON.parse(geminiRes.text);
      } catch (pErr) {
        console.warn("Falha ao parsear JSON direto do Gemini 3.8 Flash, usando fallback.", pErr);
      }

      // Se o Gemini retornou arquivos atualizados, mescla com o bundle
      if (parsed?.updatedFiles && Array.isArray(parsed.updatedFiles)) {
        for (const uf of parsed.updatedFiles) {
          const existingFile = baseBundle.files.find(f => f.filename === uf.filename);
          if (existingFile && uf.content) {
            existingFile.content = uf.content;
          } else if (uf.filename && uf.content) {
            baseBundle.files.push({
              filename: uf.filename,
              category: uf.filename.endsWith(".tf") ? "iac" : uf.filename.endsWith(".py") || uf.filename.endsWith(".yaml") || uf.filename.endsWith(".sqlx") ? "studio" : "governance",
              description: `Arquivo customizado por Gemini 3.8 Flash (${uf.filename})`,
              content: uf.content
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        bundle: baseBundle,
        thoughtText: geminiRes.thoughtText || parsed?.thoughtSummary || "Ajustes de arquitetura aplicados com sucesso pelo Gemini 3.8 Flash.",
        mode: "gemini_38_refined"
      });

    } catch (aiErr: any) {
      console.error("Erro ao chamar Gemini 3.8 Flash para refinamento, retornando bundle base:", aiErr);
      return NextResponse.json({
        success: true,
        bundle: baseBundle,
        thoughtText: "Pipeline gerado com base nas regras canônicas das skills /bigquery-studio-pipelines, /gcp_bq_otimization e /gcp_knowledge_catalog.",
        mode: "deterministic_fallback"
      });
    }

  } catch (error: any) {
    console.error("Erro em /api/use-cases/terraform:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno na geração de Terraform" },
      { status: 500 }
    );
  }
}
