// lib/utils/formatters.ts - Padronização corporativa de casas decimais e moeda (Clean Executive UI)

/**
 * Formata valores em Dólar (USD) mantendo rigorosamente o padrão de casas decimais.
 * Exemplo padrão: 10800 -> "$10.800,00"
 * Exemplo compacto: 3850000 -> "+$3,85M"
 */
export function formatCurrencyUsd(
  amount: number | undefined | null,
  options?: {
    compact?: boolean;
    showSign?: boolean;
    decimals?: number;
  }
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "$0,00";
  }

  const decimals = options?.decimals ?? 2;
  const sign = options?.showSign && amount > 0 ? "+" : "";

  if (options?.compact) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000) {
      const formatted = (abs / 1_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${sign}$${formatted}M`;
    }
    if (abs >= 1_000) {
      const formatted = (abs / 1_000).toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${sign}$${formatted}k`;
    }
  }

  const formatted = amount.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${sign}$${formatted}`;
}

/**
 * Formata valores em Real (BRL) mantendo o padrão de 2 casas decimais.
 * Exemplo compacto: 21560000 -> "R$ 21,56M"
 */
export function formatCurrencyBrl(
  amount: number | undefined | null,
  options?: {
    compact?: boolean;
    decimals?: number;
  }
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "R$ 0,00";
  }

  const decimals = options?.decimals ?? 2;

  if (options?.compact) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000) {
      const formatted = (abs / 1_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `R$ ${formatted}M`;
    }
    if (abs >= 1_000) {
      const formatted = (abs / 1_000).toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `R$ ${formatted}k`;
    }
  }

  const formatted = amount.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `R$ ${formatted}`;
}

/**
 * Formata percentuais padronizados (ex: 58,3% ou 2.850,0%).
 */
export function formatPercent(
  val: number | undefined | null,
  decimals: number = 1
): string {
  if (val === undefined || val === null || isNaN(val)) {
    return "0,0%";
  }

  return `${val.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/**
 * Formata números gerais com casas decimais padronizadas.
 */
export function formatDecimal(
  val: number | undefined | null,
  decimals: number = 2
): string {
  if (val === undefined || val === null || isNaN(val)) {
    return "0,00";
  }

  return val.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
