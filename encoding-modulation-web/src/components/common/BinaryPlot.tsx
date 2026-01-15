import React, { memo, useMemo, useCallback } from 'react';
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
import { MAX_INDIVIDUAL_CELLS } from '../../utils/chartHelpers';

// =============================================================================
// TYPES
// =============================================================================

interface BinaryPlotProps {
  /** Array of binary data points with index and value */
  data: BinaryDataPoint[];
  /** Title displayed above the chart */
  title: string;
  /** Chart height in pixels (default: 300) */
  height?: number;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/** Maximum visible bits before horizontal scrolling is enabled */
const MAX_VISIBLE_BITS = 8;

/** Width per bit in pixels (used for scroll container sizing) */
const BIT_WIDTH_PX = 80;

/** Color for binary 1 (green) */
const COLOR_ONE = '#22c55e';

/** Color for binary 0 (red) */
const COLOR_ZERO = '#ef4444';

/** Default color when individual cells are not rendered (purple) */
const COLOR_DEFAULT = '#6366f1';

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Binary data bar chart component for visualizing binary sequences.
 *
 * Features:
 * - Bar chart with green bars for 1s and red bars for 0s
 * - Horizontal scrolling for large datasets
 * - Memoized calculations for performance
 *
 * Performance optimizations:
 * - React.memo prevents re-renders when props haven't changed
 * - useMemo caches scroll configuration and cell colors
 * - Individual Cell components only rendered for small datasets (<= 100 bits)
 * - Large datasets use uniform color to prevent DOM element overflow
 */
const BinaryPlotComponent: React.FC<BinaryPlotProps> = ({
  data,
  title,
  height = 300
}) => {
  const numBits = data.length;

  // Memoize scroll configuration
  const { needsScroll, totalChartWidth } = useMemo(() => ({
    needsScroll: numBits > MAX_VISIBLE_BITS,
    totalChartWidth: numBits * BIT_WIDTH_PX
  }), [numBits]);

  // Determine if we should render individual colored cells
  // For large datasets, skip individual cells to prevent DOM overflow
  const showIndividualCells = numBits <= MAX_INDIVIDUAL_CELLS;

  // Memoize cell colors array (only computed when cells will be shown)
  const cellColors = useMemo(() => {
    if (!showIndividualCells) return null;

    // Pre-allocate array for better performance
    const colors = new Array<string>(numBits);
    for (let i = 0; i < numBits; i++) {
      colors[i] = data[i].value === 1 ? COLOR_ONE : COLOR_ZERO;
    }
    return colors;
  }, [data, numBits, showIndividualCells]);

  // Memoize tooltip formatter
  const tooltipFormatter = useCallback(
    (value: number | undefined) => [value === 1 ? '1' : '0', 'Bit'],
    []
  );

  return (
    <div className="binary-plot">
      <h3>{title}</h3>

      {/* Info message when individual cell colors are not shown */}
      {!showIndividualCells && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
          Showing {numBits} bits (colors simplified for performance)
        </div>
      )}

      <div style={{
        width: '100%',
        overflowX: needsScroll ? 'auto' : 'visible'
      }}>
        <div style={{ width: needsScroll ? `${totalChartWidth}px` : '100%' }}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="index"
                label={{ value: 'Bit Index', position: 'insideBottom', offset: -5 }}
              />

              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                width={50}
              />

              <Tooltip formatter={tooltipFormatter} />

              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                fill={showIndividualCells ? undefined : COLOR_DEFAULT}
              >
                {/* Only render individual Cell components for small datasets */}
                {showIndividualCells && cellColors && cellColors.map((color, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/**
 * Memoized BinaryPlot component.
 * Only re-renders when props actually change, preventing unnecessary recalculations.
 */
export const BinaryPlot = memo(BinaryPlotComponent);
