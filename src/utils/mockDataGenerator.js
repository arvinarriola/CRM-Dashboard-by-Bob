import { format, subDays, subMonths } from 'date-fns';

/**
 * Generate mock change requests for demo purposes
 */

const CATEGORIES = [
  'Infrastructure',
  'Application',
  'Database',
  'Network',
  'Security',
  'Hardware',
  'Software'
];

const TITLES = [
  'Upgrade server infrastructure',
  'Deploy new application version',
  'Database schema migration',
  'Network firewall configuration',
  'Security patch deployment',
  'Hardware replacement',
  'Software license renewal',
  'API endpoint modification',
  'Load balancer configuration',
  'Backup system update',
  'Monitoring tool installation',
  'User access provisioning',
  'Certificate renewal',
  'DNS configuration change',
  'Storage capacity expansion'
];

const OWNERS = [
  { name: 'John Smith', email: 'john.smith@company.com' },
  { name: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
  { name: 'Michael Chen', email: 'michael.chen@company.com' },
  { name: 'Emily Davis', email: 'emily.davis@company.com' },
  { name: 'David Wilson', email: 'david.wilson@company.com' },
  { name: 'Lisa Anderson', email: 'lisa.anderson@company.com' },
  { name: 'Robert Taylor', email: 'robert.taylor@company.com' },
  { name: 'Jennifer Martinez', email: 'jennifer.martinez@company.com' }
];

const STATUSES = ['New', 'Assess', 'Authorize', 'Scheduled', 'Implement', 'Review', 'Closed', 'Cancelled'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

/**
 * Generate a random change request
 * @param {number} index - Index for unique ID
 * @param {Date} baseDate - Base date for creation
 * @returns {Object} Change request object
 */
function generateChangeRequest(index, baseDate = new Date()) {
  const owner = OWNERS[Math.floor(Math.random() * OWNERS.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const title = TITLES[Math.floor(Math.random() * TITLES.length)];
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
  
  const createdDate = subDays(baseDate, Math.floor(Math.random() * 90));
  const lastUpdated = subDays(createdDate, -Math.floor(Math.random() * 30));
  
  const changeNumber = `CHG${String(100000 + index).padStart(7, '0')}`;
  
  return {
    id: `cr-${index}`,
    changeNumber,
    title: `${title} - ${category}`,
    description: `This change request involves ${title.toLowerCase()} for the ${category.toLowerCase()} system. The change is required to improve system performance and reliability.`,
    owner: owner.name,
    ownerEmail: owner.email,
    status,
    priority,
    category,
    createdDate,
    lastUpdated,
    plannedStartDate: subDays(new Date(), -Math.floor(Math.random() * 14)),
    plannedEndDate: subDays(new Date(), -Math.floor(Math.random() * 30)),
    comments: '',
    actionCategory: null,
    isDuplicate: false,
    isOutdated: false,
    emailActivity: [],
    contacted: false,
    contactedDate: null
  };
}

/**
 * Generate mock email threads for a change request
 * @param {string} changeNumber - Change request number
 * @param {string} ownerEmail - Owner email
 * @param {Date} createdDate - CR creation date
 * @returns {Array} Array of email threads
 */
function generateEmailThreads(changeNumber, ownerEmail, createdDate) {
  const emailCount = Math.floor(Math.random() * 8) + 1;
  const emails = [];
  
  const subjects = [
    `RE: ${changeNumber} - Status Update`,
    `${changeNumber} - Approval Request`,
    `FW: ${changeNumber} - Implementation Details`,
    `${changeNumber} - Risk Assessment`,
    `RE: ${changeNumber} - Testing Results`,
    `${changeNumber} - Deployment Schedule`,
    `RE: ${changeNumber} - Follow-up Required`
  ];
  
  const senders = [
    'change.manager@company.com',
    ownerEmail,
    'approval.team@company.com',
    'it.operations@company.com'
  ];
  
  for (let i = 0; i < emailCount; i++) {
    const emailDate = subDays(createdDate, -Math.floor(Math.random() * 25));
    const from = senders[Math.floor(Math.random() * senders.length)];
    
    emails.push({
      id: `email-${changeNumber}-${i}`,
      changeNumber,
      date: emailDate,
      from,
      to: from === ownerEmail ? 'change.manager@company.com' : ownerEmail,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      snippet: 'This is regarding the change request status. Please review and provide updates on the implementation timeline...',
      hasAttachment: Math.random() > 0.7
    });
  }
  
  return emails.sort((a, b) => b.date - a.date);
}

/**
 * Generate a complete dataset of change requests
 * @param {number} count - Number of change requests to generate
 * @returns {Array} Array of change requests
 */
export function generateMockChangeRequests(count = 75) {
  const changeRequests = [];
  
  for (let i = 0; i < count; i++) {
    const cr = generateChangeRequest(i + 1);
    
    // Generate email activity for most CRs
    if (Math.random() > 0.15) {
      cr.emailActivity = generateEmailThreads(cr.changeNumber, cr.ownerEmail, cr.createdDate);
    }
    
    // Mark some as outdated (no updates in 30+ days)
    const daysSinceUpdate = Math.floor((new Date() - cr.lastUpdated) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate > 30 && cr.status !== 'Closed' && cr.status !== 'Cancelled') {
      cr.isOutdated = true;
    }
    
    changeRequests.push(cr);
  }
  
  return changeRequests;
}

/**
 * Generate historical change requests for comparison
 * @param {Array} currentRequests - Current change requests
 * @returns {Array} Historical change requests
 */
export function generateHistoricalChangeRequests(currentRequests) {
  // Take 60% of current requests and modify them slightly
  const historicalCount = Math.floor(currentRequests.length * 0.6);
  const historical = [];
  
  const sampleComments = [
    'Reviewed with team - approved for implementation',
    'Pending approval from security team',
    'Requires additional testing before deployment',
    'Coordinated with infrastructure team',
    'Waiting for vendor response',
    'Implementation delayed due to resource constraints',
    'Successfully completed in previous cycle',
    'Needs clarification on requirements',
    'Risk assessment completed - low impact',
    'Scheduled for next maintenance window'
  ];
  
  const sampleActionCategories = [
    'Follow-up Required',
    'Pending Approval',
    'Ready for Implementation',
    'Blocked',
    'Under Review'
  ];
  
  for (let i = 0; i < historicalCount; i++) {
    const original = currentRequests[i];
    const modified = { ...original };
    
    // Modify some fields to simulate historical data
    modified.lastUpdated = subMonths(original.lastUpdated, 1);
    
    // Some might have different status
    if (Math.random() > 0.7) {
      const oldStatuses = ['Open', 'In Progress', 'Pending'];
      modified.status = oldStatuses[Math.floor(Math.random() * oldStatuses.length)];
    }
    
    // Add comments to about 40% of historical records
    if (Math.random() > 0.6) {
      modified.comments = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      
      // Add action category to some records with comments
      if (Math.random() > 0.5) {
        modified.actionCategory = sampleActionCategories[Math.floor(Math.random() * sampleActionCategories.length)];
      }
    }
    
    historical.push(modified);
  }
  
  return historical;
}

/**
 * Generate email templates
 * @returns {Array} Array of email templates
 */
export function generateEmailTemplates() {
  return [
    {
      id: 'status-confirmation',
      name: 'Status Confirmation',
      subject: 'Change Request [CHANGE_NUMBER] - Status Confirmation Required',
      body: `Dear [OWNER_NAME],

We are reviewing change request [CHANGE_NUMBER] - "[TITLE]".

Our records show this change request has not been updated since [LAST_UPDATED]. Could you please confirm the current status and provide an update on:

1. Is this change still required?
2. What is the current implementation status?
3. Are there any blockers or dependencies?

Please respond within 3 business days.

Best regards,
Change Management Team`
    },
    {
      id: 'cancellation-request',
      name: 'Cancellation Request',
      subject: 'Change Request [CHANGE_NUMBER] - Cancellation Confirmation',
      body: `Dear [OWNER_NAME],

We are reviewing change request [CHANGE_NUMBER] - "[TITLE]".

This change request has shown no activity for over 30 days. If this change is no longer required, we recommend cancelling it to keep our records current.

Please confirm if we should:
- Cancel this change request
- Keep it open with updated timeline
- Move it to future release planning

Please respond within 5 business days, or we will proceed with cancellation.

Best regards,
Change Management Team`
    },
    {
      id: 'action-required',
      name: 'Action Required',
      subject: 'Change Request [CHANGE_NUMBER] - Action Items Required',
      body: `Dear [OWNER_NAME],

Change request [CHANGE_NUMBER] - "[TITLE]" requires your attention.

The following action items need to be addressed:

1. Update the implementation timeline
2. Provide risk assessment documentation
3. Confirm resource availability
4. Submit testing plan

Please complete these items within 3 business days to avoid delays.

Best regards,
Change Management Team`
    },
    {
      id: 'future-release',
      name: 'For Closure Confirmation',
      subject: 'Change Request [CHANGE_NUMBER] - Closure Confirmation',
      body: `Dear [OWNER_NAME],

We are reviewing change request [CHANGE_NUMBER] - "[TITLE]" for closure confirmation.

Please confirm:
1. Target release version/date
2. Dependencies on other changes
3. Resource requirements
4. Priority level for future implementation

This information will help us plan upcoming releases effectively.

Best regards,
Change Management Team`
    }
  ];
}

/**
 * Get all mock email data
 * @param {Array} changeRequests - Array of change requests
 * @returns {Array} All email threads
 */
export function getAllMockEmails(changeRequests) {
  const allEmails = [];
  
  changeRequests.forEach(cr => {
    if (cr.emailActivity && cr.emailActivity.length > 0) {
      allEmails.push(...cr.emailActivity);
    }
  });
  
  return allEmails.sort((a, b) => b.date - a.date);
}

// Made with Bob
