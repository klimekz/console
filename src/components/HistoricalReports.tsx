import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Pagination,
  Card,
  CardContent,
  Chip,
  Link,
  CircularProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { ResearchReport, PaginatedResponse } from '../types';
import { CATEGORY_LABELS, CATEGORY_ICONS, type CategoryType } from '../types';
import { reportsApi } from '../api/client';

export function HistoricalReports() {
  const [reports, setReports] = useState<PaginatedResponse<ResearchReport> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadReports();
  }, [page]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getHistory(page, 10);
      setReports(data);
    } catch (error) {
      console.error('Failed to load historical reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReports((prev) => {
      const next = new Set(prev);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && !reports) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!reports || reports.data.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', mb: 2 }}>
          Archives
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
          No historical reports available yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: '"Playfair Display", "Times New Roman", serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 2,
          mb: 2,
        }}
      >
        📜 Archives
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {reports.data.map((report) => {
        const category = report.category as CategoryType;
        const icon = CATEGORY_ICONS[category] || '📋';
        const label = CATEGORY_LABELS[category] || report.configName;
        const isExpanded = expandedReports.has(report.id);

        return (
          <Card
            key={report.id}
            variant="outlined"
            sx={{
              mb: 2,
              borderRadius: 1,
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <CardContent sx={{ pb: isExpanded ? 2 : '16px !important' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                }}
                onClick={() => toggleExpand(report.id)}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2">{icon}</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, fontFamily: '"Playfair Display", serif' }}
                    >
                      {label}
                    </Typography>
                    <Chip label={`${report.items.length} items`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatDate(report.generatedAt)}
                  </Typography>
                </Box>
                <IconButton size="small">
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={isExpanded}>
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  {report.summary && (
                    <Typography
                      variant="body2"
                      sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 2 }}
                    >
                      {report.summary}
                    </Typography>
                  )}
                  {report.items.slice(0, 5).map((item) => (
                    <Box key={item.id} sx={{ mb: 1.5 }}>
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                      >
                        {item.title}
                      </Link>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        {item.source}
                      </Typography>
                    </Box>
                  ))}
                  {report.items.length > 5 && (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      +{report.items.length - 5} more items
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        );
      })}

      {reports.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={reports.totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
