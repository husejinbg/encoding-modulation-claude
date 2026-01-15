import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { AnalogSignal } from '../../types/analog.types';

interface AnalogPlotProps {
  data: AnalogSignal;
  title: string;
  height?: number;
  numSamples?: number; // Number of sample points for scrolling
  smooth?: boolean; // If true, use smooth interpolation; if false, use step diagram
}

export const AnalogPlot: React.FC<AnalogPlotProps> = ({
  data,
  title,
  height = 300,
  numSamples = 0,
  smooth = true
}) => {
  // Calculate domain with padding
  const values = data.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 1; // 10% padding or 1 if range is 0
  const domain: [number, number] = [min - padding, max + padding];

  // Calculate if scrolling is needed
  const maxVisibleSamples = 8;
  const sampleWidth = 80; // Width per sample in pixels
  const needsScroll = numSamples > maxVisibleSamples;
  const totalChartWidth = numSamples * sampleWidth;

  return (
    <div className="analog-plot">
      <h3>{title}</h3>
      <div style={{
        width: '100%',
        overflowX: needsScroll ? 'auto' : 'visible'
      }}>
        <div style={{ width: needsScroll ? `${totalChartWidth}px` : '100%' }}>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="time"
                label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                type="number"
                domain={[0, 'dataMax']}
              />

              <YAxis
                domain={domain}
                width={50}
                label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
              />

              <Tooltip
                formatter={(value: number | undefined) =>
                  value !== undefined ? value.toFixed(3) : 'N/A'
                }
              />

              <Line
                type={smooth ? "monotone" : "stepAfter"}
                dataKey="value"
                stroke="#8b5cf6"  // Purple color to differentiate from digital signals
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
