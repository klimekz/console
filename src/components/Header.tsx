import { Box, Typography, Divider, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ReportHeaderProps {
  onSettingsClick: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function ReportHeader({ onSettingsClick, onRefresh, loading }: ReportHeaderProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { opacity: 0.7 } }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Inter", -apple-system, sans-serif',
                fontWeight: 500,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Console
            </Typography>
          </Box>
        </Link>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontFamily: '"Inter", -apple-system, sans-serif',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {dateStr}
        </Typography>
        <Box>
          <IconButton
            onClick={onRefresh}
            disabled={loading}
            size="small"
            sx={{ mr: 0.5 }}
            title="Refresh research"
          >
            <RefreshIcon sx={{ fontSize: 20, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
          <IconButton onClick={onSettingsClick} size="small" title="Configure research">
            <SettingsIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontFamily: '"Cheltenham", "Georgia", serif',
          fontSize: { xs: '2.5rem', md: '3.5rem' },
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '-0.02em',
          mb: 0.5,
        }}
      >
        The Report
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          textAlign: 'center',
          color: 'text.secondary',
          fontFamily: '"Georgia", serif',
          fontStyle: 'italic',
          fontSize: '1rem',
          mb: 2,
        }}
      >
        Your Daily Intelligence Brief
      </Typography>

      <Divider sx={{ borderWidth: 1.5, borderColor: 'text.primary' }} />
      <Divider sx={{ mt: 0.5 }} />

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
