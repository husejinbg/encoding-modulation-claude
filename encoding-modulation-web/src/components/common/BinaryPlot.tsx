import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { BinaryDataPoint } from '../../types/signal.types';

interface BinaryPlotProps {
  data: BinaryDataPoint[];
  title: string;
  height?: number;
}

export const BinaryPlot: React.FC<BinaryPlotProps> = ({
  data,
  title,
  height = 300
}) => {
  return (
    <div className="binary-plot">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="index"
            label={{ value: 'Bit Index', position: 'insideBottom', offset: -5 }}
          />

          <YAxis
            domain={[0, 1]}
            ticks={[0, 1]}
            label={{ value: 'Bit Value', angle: -90, position: 'insideLeft' }}
          />

          <Tooltip
            formatter={(value: number | undefined) => [value === 1 ? '1' : '0', 'Bit']}
          />

          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value === 1 ? '#22c55e' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
