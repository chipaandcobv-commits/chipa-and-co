"use client";

interface ChartData {
  [date: string]: {
    total: number;
    quantity: number;
    sales: number;
  };
}

interface SimpleChartProps {
  data: ChartData;
}

export default function SimpleChart({ data }: SimpleChartProps) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No hay datos para mostrar
      </div>
    );
  }

  const maxValue = Math.max(...entries.map(([, value]) => value.total));
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + padding * 2}`}
        className="w-full h-64"
      >
        {/* Background grid */}
        <defs>
          <pattern
            id="grid"
            width="50"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 40"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Chart lines and points */}
        <g>
          {entries.map(([date, value], index) => {
            const x =
              (index / (entries.length - 1 || 1)) * (chartWidth - padding * 2) +
              padding;
            const y =
              chartHeight +
              padding -
              (value.total / (maxValue || 1)) * chartHeight;

            return (
              <g key={date}>
                {/* Line to next point */}
                {index < entries.length - 1 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={
                      ((index + 1) / (entries.length - 1)) *
                        (chartWidth - padding * 2) +
                      padding
                    }
                    y2={
                      chartHeight +
                      padding -
                      (entries[index + 1][1].total / (maxValue || 1)) *
                        chartHeight
                    }
                    stroke="#f97316"
                    strokeWidth="2"
                  />
                )}

                {/* Point */}
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#f97316"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>
                    {new Date(date).toLocaleDateString("es-ES")}: $
                    {value.total.toFixed(2)}
                  </title>
                </circle>

                {/* Date label */}
                <text
                  x={x}
                  y={chartHeight + padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                  transform={`rotate(-45 ${x} ${chartHeight + padding + 20})`}
                >
                  {new Date(date).toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
              </g>
            );
          })}
        </g>

        {/* Y-axis labels */}
        <g>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight + padding - ratio * chartHeight;
            const value = ratio * (maxValue || 0);

            return (
              <g key={ratio}>
                <line
                  x1={padding - 5}
                  y1={y}
                  x2={padding}
                  y2={y}
                  stroke="#6b7280"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                >
                  ${value.toFixed(0)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            Ventas diarias ($)
          </div>
        </div>
      </div>
    </div>
  );
}
