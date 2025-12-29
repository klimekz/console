import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ReportHeader,
  ResearchSection,
  ResearchProgress,
  HistoricalReports,
  SettingsDialog,
} from '../components';
import type { ResearchReport, TodayResponse, AuditEntry } from '../types';
import { reportsApi, auditApi } from '../api/client';

// Polling interval when research is running
const POLL_INTERVAL_MS = 3000;
// Grace period to poll after triggering research (before backend shows running status)
const POLL_GRACE_PERIOD_MS = 30000;

export function ReportPage() {
  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Audit status from backend
  const [runningEntries, setRunningEntries] = useState<AuditEntry[]>([]);
  const previousRunningRef = useRef<string[]>([]);

  // Smart polling: only poll when research is running or recently triggered
  const [isPolling, setIsPolling] = useState(false);
  const pollGraceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTodayReports = useCallback(async () => {
    try {
      const data = await reportsApi.getToday();
      setTodayData(data);
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
        await loadTodayReports();
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
  }, [loadTodayReports]);

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

  // Initial load - check status once
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([loadTodayReports(), checkAuditStatus()]);
      setLoading(false);
    };
    fetchData();
  }, [loadTodayReports, checkAuditStatus]);

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
    await loadTodayReports();
    setRefreshing(false);
  };

  const handleClear = async () => {
    if (!confirm('Delete all reports?')) return;
    try {
      await reportsApi.clearAll();
      await loadTodayReports();
    } catch (err) {
      console.error('Failed to clear reports:', err);
    }
  };

  const handleItemDelete = (itemId: string) => {
    // Remove the item from local state
    setTodayData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: prev.data.map((report) => ({
          ...report,
          items: report.items.filter((item) => item.id !== itemId),
        })),
      };
    });
  };

  // Group reports by category for display order
  const groupedReports = todayData?.data.reduce(
    (acc, report) => {
      const category = report.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(report);
      return acc;
    },
    {} as Record<string, ResearchReport[]>
  );

  // Display order for categories
  const categoryOrder = ['papers', 'news', 'markets'];

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
          ) : todayData?.data.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Alert severity="info" sx={{ maxWidth: 500, mx: 'auto' }}>
                No research reports yet. Click the settings icon to configure your research topics
                and run your first research.
              </Alert>
            </Box>
          ) : (
            <>
              {todayData?.isLatest && todayData.message && (
                <Alert severity="info" sx={{ mb: 4 }}>
                  {todayData.message}
                </Alert>
              )}

              {categoryOrder.map((category) => {
                const reports = groupedReports?.[category];
                if (!reports || reports.length === 0) return null;

                // Take the most recent report for each category
                const latestReport = reports.sort(
                  (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
                )[0];

                return <ResearchSection key={category} report={latestReport} onItemDelete={handleItemDelete} />;
              })}

              {/* Also show any other categories not in the predefined order */}
              {Object.entries(groupedReports || {})
                .filter(([category]) => !categoryOrder.includes(category))
                .map(([, reports]) => {
                  const latestReport = reports.sort(
                    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
                  )[0];
                  return <ResearchSection key={latestReport.id} report={latestReport} onItemDelete={handleItemDelete} />;
                })}

              <Divider sx={{ my: 4 }} />

              <HistoricalReports />
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
