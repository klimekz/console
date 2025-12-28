import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { usePortfolio } from '../../hooks/usePortfolio';
import { AddHolding, SectorView, PortfolioInsights } from '../Portfolio';

export function Markets() {
  const {
    holdings,
    holdingsBySector,
    summary,
    isLoaded,
    addHolding,
    removeHolding,
    clearPortfolio,
  } = usePortfolio();

  if (!isLoaded) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading portfolio...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Markets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your personalized market view based on your portfolio
        </Typography>
      </Box>

      {/* Portfolio Summary Stats */}
      {summary.totalPositions > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="primary">
                {summary.totalPositions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Positions
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="primary">
                {summary.totalHoldings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Shares
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="primary">
                {summary.sectors.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sectors
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color="primary">
                {summary.industries.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Industries
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Add Holding Form */}
      <Box sx={{ mb: 4 }}>
        <AddHolding onAdd={addHolding} />
      </Box>

      {/* Empty State */}
      {summary.totalPositions === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 2,
            textAlign: 'center',
            mb: 4,
          }}
        >
          <AccountBalanceWalletIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Build Your Portfolio
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            Add your stock and ETF holdings above to get personalized market content,
            sector insights, and relevant news tailored to your investments.
          </Typography>
        </Paper>
      )}

      {/* Main Content Grid */}
      {summary.totalPositions > 0 && (
        <Grid container spacing={4}>
          {/* Left Column: Portfolio Holdings */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Your Holdings</Typography>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={clearPortfolio}
                sx={{ textTransform: 'none' }}
              >
                Clear All
              </Button>
            </Box>
            <SectorView
              sectorGroups={holdingsBySector}
              totalPositions={summary.totalPositions}
              onRemoveHolding={removeHolding}
            />
          </Grid>

          {/* Right Column: Insights */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Personalized Insights
            </Typography>
            <PortfolioInsights
              summary={summary}
              tickers={holdings.map(h => h.ticker)}
            />
          </Grid>
        </Grid>
      )}

      {/* Portfolio Insights for empty state */}
      {summary.totalPositions === 0 && (
        <PortfolioInsights
          summary={summary}
          tickers={[]}
        />
      )}

      <Divider sx={{ my: 4 }} />

      {/* Footer hint */}
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Your portfolio is saved locally in your browser
      </Typography>
    </Box>
  );
}
