/**
 * 全球通用时区转换与映射助手 (基于 Unicode CLDR windowsZones 标准)
 * 支持全球所有主流国家/地区的 IANA 时区 <-> Windows 时区 ID <-> 各 OS 修复命令双向映射
 */

export interface TimezoneMapping {
  tzName: string;   // IANA 时区标识 (如 America/Los_Angeles)
  winTzId: string;  // Windows 时区标识 (如 Pacific Standard Time)
  label: string;    // 中文语义化标签 (如 美国太平洋时区 (洛杉矶/西八区))
  offsetHours?: number; // UTC 偏移量
}

/**
 * 权威 Unicode CLDR 全球重点 IANA 到 Windows 时区映射字典
 */
export const CLDR_IANA_TO_WINDOWS: Record<string, { winTz: string; label: string }> = {
  // ===================== 北美 (美国 / 加拿大 / 墨西哥) =====================
  'America/Los_Angeles': { winTz: 'Pacific Standard Time', label: '美国太平洋时区 (洛杉矶/西八区)' },
  'America/New_York': { winTz: 'Eastern Standard Time', label: '美国东部时区 (纽约/西五区)' },
  'America/Chicago': { winTz: 'Central Standard Time', label: '美国中部时区 (芝加哥/西六区)' },
  'America/Denver': { winTz: 'Mountain Standard Time', label: '美国山地时区 (丹佛/西七区)' },
  'America/Phoenix': { winTz: 'US Mountain Standard Time', label: '美国山地时区 (亚利桑那/无夏令时)' },
  'America/Anchorage': { winTz: 'Alaskan Standard Time', label: '美国阿拉斯加时区 (西九区)' },
  'Pacific/Honolulu': { winTz: 'Hawaiian Standard Time', label: '美国夏威夷时区 (西十区)' },
  'America/Detroit': { winTz: 'Eastern Standard Time', label: '美国东部时区 (底特律/西五区)' },
  'America/Indiana/Indianapolis': { winTz: 'US Eastern Standard Time', label: '美国印第安纳时区 (西五区)' },
  'America/Boise': { winTz: 'Mountain Standard Time', label: '美国山地时区 (博伊西/西七区)' },
  'America/Toronto': { winTz: 'Eastern Standard Time', label: '加拿大东部时区 (多伦多/西五区)' },
  'America/Vancouver': { winTz: 'Pacific Standard Time', label: '加拿大太平洋时区 (温哥华/西八区)' },
  'America/Montreal': { winTz: 'Eastern Standard Time', label: '加拿大蒙特利尔时区 (西五区)' },
  'America/Edmonton': { winTz: 'Mountain Standard Time', label: '加拿大山地时区 (埃德蒙顿/西七区)' },
  'America/Winnipeg': { winTz: 'Central Standard Time', label: '加拿大中部时区 (温尼伯/西六区)' },
  'America/Halifax': { winTz: 'Atlantic Standard Time', label: '加拿大西洋时区 (哈利法克斯/西四区)' },
  'America/Mexico_City': { winTz: 'Central Standard Time (Mexico)', label: '墨西哥中部时区 (墨西哥城/西六区)' },
  'America/Tijuana': { winTz: 'Pacific Standard Time (Mexico)', label: '墨西哥太平洋时区 (蒂华纳/西八区)' },

  // ===================== 亚太核心支持区 (日本/新加坡/港澳台/韩国/澳新等) =====================
  'Asia/Tokyo': { winTz: 'Tokyo Standard Time', label: '日本东京时区 (JST/东九区)' },
  'Asia/Singapore': { winTz: 'Singapore Standard Time', label: '新加坡时区 (SGT/东八区)' },
  'Asia/Hong_Kong': { winTz: 'China Standard Time', label: '中国香港时区 (HKT/东八区)' },
  'Asia/Taipei': { winTz: 'Taipei Standard Time', label: '中国台湾时区 (CST/东八区)' },
  'Asia/Seoul': { winTz: 'Korea Standard Time', label: '韩国首尔时区 (KST/东九区)' },
  'Asia/Kuala_Lumpur': { winTz: 'Singapore Standard Time', label: '马来西亚吉隆坡时区 (MYT/东八区)' },
  'Asia/Bangkok': { winTz: 'SE Asia Standard Time', label: '泰国曼谷时区 (ICT/东七区)' },
  'Asia/Ho_Chi_Minh': { winTz: 'SE Asia Standard Time', label: '越南胡志明时区 (ICT/东七区)' },
  'Asia/Jakarta': { winTz: 'SE Asia Standard Time', label: '印尼雅加达时区 (WIB/东七区)' },
  'Asia/Manila': { winTz: 'Singapore Standard Time', label: '菲律宾马尼拉时区 (PHT/东八区)' },
  'Asia/Kolkata': { winTz: 'India Standard Time', label: '印度加尔各答时区 (IST/东5.5区)' },
  'Asia/Dubai': { winTz: 'Arabian Standard Time', label: '阿联酋迪拜时区 (GST/东四区)' },
  'Asia/Jerusalem': { winTz: 'Israel Standard Time', label: '以色列耶路撒冷时区 (IST/东二区)' },
  'Australia/Sydney': { winTz: 'AUS Eastern Standard Time', label: '澳大利亚悉尼时区 (AEST/东十区)' },
  'Australia/Melbourne': { winTz: 'AUS Eastern Standard Time', label: '澳大利亚墨尔本时区 (AEST/东十区)' },
  'Australia/Brisbane': { winTz: 'E. Australia Standard Time', label: '澳大利亚布里斯班时区 (无夏令时/东十区)' },
  'Australia/Perth': { winTz: 'W. Australia Standard Time', label: '澳大利亚珀斯时区 (AWST/东八区)' },
  'Australia/Adelaide': { winTz: 'Cen. Australia Standard Time', label: '澳大利亚阿德莱德时区 (ACST/东9.5区)' },
  'Pacific/Auckland': { winTz: 'New Zealand Standard Time', label: '新西兰奥克兰时区 (NZST/东十二区)' },

  // ===================== 欧洲与英国 =====================
  'Europe/London': { winTz: 'GMT Standard Time', label: '英国伦敦时区 (GMT/零时区)' },
  'Europe/Dublin': { winTz: 'GMT Standard Time', label: '爱尔兰都柏林时区 (GMT/零时区)' },
  'Europe/Berlin': { winTz: 'W. Europe Standard Time', label: '西欧柏林时区 (CET/东一区)' },
  'Europe/Frankfurt': { winTz: 'W. Europe Standard Time', label: '西欧法兰克福时区 (CET/东一区)' },
  'Europe/Paris': { winTz: 'Romance Standard Time', label: '西欧巴黎时区 (CET/东一区)' },
  'Europe/Amsterdam': { winTz: 'W. Europe Standard Time', label: '西欧阿姆斯特丹时区 (CET/东一区)' },
  'Europe/Brussels': { winTz: 'Romance Standard Time', label: '西欧布鲁塞尔时区 (CET/东一区)' },
  'Europe/Rome': { winTz: 'W. Europe Standard Time', label: '西欧罗马时区 (CET/东一区)' },
  'Europe/Madrid': { winTz: 'Romance Standard Time', label: '西欧马德里时区 (CET/东一区)' },
  'Europe/Zurich': { winTz: 'W. Europe Standard Time', label: '西欧苏黎世时区 (CET/东一区)' },
  'Europe/Vienna': { winTz: 'W. Europe Standard Time', label: '中欧维也纳时区 (CET/东一区)' },
  'Europe/Stockholm': { winTz: 'W. Europe Standard Time', label: '北欧斯德哥尔摩时区 (CET/东一区)' },
  'Europe/Oslo': { winTz: 'W. Europe Standard Time', label: '北欧奥斯陆时区 (CET/东一区)' },
  'Europe/Copenhagen': { winTz: 'Romance Standard Time', label: '北欧哥本哈根时区 (CET/东一区)' },
  'Europe/Helsinki': { winTz: 'FLE Standard Time', label: '东欧赫尔辛基时区 (EET/东二区)' },
  'Europe/Warsaw': { winTz: 'Central European Standard Time', label: '中欧华沙时区 (CET/东一区)' },
  'Europe/Prague': { winTz: 'Central Europe Standard Time', label: '中欧布拉格时区 (CET/东一区)' },
  'Europe/Athens': { winTz: 'GTB Standard Time', label: '东欧雅典时区 (EET/东二区)' },
  'Europe/Bucharest': { winTz: 'GTB Standard Time', label: '东欧布加勒斯特时区 (EET/东二区)' },
  'Europe/Lisbon': { winTz: 'GMT Standard Time', label: '葡萄牙里斯本时区 (WET/零时区)' },
  'Europe/Moscow': { winTz: 'Russian Standard Time', label: '俄罗斯莫斯科时区 (MSK/东三区)' },

  // ===================== 南美与非洲 =====================
  'America/Sao_Paulo': { winTz: 'E. South America Standard Time', label: '巴西圣保罗时区 (BRT/西三区)' },
  'America/Buenos_Aires': { winTz: 'Argentina Standard Time', label: '阿根廷布宜诺斯艾利斯时区 (ART/西三区)' },
  'America/Santiago': { winTz: 'Pacific SA Standard Time', label: '智利圣地亚哥时区 (CLT/西四区)' },
  'America/Bogota': { winTz: 'SA Pacific Standard Time', label: '哥伦比亚波哥大时区 (COT/西五区)' },
  'Africa/Johannesburg': { winTz: 'South Africa Standard Time', label: '南非约翰内斯堡时区 (SAST/东二区)' },
  'Africa/Cairo': { winTz: 'Egypt Standard Time', label: '埃及开罗时区 (EEST/东二区)' },
};

/**
 * 针对仅有国家代码 (Country Code) 时的默认时区兜底
 */
const COUNTRY_FALLBACK_MAP: Record<string, TimezoneMapping> = {
  US: { tzName: 'America/Los_Angeles', winTzId: 'Pacific Standard Time', label: '美国太平洋时区 (洛杉矶/西八区)' },
  CA: { tzName: 'America/Toronto', winTzId: 'Eastern Standard Time', label: '加拿大东部时区 (多伦多/西五区)' },
  JP: { tzName: 'Asia/Tokyo', winTzId: 'Tokyo Standard Time', label: '日本东京时区 (JST/东九区)' },
  SG: { tzName: 'Asia/Singapore', winTzId: 'Singapore Standard Time', label: '新加坡时区 (SGT/东八区)' },
  GB: { tzName: 'Europe/London', winTzId: 'GMT Standard Time', label: '英国伦敦时区 (GMT/零时区)' },
  UK: { tzName: 'Europe/London', winTzId: 'GMT Standard Time', label: '英国伦敦时区 (GMT/零时区)' },
  DE: { tzName: 'Europe/Berlin', winTzId: 'W. Europe Standard Time', label: '德国柏林时区 (CET/东一区)' },
  FR: { tzName: 'Europe/Paris', winTzId: 'Romance Standard Time', label: '法国巴黎时区 (CET/东一区)' },
  NL: { tzName: 'Europe/Amsterdam', winTzId: 'W. Europe Standard Time', label: '荷兰阿姆斯特丹时区 (CET/东一区)' },
  AU: { tzName: 'Australia/Sydney', winTzId: 'AUS Eastern Standard Time', label: '澳大利亚悉尼时区 (AEST/东十区)' },
  NZ: { tzName: 'Pacific/Auckland', winTzId: 'New Zealand Standard Time', label: '新西兰奥克兰时区 (NZST/东十二区)' },
  KR: { tzName: 'Asia/Seoul', winTzId: 'Korea Standard Time', label: '韩国首尔时区 (KST/东九区)' },
  HK: { tzName: 'Asia/Hong_Kong', winTzId: 'China Standard Time', label: '中国香港时区 (HKT/东八区)' },
  TW: { tzName: 'Asia/Taipei', winTzId: 'Taipei Standard Time', label: '中国台湾时区 (CST/东八区)' },
  MY: { tzName: 'Asia/Kuala_Lumpur', winTzId: 'Singapore Standard Time', label: '马来西亚吉隆坡时区 (MYT/东八区)' },
  TH: { tzName: 'Asia/Bangkok', winTzId: 'SE Asia Standard Time', label: '泰国曼谷时区 (ICT/东七区)' },
  VN: { tzName: 'Asia/Ho_Chi_Minh', winTzId: 'SE Asia Standard Time', label: '越南胡志明时区 (ICT/东七区)' },
  IN: { tzName: 'Asia/Kolkata', winTzId: 'India Standard Time', label: '印度加尔各答时区 (IST/东5.5区)' },
  AE: { tzName: 'Asia/Dubai', winTzId: 'Arabian Standard Time', label: '阿联酋迪拜时区 (GST/东四区)' },
  CH: { tzName: 'Europe/Zurich', winTzId: 'W. Europe Standard Time', label: '瑞士苏黎世时区 (CET/东一区)' },
  SE: { tzName: 'Europe/Stockholm', winTzId: 'W. Europe Standard Time', label: '瑞典斯德哥尔摩时区 (CET/东一区)' },
  IT: { tzName: 'Europe/Rome', winTzId: 'W. Europe Standard Time', label: '意大利罗马时区 (CET/东一区)' },
  ES: { tzName: 'Europe/Madrid', winTzId: 'Romance Standard Time', label: '西班牙马德里时区 (CET/东一区)' },
  IE: { tzName: 'Europe/Dublin', winTzId: 'GMT Standard Time', label: '爱尔兰都柏林时区 (GMT/零时区)' },
  BR: { tzName: 'America/Sao_Paulo', winTzId: 'E. South America Standard Time', label: '巴西圣保罗时区 (BRT/西三区)' },
};

/**
 * 智能解析目标时区配置：优先精确匹配 IANA 时区，次选国家代码，最后大洲回退
 */
export function resolveRecommendedTimezone(
  targetIanaTz?: string,
  countryCode?: string,
  countryName?: string
): TimezoneMapping {
  // 1. 最高优先级：如果接口直接返回了精准的 IANA 时区名称（如 America/Los_Angeles）
  if (targetIanaTz && targetIanaTz.trim()) {
    const cleanTz = targetIanaTz.trim();
    if (CLDR_IANA_TO_WINDOWS[cleanTz]) {
      return {
        tzName: cleanTz,
        winTzId: CLDR_IANA_TO_WINDOWS[cleanTz].winTz,
        label: CLDR_IANA_TO_WINDOWS[cleanTz].label,
      };
    }

    // 模糊前缀匹配 (处理类似 America/Indiana/Knox 等小众时区)
    for (const [key, val] of Object.entries(CLDR_IANA_TO_WINDOWS)) {
      if (cleanTz.startsWith(key) || key.startsWith(cleanTz)) {
        return {
          tzName: cleanTz,
          winTzId: val.winTz,
          label: val.label,
        };
      }
    }
  }

  // 2. 次高优先级：根据国家代码 (US, JP, SG, GB 等)
  const code = (countryCode || '').toUpperCase().trim();
  if (code && COUNTRY_FALLBACK_MAP[code]) {
    return COUNTRY_FALLBACK_MAP[code];
  }

  // 3. 辅助按国家名称关键词识别
  const cName = (countryName || '').toLowerCase();
  if (cName.includes('united states') || cName.includes('usa') || cName.includes('美国')) {
    return COUNTRY_FALLBACK_MAP.US;
  }
  if (cName.includes('japan') || cName.includes('日本')) return COUNTRY_FALLBACK_MAP.JP;
  if (cName.includes('singapore') || cName.includes('新加坡')) return COUNTRY_FALLBACK_MAP.SG;
  if (cName.includes('united kingdom') || cName.includes('britain') || cName.includes('英国')) return COUNTRY_FALLBACK_MAP.GB;
  if (cName.includes('germany') || cName.includes('德国')) return COUNTRY_FALLBACK_MAP.DE;
  if (cName.includes('france') || cName.includes('法国')) return COUNTRY_FALLBACK_MAP.FR;
  if (cName.includes('australia') || cName.includes('澳大利亚')) return COUNTRY_FALLBACK_MAP.AU;

  // 4. 大洲兜底
  if (targetIanaTz?.startsWith('America/')) {
    return { tzName: targetIanaTz, winTzId: 'Eastern Standard Time', label: `美洲时区 (${targetIanaTz})` };
  }
  if (targetIanaTz?.startsWith('Europe/')) {
    return { tzName: targetIanaTz, winTzId: 'W. Europe Standard Time', label: `欧洲时区 (${targetIanaTz})` };
  }
  if (targetIanaTz?.startsWith('Asia/')) {
    return { tzName: targetIanaTz, winTzId: 'Singapore Standard Time', label: `亚洲时区 (${targetIanaTz})` };
  }
  if (targetIanaTz?.startsWith('Australia/') || targetIanaTz?.startsWith('Pacific/')) {
    return { tzName: targetIanaTz, winTzId: 'AUS Eastern Standard Time', label: `大洋洲时区 (${targetIanaTz})` };
  }

  // 全局终极兜底 (Anthropic 总部所在加州或美东标准)
  return {
    tzName: 'America/Los_Angeles',
    winTzId: 'Pacific Standard Time',
    label: '美国太平洋时区 (洛杉矶/西八区)',
  };
}

/**
 * 判断两个时区是否在业务层面等价或一致
 */
export function isTimezoneMatched(localIanaTz: string, nodeIanaTz?: string): boolean {
  if (!nodeIanaTz) return false;
  if (localIanaTz === nodeIanaTz) return true;

  // 通过 CLDR 映射判断两者是否属于同一个 Windows 时区（如 America/Detroit 与 America/New_York 同属 Eastern）
  const localWin = CLDR_IANA_TO_WINDOWS[localIanaTz]?.winTz;
  const nodeWin = CLDR_IANA_TO_WINDOWS[nodeIanaTz]?.winTz;

  if (localWin && nodeWin && localWin === nodeWin) {
    return true;
  }

  return false;
}

/**
 * 根据操作系统动态生成一键修改时区的标准命令
 */
export function getOsQuickFixCommand(
  targetIanaTz: string,
  winTzId: string,
  forcedOs?: 'windows' | 'mac' | 'linux'
): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isWindows = forcedOs ? forcedOs === 'windows' : ua.includes('Windows');
  const isMac = forcedOs ? forcedOs === 'mac' : /Macintosh|Mac OS X/i.test(ua);

  if (isWindows) {
    return `tzutil /s "${winTzId}"`;
  }
  if (isMac) {
    return `sudo systemsetup -settimezone "${targetIanaTz}"`;
  }
  // Linux / 其他
  return `sudo timedatectl set-timezone "${targetIanaTz}"`;
}
