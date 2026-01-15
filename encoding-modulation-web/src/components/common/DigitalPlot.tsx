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
import type { DigitalSignalPoint, EncodedSignal } from '../../types/signal.types';
import { getSignalDomain, MAX_VISIBLE_BIT_BOUNDARIES } from '../../utils/chartHelpers';

// =============================================================================
// TYPES
// =============================================================================

interface DigitalPlotProps {
  /** Array of chart data points with time and level */
  data: DigitalSignalPoint[];
  /** Title displayed above the chart */
  title: string;
  /** Optional raw signal for calculating Y-axis domain */
  rawSignal?: EncodedSignal;
  /** Chart height in pixels (default: 300) */
  height?: number;
  /** Number of original bits (used for scroll calculation and bit boundaries) */
  numBits?: number;
  /** Whether encoding produces 2x signal length (e.g., Manchester encoding) */
  producesDoubleLength?: boolean;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/** Maximum visible bits before horizontal scrolling is enabled */
const MAX_VISIBLE_BITS = 8;

/** Width per bit in pixels (used for scroll container sizing) */
const BIT_WIDTH_PX = 80;

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Digital signal step chart component for visualizing encoded signals.
 *
 * Features:
 * - Horizontal step chart displaying signal levels (HIGH, LOW, NO_LINE)
 * - Bit boundary reference lines (limited to prevent rendering overflow)
 * - Horizontal scrolling for large datasets
 * - Memoized calculations for performance
 *
 * Performance optimizations:
 * - React.memo prevents re-renders when props haven't changed
 * - useMemo caches expensive calculations (domain, boundaries, scroll config)
 * - Bit boundaries limited to MAX_VISIBLE_BIT_BOUNDARIES to prevent SVG overflow
 */
const DigitalPlotComponent: React.FC<DigitalPlotProps> = ({
  data,
  title,
  rawSignal,
  height = 300,
  numBits = 0,
  producesDoubleLength = false
}) => {
  // Memoize Y-axis domain calculation
  const domain = useMemo(() => {
    return rawSignal ? getSignalDomain(rawSignal) : [-1.5, 1.5];
  }, [rawSignal]);

  // Memoize scroll configuration
  const { needsScroll, totalChartWidth } = useMemo(() => ({
    needsScroll: numBits > MAX_VISIBLE_BITS,
    totalChartWidth: numBits * BIT_WIDTH_PX
  }), [numBits]);

  // Memoize bit boundaries with overflow protection
  // Only render individual ReferenceLine components when bit count is reasonable
  // For large datasets (>50 bits), skip boundaries to prevent SVG element overflow
  const { bitBoundaries, showBitBoundaries } = useMemo(() => {
    const show = numBits > 0 && numBits <= MAX_VISIBLE_BIT_BOUNDARIES + 1;
    const boundaries: number[] = [];

    if (show) {
      // For Manchester-style encoders, boundaries are at 2x positions
      const symbolsPerBit = producesDoubleLength ? 2 : 1;
      for (let i = 1; i < numBits; i++) {
        boundaries.push(i * symbolsPerBit);
      }
    }

    return { bitBoundaries: boundaries, showBitBoundaries: show };
  }, [numBits, producesDoubleLength]);

  // Memoize Y-axis tick formatter to avoid recreation on each render
  const yAxisFormatter = useCallback((value: number) => {
    if (value === 1) return 'HIGH';
    if (value === -1) return 'LOW';
    if (value === 0) return 'NO_LINE';
    return value.toString();
  }, []);

  // Memoize tooltip formatter
  const tooltipFormatter = useCallback((value: number | undefined) => {
    if (value === 1) return ['HIGH', 'Level'];
    if (value === -1) return ['LOW', 'Level'];
    if (value === 0) return ['NO_LINE', 'Level'];
    return [value, 'Level'];
  }, []);

  return (
    <div className="digital-plot">
      <h3>{title}</h3>

      {/* Info message when bit boundaries are hidden for performance */}
      {!showBitBoundaries && numBits > MAX_VISIBLE_BIT_BOUNDARIES + 1 && (
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
                label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                type="number"
                domain={[0, 'dataMax']}
              />

              <YAxis
                domain={domain}
                width={50}
                ticks={[-1, 0, 1]}
                tickFormatter={yAxisFormatter}
              />

              {/* Reference lines for signal levels */}
              <ReferenceLine y={1} stroke="#22c55e" strokeDasharray="3 3" opacity={0.3} />
              <ReferenceLine y={0} stroke="#gray" strokeDasharray="3 3" opacity={0.3} />
              <ReferenceLine y={-1} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} />

              {/* Bit boundary lines - only rendered when count is reasonable */}
              {showBitBoundaries && bitBoundaries.map((x) => (
                <ReferenceLine
                  key={`bit-${x}`}
                  x={x}
                  stroke="#9ca3af"
                  strokeDasharray="5 5"
                  opacity={0.5}
                />
              ))}

              <Tooltip formatter={tooltipFormatter} />

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
      </div>
    </div>
  );
};

/**
 * Memoized DigitalPlot component.
 * Only re-renders when props actually change, preventing unnecessary recalculations.
 */
export const DigitalPlot = memo(DigitalPlotComponent);
