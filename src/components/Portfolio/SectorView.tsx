import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { SectorGroup } from '../../types/portfolio';
import { getSectorColor } from '../../data/sectorMappings';
import { HoldingCard } from './HoldingCard';

interface SectorViewProps {
  sectorGroups: SectorGroup[];
  totalPositions: number;
  onRemoveHolding: (id: string) => void;
}

export function SectorView({ sectorGroups, totalPositions, onRemoveHolding }: SectorViewProps) {
  if (sectorGroups.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Portfolio by Sector
      </Typography>

      {/* Sector breakdown bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', height: 24, borderRadius: 1, overflow: 'hidden', mb: 2 }}>
          {sectorGroups.map((group) => {
            const percentage = (group.totalHoldings / totalPositions) * 100;
            const color = getSectorColor(group.sector);
            return (
              <Box
                key={group.sector}
                sx={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                  transition: 'width 0.3s',
                  minWidth: group.totalHoldings > 0 ? '4px' : 0,
                }}
                title={`${group.sector}: ${percentage.toFixed(1)}%`}
              />
            );
          })}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {sectorGroups.map((group) => {
            const color = getSectorColor(group.sector);
            const percentage = ((group.totalHoldings / totalPositions) * 100).toFixed(1);
            return (
              <Box key={group.sector} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: color,
                  }}
                />
                <Typography variant="caption">
                  {group.sector} ({percentage}%)
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Sector accordions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sectorGroups.map((group) => {
          const color = getSectorColor(group.sector);
          const percentage = ((group.totalHoldings / totalPositions) * 100).toFixed(1);

          return (
            <Accordion
              key={group.sector}
              disableGutters
              elevation={0}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                overflow: 'hidden',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  borderLeft: `4px solid ${color}`,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  <Typography fontWeight="bold" sx={{ minWidth: 160 }}>
                    {group.sector}
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(percentage)}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: color,
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      {group.totalHoldings} position{group.totalHoldings !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {group.holdings.map((holding) => (
                    <HoldingCard
                      key={holding.id}
                      holding={holding}
                      onRemove={onRemoveHolding}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
}
