import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/helpers';
import type { ReusableBarChartProps } from '@/types';

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

export const BarChartView = <TData extends object>({
  data,
  xDataKey,
  barDataKey,
  barName,
  barColor = '#3B82F6',
  className,
  yAxisAllowDecimals = false,
  showXAxisLabels = false,
  tooltipLabelKey,
}: ReusableBarChartProps<TData>) => {
  const { effectiveTheme } = useTheme();
  const tooltipStyles = getTooltipStyles(effectiveTheme === 'dark');

  return (
    <div className={cn('h-72 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
          <XAxis dataKey={xDataKey} hide={!showXAxisLabels} />
          <YAxis allowDecimals={yAxisAllowDecimals} />
          <Tooltip
            contentStyle={tooltipStyles.contentStyle}
            labelStyle={tooltipStyles.labelStyle}
            itemStyle={tooltipStyles.itemStyle}
            labelFormatter={(label: string, payload) => {
              if (!tooltipLabelKey) {
                return label;
              }

              const currentItem = payload?.[0]?.payload as Record<string, unknown> | undefined;
              const preferredLabel = currentItem?.[tooltipLabelKey];

              return typeof preferredLabel === 'string' ? preferredLabel : label;
            }}
          />
          <Bar dataKey={barDataKey} name={barName} fill={barColor} radius={[6, 6, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
