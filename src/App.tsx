import { Box, Typography, Container } from '@mui/material'

function App() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          Console
        </Typography>
        <Typography variant="h4" component="h2" color="text.secondary">
          Zack's Console
        </Typography>
      </Box>
    </Container>
  )
}

export default App
