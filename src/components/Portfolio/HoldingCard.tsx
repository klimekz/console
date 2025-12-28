import {
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Holding } from '../../types/portfolio';
import { getSectorColor } from '../../data/sectorMappings';

interface HoldingCardProps {
  holding: Holding;
  onRemove: (id: string) => void;
}

export function HoldingCard({ holding, onRemove }: HoldingCardProps) {
  const sectorColor = getSectorColor(holding.sector || '');

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 2,
        borderLeft: `4px solid ${sectorColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="h6" component="span" fontWeight="bold">
            {holding.ticker}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {holding.shares.toLocaleString()} shares
          </Typography>
        </Box>
        {holding.name && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {holding.name}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {holding.sector && (
            <Chip
              label={holding.sector}
              size="small"
              sx={{
                backgroundColor: `${sectorColor}22`,
                color: sectorColor,
                fontWeight: 500,
              }}
            />
          )}
          {holding.industry && holding.industry !== holding.sector && (
            <Chip
              label={holding.industry}
              size="small"
              variant="outlined"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />
          )}
        </Box>
      </Box>
      <IconButton
        onClick={() => onRemove(holding.id)}
        size="small"
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'error.main',
          },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}
