import type { DetectionItem, OverallResult, NetworkProfile } from '../types';

export function generateReportPoster(
  overall: OverallResult,
  items: DetectionItem[],
  network: NetworkProfile
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 750;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // 1. 渐变背景
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0b0f19');
    grad.addColorStop(0.5, '#111827');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 装饰网格与暗纹
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 2. 头部品牌
    ctx.fillStyle = '#d97706'; // Claude 特色赭石黄/琥珀金
    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.fillText('CLAUDE SHIELD • 封号风险体检中心', 50, 75);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText('面向国内开发者的纯本地环境指纹检测单', 50, 105);

    // 3. 核心大分值卡片
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(50, 135, 650, 230, 16);
    ctx.fill();
    ctx.stroke();

    // 分数圆环/文字
    const isSafe = overall.totalScore >= 75;
    const isWarning = overall.totalScore >= 45 && overall.totalScore < 75;
    const themeColor = isSafe ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444';

    ctx.fillStyle = themeColor;
    ctx.font = 'bold 88px -apple-system, sans-serif';
    ctx.fillText(`${overall.totalScore}`, 90, 255);

    ctx.fillStyle = '#64748b';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('/ 100 分', 230, 250);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px -apple-system, sans-serif';
    ctx.fillText(overall.verdict, 90, 310);

    // 盖章效果（高危红码 / 相对安全）
    ctx.save();
    ctx.translate(550, 240);
    ctx.rotate((-15 * Math.PI) / 180);
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(-80, -35, 160, 70);
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isSafe ? '安全通行' : isWarning ? '中度疑似' : '高危封禁', 0, 8);
    ctx.restore();

    // 4. 网络与出口信息
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.beginPath();
    ctx.roundRect(50, 390, 650, 110, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText('出口 IP 画像与网络归属地', 75, 425);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${network.country} (${network.ip})`, 75, 460);

    ctx.fillStyle = network.isTzMismatch ? '#ef4444' : '#10b981';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText(
      network.isTzMismatch ? '⚠️ 发现致命时区不匹配破绽' : '✓ 出口与时区对应正常',
      420,
      460
    );

    // 5. 检测明细列表
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.fillText('关键检测信号诊断', 50, 535);

    let startY = 560;
    items.slice(0, 6).forEach((item) => {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.beginPath();
      ctx.roundRect(50, startY, 650, 70, 8);
      ctx.fill();

      // 小状态点
      const itemColor =
        item.risk === 'SAFE'
          ? '#10b981'
          : item.risk === 'LOW'
          ? '#38bdf8'
          : item.risk === 'MEDIUM'
          ? '#f59e0b'
          : '#ef4444';

      ctx.fillStyle = itemColor;
      ctx.beginPath();
      ctx.arc(75, startY + 35, 6, 0, Math.PI * 2);
      ctx.fill();

      // 标题
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px -apple-system, sans-serif';
      ctx.fillText(item.title, 95, startY + 30);

      // 当前值
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText(item.value.slice(0, 40), 95, startY + 52);

      // 得分
      ctx.fillStyle = itemColor;
      ctx.font = 'bold 18px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${item.score}分`, 670, startY + 42);
      ctx.textAlign = 'left';

      startY += 82;
    });

    // 6. 底部二维码与版权标语
    const footerY = 1080;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(50, footerY, 650, 1);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px -apple-system, sans-serif';
    ctx.fillText('本检测完全在本地浏览器沙箱运行，零数据上传。', 50, footerY + 35);
    ctx.fillText(`检测时间: ${new Date().toLocaleString()} | ID: ${Math.random().toString(36).substring(2, 8).toUpperCase()}`, 50, footerY + 60);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 14px -apple-system, sans-serif';
    ctx.fillText('扫码或访问 Claude 封号体检中心自测 →', 380, footerY + 50);

    // 7. 异步绘制达里奥 Q 版夸张立绘并完成导出
    const darioKey =
      overall.totalScore >= 90 && overall.riskLevel === 'SAFE'
        ? 'safe'
        : overall.totalScore >= 70
        ? 'good'
        : overall.totalScore >= 40 && overall.riskLevel !== 'CRITICAL'
        ? 'warning'
        : 'danger';

    const darioImg = new Image();
    darioImg.crossOrigin = 'anonymous';
    darioImg.src = `/dario/dario-${darioKey}.png`;

    const finalize = () => {
      try {
        if (darioImg.complete && darioImg.naturalWidth > 0) {
          ctx.drawImage(darioImg, 485, 145, 195, 195);
        }
      } catch (e) {
        // 图片绘制失败时正常导出
      }
      resolve(canvas.toDataURL('image/png'));
    };

    if (darioImg.complete) {
      finalize();
    } else {
      darioImg.onload = finalize;
      darioImg.onerror = finalize;
    }
  });
}
