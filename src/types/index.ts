export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DetectionItem {
  id: string;
  title: string;
  category: 'timezone' | 'language' | 'font' | 'webrtc' | 'browser' | 'ip' | 'intl';
  weight: number;
  score: number; // 0 (extreme risk) to 100 (completely safe)
  risk: RiskLevel;
  value: string;
  detail: string;
  impactReason: string; // 为什么 Claude 会查这个
  fixGuide: string; // 如何修复
  quickFixCmd?: string; // 终端快速修复命令
}

export interface NetworkProfile {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  timezone: string;
  isp: string;
  isDatacenter: boolean;
  isTzMismatch: boolean;
  status: 'loading' | 'success' | 'failed';
}

export interface OverallResult {
  totalScore: number;
  riskLevel: RiskLevel;
  verdict: string;
  description: string;
  criticalIssues: string[];
}

export interface VirtualCard {
  id: string;
  name: string;
  issuer: string;
  region_label: string;
  summary: string;
  official_url: string;
  network?: string;
  issue_fee?: number | null;
  issue_fee_unit?: string;
  issue_fee_note?: string;
  annual_fee?: number | null;
  fx_markup?: number | null;
  fx_note?: string;
  kyc_need: 'yes' | 'no' | 'maybe' | 'unknown' | string;
  kyc_title?: string;
  kyc_detail?: string;
  passport_need?: string;
  residence_need?: string;
  geo_code?: string;
  fee_summary?: string;
}

export interface CuratedCard {
  id: string;
  name: string;
  tagline: string;
  issuer: string;
  cardType: string; // Visa / Mastercard
  kycLevel: 'No-KYC' | 'Lite-KYC' | 'Passport-KYC' | 'Strict-KYC';
  kycBadgeColor: string;
  issueFeeText: string;
  topupMethods: string[];
  applePaySupport: boolean;
  claudeSuccessRate: string;
  pros: string[];
  cons: string[];
  officialUrl: string;
  recommendedFor: string;
}

export interface TaxFreeAddressTemplate {
  stateName: string;
  stateCode: string;
  city: string;
  zipCode: string;
  streetExample: string;
  phoneAreaCode: string;
  taxRate: string;
  note: string;
}

