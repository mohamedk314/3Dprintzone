"use client";

export interface ChartPoint { label: string; value: number; }

const W = 700, H = 160;
const PL = 60, PR = 16, PT = 10, PB = 34;
const PW = W - PL - PR;
const PH = H - PT - PB;

function fmt(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}k`;
  return String(Math.round(v));
}

export function LineChart({
  data,
  color     = "#6366f1",
  fillColor = "#6366f120",
}: {
  data:       ChartPoint[];
  color?:     string;
  fillColor?: string;
}) {
  if (!data.length) return <EmptyChart />;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const n      = data.length;

  const px = (i: number) => PL + (n === 1 ? PW / 2 : (i / (n - 1)) * PW);
  const py = (v: number) => PT + PH - (v / maxVal) * PH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(d.value).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${px(n - 1).toFixed(1)} ${(PT + PH).toFixed(1)} L ${px(0).toFixed(1)} ${(PT + PH).toFixed(1)} Z`;

  const yTicks   = [0, 0.25, 0.5, 0.75, 1].map((t) => maxVal * t);
  const xStep    = Math.max(1, Math.ceil(n / 8));

  return (
    <div style={{ aspectRatio: `${W}/${H}`, width: "100%" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        {yTicks.map((v, i) => {
          const y = py(v);
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={PL + PW} y2={y} stroke="#e5e7eb" strokeDasharray={i === 0 ? "none" : "4 3"} />
              <text x={PL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#9ca3af">{fmt(v)}</text>
            </g>
          );
        })}
        <path d={areaPath} fill={fillColor} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {n <= 14 && data.map((d, i) => (
          <circle key={i} cx={px(i)} cy={py(d.value)} r={3.5} fill={color} />
        ))}
        {data.map((d, i) => {
          if (i % xStep !== 0 && i !== n - 1) return null;
          return (
            <text key={i} x={px(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="#9ca3af">
              {d.label}
            </text>
          );
        })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + PH} stroke="#e5e7eb" />
        <line x1={PL} y1={PT + PH} x2={PL + PW} y2={PT + PH} stroke="#e5e7eb" />
      </svg>
    </div>
  );
}

export function BarChart({
  data,
  color = "#6366f1",
}: {
  data:   ChartPoint[];
  color?: string;
}) {
  if (!data.length) return <EmptyChart />;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const n      = data.length;
  const segW   = PW / n;
  const barW   = Math.min(48, segW * 0.55);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => maxVal * t);

  return (
    <div style={{ aspectRatio: `${W}/${H}`, width: "100%" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        {yTicks.map((v, i) => {
          const y = PT + PH - (v / maxVal) * PH;
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={PL + PW} y2={y} stroke="#e5e7eb" strokeDasharray={i === 0 ? "none" : "4 3"} />
              <text x={PL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#9ca3af">{fmt(v)}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * PH;
          const x    = PL + i * segW + (segW - barW) / 2;
          const y    = PT + PH - barH;
          const lbl  = d.label.length > 9 ? d.label.slice(0, 8) + "…" : d.label;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={Math.max(barH, 1)} fill={color} rx={3} />
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={10} fill="#9ca3af">{lbl}</text>
            </g>
          );
        })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + PH} stroke="#e5e7eb" />
        <line x1={PL} y1={PT + PH} x2={PL + PW} y2={PT + PH} stroke="#e5e7eb" />
      </svg>
    </div>
  );
}

export function HorizontalBars({
  data,
  color     = "#6366f1",
  formatVal = (v: number) => String(Math.round(v)),
}: {
  data:       ChartPoint[];
  color?:     string;
  formatVal?: (v: number) => string;
}) {
  if (!data.length) return <EmptyChart />;

  const maxVal   = Math.max(...data.map((d) => d.value), 1);
  const rowH     = 38;
  const padV     = 8;
  const labelW   = 80;
  const barAreaW = 300;
  const valW     = 90;
  const totalW   = labelW + barAreaW + valW + 20;
  const totalH   = data.length * rowH + padV * 2;

  return (
    <div style={{ height: `${Math.max(totalH, 100)}px`, width: "100%" }}>
      <svg viewBox={`0 0 ${totalW} ${totalH}`} width="100%" height="100%">
        {data.map((d, i) => {
          const barW = (d.value / maxVal) * barAreaW;
          const y    = padV + i * rowH;
          const lbl  = d.label.length > 10 ? d.label.slice(0, 9) + "…" : d.label;
          return (
            <g key={i}>
              <text x={labelW - 6} y={y + rowH / 2 + 4} textAnchor="end" fontSize={12} fill="#374151" fontWeight="500">{lbl}</text>
              <rect x={labelW} y={y + 12} width={Math.max(barW, 2)} height={rowH - 24} fill={color} rx={3} />
              <text x={labelW + barAreaW + 8} y={y + rowH / 2 + 4} fontSize={11} fill="#6b7280">{formatVal(d.value)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-20 text-sm text-gray-400">No data for this period</div>
  );
}
