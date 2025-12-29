import { Box, Typography, Divider, Grid } from '@mui/material';
import type { ResearchReport } from '../types';
import { ResearchItem } from './ResearchItem';
import { CATEGORY_LABELS, type CategoryType } from '../types';
import { cleanMarkdownLinks } from '../utils/textUtils';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

interface ResearchSectionProps {
  report: ResearchReport;
  showSummary?: boolean;
}

export function ResearchSection({ report, showSummary = true }: ResearchSectionProps) {
  const category = report.category as CategoryType;
  const label = CATEGORY_LABELS[category] || report.configName;

  const sortedItems = [...report.items].sort((a, b) => b.relevanceScore - a.relevanceScore);
  const featuredItem = sortedItems[0];
  const otherItems = sortedItems.slice(1);

  return (
    <Box sx={{ mb: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography
          sx={{
            fontFamily: SYSTEM_FONT,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: '0.7rem',
            color: '#666',
          }}
        >
          {label}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: '#e0e0e0' }} />

      {showSummary && report.summary && (
        <Typography
          sx={{
            fontFamily: '"Newsreader", Georgia, serif',
            fontStyle: 'italic',
            color: '#444',
            fontSize: '1rem',
            mb: 2.5,
            pl: 2,
            borderLeft: '2px solid #121212',
          }}
        >
          {cleanMarkdownLinks(report.summary)}
        </Typography>
      )}

      {report.items.length === 0 ? (
        <Typography sx={{ color: '#999', fontFamily: SYSTEM_FONT, fontSize: '0.875rem' }}>
          No items available.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {featuredItem && (
            <Grid size={12}>
              <ResearchItem item={featuredItem} featured />
            </Grid>
          )}

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
