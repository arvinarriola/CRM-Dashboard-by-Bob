import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { bulkSearchEmails, getEmailStatistics } from '../../utils/emailMatcher';
import useStore from '../../store/useStore';
import { format } from 'date-fns';

function EmailSearchTab() {
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCR, setSelectedCR] = useState(null);
  
  const changeRequests = useStore((state) => state.changeRequests);
  const allEmails = useStore((state) => state.allEmails);
  const emailSearchResults = useStore((state) => state.emailSearchResults);
  const setEmailSearchResults = useStore((state) => state.setEmailSearchResults);
  const updateChangeRequest = useStore((state) => state.updateChangeRequest);
  const setSuccessMessage = useStore((state) => state.setSuccessMessage);
  const setError = useStore((state) => state.setError);

  const handleBulkSearch = () => {
    if (changeRequests.length === 0) {
      setError('No change requests to search. Please import data first.');
      return;
    }

    setSearching(true);
    
    // Simulate search processing
    setTimeout(() => {
      const results = bulkSearchEmails(changeRequests, allEmails);
      setEmailSearchResults(results);
      setSearching(false);
      setSuccessMessage(`Email search completed for ${changeRequests.length} change requests`);
    }, 1500);
  };

  const handleSearchSpecific = () => {
    if (!searchTerm.trim()) {
      setError('Please enter a change request number to search');
      return;
    }

    const cr = changeRequests.find(c => 
      c.changeNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!cr) {
      setError('Change request not found');
      return;
    }

    setSelectedCR(cr);
    const results = bulkSearchEmails([cr], allEmails);
    setEmailSearchResults({ ...emailSearchResults, ...results });
    setSuccessMessage(`Found ${results[cr.changeNumber]?.emails.length || 0} emails for ${cr.changeNumber}`);
  };

  const handleAddObservation = (changeNumber) => {
    const result = emailSearchResults[changeNumber];
    if (!result) return;

    const cr = changeRequests.find(c => c.changeNumber === changeNumber);
    if (!cr) return;

    updateChangeRequest(cr.id, {
      comments: result.observation
    });

    setSuccessMessage(`Observation added to ${changeNumber}`);
  };

  const emailStats = getEmailStatistics(allEmails);
  const searchResultsCount = Object.keys(emailSearchResults).length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        📧 Email Search
      </Typography>

      <Grid container spacing={3}>
        {/* Search Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Search Specific Change Request
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Enter change request number (e.g., CHG0012345)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSpecific()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearchSpecific}
                    startIcon={<SearchIcon />}
                  >
                    Search
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Bulk Email Search
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<EmailIcon />}
                  onClick={handleBulkSearch}
                  disabled={searching || changeRequests.length === 0}
                >
                  {searching ? 'Searching...' : `Search All ${changeRequests.length} Change Requests`}
                </Button>
              </Grid>
            </Grid>
            {searching && <LinearProgress sx={{ mt: 2 }} />}
          </Paper>
        </Grid>

        {/* Email Statistics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Emails
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {emailStats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    With Attachments
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {emailStats.withAttachments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Unique Senders
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {emailStats.uniqueSenders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    CRs Searched
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {searchResultsCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Search Results */}
        {searchResultsCount > 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Search Results ({searchResultsCount} Change Requests)
              </Typography>
              
              {Object.entries(emailSearchResults).map(([changeNumber, result]) => {
                const cr = changeRequests.find(c => c.changeNumber === changeNumber);
                if (!cr) return null;

                return (
                  <Accordion key={changeNumber} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {changeNumber}
                        </Typography>
                        <Typography sx={{ flexGrow: 1, color: 'text.secondary' }}>
                          {cr.title}
                        </Typography>
                        <Chip 
                          label={`${result.emails.length} emails`}
                          size="small"
                          color={result.emails.length > 0 ? 'primary' : 'default'}
                        />
                        {result.summary.hasAttachments && (
                          <AttachFileIcon fontSize="small" color="action" />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Alert 
                          severity={result.summary.daysSinceLastEmail > 30 ? 'warning' : 'info'}
                          action={
                            <Tooltip title="Add observation to comments">
                              <IconButton
                                size="small"
                                onClick={() => handleAddObservation(changeNumber)}
                              >
                                <AddCommentIcon />
                              </IconButton>
                            </Tooltip>
                          }
                        >
                          <Typography variant="body2">
                            {result.observation}
                          </Typography>
                        </Alert>
                      </Box>

                      {result.emails.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>From</TableCell>
                                <TableCell>To</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Preview</TableCell>
                                <TableCell align="center">Attachment</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {result.emails.map((email) => (
                                <TableRow key={email.id} hover>
                                  <TableCell>
                                    {format(new Date(email.date), 'yyyy-MM-dd HH:mm')}
                                  </TableCell>
                                  <TableCell>{email.from}</TableCell>
                                  <TableCell>{email.to}</TableCell>
                                  <TableCell>{email.subject}</TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                      {email.snippet}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    {email.hasAttachment && (
                                      <AttachFileIcon fontSize="small" color="action" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="warning">
                          No email activity found for this change request
                        </Alert>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Paper>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EmailIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No search results yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search for specific change requests or run a bulk search to find related emails
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Instructions */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              How Email Search Works
            </Typography>
            <Typography variant="body2">
              • Search individual change requests by number or run bulk search for all records<br />
              • System searches mock Outlook emails for matching change request numbers<br />
              • View email threads, dates, and activity patterns<br />
              • Automatically generate observations based on email activity<br />
              • Add observations directly to change request comments for reporting
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EmailSearchTab;

// Made with Bob
