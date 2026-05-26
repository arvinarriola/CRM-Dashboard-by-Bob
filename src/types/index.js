/**
 * Type definitions for Change Manager Dashboard
 * Using JSDoc for type checking in JavaScript
 */

/**
 * @typedef {Object} ChangeRequest
 * @property {string} id - Unique identifier
 * @property {string} changeNumber - Change request number (e.g., CHG0012345)
 * @property {string} title - Title of the change request
 * @property {string} description - Detailed description
 * @property {string} owner - Owner name
 * @property {string} ownerEmail - Owner email address
 * @property {'Open'|'In Progress'|'Pending'|'Closed'|'Cancelled'} status - Current status
 * @property {'Critical'|'High'|'Medium'|'Low'} priority - Priority level
 * @property {string} category - Category of change
 * @property {Date} createdDate - Creation date
 * @property {Date} lastUpdated - Last update date
 * @property {Date} [plannedStartDate] - Planned start date
 * @property {Date} [plannedEndDate] - Planned end date
 * @property {string} [comments] - User comments
 * @property {'Cancel'|'Close'|'Future'|'Action Required'} [actionCategory] - Action category
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

export const STATUS_OPTIONS = ['Open', 'In Progress', 'Pending', 'Closed', 'Cancelled'];
export const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
export const ACTION_CATEGORIES = ['Cancel', 'Close', 'Future', 'Action Required'];

export const STATUS_COLORS = {
  'Open': '#2196F3',
  'In Progress': '#FF9800',
  'Pending': '#FFC107',
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
