import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/helpers';
import type { ReusableLineChartProps } from '@/types';

const getTooltipStyles = (isDark: boolean) => ({
  contentStyle: {
    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
    border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
    borderRadius: '0.5rem',
    color: isDark ? '#F8FAFC' : '#0F172A',
  },
  labelStyle: {
    color: isDark ? '#F8FAFC' : '#0F172A',
  },
  itemStyle: {
    color: isDark ? '#E2E8F0' : '#334155',
  },
});

export const LineChartView = <TData extends object>({
  data,
  xDataKey,
  series,
  className,
  yAxisAllowDecimals = false,
}: ReusableLineChartProps<TData>) => {
  const { effectiveTheme } = useTheme();
  const tooltipStyles = getTooltipStyles(effectiveTheme === 'dark');

  return (
    <div className={cn('h-72 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
          <XAxis dataKey={xDataKey} />
          <YAxis allowDecimals={yAxisAllowDecimals} />
          <Tooltip
            contentStyle={tooltipStyles.contentStyle}
            labelStyle={tooltipStyles.labelStyle}
            itemStyle={tooltipStyles.itemStyle}
          />
          <Legend />
          {series.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth ?? 2}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
