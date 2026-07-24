/**
 * Unified Conversation Design System
 * Single source of truth for all messaging interfaces across ShikshaSetu
 * 
 * Inspired by: Apple Messages, ChatGPT, Claude, Linear, Notion AI
 * Principle: Premium, calm, trustworthy, enterprise-grade
 */

export const CONVERSATION_TOKENS = {
  // ─── SPACING ───────────────────────────────────────────────────────────
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
  },

  // ─── BUBBLE GEOMETRY ────────────────────────────────────────────────────
  bubble: {
    radius: '1.25rem',           // 20px - warm, not sharp
    radiusSmall: '0.75rem',      // 12px for tight corners
    padding: {
      compact: '0.75rem 1rem',   // smaller messages
      standard: '1rem 1.25rem',  // typical messages
      large: '1.25rem 1.5rem',   // rich content
    },
    maxWidth: '65%',             // desktop; narrows on mobile
    maxWidthMobile: '85%',
    maxWidthTablet: '70%',
    gapConsecutive: '0.25rem',   // gap between grouped messages
    gapDifferent: '1rem',        // gap between different senders
  },

  // ─── AVATARS ───────────────────────────────────────────────────────────
  avatar: {
    sizeLarge: '2.5rem',         // 40px - header
    sizeSmall: '1.75rem',        // 28px - message bubble
    sizeXSmall: '1.5rem',        // 24px - compact list
    radius: '50%',               // perfect circle
  },

  // ─── TYPOGRAPHY ────────────────────────────────────────────────────────
  typography: {
    // Message text
    messageFontSize: '0.95rem',
    messageLineHeight: '1.5',
    messageFontWeight: '400',

    // Timestamp
    timestampFontSize: '0.75rem',
    timestampLineHeight: '1.4',
    timestampFontWeight: '400',
    timestampColor: 'rgb(100, 116, 139)', // slate-500

    // Metadata (read status, etc)
    metadataFontSize: '0.7rem',
    metadataFontWeight: '500',
    metadataColor: 'rgb(148, 163, 184)', // slate-400

    // Status labels
    statusFontSize: '0.75rem',
    statusFontWeight: '600',
    statusColor: 'rgb(15, 23, 42)', // slate-900
  },

  // ─── COMPOSER ───────────────────────────────────────────────────────────
  composer: {
    minHeight: '3.5rem',         // 56px
    maxHeight: '8rem',           // 128px (4 lines)
    padding: '0.75rem 1rem',
    borderRadius: '1.25rem',
    borderWidth: '1px',
    borderColorIdle: 'rgb(226, 232, 240)',     // slate-200
    borderColorFocus: 'rgb(148, 163, 184)',    // slate-400
    backgroundColor: 'rgb(248, 250, 252)',    // slate-50
    backgroundColorFocus: 'rgb(255, 255, 255)',
    focusTransitionDuration: '200ms',
    placeholderColor: 'rgb(148, 163, 184)',   // slate-400
  },

  // ─── QUICK CHIPS ────────────────────────────────────────────────────────
  quickChip: {
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    backgroundColor: 'rgb(241, 245, 249)',       // slate-100
    backgroundColorHover: 'rgb(226, 232, 240)', // slate-200
    textColor: 'rgb(15, 23, 42)',                // slate-900
    transitionDuration: '150ms',
    maxWidth: '100%',
    gap: '0.5rem',
  },

  // ─── SHADOWS ────────────────────────────────────────────────────────────
  shadows: {
    bubble: '0 1px 3px rgba(0, 0, 0, 0.08)',
    bubbleHover: '0 2px 6px rgba(0, 0, 0, 0.12)',
    composer: '0 2px 8px rgba(0, 0, 0, 0.1)',
    header: '0 1px 2px rgba(0, 0, 0, 0.04)',
  },

  // ─── COLORS ─────────────────────────────────────────────────────────────
  colors: {
    // User messages (incoming/from you)
    userBubbleBg: 'rgb(63, 81, 181)',         // primary/indigo
    userBubbleText: 'rgb(255, 255, 255)',     // white
    userBubbleBgLight: 'rgb(222, 231, 255)',  // primary/5 - for preview
    userBubbleTextLight: 'rgb(63, 81, 181)',  // primary - for preview

    // Other messages (incoming/from them)
    otherBubbleBg: 'rgb(241, 245, 249)',      // slate-100
    otherBubbleText: 'rgb(15, 23, 42)',       // slate-900
    otherBubbleBgHover: 'rgb(226, 232, 240)',// slate-200

    // System messages
    systemBg: 'rgb(248, 250, 252)',           // slate-50
    systemText: 'rgb(71, 85, 105)',           // slate-600
    systemBorder: 'rgb(226, 232, 240)',       // slate-200

    // Status
    statusSuccess: 'rgb(34, 197, 94)',        // green-500
    statusWarning: 'rgb(251, 146, 60)',       // orange-500
    statusError: 'rgb(239, 68, 68)',          // red-500
    statusPending: 'rgb(148, 163, 184)',      // slate-400

    // Background
    conversationBg: 'rgb(255, 255, 255)',     // white
    conversationBgAlt: 'rgb(248, 250, 252)',  // slate-50

    // Text
    textPrimary: 'rgb(15, 23, 42)',           // slate-900
    textSecondary: 'rgb(71, 85, 105)',        // slate-600
    textTertiary: 'rgb(100, 116, 139)',       // slate-500
  },

  // ─── ANIMATIONS ─────────────────────────────────────────────────────────
  animations: {
    messageEnter: '300ms ease-out',
    bubbleHover: '150ms ease-in-out',
    composerFocus: '200ms ease-in-out',
    typingIndicator: '600ms',
    scrollSmooth: '200ms ease-in-out',
    fadeIn: '200ms ease-in',
    slideIn: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // ─── BORDERS ────────────────────────────────────────────────────────────
  borders: {
    subtle: '1px solid rgb(226, 232, 240)',   // slate-200
    light: '1px solid rgb(241, 245, 249)',    // slate-100
    focus: '2px solid rgb(63, 81, 181)',      // primary
  },

  // ─── LAYOUT ─────────────────────────────────────────────────────────────
  layout: {
    headerHeight: '3.5rem',
    headerPadding: '1rem',
    conversationPadding: '1.5rem',
    conversationPaddingMobile: '1rem',
    footerHeight: '5rem',
    footerPaddingTop: '1rem',
    maxWidth: '100%',
  },

  // ─── Z-INDEX ────────────────────────────────────────────────────────────
  zIndex: {
    background: '0',
    content: '10',
    overlay: '100',
  },

  // ─── SCROLLING ──────────────────────────────────────────────────────────
  scrolling: {
    autoScrollThreshold: '100px',  // auto-scroll if within 100px of bottom
    smooth: true,
  },
};

// ─── MESSAGE TYPES ──────────────────────────────────────────────────────────
export type MessageType = 'user' | 'other' | 'system' | 'ai';

export interface ConversationMessage {
  id: string;
  type: MessageType;
  content: string;
  senderName: string;
  senderAvatar?: string | null;
  senderRole?: string;
  timestamp: number; // milliseconds
  status?: 'sent' | 'delivered' | 'read';
  isGrouped?: boolean; // part of consecutive messages from same sender
  metadata?: {
    edited?: boolean;
    editedAt?: number;
    reactions?: Record<string, string[]>;
  };
}

export interface ConversationHeader {
  title: string;           // "Ms. Ananya Mehra"
  subtitle?: string;       // "Class Teacher"
  tertiary?: string;       // "Math & Science"
  quaternary?: string;     // "Usually replies within 2 hours"
  avatar?: string | null;
  status?: 'online' | 'offline' | 'away';
  unreadCount?: number;
  muted?: boolean;
}

export interface QuickReply {
  id: string;
  label: string;           // "Morning was difficult"
  emoji: string;           // "😊"
  action: () => void;
}

export interface ComposerState {
  text: string;
  isDisabled: boolean;
  isSending: boolean;
  placeholder: string;
  canAttach?: boolean;
}
