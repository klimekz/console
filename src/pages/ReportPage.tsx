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

export function ReportPage() {
  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Audit status from backend
  const [runningEntries, setRunningEntries] = useState<AuditEntry[]>([]);
  const [recentFailed, setRecentFailed] = useState<AuditEntry[]>([]);
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());
  const previousRunningRef = useRef<string[]>([]);

  const loadTodayReports = useCallback(async () => {
    try {
      const data = await reportsApi.getToday();
      setTodayData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load research reports. Is the backend running?');
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

      // Filter out dismissed errors
      const failedNotDismissed = status.recentCompleted.filter(
        (e) => e.status === 'failed' && !dismissedErrors.has(e.id)
      );
      setRecentFailed(failedNotDismissed);
    } catch (err) {
      console.error('Failed to check audit status:', err);
    }
  }, [loadTodayReports, dismissedErrors]);

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([loadTodayReports(), checkAuditStatus()]);
      setLoading(false);
    };
    fetchData();
  }, [loadTodayReports, checkAuditStatus]);

  // Poll for status every 3 seconds
  useEffect(() => {
    const interval = setInterval(checkAuditStatus, 3000);
    return () => clearInterval(interval);
  }, [checkAuditStatus]);

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

  const handleDismissError = (id: string) => {
    setDismissedErrors((prev) => new Set([...prev, id]));
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

          <ResearchProgress
            runningEntries={runningEntries}
            recentFailed={recentFailed}
            onDismissError={handleDismissError}
          />

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

                return <ResearchSection key={category} report={latestReport} />;
              })}

              {/* Also show any other categories not in the predefined order */}
              {Object.entries(groupedReports || {})
                .filter(([category]) => !categoryOrder.includes(category))
                .map(([, reports]) => {
                  const latestReport = reports.sort(
                    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
                  )[0];
                  return <ResearchSection key={latestReport.id} report={latestReport} />;
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
      />
    </>
  );
}
