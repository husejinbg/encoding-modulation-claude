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
import type { AnalogSignal } from '../../types/analog.types';

interface AnalogPlotProps {
  data: AnalogSignal;
  title: string;
  height?: number;
  numSamples?: number; // Number of sample points for scrolling
  smooth?: boolean; // If true, use smooth interpolation; if false, use step diagram
  bitDuration?: number; // Duration of each bit in seconds (for bit boundaries)
  numBits?: number; // Number of bits (for bit boundaries)
  yDomain?: [number, number]; // Optional fixed y-axis domain for synchronization
}

export const AnalogPlot: React.FC<AnalogPlotProps> = ({
  data,
  title,
  height = 300,
  numSamples = 0,
  smooth = true,
  bitDuration,
  numBits,
  yDomain
}) => {
  // Calculate domain with padding (or use provided domain)
  let domain: [number, number];
  if (yDomain) {
    domain = yDomain;
  } else {
    const values = data.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 1; // 10% padding or 1 if range is 0
    domain = [min - padding, max + padding];
  }

  // Calculate if scrolling is needed
  const maxVisibleSamples = 8;
  const sampleWidth = 80; // Width per sample in pixels
  const needsScroll = numSamples > maxVisibleSamples;
  const totalChartWidth = numSamples * sampleWidth;

  // Generate bit boundary lines
  const bitBoundaries: number[] = [];
  if (bitDuration && numBits && numBits > 0) {
    for (let i = 1; i < numBits; i++) {
      bitBoundaries.push(i * bitDuration);
    }
  }

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

              {/* Bit boundary lines */}
              {bitBoundaries.map((time) => (
                <ReferenceLine
                  key={`bit-${time}`}
                  x={time}
                  stroke="#9ca3af"
                  strokeDasharray="5 5"
                  opacity={0.5}
                />
              ))}

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
