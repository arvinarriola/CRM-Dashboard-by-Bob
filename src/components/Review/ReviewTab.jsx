import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CommentIcon from '@mui/icons-material/Comment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, ACTION_CATEGORIES, STATUS_COLORS, PRIORITY_COLORS } from '../../types';
import useStore from '../../store/useStore';
import { format } from 'date-fns';

function ReviewTab() {
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editActionCategory, setEditActionCategory] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState('');
  const [selectedChangeRequest, setSelectedChangeRequest] = useState(null);
  const [isEditingInDialog, setIsEditingInDialog] = useState(false);
  const [dialogEditComment, setDialogEditComment] = useState('');
  
  const changeRequests = useStore((state) => state.changeRequests);
  const filters = useStore((state) => state.filters);
  const updateFilters = useStore((state) => state.updateFilters);
  const resetFilters = useStore((state) => state.resetFilters);
  const updateChangeRequest = useStore((state) => state.updateChangeRequest);
  const getFilteredChangeRequests = useStore((state) => state.getFilteredChangeRequests);
  const getUniqueValues = useStore((state) => state.getUniqueValues);
  const setSuccessMessage = useStore((state) => state.setSuccessMessage);

  const filteredRequests = useMemo(() => getFilteredChangeRequests(), [changeRequests, filters]);
  const uniqueValues = useMemo(() => getUniqueValues(), [changeRequests]);

  const handleStartEdit = (cr) => {
    setEditingId(cr.id);
    setEditComment(cr.comments || '');
    setEditActionCategory(cr.actionCategory || '');
  };

  const handleSaveEdit = (id) => {
    updateChangeRequest(id, {
      comments: editComment,
      actionCategory: editActionCategory || null
    });
    setEditingId(null);
    setSuccessMessage('Changes saved successfully');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditComment('');
    setEditActionCategory('');
  };

  const handleFilterChange = (filterName, value) => {
    updateFilters({ [filterName]: value });
  };

  const handleClearFilters = () => {
    resetFilters();
    setSuccessMessage('Filters cleared');
  };

  const handleViewComment = (comment, changeRequest) => {
    setSelectedComment(comment || 'No comments');
    setSelectedChangeRequest(changeRequest);
    setDialogEditComment(comment || '');
    setIsEditingInDialog(false);
    setCommentDialogOpen(true);
  };

  const handleStartEditInDialog = () => {
    setIsEditingInDialog(true);
  };

  const handleSaveDialogEdit = () => {
    if (selectedChangeRequest) {
      updateChangeRequest(selectedChangeRequest.id, {
        comments: dialogEditComment
      });
      setSelectedComment(dialogEditComment);
      setIsEditingInDialog(false);
      setSuccessMessage('Comment updated successfully');
    }
  };

  const handleCancelDialogEdit = () => {
    setDialogEditComment(selectedComment);
    setIsEditingInDialog(false);
  };

  const activeFilterCount = 
    filters.status.length +
    filters.priority.length +
    filters.category.length +
    filters.owner.length +
    (filters.showOutdatedOnly ? 1 : 0) +
    (filters.showDuplicatesOnly ? 1 : 0) +
    (filters.hasComments !== undefined ? 1 : 0) +
    (filters.contacted !== undefined ? 1 : 0) +
    (filters.searchText ? 1 : 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        ✏️ Review & Comment
      </Typography>

      <Grid container spacing={3}>
        {/* Filter Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Filters {activeFilterCount > 0 && `(${activeFilterCount} active)`}
              </Typography>
              <Box>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={activeFilterCount === 0}
                  sx={{ mr: 1 }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={() => setFilterDialogOpen(true)}
                >
                  Advanced Filters
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by change number, title, or owner..."
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {filters.showOutdatedOnly && (
                    <Chip label="Outdated Only" onDelete={() => handleFilterChange('showOutdatedOnly', false)} color="warning" />
                  )}
                  {filters.showDuplicatesOnly && (
                    <Chip label="Duplicates Only" onDelete={() => handleFilterChange('showDuplicatesOnly', false)} color="error" />
                  )}
                  {filters.hasComments !== undefined && (
                    <Chip 
                      label={filters.hasComments ? "With Comments" : "Without Comments"} 
                      onDelete={() => handleFilterChange('hasComments', undefined)} 
                    />
                  )}
                  {filters.contacted !== undefined && (
                    <Chip 
                      label={filters.contacted ? "Contacted" : "Not Contacted"} 
                      onDelete={() => handleFilterChange('contacted', undefined)} 
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredRequests.length} of {changeRequests.length} change requests
              {filteredRequests.filter(cr => cr.comments && cr.comments.trim()).length > 0 && 
                ` • ${filteredRequests.filter(cr => cr.comments && cr.comments.trim()).length} with comments`}
            </Typography>
          </Paper>
        </Grid>

        {/* Data Table */}
        <Grid item xs={12}>
          <Paper>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Change Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Short Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Comments</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((cr) => (
                    <TableRow key={cr.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {cr.changeNumber}
                          {cr.isOutdated && (
                            <Chip label="Outdated" size="small" color="warning" sx={{ ml: 1 }} />
                          )}
                          {cr.isDuplicate && (
                            <Chip label="Duplicate" size="small" color="error" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Tooltip title={cr.shortDescription}>
                          <Typography variant="body2" noWrap>
                            {cr.shortDescription}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{cr.owner}</TableCell>
                      <TableCell>
                        <Chip 
                          label={cr.status} 
                          size="small"
                          sx={{ bgcolor: STATUS_COLORS[cr.status], color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={cr.priority} 
                          size="small"
                          sx={{ bgcolor: PRIORITY_COLORS[cr.priority], color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(cr.lastUpdated), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell>
                        {editingId === cr.id ? (
                          <FormControl size="small" fullWidth>
                            <Select
                              value={editActionCategory}
                              onChange={(e) => setEditActionCategory(e.target.value)}
                            >
                              <MenuItem value="">None</MenuItem>
                              {ACTION_CATEGORIES.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          cr.actionCategory ? (
                            <Chip label={cr.actionCategory} size="small" color="secondary" />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        {editingId === cr.id ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="Add comments..."
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" noWrap sx={{ flex: 1, maxWidth: 150 }}>
                              {cr.comments ? cr.comments.substring(0, 30) + (cr.comments.length > 30 ? '...' : '') : '-'}
                            </Typography>
                            {cr.comments && (
                              <Tooltip title="View full comment">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewComment(cr.comments, cr)}
                                  sx={{ p: 0.5 }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ width: 100 }}>
                        {editingId === cr.id ? (
                          <Box>
                            <Tooltip title="Save">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleSaveEdit(cr.id)}
                              >
                                <SaveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                onClick={handleCancelEdit}
                              >
                                <ClearIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleStartEdit(cr)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Advanced Filters Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {uniqueValues.statuses.map(status => (
                    <MenuItem key={status} value={status}>
                      <Checkbox checked={filters.status.includes(status)} />
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  multiple
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {uniqueValues.priorities.map(priority => (
                    <MenuItem key={priority} value={priority}>
                      <Checkbox checked={filters.priority.includes(priority)} />
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.showOutdatedOnly}
                    onChange={(e) => handleFilterChange('showOutdatedOnly', e.target.checked)}
                  />
                }
                label="Show outdated only"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.showDuplicatesOnly}
                    onChange={(e) => handleFilterChange('showDuplicatesOnly', e.target.checked)}
                  />
                }
                label="Show duplicates only"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Comments</InputLabel>
                <Select
                  value={filters.hasComments === undefined ? '' : filters.hasComments ? 'with' : 'without'}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleFilterChange('hasComments', val === '' ? undefined : val === 'with');
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="with">With Comments</MenuItem>
                  <MenuItem value="without">Without Comments</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Comment View Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Comment Details</DialogTitle>
        <DialogContent>
          {isEditingInDialog ? (
            <TextField
              fullWidth
              multiline
              rows={8}
              value={dialogEditComment}
              onChange={(e) => setDialogEditComment(e.target.value)}
              placeholder="Add your comments here..."
              sx={{ mt: 2 }}
            />
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
              {selectedComment}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {isEditingInDialog ? (
            <>
              <Button onClick={handleCancelDialogEdit}>Cancel</Button>
              <Button onClick={handleSaveDialogEdit} variant="contained" startIcon={<SaveIcon />}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleStartEditInDialog} startIcon={<EditIcon />} variant="contained">
                Edit
              </Button>
              <Button onClick={() => setCommentDialogOpen(false)}>Close</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReviewTab;

// Made with Bob
