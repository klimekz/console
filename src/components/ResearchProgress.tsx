import { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Alert } from '@mui/material';
import type { AuditEntry } from '../types';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO_FONT = '"SF Mono", "Fira Code", "Monaco", monospace';

interface ResearchProgressProps {
  runningEntries: AuditEntry[];
  recentFailed?: AuditEntry[];
  onDismissError?: (id: string) => void;
}

export function ResearchProgress({ runningEntries, recentFailed, onDismissError }: ResearchProgressProps) {
  const [elapsed, setElapsed] = useState<Record<string, number>>({});

  useEffect(() => {
    if (runningEntries.length === 0) return;

    const parseDbDate = (dateStr: string): number => {
      // SQLite returns "YYYY-MM-DD HH:MM:SS", convert to ISO format
      const isoStr = dateStr.replace(' ', 'T') + 'Z';
      return new Date(isoStr).getTime();
    };

    const interval = setInterval(() => {
      const now = Date.now();
      const newElapsed: Record<string, number> = {};
      for (const entry of runningEntries) {
        const startTime = parseDbDate(entry.createdAt);
        newElapsed[entry.id] = Math.floor((now - startTime) / 1000);
      }
      setElapsed(newElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [runningEntries]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (runningEntries.length === 0 && (!recentFailed || recentFailed.length === 0)) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Show errors from recent failures */}
      {recentFailed?.map((entry) => (
        <Alert
          key={entry.id}
          severity="error"
          sx={{ mb: 2 }}
          onClose={onDismissError ? () => onDismissError(entry.id) : undefined}
        >
          <strong>{entry.configName || 'Research'}</strong> failed: {entry.errorMessage || 'Unknown error'}
          {entry.runtimeMs > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              Failed after {(entry.runtimeMs / 1000).toFixed(1)}s
            </Typography>
          )}
        </Alert>
      ))}

      {/* Show running research */}
      {runningEntries.length > 0 && (
        <Box
          sx={{
            border: '1px solid #333',
            borderRadius: 1,
            p: 3,
            backgroundColor: '#0a0a0a',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#00ff88',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                  },
                }}
              />
              <Typography
                sx={{
                  fontFamily: SYSTEM_FONT,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Deep Research in Progress
              </Typography>
            </Box>
          </Box>

          {runningEntries.map((entry) => {
            const elapsedSecs = elapsed[entry.id] || 0;
            const estimatedDuration = 180;
            const progress = Math.min((elapsedSecs / estimatedDuration) * 100, 95);

            return (
              <Box key={entry.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: SYSTEM_FONT,
                      fontSize: '0.8rem',
                      color: '#aaa',
                    }}
                  >
                    {entry.configName || entry.configId}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: MONO_FONT,
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#00ff88',
                    }}
                  >
                    {formatTime(elapsedSecs)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#222',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#00ff88',
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            );
          })}

          <Typography
            sx={{
              fontFamily: SYSTEM_FONT,
              fontSize: '0.75rem',
              color: '#666',
              mt: 2,
            }}
          >
            Searching the web for recent content. This typically takes 2-5 minutes.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
