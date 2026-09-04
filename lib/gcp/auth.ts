// lib/gcp/auth.ts - Gerenciador robusto de tokens de acesso Google Cloud
import { GoogleAuth } from "google-auth-library";
import { execSync } from "child_process";

export const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "rafaelpaes-477-20240820125418";
export const DATASET_ID = "business_assessment_customer";
export const GCS_BUCKET = "dass-2026";
export const GCS_PREFIX = "business_assessment";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getGcpAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  // 1. Tenta obter via GoogleAuth (ADC nativo)
  try {
    const auth = new GoogleAuth({
      scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/bigquery",
        "https://www.googleapis.com/auth/devstorage.read_write"
      ]
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    if (tokenResponse?.token) {
      cachedToken = {
        token: tokenResponse.token,
        expiresAt: now + 3500000 // ~1 hora
      };
      return tokenResponse.token;
    }
  } catch (error) {
    console.warn("[GCP Auth] ADC nativo falhou, tentando fallback gcloud auth CLI...", error);
  }

  // 2. Fallback resiliente via gcloud CLI local
  try {
    const stdout = execSync("gcloud auth print-access-token", { encoding: "utf-8", timeout: 10000 });
    const token = stdout.trim();
    if (token && token.startsWith("ya29.")) {
      cachedToken = {
        token,
        expiresAt: now + 3000000
      };
      return token;
    }
  } catch (cliError) {
    console.error("[GCP Auth] Falha crítica ao obter token via CLI:", cliError);
  }

  throw new Error("Não foi possível autenticar no Google Cloud via ADC ou gcloud CLI.");
}
