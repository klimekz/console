import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArticleIcon from '@mui/icons-material/Article';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CategoryIcon from '@mui/icons-material/Category';
import type { PortfolioSummary } from '../../types/portfolio';
import { getSectorColor } from '../../data/sectorMappings';

interface PortfolioInsightsProps {
  summary: PortfolioSummary;
  tickers: string[];
}

// Generate relevant topics/themes based on portfolio composition
function generateRelevantTopics(sectors: string[], industries: string[]): string[] {
  const topics: string[] = [];

  // Sector-based topics
  if (sectors.includes('Technology')) {
    topics.push('AI & Machine Learning', 'Cloud Computing', 'Cybersecurity', 'Tech Earnings');
  }
  if (sectors.includes('Financial Services')) {
    topics.push('Interest Rates', 'Banking Regulations', 'Fintech Trends', 'Fed Policy');
  }
  if (sectors.includes('Healthcare')) {
    topics.push('Drug Approvals', 'Healthcare Policy', 'Biotech Innovation', 'Medical Devices');
  }
  if (sectors.includes('Energy')) {
    topics.push('Oil Prices', 'Renewable Energy', 'Energy Policy', 'OPEC Decisions');
  }
  if (sectors.includes('Consumer Discretionary')) {
    topics.push('Consumer Spending', 'Retail Trends', 'E-commerce Growth', 'Holiday Sales');
  }
  if (sectors.includes('Industrials')) {
    topics.push('Manufacturing Data', 'Supply Chain', 'Infrastructure Spending', 'Defense Contracts');
  }
  if (sectors.includes('ETF')) {
    topics.push('Market Indices', 'ETF Flows', 'Sector Rotation', 'Portfolio Strategy');
  }
  if (sectors.includes('Communication Services')) {
    topics.push('Streaming Wars', 'Advertising Trends', '5G Rollout', 'Social Media Regulation');
  }
  if (sectors.includes('Materials')) {
    topics.push('Commodity Prices', 'Mining News', 'Supply Constraints', 'Green Materials');
  }
  if (sectors.includes('Real Estate')) {
    topics.push('Housing Market', 'REIT Performance', 'Commercial Real Estate', 'Mortgage Rates');
  }

  // Industry-specific topics
  if (industries.includes('Semiconductors')) {
    topics.push('Chip Shortage', 'Semiconductor Policy', 'AI Chips', 'Foundry Capacity');
  }
  if (industries.includes('Electric Vehicles')) {
    topics.push('EV Sales', 'Battery Technology', 'Charging Infrastructure', 'EV Competition');
  }
  if (industries.includes('Biotechnology')) {
    topics.push('Clinical Trials', 'FDA Approvals', 'Gene Therapy', 'Biotech M&A');
  }
  if (industries.includes('Cloud Computing')) {
    topics.push('Cloud Revenue', 'Datacenter Expansion', 'Edge Computing', 'Cloud Competition');
  }

  // Remove duplicates and limit
  return [...new Set(topics)].slice(0, 12);
}

// Generate watchlist suggestions based on current holdings
function generateWatchlistSuggestions(sectors: string[], _industries: string[], currentTickers: string[]): { ticker: string; reason: string }[] {
  const suggestions: { ticker: string; reason: string }[] = [];

  const sectorRelated: Record<string, { ticker: string; reason: string }[]> = {
    'Technology': [
      { ticker: 'CRM', reason: 'Enterprise software leader' },
      { ticker: 'NOW', reason: 'IT workflow automation' },
      { ticker: 'ADBE', reason: 'Creative & marketing software' },
    ],
    'Financial Services': [
      { ticker: 'SCHW', reason: 'Retail brokerage leader' },
      { ticker: 'BLK', reason: 'Asset management giant' },
      { ticker: 'ICE', reason: 'Exchange operator' },
    ],
    'Healthcare': [
      { ticker: 'ISRG', reason: 'Surgical robotics pioneer' },
      { ticker: 'VEEV', reason: 'Healthcare cloud software' },
      { ticker: 'DXCM', reason: 'Continuous glucose monitoring' },
    ],
    'Energy': [
      { ticker: 'ENPH', reason: 'Solar microinverters' },
      { ticker: 'FSLR', reason: 'Solar panel manufacturer' },
      { ticker: 'LNG', reason: 'LNG export leader' },
    ],
    'Consumer Discretionary': [
      { ticker: 'LULU', reason: 'Athleisure apparel' },
      { ticker: 'POOL', reason: 'Pool supplies distribution' },
      { ticker: 'DECK', reason: 'Premium footwear brands' },
    ],
  };

  sectors.forEach(sector => {
    const related = sectorRelated[sector] || [];
    related.forEach(item => {
      if (!currentTickers.includes(item.ticker)) {
        suggestions.push(item);
      }
    });
  });

  return suggestions.slice(0, 6);
}

export function PortfolioInsights({ summary, tickers }: PortfolioInsightsProps) {
  const topics = generateRelevantTopics(summary.sectors, summary.industries);
  const watchlistSuggestions = generateWatchlistSuggestions(summary.sectors, summary.industries, tickers);

  if (summary.totalPositions === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <LightbulbIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Add holdings to get personalized insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Once you add your stocks and ETFs, you'll see relevant topics,
          news, and suggestions tailored to your portfolio.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Relevant Topics */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ArticleIcon color="primary" />
          <Typography variant="h6">Topics For You</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Based on your {summary.sectors.length} sector{summary.sectors.length !== 1 ? 's' : ''} exposure
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {topics.map((topic) => (
            <Chip
              key={topic}
              label={topic}
              variant="outlined"
              clickable
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Your Sectors */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CategoryIcon color="primary" />
          <Typography variant="h6">Your Sectors</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {summary.sectors.map((sector) => (
            <Chip
              key={sector}
              label={sector}
              sx={{
                backgroundColor: `${getSectorColor(sector)}22`,
                color: getSectorColor(sector),
                fontWeight: 600,
              }}
            />
          ))}
        </Box>
        {summary.industries.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Industries
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {summary.industries.map((industry) => (
                <Chip
                  key={industry}
                  label={industry}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Paper>

      {/* Watchlist Suggestions */}
      {watchlistSuggestions.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6">You Might Also Watch</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Related to your sector exposure
          </Typography>
          <List dense disablePadding>
            {watchlistSuggestions.map((item, index) => (
              <ListItem
                key={item.ticker}
                disablePadding
                sx={{
                  py: 1,
                  borderBottom: index < watchlistSuggestions.length - 1
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : 'none',
                }}
              >
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Chip
                    label={item.ticker}
                    size="small"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.reason}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
