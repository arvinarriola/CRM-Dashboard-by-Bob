import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Collapse,
  Checkbox
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { parseExcelFile } from '../../utils/excelParser';
import useStore from '../../store/useStore';
import { format } from 'date-fns';

function DataImportTab() {
  const [serviceNowUrl, setServiceNowUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [serviceNowExpanded, setServiceNowExpanded] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [historicalFilesExpanded, setHistoricalFilesExpanded] = useState(false);
  
  const changeRequests = useStore((state) => state.changeRequests);
  const historicalFiles = useStore((state) => state.historicalFiles);
  const importChangeRequests = useStore((state) => state.importChangeRequests);
  const addHistoricalFile = useStore((state) => state.addHistoricalFile);
  const removeHistoricalFile = useStore((state) => state.removeHistoricalFile);
  const setSuccessMessage = useStore((state) => state.setSuccessMessage);
  const setError = useStore((state) => state.setError);
  const setLoading = useStore((state) => state.setLoading);

  const handleFileUpload = async (event, isPrimary = true) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await parseExcelFile(file);
      
      if (isPrimary) {
        importChangeRequests(data, true);
        setSuccessMessage(`Primary file imported: ${data.length} change requests loaded`);
      } else {
        addHistoricalFile(file.name, data);
        setSuccessMessage(`Historical file imported: ${data.length} records loaded`);
      }
      
      setUploadedFiles([...uploadedFiles, { name: file.name, type: isPrimary ? 'Primary' : 'Historical', count: data.length }]);
    } catch (error) {
      setError(`Failed to import file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceNowUrlSubmit = () => {
    if (!serviceNowUrl.trim()) {
      setError('Please enter a ServiceNow URL');
      return;
    }
    
    // Simulate parsing ServiceNow URL and loading mock data
    setSuccessMessage('ServiceNow data loaded successfully (using mock data for demo)');
    setServiceNowUrl('');
  };

  const handlePreview = () => {
    if (changeRequests.length === 0) {
      setError('No data to preview. Please import a file first.');
      return;
    }
    setPreviewData(changeRequests.slice(0, 10));
  };

  const handleClearPreview = () => {
    setPreviewData(null);
  };

  const handleSelectFile = (index) => {
    setSelectedFiles(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSelectAllFiles = (event) => {
    if (event.target.checked) {
      setSelectedFiles(historicalFiles.map((_, index) => index));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to delete');
      return;
    }
    
    // Sort in descending order to delete from end to start (to maintain correct indices)
    const sortedIndices = [...selectedFiles].sort((a, b) => b - a);
    sortedIndices.forEach(index => {
      removeHistoricalFile(index);
    });
    
    setSuccessMessage(`${selectedFiles.length} file(s) deleted successfully`);
    setSelectedFiles([]);
  };

  const statistics = {
    totalRecords: changeRequests.length,
    historicalFiles: historicalFiles.length,
    statuses: [...new Set(changeRequests.map(cr => cr.status))].length,
    priorities: [...new Set(changeRequests.map(cr => cr.priority))].length
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        📥 Data Import
      </Typography>

      <Grid container spacing={3}>
        {/* ServiceNow URL Input */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: serviceNowExpanded ? 2 : 0 }}>
              <Typography variant="h6">
                Import from ServiceNow
              </Typography>
              <IconButton
                onClick={() => setServiceNowExpanded(!serviceNowExpanded)}
                size="small"
              >
                {serviceNowExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={serviceNowExpanded}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter a ServiceNow filter URL to import change requests (Demo: uses mock data)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="https://instance.service-now.com/change_request_list.do?..."
                  value={serviceNowUrl}
                  onChange={(e) => setServiceNowUrl(e.target.value)}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleServiceNowUrlSubmit}
                  startIcon={<DataObjectIcon />}
                >
                  Load Data
                </Button>
              </Box>
            </Collapse>
          </Paper>
        </Grid>

        {/* File Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upload Primary File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload the main Excel file containing current change requests
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              size="large"
            >
              Select Primary Excel File
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, true)}
              />
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upload Historical Files
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload previous Excel files for comparison and cross-checking
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              size="large"
            >
              Select Historical Excel File
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, false)}
              />
            </Button>
          </Paper>
        </Grid>

        {/* Uploaded Historical Files List */}
        {historicalFiles.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">
                    Uploaded Historical Files ({historicalFiles.length})
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setHistoricalFilesExpanded(!historicalFilesExpanded)}
                  >
                    {historicalFilesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelected}
                  disabled={selectedFiles.length === 0}
                >
                  Delete Selected ({selectedFiles.length})
                </Button>
              </Box>
              <Collapse in={historicalFilesExpanded}>
                <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedFiles.length === historicalFiles.length && historicalFiles.length > 0}
                          indeterminate={selectedFiles.length > 0 && selectedFiles.length < historicalFiles.length}
                          onChange={handleSelectAllFiles}
                        />
                      </TableCell>
                      <TableCell>File Name</TableCell>
                      <TableCell align="right">Records</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historicalFiles.map((file, index) => (
                      <TableRow key={index} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedFiles.includes(index)}
                            onChange={() => handleSelectFile(index)}
                          />
                        </TableCell>
                        <TableCell>{file.name}</TableCell>
                        <TableCell align="right">
                          <Chip label={file.data.length} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Delete file">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                removeHistoricalFile(index);
                                setSuccessMessage(`File "${file.name}" deleted`);
                                setSelectedFiles(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </Collapse>
            </Paper>
          </Grid>
        )}

        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Records
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {statistics.totalRecords}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Historical Files
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {statistics.historicalFiles}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Unique Statuses
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {statistics.statuses}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Priority Levels
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {statistics.priorities}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Uploaded Files
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {uploadedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${file.count} records)`}
                    color={file.type === 'Primary' ? 'primary' : 'default'}
                    onDelete={() => {
                      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Data Preview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Data Preview
              </Typography>
              <Box>
                {previewData && (
                  <Button
                    onClick={handleClearPreview}
                    startIcon={<DeleteIcon />}
                    sx={{ mr: 1 }}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={handlePreview}
                  startIcon={<VisibilityIcon />}
                  disabled={changeRequests.length === 0}
                >
                  Preview Data
                </Button>
              </Box>
            </Box>

            {previewData ? (
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Change Number</TableCell>
                      <TableCell>Short Description</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.changeNumber}</TableCell>
                        <TableCell>{row.shortDescription}</TableCell>
                        <TableCell>{row.owner}</TableCell>
                        <TableCell>
                          <Chip label={row.status} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Chip label={row.priority} size="small" />
                        </TableCell>
                        <TableCell>
                          {format(new Date(row.createdDate), 'yyyy-MM-dd')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                Click "Preview Data" to view the first 10 records of imported data
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DataImportTab;

// Made with Bob
