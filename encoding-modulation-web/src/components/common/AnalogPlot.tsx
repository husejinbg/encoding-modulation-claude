import React, { memo, useMemo, useCallback } from 'react';
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
import { getAnalogDomain, MAX_VISIBLE_BIT_BOUNDARIES } from '../../utils/chartHelpers';

// =============================================================================
// TYPES
// =============================================================================

interface AnalogPlotProps {
  /** Array of time-value points to plot */
  data: AnalogSignal;
  /** Title displayed above the chart */
  title: string;
  /** Chart height in pixels (default: 300) */
  height?: number;
  /** Number of sample points for scroll calculation */
  numSamples?: number;
  /** If true, use smooth interpolation; if false, use step diagram */
  smooth?: boolean;
  /** Duration of each bit in seconds (for bit boundaries) */
  bitDuration?: number;
  /** Number of bits (for bit boundaries) */
  numBits?: number;
  /** Optional fixed y-axis domain for synchronization between charts */
  yDomain?: [number, number];
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/** Maximum visible samples before horizontal scrolling is enabled */
const MAX_VISIBLE_SAMPLES = 8;

/** Width per sample in pixels (used for scroll container sizing) */
const SAMPLE_WIDTH_PX = 80;

/** Signal line color (purple) */
const SIGNAL_COLOR = '#8b5cf6';

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Analog signal line chart component for visualizing continuous waveforms.
 *
 * Features:
 * - Smooth curve or step diagram rendering modes
 * - Horizontal scrolling for large datasets
 * - Optional bit boundary lines
 * - Synchronized Y-axis domain with other charts
 *
 * Performance optimizations:
 * - React.memo prevents re-renders when props haven't changed
 * - useMemo caches expensive calculations (domain, boundaries, scroll config)
 * - Bit boundaries limited to prevent SVG overflow
 * - Domain calculation uses optimized single-pass algorithm
 */
const AnalogPlotComponent: React.FC<AnalogPlotProps> = ({
  data,
  title,
  height = 300,
  numSamples = 0,
  smooth = true,
  bitDuration,
  numBits,
  yDomain
}) => {
  // Memoize Y-axis domain calculation
  // Uses provided domain or calculates from data with optimized algorithm
  const domain = useMemo((): [number, number] => {
    if (yDomain) return yDomain;
    return getAnalogDomain(data);
  }, [data, yDomain]);

  // Memoize scroll configuration
  const { needsScroll, totalChartWidth } = useMemo(() => ({
    needsScroll: numSamples > MAX_VISIBLE_SAMPLES,
    totalChartWidth: numSamples * SAMPLE_WIDTH_PX
  }), [numSamples]);

  // Memoize bit boundaries with overflow protection
  const { bitBoundaries, showBitBoundaries } = useMemo(() => {
    const show = bitDuration && numBits && numBits > 0 && numBits <= MAX_VISIBLE_BIT_BOUNDARIES + 1;
    const boundaries: number[] = [];

    if (show && bitDuration && numBits) {
      for (let i = 1; i < numBits; i++) {
        boundaries.push(i * bitDuration);
      }
    }

    return { bitBoundaries: boundaries, showBitBoundaries: !!show };
  }, [bitDuration, numBits]);

  // Memoize Y-axis tick formatter
  const yAxisFormatter = useCallback(
    (value: number) => value.toFixed(1),
    []
  );

  // Memoize tooltip formatter
  const tooltipFormatter = useCallback(
    (value: number | undefined) => value !== undefined ? value.toFixed(3) : 'N/A',
    []
  );

  return (
    <div className="analog-plot">
      <h3>{title}</h3>

      {/* Info message when bit boundaries are hidden for performance */}
      {bitDuration && numBits && numBits > MAX_VISIBLE_BIT_BOUNDARIES + 1 && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
          Bit boundaries hidden ({numBits} bits exceeds display limit)
        </div>
      )}

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
                tickFormatter={yAxisFormatter}
              />

              {/* Bit boundary lines - only rendered when count is reasonable */}
              {showBitBoundaries && bitBoundaries.map((time) => (
                <ReferenceLine
                  key={`bit-${time}`}
                  x={time}
                  stroke="#9ca3af"
                  strokeDasharray="5 5"
                  opacity={0.5}
                />
              ))}

              <Tooltip formatter={tooltipFormatter} />

              <Line
                type={smooth ? "monotone" : "stepAfter"}
                dataKey="value"
                stroke={SIGNAL_COLOR}
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

/**
 * Memoized AnalogPlot component.
 * Only re-renders when props actually change, preventing unnecessary recalculations.
 */
export const AnalogPlot = memo(AnalogPlotComponent);
