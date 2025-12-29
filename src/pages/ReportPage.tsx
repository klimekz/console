import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  ReportHeader,
  ResearchProgress,
  DaySection,
  SettingsDialog,
} from '../components';
import type { DayReports, AuditEntry } from '../types';
import { reportsApi, auditApi } from '../api/client';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

// Polling interval when research is running
const POLL_INTERVAL_MS = 3000;
// Grace period to poll after triggering research (before backend shows running status)
const POLL_GRACE_PERIOD_MS = 30000;
// Number of days to load at a time
const DAYS_PER_PAGE = 3;

export function ReportPage() {
  const [days, setDays] = useState<DayReports[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Audit status from backend
  const [runningEntries, setRunningEntries] = useState<AuditEntry[]>([]);
  const previousRunningRef = useRef<string[]>([]);

  // Smart polling: only poll when research is running or recently triggered
  const [isPolling, setIsPolling] = useState(false);
  const pollGraceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadReports = useCallback(async (offset = 0, append = false) => {
    try {
      const data = await reportsApi.getByDay(DAYS_PER_PAGE, offset);
      if (append) {
        setDays((prev) => [...prev, ...data.data]);
      } else {
        setDays(data.data);
      }
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load research reports');
    }
  }, []);

  // Poll for audit status
  const checkAuditStatus = useCallback(async () => {
    try {
      const status = await auditApi.getStatus();
      const previousIds = previousRunningRef.current;
      const currentIds = status.running.map((e) => e.id);

      // Check if any previously running research just completed
      const justCompleted = previousIds.filter((id) => !currentIds.includes(id));
      if (justCompleted.length > 0) {
        // Refresh reports when research completes
        await loadReports();
      }

      previousRunningRef.current = currentIds;
      setRunningEntries(status.running);

      // Stop polling if nothing is running and grace period expired
      if (status.running.length === 0 && !pollGraceTimeoutRef.current) {
        setIsPolling(false);
      }
    } catch (err) {
      console.error('Failed to check audit status:', err);
    }
  }, [loadReports]);

  // Start polling with grace period (called when research is triggered)
  const startPolling = useCallback(() => {
    setIsPolling(true);

    // Clear any existing grace timeout
    if (pollGraceTimeoutRef.current) {
      clearTimeout(pollGraceTimeoutRef.current);
    }

    // Set grace period - keep polling for 30s even if no running entries found
    pollGraceTimeoutRef.current = setTimeout(() => {
      pollGraceTimeoutRef.current = null;
      // Will stop on next check if still no running entries
    }, POLL_GRACE_PERIOD_MS);
  }, []);

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([loadReports(), checkAuditStatus()]);
      setLoading(false);
    };
    fetchData();
  }, [loadReports, checkAuditStatus]);

  // Smart polling - only poll when isPolling is true
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(checkAuditStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isPolling, checkAuditStatus]);

  // Start polling if there are running entries on initial load
  useEffect(() => {
    if (runningEntries.length > 0 && !isPolling) {
      setIsPolling(true);
    }
  }, [runningEntries.length, isPolling]);

  // Cleanup grace timeout on unmount
  useEffect(() => {
    return () => {
      if (pollGraceTimeoutRef.current) {
        clearTimeout(pollGraceTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleClear = async () => {
    if (!confirm('Delete all reports?')) return;
    try {
      await reportsApi.clearAll();
      await loadReports();
    } catch (err) {
      console.error('Failed to clear reports:', err);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadReports(days.length, true);
    setLoadingMore(false);
  };

  const handleItemDelete = (itemId: string) => {
    // Remove the item from local state
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        reports: day.reports.map((report) => ({
          ...report,
          items: report.items.filter((item) => item.id !== itemId),
        })),
      }))
    );
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <ReportHeader
            onSettingsClick={() => setSettingsOpen(true)}
            onRefresh={handleRefresh}
            onClear={handleClear}
            loading={refreshing}
          />

          <ResearchProgress runningEntries={runningEntries} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          ) : days.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Alert severity="info" sx={{ maxWidth: 500, mx: 'auto' }}>
                No research reports yet. Click the settings icon to configure your research topics
                and run your first research.
              </Alert>
            </Box>
          ) : (
            <>
              {days.map((day) => (
                <DaySection key={day.date} day={day} onItemDelete={handleItemDelete} />
              ))}

              {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    sx={{
                      fontFamily: SYSTEM_FONT,
                      textTransform: 'none',
                      borderColor: '#ccc',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#999',
                        bgcolor: 'transparent',
                      },
                    }}
                  >
                    {loadingMore ? 'Loading...' : 'Load earlier days'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onResearchTriggered={startPolling}
      />
    </>
  );
}
