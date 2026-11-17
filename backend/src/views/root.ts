import { ENV } from "../constants/index.js";

export const renderStatusPage = (): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#131313" />
  <meta name="description" content="Dadsmith API service status and system information." />

  <title>Dadsmith API | System Status</title>

  <style>
    :root {
      color-scheme: dark;
      --bg: #131313;
      --surface: #1d1d1d;
      --surface-2: #272727;
      --border: #2a2b2a;
      --text: rgba(255, 255, 255, 0.9);
      --muted: rgba(255, 255, 255, 0.44);
      --green: #00b648;
    }

    * { box-sizing: border-box; }

    html, body {
      height: 100%;
      overflow: hidden;
    }

    body {
      margin: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-rows: 1fr auto;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .side {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: clamp(24px, 5vw, 80px);
      min-width: 0;
      overflow: hidden;
    }

    .left { gap: 20px; }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      color: var(--muted);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    @keyframes blink {
      50% { opacity: 0.3; }
    }

    h1 {
      margin: 0;
      font-size: clamp(30px, 5.2vw, 60px);
      font-weight: 700;
      letter-spacing: -1.5px;
      line-height: 1.08;
    }

    .description {
      max-width: 460px;
      margin: 0;
      color: var(--muted);
      font-size: clamp(14px, 1.4vw, 16px);
      line-height: 1.7;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 4px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 650;
      text-decoration: none;
      border: 1px solid var(--border);
    }

    .btn-primary {
      color: #131313;
      background: var(--text);
      border: none;
    }

    .btn-ghost {
      color: var(--text);
      background: var(--surface);
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      max-width: 460px;
      margin-top: 4px;
    }

    .detail {
      min-width: 0;
      padding: 12px 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
    }

    .detail-label {
      margin-bottom: 8px;
      color: var(--muted);
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .detail-value {
      overflow-wrap: anywhere;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12.5px;
      font-weight: 650;
    }

    .detail-value.ok { color: var(--green); }

    .right {
      background: var(--surface);
      border-left: 1px solid var(--border);
      align-items: center;
    }

    .panel {
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
    }

    .illustration {
      width: 100%;
      height: auto;
      overflow: visible;
    }

    .illustration .frame {
      fill: var(--surface-2);
      stroke: var(--border);
      stroke-width: 1.5;
    }

    .illustration .chrome-dot { fill: var(--muted); }

    .illustration .bar {
      fill: var(--muted);
      transform-box: fill-box;
      transform-origin: center bottom;
      animation: bar-grow 3.2s ease-in-out infinite;
    }

    .illustration .chart-line {
      fill: none;
      stroke: var(--text);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 10 8;
      animation: dash-flow 1.8s linear infinite;
    }

    .illustration .marker {
      fill: var(--surface-2);
      stroke: var(--text);
      stroke-width: 2;
      transform-box: fill-box;
      transform-origin: center;
      animation: marker-pulse 2.4s ease-in-out infinite;
    }

    .illustration .badge-bg {
      fill: var(--surface-2);
      stroke: var(--border);
      stroke-width: 1.5;
    }

    .illustration .badge-text {
      fill: var(--green);
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
    }

    .illustration .badge {
      transform-box: fill-box;
      transform-origin: center;
      animation: badge-float 3.6s ease-in-out infinite;
    }

    .illustration .icon-fill { fill: var(--text); }

    .illustration .icon-label {
      fill: #131313;
      font-size: 20px;
      font-weight: 800;
      font-family: inherit;
    }

    @keyframes bar-grow {
      0%, 100% { transform: scaleY(0.82); }
      50% { transform: scaleY(1); }
    }

    @keyframes dash-flow {
      to { stroke-dashoffset: -36; }
    }

    @keyframes marker-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.35); }
    }

    @keyframes badge-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    footer {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px clamp(24px, 5vw, 80px);
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 11.5px;
    }

    footer strong { color: var(--text); }

    @media (max-width: 860px) {
      html, body { height: auto; overflow: auto; }
      body { grid-template-columns: 1fr; }
      .right { border-left: none; border-top: 1px solid var(--border); padding-top: 32px; }
      footer { flex-direction: column; align-items: flex-start; gap: 6px; }
    }

    @media (max-width: 480px) {
      .detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .btn { flex: 1 1 auto; justify-content: center; }
      .panel { max-width: 320px; }
    }
  </style>
</head>

<body>
  <section class="side left">
    <div class="eyebrow">Dadsmith Developer Platform</div>

    <h1>Your backend<br />is online.</h1>

    <p class="description">
      One platform for your advertising operations. Connect Google and Meta, streamline campaign management, and stay in control of your ad performance.
    </p>

    <div class="actions">
      <a class="btn btn-primary" href="/api/docs">View API →</a>
      <a class="btn btn-ghost" href="#status">Operational</a>
    </div>

    <div class="detail-grid" id="status">
      <div class="detail">
        <div class="detail-label">Status</div>
        <div class="detail-value ok">Healthy</div>
      </div>
      <div class="detail">
        <div class="detail-label">Environment</div>
        <div class="detail-value">${ENV.NODE_ENV}</div>
      </div>
      <div class="detail">
        <div class="detail-label">Version</div>
        <div class="detail-value">v1.0.0</div>
      </div>
    </div>
  </section>

  <section class="side right">
    <div class="panel">
      <svg class="illustration" viewBox="0 0 420 420" role="img" aria-label="Animated campaign dashboard illustration">
        <rect class="frame" x="55" y="95" width="300" height="210" rx="20" />
        <circle class="chrome-dot" cx="77" cy="117" r="4" />
        <circle class="chrome-dot" cx="93" cy="117" r="4" />
        <circle class="chrome-dot" cx="109" cy="117" r="4" />

        <rect class="bar" x="85" y="247" width="24" height="38" rx="4" style="animation-delay:0s" />
        <rect class="bar" x="125" y="223" width="24" height="62" rx="4" style="animation-delay:.1s" />
        <rect class="bar" x="165" y="237" width="24" height="48" rx="4" style="animation-delay:.2s" />
        <rect class="bar" x="205" y="205" width="24" height="80" rx="4" style="animation-delay:.3s" />
        <rect class="bar" x="245" y="227" width="24" height="58" rx="4" style="animation-delay:.4s" />
        <rect class="bar" x="285" y="193" width="24" height="92" rx="4" style="animation-delay:.5s" />

        <path class="chart-line" d="M97,232 L137,208 L177,222 L217,190 L257,212 L297,178" />
        <circle class="marker" cx="97" cy="232" r="4" style="animation-delay:0s" />
        <circle class="marker" cx="137" cy="208" r="4" style="animation-delay:.15s" />
        <circle class="marker" cx="177" cy="222" r="4" style="animation-delay:.3s" />
        <circle class="marker" cx="217" cy="190" r="4" style="animation-delay:.45s" />
        <circle class="marker" cx="257" cy="212" r="4" style="animation-delay:.6s" />
        <circle class="marker" cx="297" cy="178" r="4" style="animation-delay:.75s" />

        <g class="badge" style="animation-delay:0s">
          <rect class="badge-bg" x="296" y="58" width="112" height="42" rx="14" />
          <text class="badge-text" x="352" y="84" text-anchor="middle">CTR +24%</text>
        </g>
        <g class="badge" style="animation-delay:.6s">
          <rect class="badge-bg" x="8" y="300" width="118" height="42" rx="14" />
          <text class="badge-text" x="67" y="326" text-anchor="middle">ROAS 4.2x</text>
        </g>

        <circle class="icon-fill" cx="55" cy="95" r="24" />
        <text class="icon-label" x="55" y="102" text-anchor="middle">↑</text>
      </svg>
    </div>
  </section>

  <footer>
    <span>Powered by <strong>Dadsmith</strong></span>
    <span>Backend service · v1.0.0</span>
  </footer>
</body>
</html>`;
