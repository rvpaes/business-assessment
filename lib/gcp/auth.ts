// lib/gcp/auth.ts - Gerenciador robusto de tokens de acesso Google Cloud
import { GoogleAuth } from "google-auth-library";
import { execSync } from "child_process";

export const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "rafaelpaes-477-20240820125418";
export const DATASET_ID = "business_assessment_customer";
export const GCS_BUCKET = "dass-2026";
export const GCS_PREFIX = "business_assessment";

// Cache do token com expiração curta e segura (máx 4 minutos) para evitar tokens expirados em memória
let cachedToken: { token: string; expiresAt: number } | null = null;

export function invalidateGcpTokenCache(): void {
  cachedToken = null;
}

export async function getGcpAccessToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 30000) {
    return cachedToken.token;
  }

  // 0. Verifica token explicitamente fornecido em variável de ambiente
  if (process.env.GCP_ACCESS_TOKEN && process.env.GCP_ACCESS_TOKEN.startsWith("ya29.")) {
    return process.env.GCP_ACCESS_TOKEN;
  }

  // 1. Tenta prioritariamente via gcloud CLI local (ambiente de dev/macOS onde o usuário está autenticado)
  const gcloudBinCandidates = [
    process.env.GCLOUD_BIN,
    "/Users/rafaelpaes/google-cloud-sdk/bin/gcloud",
    "/opt/homebrew/bin/gcloud",
    "/usr/local/bin/gcloud",
    "gcloud"
  ].filter(Boolean) as string[];

  const customEnv = {
    ...process.env,
    PATH: `/Users/rafaelpaes/google-cloud-sdk/bin:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ""}`
  };

  for (const bin of gcloudBinCandidates) {
    try {
      const stdout = execSync(`${bin} auth print-access-token`, {
        encoding: "utf-8",
        timeout: 12000,
        env: customEnv,
        stdio: ["pipe", "pipe", "pipe"]
      });
      const token = stdout.trim();
      if (token && token.startsWith("ya29.")) {
        cachedToken = {
          token,
          expiresAt: now + 240000 // Cache seguro de 4 minutos (tokens GCP duram 60 min)
        };
        return token;
      }
    } catch {
      // continua para o próximo candidato
    }
  }

  // 2. Fallback via GoogleAuth (ADC nativo / Cloud Run Service Account)
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
        expiresAt: now + 240000 // Cache seguro de 4 minutos
      };
      return tokenResponse.token;
    }
  } catch (error: any) {
    console.warn("[GCP Auth] Falha ao obter token via GoogleAuth ADC:", error?.message || error);
  }

  throw new Error("Não foi possível autenticar no Google Cloud via gcloud CLI ou ADC.");
}

/**
 * Wrapper resiliente para fetch com autorização GCP automática e auto-retry transparente em caso de 401.
 */
export async function fetchWithGcpAuth(
  url: string,
  init: RequestInit = {},
  retryOn401 = true
): Promise<Response> {
  let token = await getGcpAccessToken();
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...init, headers });

  // Se retornar 401 Unauthorized, invalida imediatamente o cache e retenta com token novo
  if (res.status === 401 && retryOn401) {
    console.warn(`[GCP Auth] Requisição a ${url} retornou 401. Renovando token via gcloud/ADC e repetindo...`);
    invalidateGcpTokenCache();
    token = await getGcpAccessToken(true);
    headers.set("Authorization", `Bearer ${token}`);
    res = await fetch(url, { ...init, headers });
  }

  return res;
}
