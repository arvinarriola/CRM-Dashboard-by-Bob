/**
 * Email Security Guard Rails
 * Provides validation, rate limiting, and security checks for email operations
 */

// Rate limiting configuration
const RATE_LIMITS = {
  emailSearch: { maxPerHour: 50, cooldown: 60000 }, // 50 searches per hour, 1 min cooldown
  bulkSend: { maxPerBatch: 50, cooldown: 300000 }, // 50 emails per batch, 5 min cooldown
  singleSend: { maxPerMinute: 10, cooldown: 6000 } // 10 emails per minute
};

// Track operations
const operationTracker = {
  emailSearch: [],
  bulkSend: [],
  singleSend: []
};

/**
 * Validate email address format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate email content
 */
export function validateEmailContent(subject, body) {
  const errors = [];
  
  if (!subject || subject.trim().length === 0) {
    errors.push('Email subject is required');
  }
  
  if (subject && subject.length > 200) {
    errors.push('Email subject is too long (max 200 characters)');
  }
  
  if (!body || body.trim().length === 0) {
    errors.push('Email body is required');
  }
  
  if (body && body.length > 10000) {
    errors.push('Email body is too long (max 10,000 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check rate limit for operation
 */
export function checkRateLimit(operationType) {
  const now = Date.now();
  const config = RATE_LIMITS[operationType];
  
  if (!config) {
    return { allowed: true };
  }
  
  // Clean old entries
  operationTracker[operationType] = operationTracker[operationType].filter(
    timestamp => now - timestamp < (operationType === 'emailSearch' ? 3600000 : 60000)
  );
  
  // Check if limit exceeded
  const recentOps = operationTracker[operationType].length;
  const maxOps = operationType === 'emailSearch' ? config.maxPerHour : config.maxPerMinute;
  
  if (recentOps >= maxOps) {
    const oldestOp = operationTracker[operationType][0];
    const waitTime = Math.ceil((config.cooldown - (now - oldestOp)) / 1000);
    
    return {
      allowed: false,
      message: `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`,
      waitTime
    };
  }
  
  return { allowed: true };
}

/**
 * Record operation for rate limiting
 */
export function recordOperation(operationType) {
  operationTracker[operationType].push(Date.now());
}

/**
 * Validate bulk email operation
 */
export function validateBulkEmailOperation(recipients, subject, body) {
  const errors = [];
  
  // Check recipient count
  if (!recipients || recipients.length === 0) {
    errors.push('No recipients selected');
  }
  
  if (recipients && recipients.length > RATE_LIMITS.bulkSend.maxPerBatch) {
    errors.push(`Too many recipients. Maximum ${RATE_LIMITS.bulkSend.maxPerBatch} per batch.`);
  }
  
  // Validate email addresses
  const invalidEmails = recipients.filter(email => !validateEmail(email));
  if (invalidEmails.length > 0) {
    errors.push(`Invalid email addresses: ${invalidEmails.slice(0, 3).join(', ')}${invalidEmails.length > 3 ? '...' : ''}`);
  }
  
  // Validate content
  const contentValidation = validateEmailContent(subject, body);
  if (!contentValidation.isValid) {
    errors.push(...contentValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    recipientCount: recipients.length
  };
}

/**
 * Sanitize email content to prevent injection
 */
export function sanitizeEmailContent(content) {
  if (!content) return '';
  
  // Remove potentially dangerous HTML/script tags
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Generate operation audit log entry
 */
export function createAuditLog(operation, details) {
  return {
    timestamp: new Date().toISOString(),
    operation,
    user: details.userEmail || 'unknown',
    details: {
      recipientCount: details.recipientCount || 0,
      success: details.success || false,
      error: details.error || null
    }
  };
}

/**
 * Check if user session is still valid (30 minute timeout)
 */
export function isSessionValid(lastActivity) {
  if (!lastActivity) return false;
  const now = Date.now();
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  return (now - lastActivity) < sessionTimeout;
}

/**
 * Security recommendations for production
 */
export const SECURITY_NOTES = {
  tokenStorage: 'Never store access tokens in localStorage. Use memory-only storage.',
  permissions: 'Request minimal Microsoft Graph API scopes: Mail.Read, Mail.Send, User.Read',
  encryption: 'Use HTTPS only. Enable CORS restrictions.',
  monitoring: 'Implement server-side logging and monitoring for all email operations.',
  authentication: 'Use Microsoft MSAL library with proper OAuth 2.0 flow.',
  dataRetention: 'Clear all cached email data on sign-out.',
  errorHandling: 'Never expose internal errors or tokens to users.'
};

export default {
  validateEmail,
  validateEmailContent,
  checkRateLimit,
  recordOperation,
  validateBulkEmailOperation,
  sanitizeEmailContent,
  createAuditLog,
  isSessionValid,
  SECURITY_NOTES
};

// Made with Bob