/**
 * Type definitions for Change Manager Dashboard
 * Using JSDoc for type checking in JavaScript
 */

/**
 * @typedef {Object} ChangeRequest
 * @property {string} id - Unique identifier
 * @property {string} changeNumber - Change request number (e.g., CHG0012345)
 * @property {string} shortDescription - Short description of the change request
 * @property {string} description - Detailed description
 * @property {string} owner - Owner name
 * @property {string} ownerEmail - Owner email address
 * @property {'New'|'Assess'|'Authorize'|'Scheduled'|'Implement'|'Review'|'Closed'|'Cancelled'} status - Current status
 * @property {'Critical'|'High'|'Medium'|'Low'} priority - Priority level
 * @property {string} category - Category of change
 * @property {Date} createdDate - Creation date
 * @property {Date} lastUpdated - Last update date
 * @property {Date} [plannedStartDate] - Planned start date
 * @property {Date} [plannedEndDate] - Planned end date
 * @property {string} [comments] - User comments
 * @property {'Closure Confirmation'|'Pending Update'|'Action Required'|'Closed'|'Cancelled'} [actionCategory] - Action category
 * @property {boolean} [isDuplicate] - Duplicate flag
 * @property {boolean} [isOutdated] - Outdated flag
 * @property {EmailThread[]} [emailActivity] - Related email threads
 * @property {boolean} [contacted] - Whether owner has been contacted
 * @property {Date} [contactedDate] - Date when contacted
 */

/**
 * @typedef {Object} EmailThread
 * @property {string} id - Unique identifier
 * @property {string} changeNumber - Related change request number
 * @property {Date} date - Email date
 * @property {string} from - Sender email
 * @property {string} to - Recipient email
 * @property {string} subject - Email subject
 * @property {string} snippet - Email preview text
 * @property {boolean} hasAttachment - Whether email has attachments
 */

/**
 * @typedef {Object} EmailTemplate
 * @property {string} id - Template identifier
 * @property {string} name - Template name
 * @property {string} subject - Email subject template
 * @property {string} body - Email body template
 */

/**
 * @typedef {Object} ComparisonResult
 * @property {ChangeRequest[]} duplicates - Duplicate change requests
 * @property {ChangeRequest[]} outdated - Outdated change requests
 * @property {ChangeRequest[]} statusChanged - Status changed requests
 * @property {Object} statistics - Comparison statistics
 */

// Status options for both standard and normal change requests
export const STATUS_OPTIONS = ['New', 'Assess', 'Authorize', 'Scheduled', 'Implement', 'Review', 'Closed', 'Cancelled'];
export const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
export const ACTION_CATEGORIES = ['Closure Confirmation', 'Pending Update', 'Action Required', 'Closed', 'Cancelled'];

export const STATUS_COLORS = {
  'New': '#2196F3',
  'Assess': '#9C27B0',
  'Authorize': '#3F51B5',
  'Scheduled': '#00BCD4',
  'Implement': '#FF9800',
  'Review': '#FFC107',
  'Closed': '#4CAF50',
  'Cancelled': '#9E9E9E'
};

export const PRIORITY_COLORS = {
  'Critical': '#F44336',
  'High': '#FF5722',
  'Medium': '#FF9800',
  'Low': '#4CAF50'
};

// Made with Bob
