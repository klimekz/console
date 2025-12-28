import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LandingPage } from './pages/LandingPage';
import { ReportPage } from './pages/ReportPage';
import { PortfolioPage } from './pages/PortfolioPage';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#121212',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: '#121212',
      secondary: '#666',
    },
  },
  typography: {
    fontFamily: SYSTEM_FONT,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fff',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
