import { Box, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { AddHolding, SectorView, PortfolioInsights } from '../components/Portfolio';
import { PortfolioChart } from '../components/Charts';

const MONO = '"SF Mono", "Fira Code", monospace';

export function PortfolioPage() {
  const {
    holdings,
    holdingsBySector,
    summary,
    isLoaded,
    addHolding,
    removeHolding,
    clearPortfolio,
  } = usePortfolio();

  const {
    portfolioValues,
    isLoading: isPriceLoading,
    error: priceError,
    refresh: refreshPrices,
  } = usePriceHistory(holdings);

  if (!isLoaded) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#0a0a0a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: '#fff', p: 3 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { opacity: 0.6 } }}>
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                Console
              </Typography>
            </Box>
          </Link>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {summary.totalPositions > 0 && (
              <Typography
                component="button"
                onClick={refreshPrices}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.3)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    color: 'rgba(255,255,255,0.6)',
                  },
                }}
              >
                <RefreshIcon sx={{ fontSize: 12 }} />
                Refresh
              </Typography>
            )}
            {summary.totalPositions > 0 && (
              <Typography
                component="button"
                onClick={clearPortfolio}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.3)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  '&:hover': {
                    color: 'rgba(255,100,100,0.7)',
                  },
                }}
              >
                Clear all
              </Typography>
            )}
          </Box>
        </Box>

        {/* Title */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '1.25rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              mb: 0.5,
            }}
          >
            Portfolio
          </Typography>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Your holdings guide your market view
          </Typography>
        </Box>

        {/* Stats row */}
        {summary.totalPositions > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              mb: 3,
              pb: 3,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '1.5rem', fontWeight: 500 }}>
                {summary.totalPositions}
              </Typography>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Positions
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '1.5rem', fontWeight: 500 }}>
                {summary.sectors.length}
              </Typography>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Sectors
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '1.5rem', fontWeight: 500 }}>
                {summary.industries.length}
              </Typography>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Industries
              </Typography>
            </Box>
          </Box>
        )}

        {/* Add Holding */}
        <Box sx={{ mb: 3 }}>
          <AddHolding onAdd={addHolding} />
        </Box>

        {/* Portfolio Chart */}
        {summary.totalPositions > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 2,
              }}
            >
              Performance
            </Typography>
            <PortfolioChart
              values={portfolioValues}
              isLoading={isPriceLoading}
              error={priceError}
            />
          </Box>
        )}

        {/* Empty State */}
        {summary.totalPositions === 0 && (
          <Box
            sx={{
              p: 4,
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.5)',
                mb: 1,
              }}
            >
              No holdings yet
            </Typography>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              Add stocks and ETFs to personalize your market view
            </Typography>
          </Box>
        )}

        {/* Main content */}
        {summary.totalPositions > 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  mb: 2,
                }}
              >
                Holdings
              </Typography>
              <SectorView
                sectorGroups={holdingsBySector}
                totalPositions={summary.totalPositions}
                onRemoveHolding={removeHolding}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  mb: 2,
                }}
              >
                Insights
              </Typography>
              <PortfolioInsights
                summary={summary}
                tickers={holdings.map(h => h.ticker)}
              />
            </Grid>
          </Grid>
        )}

        {/* Footer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.25)',
              textAlign: 'center',
            }}
          >
            Saved locally in browser
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
