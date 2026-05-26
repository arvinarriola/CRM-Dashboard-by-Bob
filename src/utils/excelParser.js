import * as XLSX from 'xlsx';

/**
 * Parse Excel file and extract change request data
 * @param {File} file - Excel file to parse
 * @returns {Promise<Array>} Array of change requests
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });
        
        // Transform to our data structure
        const changeRequests = jsonData.map((row, index) => {
          return normalizeChangeRequest(row, index);
        });
        
        resolve(changeRequests);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Normalize change request data from Excel row
 * @param {Object} row - Excel row data
 * @param {number} index - Row index
 * @returns {Object} Normalized change request
 */
function normalizeChangeRequest(row, index) {
  // Map common column names to our structure
  const columnMappings = {
    changeNumber: ['Change Number', 'Number', 'CR Number', 'Change ID', 'changeNumber'],
    title: ['Title', 'Short Description', 'Summary', 'Description', 'title'],
    owner: ['Owner', 'Assigned To', 'Assignee', 'owner'],
    ownerEmail: ['Owner Email', 'Email', 'Assignee Email', 'ownerEmail'],
    status: ['Status', 'State', 'status'],
    priority: ['Priority', 'priority'],
    category: ['Category', 'Type', 'Change Type', 'category'],
    createdDate: ['Created', 'Created Date', 'Creation Date', 'createdDate'],
    lastUpdated: ['Updated', 'Last Updated', 'Modified', 'lastUpdated'],
    description: ['Description', 'Long Description', 'Details', 'description'],
    plannedStartDate: ['Planned Start', 'Start Date', 'plannedStartDate'],
    plannedEndDate: ['Planned End', 'End Date', 'plannedEndDate'],
    comments: ['Comments', 'Notes', 'Remarks', 'comments']
  };
  
  const normalized = {
    id: `imported-${index}`,
    changeNumber: findValue(row, columnMappings.changeNumber) || `CHG${String(index).padStart(7, '0')}`,
    title: findValue(row, columnMappings.title) || 'Untitled Change Request',
    description: findValue(row, columnMappings.description) || '',
    owner: findValue(row, columnMappings.owner) || 'Unknown',
    ownerEmail: findValue(row, columnMappings.ownerEmail) || 'unknown@company.com',
    status: normalizeStatus(findValue(row, columnMappings.status)),
    priority: normalizePriority(findValue(row, columnMappings.priority)),
    category: findValue(row, columnMappings.category) || 'General',
    createdDate: parseDate(findValue(row, columnMappings.createdDate)),
    lastUpdated: parseDate(findValue(row, columnMappings.lastUpdated)),
    plannedStartDate: parseDate(findValue(row, columnMappings.plannedStartDate)),
    plannedEndDate: parseDate(findValue(row, columnMappings.plannedEndDate)),
    comments: findValue(row, columnMappings.comments) || '',
    actionCategory: null,
    isDuplicate: false,
    isOutdated: false,
    emailActivity: [],
    contacted: false,
    contactedDate: null
  };
  
  return normalized;
}

/**
 * Find value from row using multiple possible column names
 * @param {Object} row - Excel row
 * @param {Array} possibleNames - Possible column names
 * @returns {*} Found value or null
 */
function findValue(row, possibleNames) {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return null;
}

/**
 * Normalize status value
 * @param {string} status - Raw status value
 * @returns {string} Normalized status
 */
function normalizeStatus(status) {
  if (!status) return 'Open';
  
  const statusMap = {
    'open': 'Open',
    'new': 'Open',
    'in progress': 'In Progress',
    'inprogress': 'In Progress',
    'work in progress': 'In Progress',
    'pending': 'Pending',
    'waiting': 'Pending',
    'closed': 'Closed',
    'complete': 'Closed',
    'completed': 'Closed',
    'cancelled': 'Cancelled',
    'canceled': 'Cancelled'
  };
  
  const normalized = statusMap[status.toLowerCase()];
  return normalized || 'Open';
}

/**
 * Normalize priority value
 * @param {string} priority - Raw priority value
 * @returns {string} Normalized priority
 */
function normalizePriority(priority) {
  if (!priority) return 'Medium';
  
  const priorityMap = {
    '1': 'Critical',
    '2': 'High',
    '3': 'Medium',
    '4': 'Low',
    'critical': 'Critical',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    'urgent': 'Critical',
    'normal': 'Medium'
  };
  
  const normalized = priorityMap[priority.toLowerCase()];
  return normalized || 'Medium';
}

/**
 * Parse date string to Date object
 * @param {string} dateStr - Date string
 * @returns {Date} Parsed date or current date
 */
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  } catch {
    return new Date();
  }
}

/**
 * Export change requests to Excel file
 * @param {Array} changeRequests - Array of change requests
 * @param {string} filename - Output filename
 */
export function exportToExcel(changeRequests, filename = 'change-requests-export.xlsx') {
  // Transform data for export
  const exportData = changeRequests.map(cr => ({
    'Change Number': cr.changeNumber,
    'Title': cr.title,
    'Description': cr.description,
    'Owner': cr.owner,
    'Owner Email': cr.ownerEmail,
    'Status': cr.status,
    'Priority': cr.priority,
    'Category': cr.category,
    'Created Date': formatDate(cr.createdDate),
    'Last Updated': formatDate(cr.lastUpdated),
    'Planned Start': cr.plannedStartDate ? formatDate(cr.plannedStartDate) : '',
    'Planned End': cr.plannedEndDate ? formatDate(cr.plannedEndDate) : '',
    'Comments': cr.comments || '',
    'Action Category': cr.actionCategory || '',
    'Is Duplicate': cr.isDuplicate ? 'Yes' : 'No',
    'Is Outdated': cr.isOutdated ? 'Yes' : 'No',
    'Email Activity Count': cr.emailActivity ? cr.emailActivity.length : 0,
    'Contacted': cr.contacted ? 'Yes' : 'No',
    'Contacted Date': cr.contactedDate ? formatDate(cr.contactedDate) : ''
  }));
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Set column widths
  const colWidths = [
    { wch: 15 }, // Change Number
    { wch: 40 }, // Title
    { wch: 50 }, // Description
    { wch: 20 }, // Owner
    { wch: 30 }, // Owner Email
    { wch: 12 }, // Status
    { wch: 10 }, // Priority
    { wch: 15 }, // Category
    { wch: 12 }, // Created Date
    { wch: 12 }, // Last Updated
    { wch: 12 }, // Planned Start
    { wch: 12 }, // Planned End
    { wch: 50 }, // Comments
    { wch: 15 }, // Action Category
    { wch: 12 }, // Is Duplicate
    { wch: 12 }, // Is Outdated
    { wch: 18 }, // Email Activity Count
    { wch: 10 }, // Contacted
    { wch: 15 }  // Contacted Date
  ];
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Change Requests');
  
  // Generate summary sheet
  const summary = generateSummarySheet(changeRequests);
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  
  // Write file
  XLSX.writeFile(wb, filename);
}

/**
 * Generate summary statistics for export
 * @param {Array} changeRequests - Array of change requests
 * @returns {Array} Summary data
 */
function generateSummarySheet(changeRequests) {
  const statusCounts = {};
  const priorityCounts = {};
  const categoryCounts = {};
  
  changeRequests.forEach(cr => {
    statusCounts[cr.status] = (statusCounts[cr.status] || 0) + 1;
    priorityCounts[cr.priority] = (priorityCounts[cr.priority] || 0) + 1;
    categoryCounts[cr.category] = (categoryCounts[cr.category] || 0) + 1;
  });
  
  const summary = [
    { Metric: 'Total Change Requests', Value: changeRequests.length },
    { Metric: '', Value: '' },
    { Metric: 'By Status', Value: '' },
    ...Object.entries(statusCounts).map(([status, count]) => ({
      Metric: `  ${status}`,
      Value: count
    })),
    { Metric: '', Value: '' },
    { Metric: 'By Priority', Value: '' },
    ...Object.entries(priorityCounts).map(([priority, count]) => ({
      Metric: `  ${priority}`,
      Value: count
    })),
    { Metric: '', Value: '' },
    { Metric: 'Flags', Value: '' },
    { Metric: '  Duplicates', Value: changeRequests.filter(cr => cr.isDuplicate).length },
    { Metric: '  Outdated', Value: changeRequests.filter(cr => cr.isOutdated).length },
    { Metric: '  Contacted', Value: changeRequests.filter(cr => cr.contacted).length }
  ];
  
  return summary;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Validate Excel file structure
 * @param {Array} data - Parsed Excel data
 * @returns {Object} Validation result
 */
export function validateExcelData(data) {
  const errors = [];
  const warnings = [];
  
  if (!data || data.length === 0) {
    errors.push('File is empty or contains no data');
    return { valid: false, errors, warnings };
  }
  
  // Check for required columns
  const firstRow = data[0];
  const hasChangeNumber = Object.keys(firstRow).some(key => 
    key.toLowerCase().includes('change') || key.toLowerCase().includes('number')
  );
  
  if (!hasChangeNumber) {
    warnings.push('No change number column detected. Auto-generating numbers.');
  }
  
  // Check for common issues
  const emptyRows = data.filter(row => 
    Object.values(row).every(val => !val || val === '')
  ).length;
  
  if (emptyRows > 0) {
    warnings.push(`${emptyRows} empty rows will be skipped`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    rowCount: data.length,
    columnCount: Object.keys(firstRow).length
  };
}

// Made with Bob
