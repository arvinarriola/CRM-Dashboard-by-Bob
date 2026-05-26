import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { compareChangeRequests, identifyOutdatedRequests } from '../../utils/comparisonEngine';
import useStore from '../../store/useStore';
import { format } from 'date-fns';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../types';

function CrossCheckTab() {
  const [comparing, setComparing] = useState(false);
  const [comparisonDone, setComparisonDone] = useState(false);
  const [selectedHistoricalFileIndex, setSelectedHistoricalFileIndex] = useState(0);
  
  const changeRequests = useStore((state) => state.changeRequests);
  const historicalFiles = useStore((state) => state.historicalFiles);
  const comparisonResults = useStore((state) => state.comparisonResults);
  const setComparisonResults = useStore((state) => state.setComparisonResults);
  const updateChangeRequest = useStore((state) => state.updateChangeRequest);
  const setSuccessMessage = useStore((state) => state.setSuccessMessage);
  const setError = useStore((state) => state.setError);

  const handleRunComparison = () => {
    if (changeRequests.length === 0) {
      setError('No primary data to compare. Please import data first.');
      return;
    }

    if (historicalFiles.length === 0) {
      setError('No historical files to compare against. Please upload historical files.');
      return;
    }

    setComparing(true);
    
    // Simulate processing time
    setTimeout(() => {
      const historicalData = historicalFiles[selectedHistoricalFileIndex].data;
      const results = compareChangeRequests(changeRequests, historicalData);
      
      // Transfer comments from historical data
      results.commentsToTransfer.forEach(item => {
        updateChangeRequest(item.id, {
          comments: item.comments,
          actionCategory: item.actionCategory
        });
      });
      
      // Mark outdated items in the store
      results.outdated.forEach(outdated => {
        updateChangeRequest(outdated.id, { isOutdated: true });
      });
      
      // Mark duplicates in the store
      results.duplicates.forEach(dup => {
        updateChangeRequest(dup.changeRequest.id, { isDuplicate: true });
      });
      
      setComparisonResults(results);
      setComparisonDone(true);
      setComparing(false);
      
      const transferredCount = results.commentsToTransfer.length;
      const message = transferredCount > 0
        ? `Cross-check completed: ${transferredCount} comment(s) transferred from historical data`
        : 'Cross-check comparison completed successfully';
      setSuccessMessage(message);
    }, 1500);
  };

  const getSeverityColor = (type) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🔍 Cross-Check Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Control Panel */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comparison Settings
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Compare primary data ({changeRequests.length} records) against historical files
                </Typography>
                {historicalFiles.length > 0 && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Select Historical File</InputLabel>
                    <Select
                      value={selectedHistoricalFileIndex}
                      onChange={(e) => setSelectedHistoricalFileIndex(e.target.value)}
                      label="Select Historical File"
                    >
                      {historicalFiles.map((file, index) => (
                        <MenuItem key={index} value={index}>
                          {file.name} ({file.data.length} records)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CompareArrowsIcon />}
                  onClick={handleRunComparison}
                  disabled={comparing || changeRequests.length === 0 || historicalFiles.length === 0}
                >
                  {comparing ? 'Comparing...' : 'Run Comparison'}
                </Button>
              </Grid>
            </Grid>
            {comparing && <LinearProgress sx={{ mt: 2 }} />}
          </Paper>
        </Grid>

        {/* Results Summary */}
        {comparisonDone && comparisonResults && (
          <>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#fff3e0' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WarningIcon sx={{ color: '#f57c00', mr: 1 }} />
                        <Typography color="text.secondary">
                          Duplicates Found
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#f57c00' }}>
                        {comparisonResults.duplicates.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#ffebee' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ErrorIcon sx={{ color: '#d32f2f', mr: 1 }} />
                        <Typography color="text.secondary">
                          Outdated Requests
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                        {comparisonResults.outdated.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#e3f2fd' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <InfoIcon sx={{ color: '#1976d2', mr: 1 }} />
                        <Typography color="text.secondary">
                          Status Changes
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {comparisonResults.statusChanged.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#e8f5e9' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <InfoIcon sx={{ color: '#388e3c', mr: 1 }} />
                        <Typography color="text.secondary">
                          New Requests
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#388e3c' }}>
                        {comparisonResults.newRequests.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Recommendations */}
            {comparisonResults.duplicates.length > 0 || comparisonResults.outdated.length > 0 ? (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Action Required
                  </Typography>
                  <Typography variant="body2">
                    {comparisonResults.duplicates.length > 0 && 
                      `${comparisonResults.duplicates.length} duplicate(s) need review. `}
                    {comparisonResults.outdated.length > 0 && 
                      `${comparisonResults.outdated.length} outdated request(s) require follow-up.`}
                  </Typography>
                </Alert>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Alert severity="success">
                  No critical issues found. All change requests are up to date.
                </Alert>
              </Grid>
            )}

            {/* Duplicates Section */}
            {comparisonResults.duplicates.length > 0 && (
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Duplicate Change Requests ({comparisonResults.duplicates.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Change Number</TableCell>
                            <TableCell>Short Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Owner</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {comparisonResults.duplicates.map((dup, index) => (
                            <TableRow key={index} hover>
                              <TableCell>{dup.changeRequest.changeNumber}</TableCell>
                              <TableCell>{dup.changeRequest.title}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={dup.changeRequest.status} 
                                  size="small"
                                  sx={{ bgcolor: STATUS_COLORS[dup.changeRequest.status], color: 'white' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={dup.changeRequest.priority} 
                                  size="small"
                                  sx={{ bgcolor: PRIORITY_COLORS[dup.changeRequest.priority], color: 'white' }}
                                />
                              </TableCell>
                              <TableCell>{dup.changeRequest.owner}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}

            {/* Outdated Section */}
            {comparisonResults.outdated.length > 0 && (
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Outdated Change Requests ({comparisonResults.outdated.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Change Number</TableCell>
                            <TableCell>Short Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Last Updated</TableCell>
                            <TableCell>Days Since Update</TableCell>
                            <TableCell>Owner</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {comparisonResults.outdated.map((outdated, index) => (
                            <TableRow key={index} hover>
                              <TableCell>{outdated.changeNumber}</TableCell>
                              <TableCell>{outdated.title}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={outdated.status} 
                                  size="small"
                                  sx={{ bgcolor: STATUS_COLORS[outdated.status], color: 'white' }}
                                />
                              </TableCell>
                              <TableCell>
                                {format(new Date(outdated.lastUpdated), 'yyyy-MM-dd')}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={`${outdated.daysSinceUpdate} days`}
                                  size="small"
                                  color="error"
                                />
                              </TableCell>
                              <TableCell>{outdated.owner}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}

            {/* Status Changes Section */}
            {comparisonResults.statusChanged.length > 0 && (
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Status Changes ({comparisonResults.statusChanged.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Change Number</TableCell>
                            <TableCell>Short Description</TableCell>
                            <TableCell>Old Status</TableCell>
                            <TableCell>New Status</TableCell>
                            <TableCell>Owner</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {comparisonResults.statusChanged.map((change, index) => (
                            <TableRow key={index} hover>
                              <TableCell>{change.changeRequest.changeNumber}</TableCell>
                              <TableCell>{change.changeRequest.title}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={change.oldStatus} 
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={change.newStatus} 
                                  size="small"
                                  sx={{ bgcolor: STATUS_COLORS[change.newStatus], color: 'white' }}
                                />
                              </TableCell>
                              <TableCell>{change.changeRequest.owner}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
          </>
        )}

        {/* No Results Message */}
        {!comparisonDone && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CompareArrowsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No comparison results yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Run Comparison" to analyze your data
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default CrossCheckTab;

// Made with Bob
