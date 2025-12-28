import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Header,
  ResearchSection,
  HistoricalReports,
  SettingsDialog,
} from './components';
import type { ResearchReport, TodayResponse } from './types';
import { reportsApi } from './api/client';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a1a1a',
    },
    background: {
      default: '#faf9f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h1: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
    },
    h2: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
    },
    h3: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
    },
    h4: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
    },
    h5: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
    },
    h6: {
      fontFamily: '"Playfair Display", "Times New Roman", serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#faf9f6',
        },
      },
    },
  },
});

function App() {
  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRunComplete = async () => {
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Header
            onSettingsClick={() => setSettingsOpen(true)}
            onRefresh={handleRefresh}
            loading={refreshing}
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
                .map(([category, reports]) => {
                  const latestReport = reports.sort(
                    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
                  )[0];
                  return <ResearchSection key={category} report={latestReport} />;
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
        onRunComplete={handleRunComplete}
      />
    </ThemeProvider>
  );
}

export default App;
