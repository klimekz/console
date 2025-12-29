import { Box, Typography, Chip, Link } from '@mui/material';
import type { ResearchItem as ResearchItemType } from '../types';
import { cleanMarkdownLinks } from '../utils/textUtils';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

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
        mb: featured ? 3 : 2.5,
        pb: featured ? 3 : 2,
        borderBottom: '1px solid #e0e0e0',
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
            fontFamily: '"Newsreader", Georgia, serif',
            fontSize: featured ? { xs: '1.35rem', md: '1.6rem' } : { xs: '1rem', md: '1.1rem' },
            fontWeight: 500,
            lineHeight: 1.3,
            mb: 0.75,
            color: '#121212',
          }}
        >
          {item.title}
        </Typography>
      </Link>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Typography
          sx={{
            color: '#666',
            fontFamily: SYSTEM_FONT,
            fontSize: '0.7rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
          }}
        >
          {item.source}
        </Typography>
        {formattedDate && (
          <>
            <Typography sx={{ color: '#999', fontSize: '0.7rem' }}>·</Typography>
            <Typography sx={{ color: '#666', fontFamily: SYSTEM_FONT, fontSize: '0.7rem' }}>
              {formattedDate}
            </Typography>
          </>
        )}
        {item.relevanceScore >= 8 && (
          <Chip
            label="Top"
            size="small"
            sx={{
              height: 16,
              fontSize: '0.6rem',
              fontFamily: SYSTEM_FONT,
              fontWeight: 600,
              bgcolor: '#121212',
              color: '#fff',
              borderRadius: 0,
            }}
          />
        )}
      </Box>

      <Typography
        sx={{
          color: '#444',
          fontFamily: SYSTEM_FONT,
          lineHeight: 1.55,
          fontSize: featured ? '0.9rem' : '0.85rem',
          mb: 1,
        }}
      >
        {cleanMarkdownLinks(item.summary)}
      </Typography>

      {item.tags.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {item.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontFamily: SYSTEM_FONT,
                borderRadius: 0,
                borderColor: '#ccc',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
