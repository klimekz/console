import { Box, Typography } from '@mui/material';
import type { PortfolioValue } from '../../types/stocks';
import { StockChart } from './StockChart';
import { portfolioToChartData } from '../../hooks/usePriceHistory';

const MONO = '"SF Mono", "Fira Code", monospace';

interface PortfolioChartProps {
  values: PortfolioValue[];
  isLoading?: boolean;
  error?: string | null;
}

export function PortfolioChart({ values, isLoading, error }: PortfolioChartProps) {
  const chartData = portfolioToChartData(values);

  if (isLoading) {
    return (
      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Loading price data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          p: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.65rem',
            color: 'rgba(255,100,100,0.7)',
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  if (values.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Add holdings to see portfolio value
        </Typography>
      </Box>
    );
  }

  return (
    <StockChart
      data={chartData}
      title="Portfolio Value"
      height={250}
      color="rgba(100, 200, 255, 0.9)"
    />
  );
}
