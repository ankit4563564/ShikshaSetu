// Simple analytics tracking utility
// Can be extended with Google Analytics, Mixpanel, or other providers

export interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  userId?: string;
  role?: string;
  metadata?: Record<string, any>;
}

export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined') return;

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event);
    return;
  }

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.event, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      custom_map: {
        user_id: event.userId,
        role: event.role,
        ...event.metadata,
      },
    });
  }

  // Add other analytics providers here
  // Mixpanel, Amplitude, etc.
};

export const trackPageView = (path: string, userId?: string, role?: string) => {
  trackEvent({
    event: 'page_view',
    category: 'navigation',
    label: path,
    userId,
    role,
  });
};

export const trackUserAction = (action: string, metadata?: Record<string, any>) => {
  trackEvent({
    event: action,
    category: 'user_action',
    metadata,
  });
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  trackEvent({
    event: 'error',
    category: 'error',
    label: error.message,
    metadata: {
      stack: error.stack,
      ...context,
    },
  });
};
