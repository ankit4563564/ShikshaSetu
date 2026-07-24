/**
 * Network Error Handling Utilities
 * Provides user-friendly error messages and retry logic
 */

export interface NetworkError {
  message: string;
  userMessage: string;
  isRetryable: boolean;
  statusCode?: number;
}

export function parseNetworkError(error: any): NetworkError {
  // Network offline
  if (!navigator.onLine) {
    return {
      message: 'Network offline',
      userMessage: 'No internet connection. Please check your network and try again.',
      isRetryable: true,
    };
  }

  // Supabase errors
  if (error?.message?.includes('Failed to fetch')) {
    return {
      message: 'Network request failed',
      userMessage: 'Unable to connect to server. Please check your connection.',
      isRetryable: true,
    };
  }

  // Timeout errors
  if (error?.message?.includes('timeout') || error?.code === 'ETIMEDOUT') {
    return {
      message: 'Request timeout',
      userMessage: 'Request took too long. Please try again.',
      isRetryable: true,
    };
  }

  // Authentication errors
  if (error?.status === 401 || error?.message?.includes('JWT')) {
    return {
      message: 'Authentication failed',
      userMessage: 'Your session has expired. Please sign in again.',
      isRetryable: false,
      statusCode: 401,
    };
  }

  // Permission errors
  if (error?.status === 403) {
    return {
      message: 'Permission denied',
      userMessage: 'You do not have permission to perform this action.',
      isRetryable: false,
      statusCode: 403,
    };
  }

  // Not found errors
  if (error?.status === 404) {
    return {
      message: 'Resource not found',
      userMessage: 'The requested information could not be found.',
      isRetryable: false,
      statusCode: 404,
    };
  }

  // Server errors
  if (error?.status >= 500) {
    return {
      message: 'Server error',
      userMessage: 'Server is having issues. Please try again in a moment.',
      isRetryable: true,
      statusCode: error.status,
    };
  }

  // Generic error
  return {
    message: error?.message || 'Unknown error',
    userMessage: 'Something went wrong. Please try again.',
    isRetryable: true,
  };
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const networkError = parseNetworkError(error);

      if (!networkError.isRetryable || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
