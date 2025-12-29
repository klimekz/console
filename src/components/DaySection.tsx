import { Box, Typography, Divider } from '@mui/material';
import type { DayReports, ResearchReport } from '../types';
import { ResearchSection } from './ResearchSection';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

interface DaySectionProps {
  day: DayReports;
  onItemDelete?: (itemId: string) => void;
}

export function DaySection({ day, onItemDelete }: DaySectionProps) {
  const dateObj = new Date(day.date + 'T12:00:00'); // Noon to avoid timezone issues
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group reports by category, taking the most recent one per category
  const reportsByCategory = day.reports.reduce(
    (acc, report) => {
      if (!acc[report.category] || new Date(report.generatedAt) > new Date(acc[report.category].generatedAt)) {
        acc[report.category] = report;
      }
      return acc;
    },
    {} as Record<string, ResearchReport>
  );

  const categoryOrder = ['papers', 'news', 'markets'];
  const orderedReports = categoryOrder
    .map((cat) => reportsByCategory[cat])
    .filter(Boolean);

  // Add any other categories not in the predefined order
  const otherReports = Object.entries(reportsByCategory)
    .filter(([cat]) => !categoryOrder.includes(cat))
    .map(([, report]) => report);

  const allReports = [...orderedReports, ...otherReports];

  if (allReports.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography
        sx={{
          fontFamily: '"Newsreader", Georgia, serif',
          fontSize: { xs: '1.5rem', md: '1.75rem' },
          fontWeight: 500,
          color: '#121212',
          mb: 0.5,
        }}
      >
        {formattedDate}
      </Typography>
      <Divider sx={{ mb: 3, borderColor: '#121212', borderWidth: 2 }} />

      {allReports.map((report) => (
        <ResearchSection
          key={report.id}
          report={report}
          showSummary={true}
          onItemDelete={onItemDelete}
        />
      ))}
    </Box>
  );
}
