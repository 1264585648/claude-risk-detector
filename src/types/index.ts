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
