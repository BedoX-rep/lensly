
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// Color palette
const colors = {
  primary: "#0369a1",
  secondary: "#6366f1",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  chart: [
    "#0369a1",
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
  ],
};

export type ChartData = Record<string, any>[];

interface ChartProps {
  data: ChartData;
  type: "line" | "bar" | "pie" | "area";
  xAxis?: string;
  yAxis?: string[] | string;
  height?: number;
  width?: string;
  className?: string;
  title?: string;
  colors?: string[];
  stacked?: boolean;
  dataKey?: string;
  nameKey?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  hideLegend?: boolean;
  renderLegend?: any;
  renderTooltip?: any;
  customTooltip?: any;
  onClick?: (data: any, index: number) => void;
  timeUnit?: "day" | "week" | "month" | "year";
}

const Chart = ({
  data,
  type,
  xAxis = "name",
  yAxis = "value",
  height = 300,
  width = "100%",
  className = "",
  title,
  colors: customColors,
  stacked = false,
  dataKey,
  nameKey = "name",
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  hideLegend = false,
  renderLegend,
  renderTooltip,
  customTooltip,
  onClick,
  timeUnit = "day",
}: ChartProps) => {
  const chartColors = customColors || colors.chart;
  const yAxisArray = Array.isArray(yAxis) ? yAxis : [yAxis];

  const formatXAxisTick = (value: any) => {
    if (!value) return '';
    
    // Handle different time units for the X-axis
    if (timeUnit === 'day') {
      // For day view, show hours
      return `${value}:00`;
    } else if (timeUnit === 'week') {
      // For week view, show abbreviated day name
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[value] || value;
    } else if (timeUnit === 'month') {
      // For month view, show week number
      return `Week ${value}`;
    } else if (timeUnit === 'year') {
      // For year view, show month name
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[value - 1] || value;
    }
    
    return value;
  };

  return (
    <div className={`chart-container ${className}`}>
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        {type === "line" ? (
          <LineChart
            data={data}
            onClick={onClick ? (data) => onClick(data.activePayload?.[0]?.payload, data.activeTooltipIndex || 0) : undefined}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={xAxis} 
              tickFormatter={formatXAxisTick} 
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis 
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(value) => `${value}`}
            />
            {showTooltip && (customTooltip ? (
              <Tooltip content={customTooltip} />
            ) : (
              <Tooltip />
            ))}
            {!hideLegend && showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                content={renderLegend}
              />
            )}

            {yAxisArray.map((key, index) => (
              <Line
                key={`line-${key}`}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        ) : type === "bar" ? (
          <BarChart
            data={data}
            onClick={onClick ? (data) => onClick(data.activePayload?.[0]?.payload, data.activeTooltipIndex || 0) : undefined}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={xAxis} 
              tickFormatter={formatXAxisTick} 
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis 
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(value) => `${value}`}
            />
            {showTooltip && (customTooltip ? (
              <Tooltip content={customTooltip} />
            ) : (
              <Tooltip />
            ))}
            {!hideLegend && showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                content={renderLegend}
              />
            )}

            {yAxisArray.map((key, index) => (
              <Bar
                key={`bar-${key}`}
                dataKey={key}
                fill={chartColors[index % chartColors.length]}
                stackId={stacked ? "stack" : undefined}
              />
            ))}
          </BarChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey || yAxisArray[0]}
              nameKey={nameKey}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              onClick={onClick ? (_, index) => onClick(data[index], index) : undefined}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            {showTooltip && (customTooltip ? (
              <Tooltip content={customTooltip} />
            ) : (
              <Tooltip />
            ))}
            {!hideLegend && showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                content={renderLegend}
              />
            )}
          </PieChart>
        ) : (
          <AreaChart
            data={data}
            onClick={onClick ? (data) => onClick(data.activePayload?.[0]?.payload, data.activeTooltipIndex || 0) : undefined}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey={xAxis} 
              tickFormatter={formatXAxisTick} 
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis 
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(value) => `${value}`}
            />
            {showTooltip && (customTooltip ? (
              <Tooltip content={customTooltip} />
            ) : (
              <Tooltip />
            ))}
            {!hideLegend && showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                content={renderLegend}
              />
            )}

            {yAxisArray.map((key, index) => (
              <Area
                key={`area-${key}`}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                fill={chartColors[index % chartColors.length]}
                stackId={stacked ? "stack" : undefined}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
