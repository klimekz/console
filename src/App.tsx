import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LandingPage } from './pages/LandingPage';
import { ReportPage } from './pages/ReportPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#121212',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#121212',
      secondary: '#5a5a5a',
    },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h1: {
      fontFamily: '"Cheltenham", "Georgia", serif',
    },
    h2: {
      fontFamily: '"Cheltenham", "Georgia", serif',
    },
    h3: {
      fontFamily: '"Cheltenham", "Georgia", serif',
    },
    h4: {
      fontFamily: '"Cheltenham", "Georgia", serif',
    },
    h5: {
      fontFamily: '"Cheltenham", "Georgia", serif',
    },
    h6: {
      fontFamily: '"Cheltenham", "Georgia", serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fafafa',
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
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
