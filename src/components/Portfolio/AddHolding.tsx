import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { tickerMappings } from '../../data/sectorMappings';

interface AddHoldingProps {
  onAdd: (ticker: string, shares: number) => void;
}

// Get all tickers for autocomplete
const tickerOptions = Object.entries(tickerMappings).map(([ticker, info]) => ({
  ticker,
  label: `${ticker} - ${info.name}`,
  name: info.name,
  sector: info.sector,
}));

export function AddHolding({ onAdd }: AddHoldingProps) {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedTicker = ticker.toUpperCase().trim();
    const sharesNum = parseFloat(shares);

    if (!normalizedTicker) {
      setError('Please enter a ticker symbol');
      return;
    }

    if (isNaN(sharesNum) || sharesNum <= 0) {
      setError('Please enter a valid number of shares');
      return;
    }

    onAdd(normalizedTicker, sharesNum);
    setTicker('');
    setShares('');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Add Holding
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-start' },
        }}
      >
        <Autocomplete
          freeSolo
          options={tickerOptions}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : option.ticker
          }
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <li key={key} {...otherProps}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {option.ticker}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.name} | {option.sector}
                  </Typography>
                </Box>
              </li>
            );
          }}
          inputValue={ticker}
          onInputChange={(_, newValue) => setTicker(newValue)}
          sx={{ flex: 2, minWidth: 200 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ticker Symbol"
              placeholder="e.g., AAPL, MSFT, VOO"
              size="small"
              error={!!error && !ticker}
            />
          )}
        />
        <TextField
          label="Shares"
          type="number"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 120 }}
          InputProps={{
            inputProps: { min: 0, step: 'any' },
            startAdornment: (
              <InputAdornment position="start">#</InputAdornment>
            ),
          }}
          error={!!error && !shares}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            minWidth: 100,
            height: 40,
          }}
        >
          Add
        </Button>
      </Box>
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Paper>
  );
}
