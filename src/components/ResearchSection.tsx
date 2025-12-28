import { Box, Typography, Divider, Grid } from '@mui/material';
import type { ResearchReport } from '../types';
import { ResearchItem } from './ResearchItem';
import { CATEGORY_LABELS, CATEGORY_ICONS, type CategoryType } from '../types';

interface ResearchSectionProps {
  report: ResearchReport;
  showSummary?: boolean;
}

export function ResearchSection({ report, showSummary = true }: ResearchSectionProps) {
  const category = report.category as CategoryType;
  const label = CATEGORY_LABELS[category] || report.configName;
  const icon = CATEGORY_ICONS[category] || '📋';

  const sortedItems = [...report.items].sort((a, b) => b.relevanceScore - a.relevanceScore);
  const featuredItem = sortedItems[0];
  const otherItems = sortedItems.slice(1);

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" component="span">
          {icon}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Inter", -apple-system, sans-serif',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontSize: '0.85rem',
          }}
        >
          {label}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {showSummary && report.summary && (
        <Typography
          variant="body1"
          sx={{
            fontStyle: 'italic',
            color: 'text.secondary',
            mb: 3,
            pl: 2,
            borderLeft: '3px solid',
            borderColor: 'primary.main',
          }}
        >
          {report.summary}
        </Typography>
      )}

      {report.items.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
          No items available for this section.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {/* Featured item - full width */}
          {featuredItem && (
            <Grid size={12}>
              <ResearchItem item={featuredItem} featured />
            </Grid>
          )}

          {/* Other items in columns */}
          {otherItems.map((item) => (
            <Grid key={item.id} size={{ xs: 12, md: 6 }}>
              <ResearchItem item={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
