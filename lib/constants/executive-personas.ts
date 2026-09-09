// lib/constants/executive-personas.ts - Definições e Metadados das Personas Executivas (persona_adk.pdf)
import { ExecutiveRole, ExecutivePersonaInfo } from "../types";

export const EXECUTIVE_PERSONAS: Record<ExecutiveRole, ExecutivePersonaInfo> = {
  CEO: {
    role: "CEO",
    title: "Chief Executive Officer (CEO)",
    subtitle: "Alinhamento Estratégico, Valor Corporativo & Riscos Críticos",
    focusArea: "Enterprise Value (EV), Custo de Oportunidade, Market Share & Cultura",
    avatarIcon: "Crown",
    themeColor: "navy"
  },
  CTO: {
    role: "CTO",
    title: "Chief Technology Officer (CTO)",
    subtitle: "Arquitetura, Engenharia, FinOps & Viabilidade Técnica",
    focusArea: "Previsibilidade FinOps, Débito Técnico, Hard-limits, SLAs L3 & Quotas",
    avatarIcon: "Cpu",
    themeColor: "indigo"
  },
  CFO: {
    role: "CFO",
    title: "Chief Financial Officer (CFO)",
    subtitle: "Modelagem Econômica, Payback, ROI & Riscos Orçamentários",
    focusArea: "TCO 12/24/36m, Unit Economics, CUDs, Risco Cambial & CapEx vs OpEx",
    avatarIcon: "Landmark",
    themeColor: "emerald"
  },
  CMO: {
    role: "CMO",
    title: "Chief Marketing Officer (CMO)",
    subtitle: "LTV, CAC, Experiência do Cliente & Go-to-Market",
    focusArea: "CAC, LTV, NRR, Churn, Atritos de UX, Posicionamento de Marca & Co-marketing",
    avatarIcon: "TrendingUp",
    themeColor: "amber"
  },
  MODERATOR: {
    role: "MODERATOR",
    title: "Mesa Redonda & Síntese Estratégica",
    subtitle: "Facilitador Executivo & Síntese de Consenso do Board",
    focusArea: "Orquestração do Debate, Mediação de Conflitos & Checklist de Sabatina GCP",
    avatarIcon: "Users",
    themeColor: "blue"
  }
};
