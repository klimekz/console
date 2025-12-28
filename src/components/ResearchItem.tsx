import { Box, Typography, Chip, Link } from '@mui/material';
import type { ResearchItem as ResearchItemType } from '../types';

interface ResearchItemProps {
  item: ResearchItemType;
  featured?: boolean;
}

export function ResearchItem({ item, featured = false }: ResearchItemProps) {
  const formattedDate = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Box
      sx={{
        mb: featured ? 4 : 3,
        pb: featured ? 4 : 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Link
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        underline="none"
        sx={{
          display: 'block',
          '&:hover h3': {
            textDecoration: 'underline',
          },
        }}
      >
        <Typography
          component="h3"
          sx={{
            fontFamily: '"Playfair Display", "Times New Roman", serif',
            fontSize: featured ? { xs: '1.5rem', md: '2rem' } : { xs: '1.1rem', md: '1.25rem' },
            fontWeight: 600,
            lineHeight: 1.2,
            mb: 1,
            color: 'text.primary',
          }}
        >
          {item.title}
        </Typography>
      </Link>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {item.source}
        </Typography>
        {formattedDate && (
          <>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              •
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formattedDate}
            </Typography>
          </>
        )}
        {item.relevanceScore >= 8 && (
          <Chip
            label="Top Story"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          />
        )}
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.6,
          fontSize: featured ? '1rem' : '0.9rem',
          mb: 1.5,
        }}
      >
        {item.summary}
      </Typography>

      {item.tags.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {item.tags.slice(0, 4).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                borderRadius: 1,
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
