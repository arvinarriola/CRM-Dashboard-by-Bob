/**
 * Email matching and search utilities
 */

/**
 * Search for emails related to a change request
 * @param {string} changeNumber - Change request number to search for
 * @param {Array} allEmails - All available emails
 * @returns {Array} Matching emails
 */
export function searchEmailsByChangeNumber(changeNumber, allEmails) {
  if (!changeNumber || !allEmails) return [];
  
  const searchTerm = changeNumber.toLowerCase();
  
  return allEmails.filter(email => {
    const subjectMatch = email.subject.toLowerCase().includes(searchTerm);
    const snippetMatch = email.snippet.toLowerCase().includes(searchTerm);
    const changeNumberMatch = email.changeNumber === changeNumber;
    
    return subjectMatch || snippetMatch || changeNumberMatch;
  });
}

/**
 * Search emails by multiple criteria
 * @param {Object} criteria - Search criteria
 * @param {Array} allEmails - All available emails
 * @returns {Array} Matching emails
 */
export function searchEmails(criteria, allEmails) {
  if (!allEmails) return [];
  
  return allEmails.filter(email => {
    // Change number search
    if (criteria.changeNumber) {
      const changeNumberMatch = email.changeNumber === criteria.changeNumber ||
        email.subject.toLowerCase().includes(criteria.changeNumber.toLowerCase());
      if (!changeNumberMatch) return false;
    }
    
    // Sender search
    if (criteria.from) {
      if (!email.from.toLowerCase().includes(criteria.from.toLowerCase())) {
        return false;
      }
    }
    
    // Recipient search
    if (criteria.to) {
      if (!email.to.toLowerCase().includes(criteria.to.toLowerCase())) {
        return false;
      }
    }
    
    // Subject search
    if (criteria.subject) {
      if (!email.subject.toLowerCase().includes(criteria.subject.toLowerCase())) {
        return false;
      }
    }
    
    // Date range
    if (criteria.dateFrom) {
      if (new Date(email.date) < new Date(criteria.dateFrom)) {
        return false;
      }
    }
    if (criteria.dateTo) {
      if (new Date(email.date) > new Date(criteria.dateTo)) {
        return false;
      }
    }
    
    // Has attachment
    if (criteria.hasAttachment !== undefined) {
      if (email.hasAttachment !== criteria.hasAttachment) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Get email activity summary for a change request
 * @param {string} changeNumber - Change request number
 * @param {Array} emails - Related emails
 * @returns {Object} Email activity summary
 */
export function getEmailActivitySummary(changeNumber, emails) {
  const relatedEmails = emails.filter(e => e.changeNumber === changeNumber);
  
  if (relatedEmails.length === 0) {
    return {
      hasActivity: false,
      emailCount: 0,
      lastEmailDate: null,
      daysSinceLastEmail: null,
      participants: [],
      hasAttachments: false
    };
  }
  
  // Sort by date descending
  const sortedEmails = [...relatedEmails].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  const lastEmail = sortedEmails[0];
  const daysSinceLastEmail = calculateDaysSince(lastEmail.date);
  
  // Get unique participants
  const participants = new Set();
  relatedEmails.forEach(email => {
    participants.add(email.from);
    participants.add(email.to);
  });
  
  // Check for attachments
  const hasAttachments = relatedEmails.some(email => email.hasAttachment);
  
  return {
    hasActivity: true,
    emailCount: relatedEmails.length,
    lastEmailDate: lastEmail.date,
    daysSinceLastEmail,
    participants: Array.from(participants),
    hasAttachments,
    recentEmails: sortedEmails.slice(0, 5) // Last 5 emails
  };
}

/**
 * Calculate days since a date
 * @param {Date} date - Date to calculate from
 * @returns {number} Number of days
 */
function calculateDaysSince(date) {
  const now = new Date();
  const then = new Date(date);
  const diffTime = Math.abs(now - then);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Analyze email patterns for change requests
 * @param {Array} changeRequests - Change requests with email activity
 * @returns {Object} Email pattern analysis
 */
export function analyzeEmailPatterns(changeRequests) {
  const withActivity = changeRequests.filter(cr => 
    cr.emailActivity && cr.emailActivity.length > 0
  );
  const withoutActivity = changeRequests.filter(cr => 
    !cr.emailActivity || cr.emailActivity.length === 0
  );
  
  // Calculate average email count
  const totalEmails = withActivity.reduce((sum, cr) => 
    sum + (cr.emailActivity?.length || 0), 0
  );
  const avgEmailsPerCR = withActivity.length > 0 
    ? (totalEmails / withActivity.length).toFixed(1)
    : 0;
  
  // Find CRs with no recent activity
  const noRecentActivity = withActivity.filter(cr => {
    const lastEmail = cr.emailActivity[0];
    const daysSince = calculateDaysSince(lastEmail.date);
    return daysSince > 30;
  });
  
  return {
    totalChangeRequests: changeRequests.length,
    withEmailActivity: withActivity.length,
    withoutEmailActivity: withoutActivity.length,
    averageEmailsPerCR: avgEmailsPerCR,
    noRecentActivity: noRecentActivity.length,
    activityRate: ((withActivity.length / changeRequests.length) * 100).toFixed(1)
  };
}

/**
 * Generate email search observations
 * @param {Object} changeRequest - Change request to analyze
 * @param {Array} emails - All emails
 * @returns {string} Observation text
 */
export function generateEmailObservation(changeRequest, emails) {
  const summary = getEmailActivitySummary(changeRequest.changeNumber, emails);
  
  if (!summary.hasActivity) {
    return `No email activity found for ${changeRequest.changeNumber}. Consider contacting owner for status update.`;
  }
  
  const observations = [];
  
  observations.push(`${summary.emailCount} email(s) found.`);
  
  if (summary.daysSinceLastEmail !== null) {
    if (summary.daysSinceLastEmail === 0) {
      observations.push('Last email: Today');
    } else if (summary.daysSinceLastEmail === 1) {
      observations.push('Last email: Yesterday');
    } else if (summary.daysSinceLastEmail < 7) {
      observations.push(`Last email: ${summary.daysSinceLastEmail} days ago`);
    } else if (summary.daysSinceLastEmail < 30) {
      const weeks = Math.floor(summary.daysSinceLastEmail / 7);
      observations.push(`Last email: ${weeks} week(s) ago`);
    } else {
      observations.push(`Last email: ${summary.daysSinceLastEmail} days ago (outdated)`);
    }
  }
  
  if (summary.hasAttachments) {
    observations.push('Contains attachments');
  }
  
  if (summary.participants.length > 2) {
    observations.push(`${summary.participants.length} participants involved`);
  }
  
  // Add recommendation
  if (summary.daysSinceLastEmail > 30) {
    observations.push('⚠️ Recommend follow-up');
  } else if (summary.daysSinceLastEmail < 7) {
    observations.push('✓ Recently active');
  }
  
  return observations.join(' | ');
}

/**
 * Bulk search emails for multiple change requests
 * @param {Array} changeRequests - Change requests to search
 * @param {Array} allEmails - All available emails
 * @returns {Object} Map of change number to email results
 */
export function bulkSearchEmails(changeRequests, allEmails) {
  const results = {};
  
  changeRequests.forEach(cr => {
    const emails = searchEmailsByChangeNumber(cr.changeNumber, allEmails);
    const summary = getEmailActivitySummary(cr.changeNumber, emails);
    const observation = generateEmailObservation(cr, allEmails);
    
    results[cr.changeNumber] = {
      emails,
      summary,
      observation
    };
  });
  
  return results;
}

/**
 * Get email statistics
 * @param {Array} emails - All emails
 * @returns {Object} Email statistics
 */
export function getEmailStatistics(emails) {
  if (!emails || emails.length === 0) {
    return {
      total: 0,
      withAttachments: 0,
      uniqueSenders: 0,
      uniqueRecipients: 0,
      dateRange: null
    };
  }
  
  const senders = new Set();
  const recipients = new Set();
  let withAttachments = 0;
  
  emails.forEach(email => {
    senders.add(email.from);
    recipients.add(email.to);
    if (email.hasAttachment) withAttachments++;
  });
  
  // Get date range
  const dates = emails.map(e => new Date(e.date)).sort((a, b) => a - b);
  const dateRange = dates.length > 0 ? {
    earliest: dates[0],
    latest: dates[dates.length - 1]
  } : null;
  
  return {
    total: emails.length,
    withAttachments,
    uniqueSenders: senders.size,
    uniqueRecipients: recipients.size,
    dateRange
  };
}

/**
 * Group emails by change request
 * @param {Array} emails - All emails
 * @returns {Object} Emails grouped by change number
 */
export function groupEmailsByChangeRequest(emails) {
  const grouped = {};
  
  emails.forEach(email => {
    if (!grouped[email.changeNumber]) {
      grouped[email.changeNumber] = [];
    }
    grouped[email.changeNumber].push(email);
  });
  
  // Sort emails within each group by date descending
  Object.keys(grouped).forEach(changeNumber => {
    grouped[changeNumber].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  });
  
  return grouped;
}

// Made with Bob
