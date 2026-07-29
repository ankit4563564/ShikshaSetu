import * as Sentry from '@sentry/nextjs';
import { trackError as analyticsTrackError, trackEvent } from './analytics';

export const captureError = (error: Error, context?: Record<string, any>) => {
  // Send to Sentry
  Sentry.captureException(error, {
    extra: context,
  });

  // Send to analytics
  analyticsTrackError(error, context);
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });

  trackEvent({
    event: 'log_message',
    category: 'monitoring',
    label: message,
    metadata: {
      level,
      ...context,
    },
  });
};

export const setUserContext = (userId: string, email?: string, role?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};

export const trackPerformance = (operation: string, duration: number, metadata?: Record<string, any>) => {
  Sentry.startSpan({
    op: operation,
    name: operation,
  }, () => {
    // Track performance metric
    trackEvent({
      event: 'performance',
      category: 'performance',
      label: operation,
      value: duration,
      metadata,
    });
  });
};

export const trackFeatureUsage = (feature: string, action: string, metadata?: Record<string, any>) => {
  trackEvent({
    event: 'feature_usage',
    category: 'feature',
    label: `${feature}:${action}`,
    metadata,
  });
};
