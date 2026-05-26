import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import PreviewIcon from '@mui/icons-material/Preview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useStore from '../../store/useStore';
import { format } from 'date-fns';

function EmailDraftTab() {
  const [selectedCRs, setSelectedCRs] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  
  const changeRequests = useStore((state) => state.changeRequests);
  const emailTemplates = useStore((state) => state.emailTemplates);
  const bulkMarkAsContacted = useStore((state) => state.bulkMarkAsContacted);
  const setSuccessMessage = useStore((state) => state.setSuccessMessage);
  const setError = useStore((state) => state.setError);

  // Filter to show only non-closed/cancelled requests
  const availableRequests = useMemo(() => 
    changeRequests.filter(cr => cr.status !== 'Closed' && cr.status !== 'Cancelled'),
    [changeRequests]
  );

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCRs(availableRequests.map(cr => cr.id));
    } else {
      setSelectedCRs([]);
    }
  };

  const handleSelectCR = (id) => {
    setSelectedCRs(prev => 
      prev.includes(id) ? prev.filter(crId => crId !== id) : [...prev, id]
    );
  };

  const generateEmail = (cr, template) => {
    if (!template) return null;

    const subject = template.subject
      .replace('[CHANGE_NUMBER]', cr.changeNumber)
      .replace('[TITLE]', cr.title);

    const body = template.body
      .replace(/\[CHANGE_NUMBER\]/g, cr.changeNumber)
      .replace(/\[TITLE\]/g, cr.title)
      .replace(/\[OWNER_NAME\]/g, cr.owner)
      .replace(/\[LAST_UPDATED\]/g, format(new Date(cr.lastUpdated), 'MMMM dd, yyyy'));

    return {
      to: cr.ownerEmail,
      subject,
      body,
      changeRequest: cr
    };
  };

  const handlePreview = () => {
    if (selectedCRs.length === 0) {
      setError('Please select at least one change request');
      return;
    }

    if (!selectedTemplate && !customSubject) {
      setError('Please select a template or enter custom email details');
      return;
    }

    const cr = changeRequests.find(c => c.id === selectedCRs[0]);
    let email;

    if (selectedTemplate) {
      const template = emailTemplates.find(t => t.id === selectedTemplate);
      email = generateEmail(cr, template);
    } else {
      email = {
        to: cr.ownerEmail,
        subject: customSubject,
        body: customBody,
        changeRequest: cr
      };
    }

    setPreviewEmail(email);
    setPreviewDialogOpen(true);
  };

  const handleSendEmails = () => {
    if (selectedCRs.length === 0) {
      setError('Please select at least one change request');
      return;
    }

    // Simulate sending emails
    bulkMarkAsContacted(selectedCRs);
    setSuccessMessage(`${selectedCRs.length} email(s) sent successfully (simulated)`);
    setSelectedCRs([]);
    setSelectedTemplate('');
    setCustomSubject('');
    setCustomBody('');
  };

  const selectedCount = selectedCRs.length;
  const contactedCount = availableRequests.filter(cr => cr.contacted).length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        ✉️ Email Draft
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Available Requests
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {availableRequests.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Selected for Email
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {selectedCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Already Contacted
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {contactedCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Email Template Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Email Template
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Template</InputLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      setCustomSubject('');
                      setCustomBody('');
                    }}
                  >
                    <MenuItem value="">None (Custom Email)</MenuItem>
                    {emailTemplates.map(template => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={handlePreview}
                    disabled={selectedCount === 0}
                    fullWidth
                  >
                    Preview Email
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSendEmails}
                    disabled={selectedCount === 0}
                    fullWidth
                  >
                    Send {selectedCount > 0 && `(${selectedCount})`}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {!selectedTemplate && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Custom Email
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Enter email subject..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Body"
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      placeholder="Enter email body..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Change Requests Selection */}
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Select Change Requests ({selectedCount} selected)
              </Typography>
              <Checkbox
                checked={selectedCount === availableRequests.length && availableRequests.length > 0}
                indeterminate={selectedCount > 0 && selectedCount < availableRequests.length}
                onChange={handleSelectAll}
              />
            </Box>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Select</TableCell>
                    <TableCell>Change Number</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Contacted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableRequests.map((cr) => (
                    <TableRow key={cr.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedCRs.includes(cr.id)}
                          onChange={() => handleSelectCR(cr.id)}
                        />
                      </TableCell>
                      <TableCell>{cr.changeNumber}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap>
                          {cr.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{cr.owner}</TableCell>
                      <TableCell>{cr.ownerEmail}</TableCell>
                      <TableCell>
                        <Chip label={cr.status} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        {format(new Date(cr.lastUpdated), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell>
                        {cr.contacted ? (
                          <Chip 
                            icon={<CheckCircleIcon />}
                            label="Yes" 
                            size="small" 
                            color="success" 
                          />
                        ) : (
                          <Chip label="No" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Instructions */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              How to Use Email Draft
            </Typography>
            <Typography variant="body2">
              • Select change requests that need owner contact<br />
              • Choose a pre-defined template or write a custom email<br />
              • Preview the email before sending<br />
              • Send emails (simulated in demo) and track contacted status<br />
              • Templates automatically fill in change request details
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Email Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Email Preview</DialogTitle>
        <DialogContent>
          {previewEmail && (
            <Box>
              <TextField
                fullWidth
                label="To"
                value={previewEmail.to}
                InputProps={{ readOnly: true }}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="Subject"
                value={previewEmail.subject}
                InputProps={{ readOnly: true }}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="Body"
                value={previewEmail.body}
                InputProps={{ readOnly: true }}
                margin="normal"
                multiline
                rows={12}
              />
              <Alert severity="info" sx={{ mt: 2 }}>
                This email will be sent to {selectedCount} recipient(s)
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<SendIcon />} onClick={() => {
            setPreviewDialogOpen(false);
            handleSendEmails();
          }}>
            Send Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmailDraftTab;

// Made with Bob
