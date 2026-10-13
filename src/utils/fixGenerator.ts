import type { DetectionItem, NetworkProfile, OverallResult } from '../types';
import {
  resolveRecommendedTimezone,
  type TimezoneMapping,
} from './timezoneHelper';

export { type TimezoneMapping };

/**
 * 根据探测到的网络属地与节点时区，智能匹配全球通用的推荐时区 (支持全量 CLDR 映射)
 */
export function getRecommendedTimezone(network: NetworkProfile): TimezoneMapping {
  return resolveRecommendedTimezone(network.timezone, network.countryCode, network.country);
}

/**
 * 生成 Windows PowerShell 一键修复完整脚本
 */
export function generatePowerShellFix(
  overall: OverallResult,
  items: DetectionItem[],
  network: NetworkProfile
): string {
  const tz = getRecommendedTimezone(network);
  const isTzMismatch = network.isTzMismatch;

  const lines = [
    '# ====================================================================',
    '# Claude 从入门到维权 - 本地环境一键修复脚本 (Windows PowerShell)',
    `# 诊断安全分: ${overall.totalScore}/100 | 出口属地: ${network.country || '海外'}`,
    `# 推荐匹配时区: ${tz.label}`,
    '# ====================================================================',
    '',
    'Write-Host ">>> 正在执行 Claude 运行环境一键自测与修复..." -ForegroundColor Cyan',
    '',
    '# 1. 临时设置当前终端环境变量（确保 Claude Code CLI 运行时正常读取）',
    `$env:TZ = "${tz.tzName}"`,
    '$env:LANG = "en_US.UTF-8"',
    '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8',
    'Write-Host "[OK] 终端环境变量已配置 (TZ=' + tz.tzName + ', LANG=en_US.UTF-8)" -ForegroundColor Green',
    '',
  ];

  if (isTzMismatch) {
    lines.push(
      '# 2. 修正 Windows 系统全局时区（与海外代理出口对齐，解决高频风控判定）',
      `try {`,
      `    tzutil /s "${tz.winTzId}"`,
      `    Write-Host "[OK] Windows 系统时区已同步为: ${tz.winTzId}" -ForegroundColor Green`,
      `} catch {`,
      `    Write-Host "[!] 修改系统时区需要管理员权限，若失败请右键以管理员身份运行 PowerShell" -ForegroundColor Yellow`,
      `}`,
      ''
    );
  } else {
    lines.push(
      '# 2. 系统时区检查：当前系统时区与出口节点已基本吻合，跳过强制改时区',
      ''
    );
  }

  const hasWebRtcRisk = items.some(
    (i) => i.category === 'webrtc' && (i.risk === 'HIGH' || i.risk === 'CRITICAL')
  );

  if (hasWebRtcRisk) {
    lines.push(
      '# 2.5 WebRTC 真实 IP 泄露防护提示',
      'Write-Host "[!] 警告: 本地探测到 WebRTC 穿透泄露风险，强烈建议开启代理客户端的 TUN 增强模式或在浏览器安装 WebRTC Control 插件" -ForegroundColor Yellow',
      ''
    );
  }

  lines.push(
    '# 3. 终端代理端口检查（若终端未走代理且未开 TUN 模式，可解除下方注释设置本地端口）',
    '# $env:HTTP_PROXY = "http://127.0.0.1:7890"',
    '# $env:HTTPS_PROXY = "http://127.0.0.1:7890"',
    'if ($env:HTTPS_PROXY) {',
    '    Write-Host "[OK] 当前终端已配置代理: $env:HTTPS_PROXY" -ForegroundColor Green',
    '} else {',
    '    Write-Host "[i] 提示: 建议在代理客户端中开启 TUN 虚拟网卡模式，可确保全系统所有流量自动代理" -ForegroundColor Cyan',
    '}',
    '',
    '# 4. 清理本地 DNS 缓存避免污染解析',
    'Clear-DnsClientCache',
    'Write-Host "[OK] 本地 DNS 缓存已清空" -ForegroundColor Green',
    '',
    '# 5. Git 隐私邮箱快速检查',
    '$gitEmail = git config --get user.email 2>$null',
    'if ($gitEmail -match "@(qq|163|126|foxmail|aliyun|sina)\\.com") {',
    '    Write-Host "[!] 警告: 本地 Git 邮箱绑定了国内服务商 ($gitEmail)，建议执行:" -ForegroundColor Yellow',
    '    Write-Host "    git config --global user.email \\"your_id+username@users.noreply.github.com\\"" -ForegroundColor Yellow',
    '} else {',
    '    Write-Host "[OK] Git 邮箱配置正常" -ForegroundColor Green',
    '}',
    '',
    'Write-Host "====================================================================" -ForegroundColor Cyan',
    'Write-Host "✅ 环境修复完成！现在可以重新检测或启动 Claude / Claude Code。" -ForegroundColor Green',
    'Write-Host "====================================================================" -ForegroundColor Cyan'
  );

  return lines.join('\n');
}

/**
 * 生成 macOS / Linux Bash 一键修复完整脚本
 */
export function generateBashFix(
  overall: OverallResult,
  items: DetectionItem[],
  network: NetworkProfile
): string {
  const tz = getRecommendedTimezone(network);
  const isTzMismatch = network.isTzMismatch;

  const lines = [
    '#!/usr/bin/env bash',
    '# ====================================================================',
    '# Claude 从入门到维权 - 本地环境一键修复脚本 (macOS / Linux)',
    `# 诊断安全分: ${overall.totalScore}/100 | 出口属地: ${network.country || '海外'}`,
    `# 推荐匹配时区: ${tz.label}`,
    '# ====================================================================',
    '',
    'echo -e "\\033[36m>>> 正在执行 Claude 运行环境一键自测与修复...\\033[0m"',
    '',
    '# 1. 临时设置当前终端时区与英文语言偏好',
    `export TZ="${tz.tzName}"`,
    'export LANG="en_US.UTF-8"',
    'echo -e "\\033[32m[OK] 终端环境变量已配置 (TZ=' + tz.tzName + ', LANG=en_US.UTF-8)\\033[0m"',
    '',
    '# 2. 终端代理设置（若未开启 TUN 模式，取消下方注释并修改为本地代理端口）',
    '# export http_proxy="http://127.0.0.1:7890"',
    '# export https_proxy="http://127.0.0.1:7890"',
    '# export all_proxy="socks5://127.0.0.1:7890"',
    '',
  ];

  if (isTzMismatch) {
    lines.push(
      '# 3. macOS 永久修改系统时区（与海外代理出口对齐，可选，需密码）',
      `# sudo systemsetup -settimezone "${tz.tzName}"`,
      ''
    );
  }

  const hasWebRtcRisk = items.some(
    (i) => i.category === 'webrtc' && (i.risk === 'HIGH' || i.risk === 'CRITICAL')
  );

  if (hasWebRtcRisk) {
    lines.push(
      '# 3.5 WebRTC 防泄露提示',
      'echo -e "\\033[33m[!] 警告: 本地探测到 WebRTC 真实 IP 穿透风险，建议开启代理客户端的 TUN 增强模式或在浏览器禁用 WebRTC\\033[0m"',
      ''
    );
  }

  lines.push(
    '# 4. 清理本地 DNS 解析缓存 (macOS)',
    'if command -v dscacheutil &>/dev/null; then',
    '    sudo dscacheutil -flushcache 2>/dev/null || true',
    '    sudo killall -HUP mDNSResponder 2>/dev/null || true',
    '    echo -e "\\033[32m[OK] 本地 DNS 缓存已刷新\\033[0m"',
    'fi',
    '',
    '# 5. Git 隐私邮箱排查',
    'GIT_EMAIL=$(git config --get user.email 2>/dev/null || echo "")',
    'if echo "$GIT_EMAIL" | grep -Ei "@(qq|163|126|foxmail|aliyun|sina)\\.com" >/dev/null; then',
    '    echo -e "\\033[33m[!] 警告: 本地 Git 邮箱包含国内服务商 ($GIT_EMAIL)，建议更新为 GitHub 隐私邮箱:\\033[0m"',
    '    echo -e "    git config --global user.email \\"your_id+username@users.noreply.github.com\\""',
    'else',
    '    echo -e "\\033[32m[OK] Git 邮箱配置正常\\033[0m"',
    'fi',
    '',
    'echo -e "\\033[36m====================================================================\\033[0m"',
    'echo -e "\\033[32m✅ 环境修复完成！现在可以重新运行体检或启动 Claude / Claude Code。\\033[0m"',
    'echo -e "\\033[36m====================================================================\\033[0m"'
  );

  return lines.join('\n');
}

/**
 * 生成单行极简版（方便用户秒贴入终端）
 */
export function generateOneLiner(network: NetworkProfile, os: 'windows' | 'mac'): string {
  const tz = getRecommendedTimezone(network);
  if (os === 'windows') {
    const tzCmd = network.isTzMismatch ? `tzutil /s "${tz.winTzId}"; ` : '';
    return `$env:TZ="${tz.tzName}"; $env:LANG="en_US.UTF-8"; [Console]::OutputEncoding=[System.Text.Encoding]::UTF8; ${tzCmd}Clear-DnsClientCache`;
  }
  return `export TZ="${tz.tzName}"; export LANG="en_US.UTF-8"; sudo dscacheutil -flushcache 2>/dev/null || true`;
}

/**
 * 生成 Markdown 格式的完整诊断结论与修复报告
 */
export function generateMarkdownReport(
  overall: OverallResult,
  items: DetectionItem[],
  network: NetworkProfile
): string {
  const tz = getRecommendedTimezone(network);
  const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });

  const lines = [
    `# 📋 Claude 从入门到维权 • 环境安全体检报告`,
    `> 生成时间: ${nowStr} | 诊断工具: Claude Shield (100% 纯本地沙箱运算)`,
    '',
    `## 📊 核心诊断结论`,
    `- **安全健康分**: **${overall.totalScore} / 100**（${overall.verdict}）`,
    `- **公网出口 IP**: \`${network.status === 'failed' ? '探测受限' : network.ip}\``,
    `- **出口属地与服务商**: ${network.country} ${network.city ? '· ' + network.city : ''} (${network.isp || '未知线路'})`,
    `- **线路属性**: ${network.isDatacenter ? '机房数据中心 IP (权重稍低)' : '家庭/企业原生宽带'}`,
    `- **本地系统时区**: \`${Intl.DateTimeFormat().resolvedOptions().timeZone}\``,
    `- **时区匹配度**: ${network.isTzMismatch ? '⚠️ 严重冲突（海外出口与东八区时区并存）' : '✅ 正常对应'}`,
    `- **推荐对齐时区**: \`${tz.tzName}\` (${tz.winTzId})`,
    '',
    `## 🔍 逐项体检结果`,
  ];

  items.forEach((item, idx) => {
    const riskBadge =
      item.risk === 'SAFE'
        ? '✅ 正常'
        : item.risk === 'LOW'
        ? 'ℹ️ 偏好'
        : item.risk === 'MEDIUM'
        ? '⚠️ 优化'
        : '🚨 风险';
    lines.push(
      `${idx + 1}. **${item.title}** [${riskBadge} - ${item.score}分]`,
      `   - 当前状态: \`${item.value}\``,
      `   - 判定分析: ${item.detail}`,
      `   - 排查建议: ${item.fixGuide}`
    );
  });

  lines.push(
    '',
    `## 🛠️ 一键修复命令 (PowerShell / Bash)`,
    '### Windows PowerShell:',
    '```powershell',
    generateOneLiner(network, 'windows'),
    '```',
    '',
    '### macOS / Linux Bash:',
    '```bash',
    generateOneLiner(network, 'mac'),
    '```',
    '',
    '---',
    '*本报告由「Claude 从入门到维权」纯本地工具生成，绝不上传任何私有指纹。*'
  );

  return lines.join('\n');
}
