import { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO_FONT = '"SF Mono", "Fira Code", "Monaco", monospace';

interface ResearchProgressProps {
  configNames: string[];
  startTime: number;
}

export function ResearchProgress({ configNames, startTime }: ResearchProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Estimate progress (deep research typically takes 2-5 minutes)
  const estimatedDuration = 180; // 3 minutes estimate
  const progress = Math.min((elapsed / estimatedDuration) * 100, 95);

  return (
    <Box
      sx={{
        border: '1px solid #333',
        borderRadius: 1,
        p: 3,
        mb: 4,
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
        <Typography
          sx={{
            fontFamily: MONO_FONT,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#00ff88',
          }}
        >
          {formatTime(elapsed)}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          borderRadius: 2,
          backgroundColor: '#222',
          mb: 2,
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#00ff88',
            borderRadius: 2,
          },
        }}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {configNames.map((name) => (
          <Typography
            key={name}
            sx={{
              fontFamily: SYSTEM_FONT,
              fontSize: '0.75rem',
              color: '#888',
              backgroundColor: '#1a1a1a',
              px: 1.5,
              py: 0.5,
              borderRadius: 0.5,
            }}
          >
            {name}
          </Typography>
        ))}
      </Box>

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
  );
}
