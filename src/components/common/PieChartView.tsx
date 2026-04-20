import React from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/helpers';
import type { ReusablePieChartProps } from '@/types';

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

export const PieChartView: React.FC<ReusablePieChartProps> = ({
  data,
  colors,
  className,
  innerRadius,
  outerRadius = 96,
  showLabel = true,
}) => {
  const { effectiveTheme } = useTheme();
  const tooltipStyles = getTooltipStyles(effectiveTheme === 'dark');

  return (
    <div className={cn('h-72 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip
            contentStyle={tooltipStyles.contentStyle}
            labelStyle={tooltipStyles.labelStyle}
            itemStyle={tooltipStyles.itemStyle}
          />
          <Legend />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            label={showLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
