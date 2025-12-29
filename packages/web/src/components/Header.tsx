import { Box, Typography, Divider, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

interface ReportHeaderProps {
  onSettingsClick: () => void;
  onRefresh: () => void;
  onClear: () => void;
  loading?: boolean;
}

export function ReportHeader({ onSettingsClick, onRefresh, onClear, loading }: ReportHeaderProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box sx={{ mb: 4 }}>
      {/* Navigation row - back link and action icons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { opacity: 0.6 } }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            <Typography
              sx={{
                fontFamily: SYSTEM_FONT,
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={onClear}
            size="small"
            sx={{ color: '#999', '&:hover': { color: '#c00' } }}
            title="Clear all reports"
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            onClick={onRefresh}
            disabled={loading}
            size="small"
            title="Refresh"
          >
            <RefreshIcon sx={{ fontSize: 18, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
          <IconButton onClick={onSettingsClick} size="small" title="Settings">
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Date row - separate for better mobile layout */}
      <Typography
        sx={{
          color: '#666',
          fontFamily: SYSTEM_FONT,
          fontSize: '0.7rem',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          textAlign: 'center',
          mb: 2,
        }}
      >
        {dateStr}
      </Typography>

      <Typography
        variant="h1"
        sx={{
          fontFamily: '"Newsreader", Georgia, serif',
          fontSize: { xs: '2.25rem', md: '3rem' },
          fontWeight: 400,
          textAlign: 'center',
          letterSpacing: '-0.02em',
          mb: 0.5,
        }}
      >
        Daily Report
      </Typography>

      <Typography
        sx={{
          textAlign: 'center',
          color: '#666',
          fontFamily: SYSTEM_FONT,
          fontSize: '0.8rem',
          mb: 3,
        }}
      >
        Research · Tech · Finance
      </Typography>

      <Divider sx={{ borderColor: '#000' }} />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}
