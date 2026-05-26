/**
 * Comparison engine for cross-checking change requests
 */

/**
 * Compare primary change requests with historical data
 * @param {Array} primaryRequests - Current change requests
 * @param {Array} historicalRequests - Historical change requests
 * @returns {Object} Comparison results
 */
export function compareChangeRequests(primaryRequests, historicalRequests) {
  const duplicates = [];
  const outdated = [];
  const statusChanged = [];
  const newRequests = [];
  const commentsToTransfer = [];
  
  // Create a map of historical requests for quick lookup
  const historicalMap = new Map();
  historicalRequests.forEach(hr => {
    historicalMap.set(hr.changeNumber, hr);
  });
  
  // Compare each primary request
  primaryRequests.forEach(pr => {
    const historical = historicalMap.get(pr.changeNumber);
    
    if (historical) {
      // Always transfer comments from historical data if they exist (overwrite primary comments)
      if (historical.comments && historical.comments.trim()) {
        commentsToTransfer.push({
          id: pr.id,
          changeNumber: pr.changeNumber,
          comments: historical.comments,
          actionCategory: historical.actionCategory || null
        });
      }
      
      // Check for status changes
      if (pr.status !== historical.status) {
        statusChanged.push({
          changeRequest: pr,
          oldStatus: historical.status,
          newStatus: pr.status,
          oldLastUpdated: historical.lastUpdated,
          newLastUpdated: pr.lastUpdated
        });
      }
      
      // Check if outdated (no update in 30+ days)
      const daysSinceUpdate = calculateDaysSince(pr.lastUpdated);
      if (daysSinceUpdate > 30 && pr.status !== 'Closed' && pr.status !== 'Cancelled') {
        outdated.push({
          ...pr,
          daysSinceUpdate,
          isOutdated: true
        });
      }
    } else {
      // New request not in historical data
      newRequests.push(pr);
    }
  });
  
  // Find duplicates within primary requests
  const changeNumberMap = new Map();
  primaryRequests.forEach(pr => {
    if (changeNumberMap.has(pr.changeNumber)) {
      duplicates.push({
        changeRequest: pr,
        duplicateOf: changeNumberMap.get(pr.changeNumber),
        isDuplicate: true
      });
    } else {
      changeNumberMap.set(pr.changeNumber, pr);
    }
  });
  
  // Calculate statistics
  const statistics = {
    totalPrimary: primaryRequests.length,
    totalHistorical: historicalRequests.length,
    duplicatesFound: duplicates.length,
    outdatedFound: outdated.length,
    statusChanges: statusChanged.length,
    newRequests: newRequests.length,
    commentsTransferred: commentsToTransfer.length,
    matchRate: historicalRequests.length > 0
      ? ((primaryRequests.length - newRequests.length) / primaryRequests.length * 100).toFixed(1)
      : 0
  };
  
  return {
    duplicates,
    outdated,
    statusChanged,
    newRequests,
    commentsToTransfer,
    statistics
  };
}

/**
 * Calculate days since a given date
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
 * Find duplicates across multiple file sets
 * @param {Array} fileSets - Array of file data sets
 * @returns {Array} Duplicate change requests
 */
export function findDuplicatesAcrossFiles(fileSets) {
  const allRequests = [];
  const duplicates = [];
  const seenNumbers = new Map();
  
  fileSets.forEach((fileSet, fileIndex) => {
    fileSet.forEach(cr => {
      if (seenNumbers.has(cr.changeNumber)) {
        duplicates.push({
          changeRequest: cr,
          fileIndex,
          originalFileIndex: seenNumbers.get(cr.changeNumber).fileIndex,
          isDuplicate: true
        });
      } else {
        seenNumbers.set(cr.changeNumber, { cr, fileIndex });
      }
      allRequests.push(cr);
    });
  });
  
  return duplicates;
}

/**
 * Identify outdated change requests
 * @param {Array} changeRequests - Change requests to check
 * @param {number} daysThreshold - Days threshold for outdated (default: 30)
 * @returns {Array} Outdated change requests
 */
export function identifyOutdatedRequests(changeRequests, daysThreshold = 30) {
  return changeRequests
    .filter(cr => {
      if (cr.status === 'Closed' || cr.status === 'Cancelled') {
        return false;
      }
      
      const daysSinceUpdate = calculateDaysSince(cr.lastUpdated);
      return daysSinceUpdate > daysThreshold;
    })
    .map(cr => ({
      ...cr,
      daysSinceUpdate: calculateDaysSince(cr.lastUpdated),
      isOutdated: true
    }));
}

/**
 * Analyze change request trends
 * @param {Array} changeRequests - Change requests to analyze
 * @returns {Object} Trend analysis
 */
export function analyzeChangeRequestTrends(changeRequests) {
  const statusDistribution = {};
  const priorityDistribution = {};
  const categoryDistribution = {};
  const ownerDistribution = {};
  
  changeRequests.forEach(cr => {
    // Status distribution
    statusDistribution[cr.status] = (statusDistribution[cr.status] || 0) + 1;
    
    // Priority distribution
    priorityDistribution[cr.priority] = (priorityDistribution[cr.priority] || 0) + 1;
    
    // Category distribution
    categoryDistribution[cr.category] = (categoryDistribution[cr.category] || 0) + 1;
    
    // Owner distribution
    ownerDistribution[cr.owner] = (ownerDistribution[cr.owner] || 0) + 1;
  });
  
  // Calculate age distribution
  const ageDistribution = {
    'Less than 7 days': 0,
    '7-30 days': 0,
    '30-60 days': 0,
    '60-90 days': 0,
    'More than 90 days': 0
  };
  
  changeRequests.forEach(cr => {
    const days = calculateDaysSince(cr.createdDate);
    if (days < 7) ageDistribution['Less than 7 days']++;
    else if (days < 30) ageDistribution['7-30 days']++;
    else if (days < 60) ageDistribution['30-60 days']++;
    else if (days < 90) ageDistribution['60-90 days']++;
    else ageDistribution['More than 90 days']++;
  });
  
  return {
    statusDistribution,
    priorityDistribution,
    categoryDistribution,
    ownerDistribution,
    ageDistribution,
    totalRequests: changeRequests.length,
    openRequests: changeRequests.filter(cr => 
      cr.status !== 'Closed' && cr.status !== 'Cancelled'
    ).length,
    closedRequests: changeRequests.filter(cr => 
      cr.status === 'Closed' || cr.status === 'Cancelled'
    ).length
  };
}

/**
 * Generate comparison report
 * @param {Object} comparisonResults - Results from compareChangeRequests
 * @returns {Object} Formatted report
 */
export function generateComparisonReport(comparisonResults) {
  const { duplicates, outdated, statusChanged, statistics } = comparisonResults;
  
  return {
    summary: {
      totalIssues: duplicates.length + outdated.length,
      duplicates: duplicates.length,
      outdated: outdated.length,
      statusChanges: statusChanged.length,
      matchRate: statistics.matchRate
    },
    details: {
      duplicates: duplicates.map(d => ({
        changeNumber: d.changeRequest.changeNumber,
        shortDescription: d.changeRequest.shortDescription,
        status: d.changeRequest.status
      })),
      outdated: outdated.map(o => ({
        changeNumber: o.changeNumber,
        shortDescription: o.shortDescription,
        daysSinceUpdate: o.daysSinceUpdate,
        lastUpdated: o.lastUpdated
      })),
      statusChanges: statusChanged.map(sc => ({
        changeNumber: sc.changeRequest.changeNumber,
        shortDescription: sc.changeRequest.shortDescription,
        oldStatus: sc.oldStatus,
        newStatus: sc.newStatus
      }))
    },
    recommendations: generateRecommendations(comparisonResults)
  };
}

/**
 * Generate recommendations based on comparison results
 * @param {Object} comparisonResults - Comparison results
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(comparisonResults) {
  const recommendations = [];
  
  if (comparisonResults.duplicates.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Duplicate Change Requests Found',
      message: `${comparisonResults.duplicates.length} duplicate change request(s) detected. Review and consolidate duplicates.`,
      action: 'Review duplicates in Cross-Check tab'
    });
  }
  
  if (comparisonResults.outdated.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Outdated Change Requests',
      message: `${comparisonResults.outdated.length} change request(s) have not been updated in over 30 days.`,
      action: 'Contact owners for status updates'
    });
  }
  
  if (comparisonResults.statusChanged.length > 5) {
    recommendations.push({
      type: 'info',
      title: 'Multiple Status Changes',
      message: `${comparisonResults.statusChanged.length} change requests have changed status since last review.`,
      action: 'Review status changes for accuracy'
    });
  }
  
  if (comparisonResults.newRequests.length > 0) {
    recommendations.push({
      type: 'info',
      title: 'New Change Requests',
      message: `${comparisonResults.newRequests.length} new change request(s) not in historical data.`,
      action: 'Review new requests for completeness'
    });
  }
  
  return recommendations;
}

/**
 * Filter change requests by criteria
 * @param {Array} changeRequests - Change requests to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered change requests
 */
export function filterChangeRequests(changeRequests, filters) {
  return changeRequests.filter(cr => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(cr.status)) return false;
    }
    
    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(cr.priority)) return false;
    }
    
    // Category filter
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(cr.category)) return false;
    }
    
    // Owner filter
    if (filters.owner && filters.owner.length > 0) {
      if (!filters.owner.includes(cr.owner)) return false;
    }
    
    // Outdated filter
    if (filters.showOutdatedOnly) {
      if (!cr.isOutdated) return false;
    }
    
    // Duplicate filter
    if (filters.showDuplicatesOnly) {
      if (!cr.isDuplicate) return false;
    }
    
    // Has comments filter
    if (filters.hasComments !== undefined) {
      const hasComments = cr.comments && cr.comments.trim().length > 0;
      if (filters.hasComments !== hasComments) return false;
    }
    
    // Contacted filter
    if (filters.contacted !== undefined) {
      if (filters.contacted !== cr.contacted) return false;
    }
    
    // Date range filter
    if (filters.dateFrom) {
      if (new Date(cr.createdDate) < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo) {
      if (new Date(cr.createdDate) > new Date(filters.dateTo)) return false;
    }
    
    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const matchesSearch = 
        cr.changeNumber.toLowerCase().includes(searchLower) ||
        cr.shortDescription.toLowerCase().includes(searchLower) ||
        cr.description.toLowerCase().includes(searchLower) ||
        cr.owner.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    return true;
  });
}

// Made with Bob
