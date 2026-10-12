import type { DetectionItem, NetworkProfile, OverallResult, RiskLevel } from '../types';

// ==========================================
// 1. 系统时区检测
// ==========================================
export function detectTimezone(): DetectionItem {
  let tz = 'Unknown';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    tz = 'Error reading timezone';
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
    detail = `命中中国大陆受限时区: ${tz} (${offsetStr})。Claude Code 与网页端对此有极高权重判定！`;
  } else if (isHongKongTaipei) {
    risk = 'HIGH';
    score = 30;
    detail = `当前时区属于非支持地区(港澳台): ${tz}。Anthropic 官方未开放港澳台直连支持。`;
  } else if (isUtc8) {
    risk = 'MEDIUM';
    score = 60;
    detail = `时区名虽非中国大陆，但时区偏移量为 UTC+8 (${tz})，存在时区反向推断疑点。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = `时区合规: ${tz} (${offsetStr})，非东八区受限区域。`;
  }

  return {
    id: 'timezone',
    title: '系统时区 (System Timezone)',
    category: 'timezone',
    weight: 25,
    score,
    risk,
    value: `${tz} (${offsetStr})`,
    detail,
    impactReason: 'Claude Code 逆向报告证实：客户端会读取本地系统时区，并在调用端点时作为元数据隐写进上下文中；网页端也会直接读取该 API 进行属地判定。',
    fixGuide: '将电脑系统时区更改为美国时区（如 America/New_York 或 America/Los_Angeles），且需同步开启自动时钟同步防止证书过期。',
    quickFixCmd: navigator.userAgent.includes('Windows')
      ? 'tzutil /s "Eastern Standard Time"'
      : 'sudo systemsetup -settimezone "America/New_York"',
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
    score = 15;
    detail = `首选语言为中文 (${primary})，直接暴露中文环境偏好。`;
  } else if (hasZhInList) {
    risk = 'LOW';
    score = 75;
    detail = `首选语言非中文 (${primary})，但备用语言包含 [${languages.filter((l) => /^zh/i.test(l)).join(', ')}]。相对安全。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = `纯外语环境偏好: [${languages.join(', ')}]，无中文痕迹。`;
  }

  return {
    id: 'languages',
    title: '浏览器语言链 (Languages)',
    category: 'language',
    weight: 15,
    score,
    risk,
    value: languages.slice(0, 3).join(', ') + (languages.length > 3 ? '...' : ''),
    detail,
    impactReason: '网页端发起请求时，请求头 Accept-Language 和 navigator.languages 会暴露客户端真实的系统/浏览器主语言。',
    fixGuide: '在 Chrome / Edge 设置 -> 语言 中，将 English (United States) 置顶，并将中文（简体）下移或移除。',
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
    risk = 'CRITICAL';
    score = 10;
    detail = `检测到国产手机厂商深度系统字体: [${oemDetected.join(', ')}]，高危暴露国产 Android 环境！`;
  } else if (detected.length >= 2) {
    risk = 'MEDIUM';
    score = 50;
    detail = `检测到本地已安装中文字体: [${detected.join(', ')}]。海外原生系统极少默认预装这些字体。`;
  } else if (detected.length === 1) {
    risk = 'LOW';
    score = 75;
    detail = `检测到 1 种常见中文字体: [${detected[0]}]。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = '未检测到明显的中文字体或国产定制字体指纹。';
  }

  return {
    id: 'fonts',
    title: '系统与厂商字体 (Installed Fonts)',
    category: 'font',
    weight: 15,
    score,
    risk,
    value: [...oemDetected, ...detected].slice(0, 3).join(', ') || '未发现中文字体',
    detail,
    impactReason: '网页可通过测算 Canvas 文本尺寸比对本地已安装字体，如果含有大量中文或国产厂商特有字体，即使改了英文语言也能被识别为中国用户。',
    fixGuide: '桌面端开发建议使用指纹浏览器（如开启字体保护）或在纯英文虚拟机/轻量级 Linux 容器中运行 Claude Code。',
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
        score = 0;
        detail = `WebRTC 严重泄露公网 IP: ${detectedIps.join(', ')}！即使开启了代理也被直接旁路穿透。`;
      } else if (detectedIps.length > 0) {
        risk = 'LOW';
        score = 80;
        detail = `WebRTC 收集到局域网内网地址 (${detectedIps.join(', ')})，未泄露公网直连 IP。`;
      } else {
        risk = 'SAFE';
        score = 100;
        detail = 'WebRTC 已被阻断或未泄露任何候选 IP，表现完美。';
      }

      resolve({
        id: 'webrtc',
        title: 'WebRTC IP 泄露防护',
        category: 'webrtc',
        weight: 15,
        score,
        risk,
        value: detectedIps.length > 0 ? detectedIps.join(', ') : '无泄露 (Safe)',
        detail,
        impactReason: 'WebRTC 的 STUN 穿透机制会绕过常规的浏览器代理扩展（如 SwitchyOmega），直接向真实网卡探测真实公网 IP。',
        fixGuide: '推荐在 Chrome 中安装 "WebRTC Control" 扩展，或开启 Clash / Surge 的 TUN 增强模式全局托管流量。',
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
    { key: 'MicroMessenger', name: '微信内置浏览器 (WeChat)' },
    { key: 'QQBrowser', name: 'QQ浏览器' },
    { key: 'Baidu', name: '百度浏览器 / 百度App' },
    { key: 'UCBrowser', name: 'UC浏览器' },
    { key: 'Quark', name: '夸克浏览器' },
    { key: '360SE', name: '360安全浏览器' },
    { key: '360EE', name: '360极速浏览器' },
    { key: 'MetaSr', name: '搜狗浏览器' },
    { key: 'LieBao', name: '猎豹浏览器' },
    { key: '2345Explorer', name: '2345王牌浏览器' },
  ];

  const matched = domesticBrowsers.filter((b) => ua.includes(b.key));

  let risk: RiskLevel = 'SAFE';
  let score = 100;
  let detail = '';

  if (matched.length > 0) {
    risk = 'CRITICAL';
    score = 0;
    detail = `检测到国产外壳浏览器/内置容器: ${matched.map((m) => m.name).join(', ')}。此类浏览器内置大量本土统计脚本及修改过的 UA。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = '未检测出国产外壳浏览器指纹（当前为原生 Chrome / Edge / Firefox / Safari 等）。';
  }

  return {
    id: 'browser',
    title: '浏览器指纹纯净度 (Browser Engine)',
    category: 'browser',
    weight: 10,
    score,
    risk,
    value: matched.length > 0 ? matched[0].name : '原生国际版浏览器',
    detail,
    impactReason: '国产浏览器在 UA 中普遍内置私有标记，且可能包含特定的全局变量注入（如 window.external），Claude 风控可 100% 确定用户设备环境在中国。',
    fixGuide: '绝对不要使用国产双核浏览器或微信内打开 Claude。请使用官方下载的 Google Chrome 原版或 Firefox。',
  };
}

// ==========================================
// 6. Intl 本地化区域与 Emoji 渲染特征
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
  let detail = `本地化 Locale 设置: 格式化区域为 ${numberLocale || '未知'}`;

  if (isZhLocale) {
    risk = 'HIGH';
    score = 20;
    detail = `系统底层 Intl.locale 依然为中文 (${numberLocale})。即使你改了浏览器显示语言，底层数字/货币习惯仍暴露了中文系统环境。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = `Intl.locale 区域非中文 (${numberLocale})，与外语环境保持高度一致。`;
  }

  return {
    id: 'intl',
    title: 'Intl 区域本地化设置 (Locale Format)',
    category: 'intl',
    weight: 10,
    score,
    risk,
    value: `${numberLocale || 'en-US'}`,
    detail,
    impactReason: '现代前端常用 Intl API 格式化日期与货币，它能绕过简单的语言设置，直接反映操作系统设置面板里的区域选项。',
    fixGuide: '在 Windows/macOS 系统设置中，将“区域格式 (Regional Format)”从“中国 (中文)”调整为“United States (English)”。',
  };
}

// ==========================================
// 7. 出口 IP 画像与时区交叉校验 (致命破绽)
// ==========================================
export async function detectIpAndCrossCheck(browserTimezone: string): Promise<{
  ipItem: DetectionItem;
  profile: NetworkProfile;
}> {
  let profile: NetworkProfile = {
    ip: 'Unknown',
    country: 'Unknown',
    countryCode: 'XX',
    city: '',
    timezone: '',
    isp: '',
    isDatacenter: false,
    isTzMismatch: false,
    status: 'loading',
  };

  try {
    // 使用快速公共免费 ip whois 接口获取当前出口信息
    const res = await fetch('https://ipwhois.app/json/', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      profile = {
        ip: data.ip || 'Unknown',
        country: data.country || 'Unknown',
        countryCode: data.country_code || '',
        city: data.city || '',
        timezone: data.timezone || '',
        isp: data.org || data.isp || '',
        isDatacenter: /Cloud|Host|Server|Datacenter|Data Center|Oracle|DigitalOcean|Amazon|Google|Alibaba|Tencent/i.test(
          data.org || data.isp || ''
        ),
        isTzMismatch: false,
        status: 'success',
      };
    }
  } catch (e) {
    // 网络请求失败或超时
    profile.status = 'failed';
  }

  // 交叉校验：IP 时区 vs 浏览器时区
  const isChinaBrowserTz = /Asia\/(Shanghai|Chongqing|Urumqi|Harbin)/i.test(browserTimezone);
  const isOverseasIp = Boolean(profile.countryCode && !['CN', 'HK', 'MO'].includes(profile.countryCode.toUpperCase()));

  // 破绽分析：如果出口是海外（如美国），但浏览器时区是上海
  profile.isTzMismatch = Boolean(isChinaBrowserTz && isOverseasIp);

  let risk: RiskLevel = 'SAFE';
  let score = 100;
  let detail = '';

  if (profile.status === 'failed') {
    return {
      ipItem: {
        id: 'ip-cross',
        title: '出口 IP 与时区交叉校验 (Cross Check)',
        category: 'ip',
        weight: 20,
        score: 70,
        risk: 'LOW',
        value: '公共 IP API 连接受限',
        detail: '无法探测出口 IP 详细 ASN（可能受拦截），建议使用全局代理模式。',
        impactReason: 'Claude 在边缘网关上会把出口 IP 所在地理位置与客户端上报时区进行对比。',
        fixGuide: '确保节点出口 IP 所在时区与电脑系统时区严格保持一致。',
      },
      profile,
    };
  }

  if (['CN', 'HK'].includes(profile.countryCode.toUpperCase())) {
    risk = 'CRITICAL';
    score = 0;
    detail = `致命：当前出口 IP 位于中国大陆/香港 (${profile.country})，Claude 官方直接阻断访问！`;
  } else if (profile.isTzMismatch) {
    risk = 'CRITICAL';
    score = 10;
    detail = `致命破绽：出口 IP 位于海外 (${profile.country} - ${profile.city})，但浏览器系统时区显示为 (${browserTimezone})！这是风控系统最直接判定“机房代理/异地伪装”的核心依据。`;
  } else if (profile.isDatacenter) {
    risk = 'HIGH';
    score = 45;
    detail = `出口 IP 为机房托管段 (Datacenter ASN: ${profile.isp})，非家庭原生住宅宽带，易被 Claude 列入批量灰名单。`;
  } else {
    risk = 'SAFE';
    score = 100;
    detail = `出口 IP 位于允许地区 (${profile.country})，且与浏览器时区基本匹配，未触发明显风控碰撞。`;
  }

  return {
    ipItem: {
      id: 'ip-cross',
      title: '出口 IP 与时区交叉校验 (Cross Check)',
      category: 'ip',
      weight: 20,
      score,
      risk,
      value: `${profile.country} (${profile.ip})`,
      detail,
      impactReason: '【致命破绽第 1 名】当你的出口 IP 是美国洛杉矶，但你的浏览器或终端时区是 Asia/Shanghai，任何风控算法都能一眼识破为代理违规访问。',
      fixGuide: `若出口 IP 位于 ${profile.timezone || '海外'}，请务必把本地操作系统时区也设置为 ${profile.timezone || '对应时区'}。`,
    },
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

  if (finalScore < 40 || criticals.length >= 2) {
    riskLevel = 'CRITICAL';
    verdict = '高危被封体质 (Extreme Risk)';
    description = '你的当前环境存在多处致命破绽（如时区未改、IP 与时区冲突或国产字体泄露），使用 Claude / Claude Code 极大概率在短期内被封号或降智！请立刻按下方方案修复。';
  } else if (finalScore < 70) {
    riskLevel = 'MEDIUM';
    verdict = '中度疑点环境 (Suspicious)';
    description = '你的基本代理有效，但残留了中文字体、语言偏好或本地化参数等痕迹。普通网页访问可能侥幸存活，但重度使用 Claude Code 很容易被触发风控。';
  } else if (finalScore < 90) {
    riskLevel = 'LOW';
    verdict = '相对安全 (Good Standing)';
    description = '绝大部分核心参数已伪装合规，仅有极个别微弱特征。保持良好的使用频率和干净的支付方式即可长期稳定。';
  } else {
    riskLevel = 'SAFE';
    verdict = '绝密原生纯净度 (Native Level)';
    description = '恭喜！你的环境特征与海外原生开发者无异，无任何明显中国区域破绽，可放心使用 Claude Code 及各类尊享订阅。';
  }

  return {
    totalScore: finalScore,
    riskLevel,
    verdict,
    description,
    criticalIssues: criticals,
  };
}
