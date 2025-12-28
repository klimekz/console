import { useState, useEffect, useCallback } from 'react';
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
import type { ResearchReport, TodayResponse } from '../types';
import { reportsApi } from '../api/client';

interface RunningResearch {
  configNames: string[];
  startTime: number;
}

export function ReportPage() {
  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [runningResearch, setRunningResearch] = useState<RunningResearch | null>(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadTodayReports();
      setLoading(false);
    };
    fetchData();
  }, [loadTodayReports]);

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

  const handleRunStart = (_configIds: string[], configNames: string[]) => {
    setRunningResearch({
      configNames,
      startTime: Date.now(),
    });
  };

  const handleRunComplete = async () => {
    setRunningResearch(null);
    await loadTodayReports();
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

          {runningResearch && (
            <ResearchProgress
              configNames={runningResearch.configNames}
              startTime={runningResearch.startTime}
            />
          )}

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
        onRunStart={handleRunStart}
        onRunComplete={handleRunComplete}
      />
    </>
  );
}
