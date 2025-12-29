import { useState } from 'react';
import { Box, Typography, Chip, Link, IconButton, Tooltip } from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CloseIcon from '@mui/icons-material/Close';
import type { ResearchItem as ResearchItemType } from '../types';
import { cleanMarkdownLinks } from '../utils/textUtils';
import { sourcesApi, reportsApi } from '../api/client';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

interface ResearchItemProps {
  item: ResearchItemType;
  featured?: boolean;
  onDelete?: (itemId: string) => void;
}

// Extract domain from URL
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function ResearchItem({ item, featured = false, onDelete }: ResearchItemProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formattedDate = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const domain = extractDomain(item.url);

  const handleFeedback = async (rating: 'up' | 'down') => {
    if (!domain || submitting) return;

    // Toggle off if clicking the same button
    if (feedback === rating) {
      setFeedback(null);
      return;
    }

    setSubmitting(true);
    try {
      await sourcesApi.submitFeedback({
        sourceDomain: domain,
        itemId: item.id,
        rating: rating === 'up' ? 1 : -1,
      });
      setFeedback(rating);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await reportsApi.deleteItem(item.id);
      onDelete?.(item.id);
    } catch (err) {
      console.error('Failed to delete item:', err);
      setDeleting(false);
    }
  };

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

        {/* Feedback and delete buttons */}
        <Box sx={{ ml: 'auto', display: 'flex', gap: 0 }}>
          {domain && (
            <>
              <Tooltip title={`Good source (${domain})`} arrow>
                <IconButton
                  size="small"
                  onClick={() => handleFeedback('up')}
                  disabled={submitting}
                  sx={{
                    p: 0.5,
                    color: feedback === 'up' ? 'success.main' : '#999',
                    '&:hover': { color: 'success.main' },
                  }}
                >
                  {feedback === 'up' ? (
                    <ThumbUpIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <ThumbUpOutlinedIcon sx={{ fontSize: 14 }} />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title={`Poor source (${domain})`} arrow>
                <IconButton
                  size="small"
                  onClick={() => handleFeedback('down')}
                  disabled={submitting}
                  sx={{
                    p: 0.5,
                    color: feedback === 'down' ? 'error.main' : '#999',
                    '&:hover': { color: 'error.main' },
                  }}
                >
                  {feedback === 'down' ? (
                    <ThumbDownIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <ThumbDownOutlinedIcon sx={{ fontSize: 14 }} />
                  )}
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Remove" arrow>
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={deleting}
              sx={{
                p: 0.5,
                color: '#bbb',
                opacity: deleting ? 0.5 : 1,
                '&:hover': { color: '#666' },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
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
