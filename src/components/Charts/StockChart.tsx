import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts';
import { Box, Typography } from '@mui/material';
import type { ChartData } from '../../types/stocks';

const MONO = '"SF Mono", "Fira Code", monospace';

interface StockChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
  color?: string;
}

export function StockChart({
  data,
  title,
  height = 200,
  color = 'rgba(255, 255, 255, 0.8)',
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.5)',
        fontFamily: MONO,
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        vertLine: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: false,
      handleScroll: false,
    });

    // Add line series using the new API
    const lineSeries = chart.addSeries(LineSeries, {
      color,
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    chartRef.current = chart;
    seriesRef.current = lineSeries as ISeriesApi<'Line'>;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [color]);

  // Update data
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const chartData: LineData<Time>[] = data.map(d => ({
        time: d.time as Time,
        value: d.value,
      }));
      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  // Calculate change
  const firstValue = data.length > 0 ? data[0].value : 0;
  const lastValue = data.length > 0 ? data[data.length - 1].value : 0;
  const change = lastValue - firstValue;
  const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <Box
      sx={{
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        p: 2,
      }}
    >
      {title && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#fff',
            }}
          >
            {title}
          </Typography>
          {data.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: '#fff',
                }}
              >
                ${lastValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.65rem',
                  color: isPositive ? 'rgba(100, 255, 100, 0.8)' : 'rgba(255, 100, 100, 0.8)',
                }}
              >
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </Typography>
            </Box>
          )}
        </Box>
      )}
      <Box
        ref={chartContainerRef}
        sx={{
          width: '100%',
          height,
        }}
      />
      {data.length === 0 && (
        <Box
          sx={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            No data available
          </Typography>
        </Box>
      )}
    </Box>
  );
}
