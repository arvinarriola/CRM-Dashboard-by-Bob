import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BarChartIcon from '@mui/icons-material/BarChart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToExcel } from '../../utils/excelParser';
import useStore from '../../store/useStore';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../types';

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function ExportTab() {
  const [includeFilters, setIncludeFilters] = useState({
    all: true,
    withComments: false,
    outdated: false,
    duplicates: false,
    contacted: false
  });

  const changeRequests = useStore((state) => state.changeRequests);
  const getStatistics = useStore((state) => state.getStatistics);
  const setSuccessMessage = useStore((state) => state.setSuccessMessage);
  const setError = useStore((state) => state.setError);

  const statistics = useMemo(() => getStatistics(), [changeRequests]);

  const getFilteredData = () => {
    if (includeFilters.all) {
      return changeRequests;
    }

    return changeRequests.filter(cr => {
      if (includeFilters.withComments && (!cr.comments || !cr.comments.trim())) {
        return false;
      }
      if (includeFilters.outdated && !cr.isOutdated) {
        return false;
      }
      if (includeFilters.duplicates && !cr.isDuplicate) {
        return false;
      }
      if (includeFilters.contacted && !cr.contacted) {
        return false;
      }
      return true;
    });
  };

  const handleExport = () => {
    const dataToExport = getFilteredData();
    
    if (dataToExport.length === 0) {
      setError('No data to export with current filters');
      return;
    }

    try {
      const filename = `change-requests-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      exportToExcel(dataToExport, filename);
      setSuccessMessage(`Successfully exported ${dataToExport.length} change requests`);
    } catch (error) {
      setError(`Export failed: ${error.message}`);
    }
  };

  const handleFilterChange = (filter) => {
    if (filter === 'all') {
      setIncludeFilters({
        all: true,
        withComments: false,
        outdated: false,
        duplicates: false,
        contacted: false
      });
    } else {
      setIncludeFilters({
        ...includeFilters,
        all: false,
        [filter]: !includeFilters[filter]
      });
    }
  };

  // Prepare chart data
  const statusData = Object.entries(statistics.statusCounts).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name]
  }));

  const priorityData = Object.entries(statistics.priorityCounts).map(([name, value]) => ({
    name,
    value,
    color: PRIORITY_COLORS[name]
  }));

  const categoryData = Object.entries(statistics.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const filteredCount = getFilteredData().length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        📊 Finalize & Export
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Summary Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Records
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {statistics.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e3f2fd' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Open Requests
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    {statistics.open}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Closed Requests
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#388e3c' }}>
                    {statistics.closed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fff3e0' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    With Comments
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#f57c00' }}>
                    {statistics.withComments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Data Visualizations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Priority Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 5 Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1976d2" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Export Configuration */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Export Configuration
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Filter Data to Export
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFilters.all}
                        onChange={() => handleFilterChange('all')}
                      />
                    }
                    label={`All Records (${changeRequests.length})`}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFilters.withComments}
                        onChange={() => handleFilterChange('withComments')}
                        disabled={includeFilters.all}
                      />
                    }
                    label={`Only With Comments (${statistics.withComments})`}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFilters.outdated}
                        onChange={() => handleFilterChange('outdated')}
                        disabled={includeFilters.all}
                      />
                    }
                    label={`Only Outdated (${statistics.outdated})`}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFilters.duplicates}
                        onChange={() => handleFilterChange('duplicates')}
                        disabled={includeFilters.all}
                      />
                    }
                    label={`Only Duplicates (${statistics.duplicates})`}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFilters.contacted}
                        onChange={() => handleFilterChange('contacted')}
                        disabled={includeFilters.all}
                      />
                    }
                    label={`Only Contacted (${statistics.contacted})`}
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Export Summary
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Records to export:</strong> {filteredCount}<br />
                    <strong>Format:</strong> Excel (.xlsx)<br />
                    <strong>Includes:</strong> All fields + Comments + Action Categories
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  disabled={filteredCount === 0}
                >
                  Export to Excel ({filteredCount} records)
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Key Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Insights
            </Typography>
            <Grid container spacing={2}>
              {statistics.outdated > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>{statistics.outdated}</strong> change request(s) are outdated and may require follow-up
                    </Typography>
                  </Alert>
                </Grid>
              )}
              {statistics.duplicates > 0 && (
                <Grid item xs={12}>
                  <Alert severity="error">
                    <Typography variant="body2">
                      <strong>{statistics.duplicates}</strong> duplicate change request(s) detected
                    </Typography>
                  </Alert>
                </Grid>
              )}
              {statistics.withComments > 0 && (
                <Grid item xs={12}>
                  <Alert severity="success">
                    <Typography variant="body2">
                      <strong>{statistics.withComments}</strong> change request(s) have been reviewed with comments
                    </Typography>
                  </Alert>
                </Grid>
              )}
              {statistics.contacted > 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>{statistics.contacted}</strong> change request owner(s) have been contacted
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Instructions */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Export Features
            </Typography>
            <Typography variant="body2">
              • Review summary statistics and data visualizations<br />
              • Filter data to export based on your criteria<br />
              • Export includes all original fields plus Comments and Action Categories<br />
              • Summary sheet with statistics is automatically generated<br />
              • Excel file is ready for submission as a report
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ExportTab;

// Made with Bob
