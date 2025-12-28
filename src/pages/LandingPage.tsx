import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  disabled?: boolean;
}

function ToolCard({ title, description, icon, to, disabled }: ToolCardProps) {
  const content = (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: disabled ? '#e0e0e0' : '#000',
        borderRadius: 0,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background-color 0.15s ease',
        '&:hover': disabled ? {} : {
          bgcolor: '#f5f5f5',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        {icon}
        <Typography
          variant="h6"
          sx={{
            fontFamily: SYSTEM_FONT,
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: '#666',
          fontFamily: SYSTEM_FONT,
          fontSize: '0.875rem',
          lineHeight: 1.5,
        }}
      >
        {description}
      </Typography>
      {disabled && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1.5,
            color: '#999',
            fontFamily: SYSTEM_FONT,
          }}
        >
          Coming soon
        </Typography>
      )}
    </Paper>
  );

  if (disabled) {
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
    <Box sx={{ minHeight: '100vh', py: 8 }}>
      <Container maxWidth="sm">
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: SYSTEM_FONT,
              fontSize: { xs: '2.5rem', md: '3rem' },
              fontWeight: 700,
              letterSpacing: '-0.03em',
              mb: 0.5,
            }}
          >
            Console
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: SYSTEM_FONT,
              color: '#666',
              fontSize: '1rem',
            }}
          >
            Personal tools
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ToolCard
              title="Daily Report"
              description="AI-curated research papers, tech news, and market insights."
              icon={<ArticleIcon sx={{ fontSize: 22 }} />}
              to="/report"
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
