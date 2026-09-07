// lib/gcp/auth.ts - Gerenciador ultra-resiliente e de alta performance para tokens Google Cloud
import { GoogleAuth } from "google-auth-library";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "rafaelpaes-477-20240820125418";
export const DATASET_ID = "business_assessment_customer";
export const GCS_BUCKET = "dass-2026";
export const GCS_PREFIX = "business_assessment";

// Cache do token em memória com tempo de expiração seguro
let cachedToken: { token: string; expiresAt: number } | null = null;

export function invalidateGcpTokenCache(): void {
  cachedToken = null;
}

/**
 * Renova o token de acesso via chamada direta HTTPS à API OAuth2 do Google (<300ms),
 * eliminando overhead, dependência de proxy ECP e congelamentos do CLI gcloud.
 */
async function refreshOAuth2Token(
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<string | null> {
  try {
    const effectiveClientId = clientId || process.env.GCP_CLIENT_ID;
    const effectiveClientSecret = clientSecret || process.env.GCP_CLIENT_SECRET;

    if (!effectiveClientId || !effectiveClientSecret) {
      return null;
    }

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: effectiveClientId,
      client_secret: effectiveClientSecret
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn("[GCP Auth] Falha no refresh direto OAuth2:", res.status, err);
      return null;
    }

    const data = await res.json();
    if (data.access_token && typeof data.access_token === "string" && data.access_token.startsWith("ya29.")) {
      const expiresInSec = typeof data.expires_in === "number" ? data.expires_in : 3600;
      cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + Math.max((expiresInSec - 120) * 1000, 60000)
      };
      return data.access_token;
    }
  } catch (e: any) {
    console.warn("[GCP Auth] Exceção no refresh direto OAuth2:", e?.message || e);
  }
  return null;
}

/**
 * Lê o banco de credenciais do gcloud no macOS/Linux para extrair o refresh_token do usuário ativo.
 */
function readLocalGcloudCredentials(): { refreshToken?: string; clientId?: string; clientSecret?: string } | null {
  try {
    const credsDbPath = path.join(os.homedir(), ".config", "gcloud", "credentials.db");
    if (!fs.existsSync(credsDbPath)) return null;

    // Busca o refresh token da conta ativa
    const stdout = execSync(
      `sqlite3 "${credsDbPath}" "SELECT value FROM credentials ORDER BY rowid DESC LIMIT 1;"`,
      { encoding: "utf-8", timeout: 2000, stdio: ["pipe", "pipe", "pipe"] }
    ).trim();

    if (stdout) {
      const parsed = JSON.parse(stdout);
      if (parsed.refresh_token) {
        return {
          refreshToken: parsed.refresh_token,
          clientId: parsed.client_id,
          clientSecret: parsed.client_secret
        };
      }
    }
  } catch {
    // Ignora erro e segue para o próximo método
  }
  return null;
}

/**
 * Verifica se já existe um token de acesso válido no cache local do gcloud (access_tokens.db).
 */
function readLocalGcloudAccessToken(): string | null {
  try {
    const tokensDbPath = path.join(os.homedir(), ".config", "gcloud", "access_tokens.db");
    if (!fs.existsSync(tokensDbPath)) return null;

    const stdout = execSync(
      `sqlite3 "${tokensDbPath}" "SELECT access_token, token_expiry FROM access_tokens ORDER BY rowid DESC LIMIT 1;"`,
      { encoding: "utf-8", timeout: 2000, stdio: ["pipe", "pipe", "pipe"] }
    ).trim();

    if (stdout) {
      const [token, expiryStr] = stdout.split("|");
      if (token && token.startsWith("ya29.") && expiryStr) {
        const expiry = new Date(expiryStr.replace(" ", "T") + "Z").getTime();
        // Se ainda for válido por mais de 60 segundos
        if (expiry > Date.now() + 60000) {
          cachedToken = {
            token,
            expiresAt: expiry - 30000
          };
          return token;
        }
      }
    }
  } catch {
    // Ignora e segue
  }
  return null;
}

export async function getGcpAccessToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 30000) {
    return cachedToken.token;
  }

  // 1. Variável de ambiente direta (GCP_ACCESS_TOKEN)
  if (!forceRefresh && process.env.GCP_ACCESS_TOKEN && process.env.GCP_ACCESS_TOKEN.startsWith("ya29.")) {
    return process.env.GCP_ACCESS_TOKEN;
  }

  // 2. Refresh Token via Variável de Ambiente (.env.local) - Mais Rápido & Resiliente (<300ms)
  if (process.env.GCP_REFRESH_TOKEN) {
    const refreshed = await refreshOAuth2Token(
      process.env.GCP_REFRESH_TOKEN,
      process.env.GCP_CLIENT_ID,
      process.env.GCP_CLIENT_SECRET
    );
    if (refreshed) return refreshed;
  }

  // 3. Cache local do gcloud (access_tokens.db)
  if (!forceRefresh) {
    const localToken = readLocalGcloudAccessToken();
    if (localToken) return localToken;
  }

  // 4. Extração de refresh_token do banco local do gcloud (credentials.db) e refresh direto HTTPS
  const localCreds = readLocalGcloudCredentials();
  if (localCreds?.refreshToken) {
    const refreshed = await refreshOAuth2Token(
      localCreds.refreshToken,
      localCreds.clientId,
      localCreds.clientSecret
    );
    if (refreshed) return refreshed;
  }

  // 5. Fallback via gcloud CLI (com timeout estrito de 4s para não congelar o servidor)
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
      const stdout = execSync(`${bin} auth print-access-token --quiet`, {
        encoding: "utf-8",
        timeout: 4000,
        env: customEnv,
        stdio: ["pipe", "pipe", "pipe"]
      });
      const token = stdout.trim();
      if (token && token.startsWith("ya29.")) {
        cachedToken = {
          token,
          expiresAt: now + 240000
        };
        return token;
      }
    } catch {
      // continua para o próximo candidato
    }
  }

  // 6. Fallback via GoogleAuth (ADC nativo / Cloud Run Service Account)
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
        expiresAt: now + 240000
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
    console.warn(`[GCP Auth] Requisição a ${url} retornou 401. Renovando token e repetindo...`);
    invalidateGcpTokenCache();
    token = await getGcpAccessToken(true);
    headers.set("Authorization", `Bearer ${token}`);
    res = await fetch(url, { ...init, headers });
  }

  return res;
}
