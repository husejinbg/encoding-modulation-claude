import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import type { DigitalSignalPoint, EncodedSignal } from '../../types/signal.types';
import { getSignalDomain } from '../../utils/chartHelpers';

interface DigitalPlotProps {
  data: DigitalSignalPoint[];
  title: string;
  rawSignal?: EncodedSignal;
  height?: number;
}

export const DigitalPlot: React.FC<DigitalPlotProps> = ({
  data,
  title,
  rawSignal,
  height = 300
}) => {
  const domain = rawSignal ? getSignalDomain(rawSignal) : [-1.5, 1.5];

  return (
    <div className="digital-plot">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
            type="number"
            domain={[0, 'dataMax']}
          />

          <YAxis
            domain={domain}
            label={{ value: 'Signal Level', angle: -90, position: 'insideLeft' }}
            ticks={[-1, 0, 1]}
            tickFormatter={(value) => {
              if (value === 1) return 'HIGH';
              if (value === -1) return 'LOW';
              if (value === 0) return 'NO_LINE';
              return value.toString();
            }}
          />

          <ReferenceLine y={1} stroke="#22c55e" strokeDasharray="3 3" opacity={0.3} />
          <ReferenceLine y={0} stroke="#gray" strokeDasharray="3 3" opacity={0.3} />
          <ReferenceLine y={-1} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} />

          <Tooltip
            formatter={(value: number | undefined) => {
              if (value === 1) return ['HIGH', 'Level'];
              if (value === -1) return ['LOW', 'Level'];
              if (value === 0) return ['NO_LINE', 'Level'];
              return [value, 'Level'];
            }}
          />

          <Line
            type="monotone"
            dataKey="level"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
