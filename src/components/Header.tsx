import { Box, Typography, Divider, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';

interface HeaderProps {
  onSettingsClick: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function Header({ onSettingsClick, onRefresh, loading }: HeaderProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
          {dateStr.toUpperCase()}
        </Typography>
        <Box>
          <IconButton
            onClick={onRefresh}
            disabled={loading}
            size="small"
            sx={{ mr: 1 }}
            title="Refresh research"
          >
            <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
          <IconButton onClick={onSettingsClick} size="small" title="Configure research">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography
        variant="h1"
        sx={{
          fontFamily: '"Playfair Display", "Times New Roman", serif',
          fontSize: { xs: '2.5rem', md: '4rem' },
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '-0.02em',
          mb: 1,
        }}
      >
        The Console
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          textAlign: 'center',
          color: 'text.secondary',
          fontStyle: 'italic',
          mb: 2,
        }}
      >
        Your Daily Intelligence Brief
      </Typography>

      <Divider sx={{ borderWidth: 2, borderColor: 'text.primary' }} />
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
