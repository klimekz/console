import { Box, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

const MONO = '"SF Mono", "Fira Code", monospace';

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
        minHeight: 120,
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.35 : 1,
        transition: 'all 0.15s ease',
        '&:hover': isDisabled ? {} : {
          bgcolor: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.15)',
          '& .arrow-icon': {
            transform: 'translate(2px, -2px)',
            opacity: 1,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {icon}
        </Box>
        {!isDisabled && (
          <ArrowOutwardIcon
            className="arrow-icon"
            sx={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.3)',
              opacity: 0,
              transition: 'all 0.15s ease',
            }}
          />
        )}
      </Box>

      <Typography
        sx={{
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: '0.75rem',
          letterSpacing: '0.02em',
          color: '#fff',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.7rem',
          lineHeight: 1.4,
          fontFamily: MONO,
        }}
      >
        {description}
      </Typography>
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
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: MONO,
              fontSize: '1.5rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: '#fff',
            }}
          >
            Console
          </Typography>
        </Box>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ToolCard
              title="Daily Report"
              description="Research & market intel"
              icon={<ArticleIcon sx={{ fontSize: 18 }} />}
              to="/report"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ToolCard
              title="Portfolio"
              description="Holdings & charts"
              icon={<ShowChartIcon sx={{ fontSize: 18 }} />}
              to="/portfolio"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
