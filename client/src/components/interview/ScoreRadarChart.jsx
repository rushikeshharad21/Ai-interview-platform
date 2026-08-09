import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const ACCENT_COLOR = "#4F46E5";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-control)] px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <p className="text-xs font-medium text-[var(--color-text-primary)]">{point.subject}</p>
      <p className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>
        {point.value.toFixed(1)} / 10
      </p>
    </div>
  );
};

const AverageBars = ({ dataPoints }) => {
  return (
    <div className="space-y-3 py-2">
      {dataPoints.map((point) => (
        <div key={point.subject} className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-secondary)] w-16 shrink-0">
            {point.subject}
          </span>
          <div className="flex-1 h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(point.value / 10) * 100}%`, backgroundColor: ACCENT_COLOR }}
            ></div>
          </div>
          <span className="text-xs font-medium text-[var(--color-text-primary)] w-8 text-right">
            {point.value.toFixed(1)}
          </span>
        </div>
      ))}
      <p className="text-xs text-[var(--color-text-secondary)] italic pt-1">
        Voice metrics unavailable for this candidate's device
      </p>
    </div>
  );
};

const ScoreRadarChart = ({ contentAvg, emotionAvg, voiceAvg }) => {
  const dataPoints = [
    { subject: "Content", value: contentAvg, fullMark: 10 },
    { subject: "Emotion", value: emotionAvg, fullMark: 10 },
    { subject: "Voice", value: voiceAvg, fullMark: 10 },
  ].filter((point) => point.value !== null && point.value !== undefined);

  if (dataPoints.length < 3) {
    return <AverageBars dataPoints={dataPoints} />;
  }

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={dataPoints} outerRadius="68%">
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#6B7280", fontSize: 12, fontFamily: "Inter" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke={ACCENT_COLOR}
            fill={ACCENT_COLOR}
            fillOpacity={0.12}
            strokeWidth={2}
            dot={{ r: 3.5, fill: ACCENT_COLOR, stroke: "#FFFFFF", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: ACCENT_COLOR, stroke: "#FFFFFF", strokeWidth: 2 }}
            animationDuration={500}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreRadarChart;