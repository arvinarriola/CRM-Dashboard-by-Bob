import React, { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Tabs, Tab, AppBar, Toolbar, Typography, Alert, Snackbar } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import useStore from './store/useStore';

// Import tab components
import DataImportTab from './components/DataImport/DataImportTab';
import CrossCheckTab from './components/CrossCheck/CrossCheckTab';
import EmailSearchTab from './components/EmailSearch/EmailSearchTab';
import ReviewTab from './components/Review/ReviewTab';
import EmailDraftTab from './components/EmailDraft/EmailDraftTab';
import ExportTab from './components/Export/ExportTab';
import OutlookAuth from './components/OutlookAuth/OutlookAuth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const currentTab = useStore((state) => state.currentTab);
  const setCurrentTab = useStore((state) => state.setCurrentTab);
  const initializeMockData = useStore((state) => state.initializeMockData);
  const error = useStore((state) => state.error);
  const successMessage = useStore((state) => state.successMessage);
  const clearMessages = useStore((state) => state.clearMessages);

  useEffect(() => {
    // Initialize with mock data on mount
    initializeMockData();
  }, [initializeMockData]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleCloseSnackbar = () => {
    clearMessages();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <AssessmentIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
              CRM Dashboard
            </Typography>
            <OutlookAuth />
          </Toolbar>
        </AppBar>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Container maxWidth="xl">
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="dashboard tabs"
            >
              <Tab label="📥 Data Import" />
              <Tab label="🔍 Cross-Check" />
              <Tab label="📧 Email Search" />
              <Tab label="✉️ Email Draft" />
              <Tab label="✏️ Review & Comment" />
              <Tab label="📊 Finalize & Export" />
            </Tabs>
          </Container>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
          <Container maxWidth="xl">
            <TabPanel value={currentTab} index={0}>
              <DataImportTab />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
              <CrossCheckTab />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
              <EmailSearchTab />
            </TabPanel>
            <TabPanel value={currentTab} index={3}>
              <EmailDraftTab />
            </TabPanel>
            <TabPanel value={currentTab} index={4}>
              <ReviewTab />
            </TabPanel>
            <TabPanel value={currentTab} index={5}>
              <ExportTab />
            </TabPanel>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              CRM Dashboard © 2024 | Demo Version with Mock Data
            </Typography>
          </Container>
        </Box>

        {/* Notifications */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;

// Made with Bob
