import type { DetectionItem, NetworkProfile, OverallResult, RiskLevel } from '../types';
import {
  resolveRecommendedTimezone,
  isTimezoneMatched,
  getOsQuickFixCommand
} from './timezoneHelper';

// ==========================================
// 1. 系统时区检测
// ==========================================
export function detectTimezone(): DetectionItem {
  let tz = 'Unknown';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    tz = '无法读取时区';
  }

  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;
  const offsetStr = `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;

  const isChinaTz = /Asia\/(Shanghai|Chongqing|Urumqi|Harbin|Kashgar)|PRC/i.test(tz);
  const isHongKongTaipei = /Asia\/(Hong_Kong|Taipei|Macau)/i.test(tz);
  const isUtc8 = offsetHours === 8;

  let risk: RiskLevel = 'SAFE';
  let score = 100;
  let detail = `当前系统时区: ${tz} (${offsetStr})`;

  if (isChinaTz) {
    risk = 'CRITICAL';
    score = 0;
    detail = `系统时区为中国大陆时区 (${tz})。Claude 客户端与网页端会直接读取此时区。`;
  } else if (isHongKongTaipei) {
    risk = 'HIGH';
    score = 30;
    detail = `系统时区为港澳台区域 (${tz})，目前 Anthropic 官方服务尚未对该地区完全开放。`;
  } else if (isUtc8) {
    risk = 'MEDIUM';
    score = 60;
    detail = `时区偏移量为东八区 (${tz}, ${offsetStr})，容易被平台作为关联辅助判定。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = `系统时区正常: ${tz} (${offsetStr})，属于支持访问的海外时区。`;
  }

  return {
    id: 'timezone',
    title: '系统本地时区 (System Timezone)',
    category: 'timezone',
    weight: 15,
    score,
    risk,
    value: `${tz} (${offsetStr})`,
    detail,
    impactReason: 'Claude 网页端以及 Claude Code 命令行客户端在运行时，会直接读取操作系统的本地时区设置作为地理位置标识。若出口 IP 是海外但系统时区为东八区，会立即形成冲突。',
    fixGuide: risk === 'SAFE'
      ? '系统时区正常，保持当前配置即可。'
      : '建议在电脑系统设置中将时区更改为与代理节点一致的海外时区（如美西 America/Los_Angeles、美东 America/New_York 或日本 Asia/Tokyo）。',
    quickFixCmd: undefined, // 避免在尚未探测到代理节点时盲目推荐时区命令
  };
}

// ==========================================
// 2. 浏览器语言偏好检测
// ==========================================
export function detectLanguages(): DetectionItem {
  const languages = navigator.languages ? Array.from(navigator.languages) : [navigator.language || ''];
  const primary = languages[0] || '';

  const isPrimaryZh = /^zh/i.test(primary);
  const hasZhInList = languages.some((l) => /^zh/i.test(l));

  let risk: RiskLevel = 'SAFE';
  let score = 100;
  let detail = `语言偏好序列: [${languages.join(', ')}]`;

  if (isPrimaryZh) {
    risk = 'HIGH';
    score = 20;
    detail = `首选语言为中文 (${primary})，请求时会向服务器声明中文首选偏好。`;
  } else if (hasZhInList) {
    risk = 'LOW';
    score = 75;
    detail = `首选语言非中文 (${primary})，备用语言列表中包含中文，配置相对合理。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = `首选与备用语言均为外语偏好: [${languages.join(', ')}]。`;
  }

  return {
    id: 'languages',
    title: '浏览器首选语言 (Languages)',
    category: 'language',
    weight: 15,
    score,
    risk,
    value: languages.slice(0, 3).join(', ') + (languages.length > 3 ? '...' : ''),
    detail,
    impactReason: '浏览器在访问网页时，会通过请求头 Accept-Language 和前端接口上报用户的首选语言序列，首选语言为中文容易增加安全系统的二次校验概率。',
    fixGuide: '打开浏览器“设置” -> “语言”，将 English (United States) 移动到第一位作为首选语言。',
  };
}

// ==========================================
// 3. 中文字体与国产厂商字体检测 (Canvas 探针)
// ==========================================
export function detectFonts(): DetectionItem {
  const baseFonts = ['monospace', 'sans-serif'];
  const testString = 'ClaudeAntiBanTest风控字体探测!@#$%^&*()_1234567890';
  const testSize = '72px';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return {
      id: 'fonts',
      title: '中文字体指纹 (Font Fingerprint)',
      category: 'font',
      weight: 15,
      score: 80,
      risk: 'LOW',
      value: '无法获取 Canvas 上下文',
      detail: '浏览器禁用了 Canvas API 测量。',
      impactReason: 'Claude 前端风控可通过测绘字体高宽反推操作系统内已安装的字体。',
      fixGuide: '开启反指纹浏览器的字体防护功能。',
    };
  }

  // 测量回退基准字体宽度
  const baselineWidths: Record<string, number> = {};
  for (const base of baseFonts) {
    ctx.font = `${testSize} ${base}`;
    baselineWidths[base] = ctx.measureText(testString).width;
  }

  const isFontInstalled = (fontName: string): boolean => {
    return baseFonts.some((base) => {
      ctx.font = `${testSize} "${fontName}", ${base}`;
      const width = ctx.measureText(testString).width;
      return width !== baselineWidths[base];
    });
  };

  // 常见中文桌面与移动字体
  const chineseFonts = [
    { name: 'Microsoft YaHei', label: '微软雅黑 (Windows常见)' },
    { name: 'SimSun', label: '中易宋体' },
    { name: 'SimHei', label: '中易黑体' },
    { name: 'PingFang SC', label: '苹方 (Mac/iOS常见)' },
    { name: 'Hiragino Sans GB', label: '冬青黑体 (Mac常见)' },
    { name: 'MiSans', label: '小米澎湃/MIUI字体' },
    { name: 'HarmonyOS Sans', label: '华为鸿蒙字体' },
    { name: 'OPPOSans', label: 'OPPO字体' },
    { name: 'vivo Sans', label: 'vivo字体' },
    { name: 'Honor Sans', label: '荣耀字体' },
  ];

  const detected: string[] = [];
  const oemDetected: string[] = [];

  for (const font of chineseFonts) {
    if (isFontInstalled(font.name)) {
      if (/MiSans|HarmonyOS|OPPO|vivo|Honor/i.test(font.name)) {
        oemDetected.push(font.label);
      } else {
        detected.push(font.label);
      }
    }
  }

  let risk: RiskLevel = 'SAFE';
  let score = 100;
  let detail = '';

  if (oemDetected.length > 0) {
    risk = 'HIGH';
    score = 25;
    detail = `检测到手机系统定制字体: [${oemDetected.join(', ')}]，表明处于特定移动设备系统环境。`;
  } else if (detected.length >= 2) {
    risk = 'MEDIUM';
    score = 55;
    detail = `检测到本地系统预装中文字体: [${detected.join(', ')}]。`;
  } else if (detected.length === 1) {
    risk = 'LOW';
    score = 80;
    detail = `检测到 1 种常见中文字体: [${detected[0]}]。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = '未检测到明显的特定中文字体指纹，字体环境纯净。';
  }

  return {
    id: 'fonts',
    title: '系统与设备字体特征 (Installed Fonts)',
    category: 'font',
    weight: 15,
    score,
    risk,
    value: [...oemDetected, ...detected].slice(0, 3).join(', ') || '未检测到特殊中文字体',
    detail,
    impactReason: '网页可通过 Canvas 文本测绘推算系统预装的字体列表。若含有较多定制中文字体，可能被作为推断用户真实设备区域的辅助参考。',
    fixGuide: '常规使用通常无需专门卸载字体；若需深度防关联或管理多账号，建议使用指纹浏览器隔离字体枚举，或在英文环境虚拟机中运行。',
  };
}

// ==========================================
// 4. WebRTC 穿透与真实 IP 泄露检测
// ==========================================
export async function detectWebRTC(): Promise<DetectionItem> {
  return new Promise((resolve) => {
    let resolved = false;
    const detectedIps: string[] = [];

    const handleDone = () => {
      if (resolved) return;
      resolved = true;

      const hasDomesticPublicIp = detectedIps.some((ip) => {
        // 排除常见私网网段 10.x, 192.168.x, 172.16-31.x, 127.x
        return !/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.)/.test(ip);
      });

      let risk: RiskLevel = 'SAFE';
      let score = 100;
      let detail = '';

      if (hasDomesticPublicIp) {
        risk = 'CRITICAL';
        score = 10;
        detail = `WebRTC 检测到公网真实 IP: ${detectedIps.join(', ')}。真实网络地址已被旁路穿透。`;
      } else if (detectedIps.length > 0) {
        risk = 'LOW';
        score = 85;
        detail = `WebRTC 仅获取到局域网私有地址 (${detectedIps.join(', ')})，未泄露真实外网 IP。`;
      } else {
        risk = 'SAFE';
        score = 100;
        detail = 'WebRTC 通道未泄露任何真实公网 IP，数据通道安全。';
      }

      resolve({
        id: 'webrtc',
        title: 'WebRTC 真实 IP 防泄露',
        category: 'webrtc',
        weight: 15,
        score,
        risk,
        value: detectedIps.length > 0 ? detectedIps.join(', ') : '无泄露 (Safe)',
        detail,
        impactReason: '部分浏览器代理插件仅代理 HTTP 网页请求，而 WebRTC 协议通过 STUN 穿透可能直接绕过代理，向外界暴露本地网络的真实宽带 IP。',
        fixGuide: '建议在代理客户端中开启 TUN/虚拟网卡增强模式进行全局接管，或在浏览器中安装 WebRTC 禁用插件避免旁路穿透。',
      });
    };

    // 2.5秒超时保护
    setTimeout(handleDone, 2500);

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }, { urls: 'stun:stun.l.google.com:19302' }],
      });

      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => handleDone());

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          handleDone();
          return;
        }
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const match = ipRegex.exec(event.candidate.candidate);
        if (match && match[1]) {
          const ip = match[1];
          if (!detectedIps.includes(ip)) {
            detectedIps.push(ip);
          }
        }
      };
    } catch (e) {
      handleDone();
    }
  });
}

// ==========================================
// 5. 国产浏览器与壳浏览器特征检测
// ==========================================
export function detectBrowser(): DetectionItem {
  const ua = navigator.userAgent;

  const domesticBrowsers = [
    { key: 'MicroMessenger', name: '微信内置浏览器' },
    { key: 'QQBrowser', name: 'QQ 浏览器' },
    { key: 'Baidu', name: '百度浏览器 / 百度 App' },
    { key: 'UCBrowser', name: 'UC 浏览器' },
    { key: 'Quark', name: '夸克浏览器' },
    { key: '360SE', name: '360 安全浏览器' },
    { key: '360EE', name: '360 极速浏览器' },
    { key: 'MetaSr', name: '搜狗浏览器' },
    { key: 'LieBao', name: '猎豹浏览器' },
    { key: '2345Explorer', name: '2345 浏览器' },
  ];

  const matched = domesticBrowsers.filter((b) => ua.includes(b.key));

  let risk: RiskLevel = 'SAFE';
  let score = 100;
  let detail = '';

  if (matched.length > 0) {
    risk = 'CRITICAL';
    score = 10;
    detail = `检测到国产定制外壳浏览器: ${matched.map((m) => m.name).join(', ')}。此类浏览器含有较多本土环境特征及修改过的 User-Agent。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = '未检测到定制外壳浏览器特征（当前为原生 Chrome / Edge / Firefox / Safari 等主流环境）。';
  }

  return {
    id: 'browser',
    title: '浏览器指纹纯净度 (Browser Engine)',
    category: 'browser',
    weight: 10,
    score,
    risk,
    value: matched.length > 0 ? matched[0].name : '国际通用原版浏览器',
    detail,
    impactReason: '部分国产定制浏览器会在 User-Agent 中注入特有标识，或携带国内服务注入脚本，极易被平台识别为非目标区域访问。',
    fixGuide: '建议使用官方版 Google Chrome、Microsoft Edge 或 Mozilla Firefox 进行日常访问，避免在微信或双核浏览器内登录。',
  };
}

// ==========================================
// 6. Intl 本地化区域与数值习惯
// ==========================================
export function detectIntlAndEmoji(): DetectionItem {
  let numberLocale = '';
  let dateLocale = '';

  try {
    numberLocale = new Intl.NumberFormat().resolvedOptions().locale;
    dateLocale = new Intl.DateTimeFormat().resolvedOptions().locale;
  } catch (e) {
    // fallback
  }

  const isZhLocale = /^zh/i.test(numberLocale) || /^zh/i.test(dateLocale);

  let risk: RiskLevel = 'SAFE';
  let score = 100;
  let detail = `系统本地化 Locale 设置: ${numberLocale || '未知'}`;

  if (isZhLocale) {
    risk = 'HIGH';
    score = 25;
    detail = `系统底层的 Intl.locale 格式化区域为中文 (${numberLocale})。即使修改了网页语言，系统底层区域习惯仍显现中文环境。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = `Intl 格式化区域非中文 (${numberLocale})，与海外环境保持一致。`;
  }

  return {
    id: 'intl',
    title: '系统区域格式 (Regional Locale)',
    category: 'intl',
    weight: 10,
    score,
    risk,
    value: `${numberLocale || 'en-US'}`,
    detail,
    impactReason: '前端 Intl API 常用于格式化日期和货币，它能绕过普通网页语言设置，直接反映操作系统设置面板里的区域选项。',
    fixGuide: '在 Windows 或 macOS 系统“区域设置”中，可将“区域格式 (Regional Format)”从“中国 (中文)”调整为“United States (English)”。',
  };
}

// ==========================================
// 7. 出口 IP 画像与时区交叉校验 (带容灾备用源)
// ==========================================
export async function detectIpAndCrossCheck(browserTimezone: string): Promise<{
  ipCrossItem: DetectionItem;
  ipLineItem: DetectionItem;
  profile: NetworkProfile;
}> {
  let profile: NetworkProfile = {
    ip: '未能获取',
    country: '探测中...',
    countryCode: '',
    city: '',
    timezone: '',
    isp: '',
    isDatacenter: false,
    isTzMismatch: false,
    status: 'loading',
  };

  // 多源容灾探测：按优先级尝试快速接口
  const fetchWithTimeout = async (url: string, timeoutMs: number = 3000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return await res.json();
    } catch {
      clearTimeout(timer);
    }
    return null;
  };

  // 源 1: ipwho.is (稳定、支持跨域、信息全)
  let rawData = await fetchWithTimeout('https://ipwho.is/');

  // 源 2: ipapi.co (高权威)
  if (!rawData || !rawData.ip) {
    rawData = await fetchWithTimeout('https://ipapi.co/json/');
    if (rawData) {
      rawData = {
        ip: rawData.ip,
        country: rawData.country_name,
        country_code: rawData.country_code,
        city: rawData.city,
        timezone: rawData.timezone,
        connection: { isp: rawData.org },
      };
    }
  }

  // 源 3: ipwhois.app
  if (!rawData || !rawData.ip) {
    const backupData = await fetchWithTimeout('https://ipwhois.app/json/');
    if (backupData && backupData.ip) {
      rawData = {
        ip: backupData.ip,
        country: backupData.country,
        country_code: backupData.country_code,
        city: backupData.city,
        timezone: backupData.timezone,
        connection: { isp: backupData.isp || backupData.org },
      };
    }
  }

  if (rawData && rawData.ip) {
    const ispName =
      (rawData.connection && rawData.connection.isp) ||
      rawData.isp ||
      rawData.org ||
      '';
    const isDc = /Cloud|Host|Server|Datacenter|Data Center|Oracle|DigitalOcean|Amazon|Google|Alibaba|Tencent|Microsoft|Linode|Vultr|OVH|DMIT/i.test(
      ispName
    );

    profile = {
      ip: rawData.ip,
      country: rawData.country || '海外节点',
      countryCode: (rawData.country_code || '').toUpperCase(),
      city: rawData.city || '',
      timezone: rawData.timezone ? (rawData.timezone.id || rawData.timezone) : '',
      isp: ispName || '国际宽带线路',
      isDatacenter: isDc,
      isTzMismatch: false,
      status: 'success',
    };
  } else {
    profile = {
      ip: '未获取到有效 IP',
      country: '网络探测受限',
      countryCode: '',
      city: '',
      timezone: '',
      isp: '未知网络',
      isDatacenter: false,
      isTzMismatch: false,
      status: 'failed',
    };
  }

  if (profile.status === 'failed') {
    return {
      ipCrossItem: {
        id: 'ip-cross',
        title: '出口属地与系统时区一致性',
        category: 'ip',
        weight: 20,
        score: 65,
        risk: 'LOW',
        value: '公共接口探测受限',
        detail: '未能通过公开接口获取公网 IP 信息。可能是代理未开启全局分流，或当前网络拦截了探测请求。',
        impactReason: 'Claude 服务位于境外，访问时需确保网络能够正常连通海外支持区域。',
        fixGuide: '请检查代理客户端（如 Clash、Sing-box、Surge）是否已正常启动，并建议开启 TUN 虚拟网卡模式或全局代理后重新检测。',
        quickFixCmd: undefined,
      },
      ipLineItem: {
        id: 'ip-line',
        title: 'IP 线路属性与纯净度',
        category: 'ip',
        weight: 15,
        score: 65,
        risk: 'LOW',
        value: '无法获取线路属性',
        detail: '公网接口探测受限，暂无法判定当前网络是否属于机房或原生宽带。',
        impactReason: '机房段 IP 比家庭原生宽带更容易被安全风控系统标记。',
        fixGuide: '建议在开启全局代理后重新检测环境。',
        quickFixCmd: undefined,
      },
      profile,
    };
  }

  // 交叉校验：只有成功拿到合法国家码时才进行比对
  const hasValidCountry = Boolean(profile.countryCode && profile.countryCode !== 'XX');
  const isDomesticIp = ['CN', 'HK', 'MO'].includes(profile.countryCode);
  const isOverseasIp = hasValidCountry && !isDomesticIp;

  // 推荐的目标时区 (支持全量 CLDR 映射)
  const recTz = resolveRecommendedTimezone(profile.timezone, profile.countryCode, profile.country);

  // 判断是否对齐：
  let isMatched = false;
  if (profile.timezone) {
    isMatched = isTimezoneMatched(browserTimezone, profile.timezone);
  } else if (isOverseasIp) {
    isMatched = isTimezoneMatched(browserTimezone, recTz.tzName);
  }

  // 核心风控点：出口已在海外支持区，但浏览器本地时区存在跨区差异
  profile.isTzMismatch = Boolean(isOverseasIp && !isMatched);

  // 1. 属地与时区一致性项 (ipCrossItem)
  let crossRisk: RiskLevel = 'SAFE';
  let crossScore = 100;
  let crossValue = `${browserTimezone} (时区与节点对齐)`;
  let crossDetail = `本地系统时区 (${browserTimezone}) 与出口节点物理时区 (${profile.timezone || profile.country}) 完全一致，无跨区时差特征。`;
  let crossImpact = '平台安全算法会比对客户端上报的本地时区与请求出口 IP 属地。如果两者一致，能极大提高环境可信度并规避跨区风控。';
  let crossFix = '保持当前匹配的节点与时区设置即可，无需做任何调整。';
  let crossCmd: string | undefined = undefined;

  if (isDomesticIp) {
    crossRisk = 'CRITICAL';
    crossScore = 0;
    crossValue = `${profile.country} (${profile.ip})`;
    crossDetail = `出口 IP 位于中国大陆/港澳地区 (${profile.country})。Claude 暂不支持该地区直连，访问将直接提示 403 限制。`;
    crossImpact = 'Claude 官方仅对特定海外受支持国家开放直连服务。';
    crossFix = '请开启代理工具并切换至海外受支持节点（如美国、日本、新加坡、英国等）。';
  } else if (profile.isTzMismatch) {
    crossRisk = 'HIGH';
    crossScore = 25;
    crossValue = `本地: ${browserTimezone} ≠ 节点: ${profile.timezone || profile.country}`;
    crossDetail = `出口节点位于海外 (${profile.country}${profile.city ? ' · ' + profile.city : ''}，时区: ${profile.timezone || '未知'})，但系统本地时区为 (${browserTimezone})。时区跨区易被平台安全策略识别。`;
    crossImpact = '当访问请求从海外节点发出，但操作系统或浏览器上报的时间仍为其他区域（如中国东八区）时，平台安全算法很容易识别出“跨区代理访问”特征。';
    crossFix = `建议将电脑本地时区调整为与节点属地一致的时区（推荐切换为 ${recTz.label}），保持二者逻辑一致。`;
    crossCmd = getOsQuickFixCommand(recTz.tzName, recTz.winTzId);
  }

  const ipCrossItem: DetectionItem = {
    id: 'ip-cross',
    title: '出口属地与系统时区一致性',
    category: 'ip',
    weight: 20,
    score: crossScore,
    risk: crossRisk,
    value: crossValue,
    detail: crossDetail,
    impactReason: crossImpact,
    fixGuide: crossFix,
    quickFixCmd: crossCmd,
  };

  // 2. 独立线路属性项 (ipLineItem)
  let lineRisk: RiskLevel = 'SAFE';
  let lineScore = 100;
  let lineValue = `原生家庭/商业宽带 (${profile.isp})`;
  let lineDetail = `出口 IP 属于原生宽带线路 (${profile.isp})，纯净度与信誉度较高。`;
  let lineImpact = '原生宽带在平台安全信誉评级中拥有最高权重，不易被识别为批量机器人或滥用代理。';
  let lineFix = '优质原生宽带，纯净度良好，请继续保持。';

  if (profile.isDatacenter) {
    lineRisk = 'MEDIUM';
    lineScore = 55;
    lineValue = `数据中心机房段 (${profile.isp})`;
    lineDetail = `出口 IP 属于机房托管线路 (${profile.isp})。此类线路容易被多人共用，安全防护权重略低于家庭原生宽带。`;
    lineImpact = 'Anthropic 与 Cloudflare 等平台的风控系统会将大型机房段 (ASN) 标记为代理池或服务器机房，机房 IP 相比原生家庭宽带更容易触发验证码、人机验证或封号。';
    lineFix = '机房线路无法通过修改本地配置解决。如遇高频验证码或限制，建议更换为支持住宅 IP (Residential IP) 或原生家庭宽带的节点。';
  }

  const ipLineItem: DetectionItem = {
    id: 'ip-line',
    title: 'IP 线路属性与纯净度',
    category: 'ip',
    weight: 15,
    score: lineScore,
    risk: lineRisk,
    value: lineValue,
    detail: lineDetail,
    impactReason: lineImpact,
    fixGuide: lineFix,
    quickFixCmd: undefined,
  };

  return {
    ipCrossItem,
    ipLineItem,
    profile,
  };
}

// ==========================================
// 8. 综合评分计算
// ==========================================
export function calculateOverall(items: DetectionItem[]): OverallResult {
  let totalWeightedScore = 0;
  let totalWeight = 0;
  const criticals: string[] = [];

  for (const item of items) {
    totalWeightedScore += item.score * item.weight;
    totalWeight += item.weight;
    if (item.risk === 'CRITICAL' || item.risk === 'HIGH') {
      criticals.push(`${item.title}: ${item.detail}`);
    }
  }

  const finalScore = Math.round(totalWeightedScore / (totalWeight || 1));

  let riskLevel: RiskLevel = 'SAFE';
  let verdict = '';
  let description = '';

  if (finalScore < 45 || criticals.length >= 2) {
    riskLevel = 'CRITICAL';
    verdict = '高风险（存在封号隐患）';
    description = '检测到当前网络环境与本地系统存在明显冲突（如海外节点与中国时区共存），该特征极易触发平台安全风控。建议优先参考下方方案完成优化。';
  } else if (finalScore < 70) {
    riskLevel = 'MEDIUM';
    verdict = '中风险（建议排查优化）';
    description = '基础网络连接正常，但本地环境（如语言偏好、系统字体或机房 IP）仍保留部分特征，轻度使用通常无碍，深度使用建议进一步配置。';
  } else if (finalScore < 90) {
    riskLevel = 'LOW';
    verdict = '良好（配置基本合规）';
    description = '核心网络与系统参数已良好匹配，未发现明显的区域冲突，可安心进行日常工作与开发。';
  } else {
    riskLevel = 'SAFE';
    verdict = '极佳（原生海外环境）';
    description = '环境特征高度符合海外原生用户标准，各项指标均处于安全区间，适于深度使用 Claude 及 Claude Code。';
  }

  return {
    totalScore: finalScore,
    riskLevel,
    verdict,
    description,
    criticalIssues: criticals,
  };
}
