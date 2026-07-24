'use server';

// Content Moderation Layer for ShikshaSetu
// Filters inappropriate content from user inputs (SchoolGPT, Community, Worry Jar, etc.)

// Profanity filter word list (Indian context + English)
const PROFANITY_PATTERNS = [
  // English profanity (mild - this is a school app)
  /\b(stupid|idiot|dumb|fool|loser)\b/gi,
  /\b(hate|kill|die|death)\b/gi,
  // Add more patterns as needed - keeping it school-appropriate
];

// Harmful content patterns
const HARMFUL_PATTERNS = [
  // Self-harm indicators
  /\b(self[\s-]?harm|cut myself|hurt myself|end it all|suicide|kill myself)\b/gi,
  // Bullying/harassment
  /\b(bully|harass|threaten|beat up)\b/gi,
  // Violence
  /\b(weapon|knife|gun|bomb|attack)\b/gi,
  // Inappropriate content requests
  /\b(porn|sex|naked|nude)\b/gi,
];

// Spam patterns
const SPAM_PATTERNS = [
  // Excessive repetition
  /(.)\1{10,}/gi, // Same character repeated 10+ times
  // All caps (more than 70% of text)
  // URL spam (multiple URLs)
  /https?:\/\/[^\s]{3,}/gi,
];

// Personal information patterns (PII)
const PII_PATTERNS = [
  // Phone numbers (Indian format)
  /\b\d{10}\b/g, // 10-digit numbers
  /\+91[\s-]?\d{10}\b/g, // +91 format
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Aadhaar numbers
  /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
];

export interface ModerationResult {
  isAllowed: boolean;
  reason?: 'profanity' | 'harmful_content' | 'spam' | 'pii' | 'prompt_injection' | 'approved';
  flaggedTerms?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  sanitizedContent?: string;
  requiresReview?: boolean;
}

// Main moderation function
export async function moderateContent(
  content: string,
  context: 'schoolgpt' | 'community' | 'worry_jar' | 'chat' | 'general'
): Promise<ModerationResult> {
  const trimmed = content.trim();

  // Empty content check
  if (!trimmed) {
    return {
      isAllowed: false,
      reason: 'approved',
      severity: 'low',
    };
  }

  // Check for profanity
  const profanityCheck = checkProfanity(trimmed);
  if (!profanityCheck.isClean) {
    return {
      isAllowed: false,
      reason: 'profanity',
      flaggedTerms: profanityCheck.flaggedTerms,
      severity: 'low',
      sanitizedContent: profanityCheck.sanitized,
    };
  }

  // Check for harmful content (self-harm, violence, etc.)
  const harmfulCheck = checkHarmfulContent(trimmed);
  if (!harmfulCheck.isClean) {
    return {
      isAllowed: false,
      reason: 'harmful_content',
      flaggedTerms: harmfulCheck.flaggedTerms,
      severity: harmfulCheck.severity,
      requiresReview: true, // Flag for counselor review
    };
  }

  // Check for spam
  const spamCheck = checkSpam(trimmed);
  if (!spamCheck.isClean) {
    return {
      isAllowed: false,
      reason: 'spam',
      severity: 'low',
    };
  }

  // Check for PII (less strict for worry_jar context)
  if (context !== 'worry_jar' && context !== 'chat') {
    const piiCheck = checkPII(trimmed);
    if (!piiCheck.isClean) {
      return {
        isAllowed: false,
        reason: 'pii',
        flaggedTerms: piiCheck.flaggedTerms,
        severity: 'medium',
        sanitizedContent: piiCheck.sanitized,
      };
    }
  }

  // Check for prompt injection (SchoolGPT specific)
  if (context === 'schoolgpt') {
    const injectionCheck = checkPromptInjection(trimmed);
    if (!injectionCheck.isClean) {
      return {
        isAllowed: false,
        reason: 'prompt_injection',
        severity: 'medium',
      };
    }
  }

  // All checks passed
  return {
    isAllowed: true,
    reason: 'approved',
    severity: 'low',
    sanitizedContent: trimmed,
  };
}

// Check for profanity
function checkProfanity(content: string): {
  isClean: boolean;
  flaggedTerms: string[];
  sanitized: string;
} {
  const flaggedTerms: string[] = [];
  let sanitized = content;

  for (const pattern of PROFANITY_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      flaggedTerms.push(...matches);
      sanitized = sanitized.replace(pattern, (match) => '*'.repeat(match.length));
    }
  }

  return {
    isClean: flaggedTerms.length === 0,
    flaggedTerms,
    sanitized,
  };
}

// Check for harmful content
function checkHarmfulContent(content: string): {
  isClean: boolean;
  flaggedTerms: string[];
  severity: 'medium' | 'high' | 'critical';
} {
  const flaggedTerms: string[] = [];
  let severity: 'medium' | 'high' | 'critical' = 'medium';

  for (const pattern of HARMFUL_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      flaggedTerms.push(...matches);
      
      // Self-harm is critical severity
      if (pattern.source.includes('self') || pattern.source.includes('suicide')) {
        severity = 'critical';
      } else if (pattern.source.includes('weapon')) {
        severity = 'high';
      }
    }
  }

  return {
    isClean: flaggedTerms.length === 0,
    flaggedTerms,
    severity,
  };
}

// Check for spam
function checkSpam(content: string): { isClean: boolean } {
  // Check character repetition
  if (/(.)\1{10,}/.test(content)) {
    return { isClean: false };
  }

  // Check for excessive caps (more than 70%)
  const letters = content.replace(/[^a-zA-Z]/g, '');
  const capitals = content.replace(/[^A-Z]/g, '');
  if (letters.length > 10 && capitals.length / letters.length > 0.7) {
    return { isClean: false };
  }

  // Check for multiple URLs
  const urlMatches = content.match(/https?:\/\/[^\s]+/gi);
  if (urlMatches && urlMatches.length > 2) {
    return { isClean: false };
  }

  return { isClean: true };
}

// Check for PII
function checkPII(content: string): {
  isClean: boolean;
  flaggedTerms: string[];
  sanitized: string;
} {
  const flaggedTerms: string[] = [];
  let sanitized = content;

  for (const pattern of PII_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      flaggedTerms.push(...matches);
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
  }

  return {
    isClean: flaggedTerms.length === 0,
    flaggedTerms,
    sanitized,
  };
}

// Check for prompt injection attacks
function checkPromptInjection(content: string): { isClean: boolean } {
  const lowerContent = content.toLowerCase();

  // Common prompt injection patterns
  const injectionPatterns = [
    'ignore previous',
    'ignore all',
    'forget everything',
    'new instructions',
    'you are now',
    'system:',
    'assistant:',
    'disregard',
    'override',
  ];

  for (const pattern of injectionPatterns) {
    if (lowerContent.includes(pattern)) {
      return { isClean: false };
    }
  }

  return { isClean: true };
}

// Log moderation events for audit trail
export async function logModerationEvent(
  userId: string,
  content: string,
  moderationResult: ModerationResult,
  context: string
): Promise<void> {
  try {
    // TODO: Log to database for audit trail
    console.log('[Content Moderation]', {
      userId,
      context,
      blocked: !moderationResult.isAllowed,
      reason: moderationResult.reason,
      severity: moderationResult.severity,
      timestamp: new Date().toISOString(),
    });

    // If critical severity (self-harm), create urgent alert
    if (moderationResult.severity === 'critical' && moderationResult.reason === 'harmful_content') {
      console.error('[CRITICAL ALERT] Potential self-harm content detected:', {
        userId,
        context,
        timestamp: new Date().toISOString(),
      });
      
      // TODO: Create urgent notification for counselor/admin
      // TODO: Send immediate alert via SMS/email to designated staff
    }
  } catch (error) {
    console.error('[Content Moderation] Failed to log event:', error);
  }
}

// Helper function for quick validation (used in forms)
export async function validateUserInput(
  content: string,
  context: 'schoolgpt' | 'community' | 'worry_jar' | 'chat' | 'general' = 'general'
): Promise<{ valid: boolean; error?: string; sanitized?: string }> {
  const result = await moderateContent(content, context);

  if (!result.isAllowed) {
    let error = 'Your message contains content that violates our community guidelines.';

    switch (result.reason) {
      case 'profanity':
        error = 'Please use respectful language. Profanity is not allowed.';
        break;
      case 'harmful_content':
        error = 'Your message contains concerning content. If you need help, please speak with a counselor.';
        break;
      case 'spam':
        error = 'Your message looks like spam. Please write naturally.';
        break;
      case 'pii':
        error = 'Please do not share personal information like phone numbers or addresses.';
        break;
      case 'prompt_injection':
        error = 'Your message contains invalid instructions.';
        break;
    }

    return {
      valid: false,
      error,
      sanitized: result.sanitizedContent,
    };
  }

  return {
    valid: true,
    sanitized: result.sanitizedContent,
  };
}

// Batch moderation for multiple items (e.g., bulk import)
export async function moderateBatch(
  items: Array<{ id: string; content: string }>,
  context: 'community' | 'general' = 'general'
): Promise<Array<{ id: string; result: ModerationResult }>> {
  const results = await Promise.all(
    items.map(async (item) => ({
      id: item.id,
      result: await moderateContent(item.content, context),
    }))
  );

  return results;
}
