import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';

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
        p: 4,
        height: '100%',
        border: '1px solid',
        borderColor: disabled ? 'grey.300' : 'grey.400',
        borderRadius: 0,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        '&:hover': disabled ? {} : {
          borderColor: 'grey.900',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {icon}
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Cheltenham", "Georgia", serif',
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontFamily: '"Georgia", serif',
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>
      {disabled && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 2,
            color: 'text.disabled',
            fontStyle: 'italic',
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container maxWidth="md" sx={{ flex: 1, py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Cheltenham", "Georgia", serif',
              fontSize: { xs: '3rem', md: '4.5rem' },
              fontWeight: 700,
              letterSpacing: '-0.03em',
              mb: 2,
            }}
          >
            Console
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Georgia", serif',
              fontWeight: 400,
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            Zack's personal tools
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ToolCard
              title="Report"
              description="Daily intelligence brief with AI-curated research papers, tech news, and market insights."
              icon={<ArticleIcon sx={{ fontSize: 28 }} />}
              to="/report"
            />
          </Grid>
          {/* Add more tools here as they're built */}
        </Grid>
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'grey.300',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontFamily: '"Georgia", serif',
          }}
        >
          Built with care
        </Typography>
      </Box>
    </Box>
  );
}
