import { Box, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

const MONO = '"SF Mono", "Fira Code", "JetBrains Mono", monospace';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  status?: 'live' | 'soon';
}

function ToolCard({ title, description, icon, to, status = 'live' }: ToolCardProps) {
  const isDisabled = status === 'soon';

  const content = (
    <Box
      sx={{
        position: 'relative',
        p: 2.5,
        height: '100%',
        minHeight: 140,
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid',
        borderColor: isDisabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.4 : 1,
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        '&:hover': isDisabled ? {} : {
          borderColor: 'rgba(255,255,255,0.4)',
          bgcolor: 'rgba(255,255,255,0.05)',
          '& .arrow-icon': {
            transform: 'translate(2px, -2px)',
            opacity: 1,
          },
        },
        '&::before': isDisabled ? {} : {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
        </Box>
        {!isDisabled && (
          <ArrowOutwardIcon
            className="arrow-icon"
            sx={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.4)',
              opacity: 0.5,
              transition: 'all 0.2s ease',
            }}
          />
        )}
      </Box>

      <Typography
        sx={{
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: '0.8rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: '#fff',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.75rem',
          lineHeight: 1.5,
          fontFamily: MONO,
        }}
      >
        {description}
      </Typography>

      {isDisabled && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            px: 1,
            py: 0.25,
            bgcolor: 'rgba(255,255,255,0.1)',
            fontSize: '0.6rem',
            fontFamily: MONO,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Soon
        </Box>
      )}
    </Box>
  );

  if (isDisabled) {
    return content;
  }

  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
}

export function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Systems Online
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.05em',
          }}
        >
          v1.0
        </Typography>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          {/* Title */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: MONO,
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 600,
                letterSpacing: '-0.02em',
                mb: 1,
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CONSOLE
            </Typography>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Command Center
            </Typography>
          </Box>

          {/* Tools grid */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ToolCard
                title="Daily Report"
                description="AI-curated intelligence brief"
                icon={<ArticleIcon sx={{ fontSize: 20 }} />}
                to="/report"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ToolCard
                title="Analytics"
                description="Performance metrics"
                icon={<Box component="span" sx={{ fontSize: 18 }}>◈</Box>}
                to="/analytics"
                status="soon"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          px: 3,
          py: 1.5,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.1em',
          }}
        >
          ZACK.SYS
        </Typography>
      </Box>
    </Box>
  );
}
