'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONVERSATION_TOKENS, type ConversationMessage, type ConversationHeader, type QuickReply, type ComposerState } from '@/lib/conversation/conversationTokens';

interface ConversationProps {
  /** Conversation header metadata */
  header: ConversationHeader;

  /** Messages to display */
  messages: ConversationMessage[];

  /** Quick reply suggestions */
  quickReplies?: QuickReply[];

  /** Composer state and handlers */
  composerState: ComposerState;
  onComposerChange: (text: string) => void;
  onComposerSubmit: (text: string) => void;
  onQuickReply: (id: string, label: string) => void;

  /** Optional: Show typing indicator */
  isTyping?: boolean;

  /** Optional: Loading state for initial load */
  isLoading?: boolean;

  /** Optional: Custom className */
  className?: string;
}

const getMessageBubbleColors = (type: ConversationMessage['type']) => {
  if (type === 'user') {
    return {
      bg: CONVERSATION_TOKENS.colors.userBubbleBg,
      text: CONVERSATION_TOKENS.colors.userBubbleText,
    };
  }
  if (type === 'system') {
    return {
      bg: CONVERSATION_TOKENS.colors.systemBg,
      text: CONVERSATION_TOKENS.colors.systemText,
    };
  }
  if (type === 'ai') {
    return {
      bg: CONVERSATION_TOKENS.colors.otherBubbleBg,
      text: CONVERSATION_TOKENS.colors.otherBubbleText,
    };
  }
  return {
    bg: CONVERSATION_TOKENS.colors.otherBubbleBg,
    text: CONVERSATION_TOKENS.colors.otherBubbleText,
  };
};

const groupConsecutiveMessages = (messages: ConversationMessage[]): (ConversationMessage & { isGrouped: boolean; isFirst: boolean; isLast: boolean })[] => {
  return messages.map((msg, i) => ({
    ...msg,
    isGrouped: i > 0 && messages[i - 1].type === msg.type && messages[i - 1].senderName === msg.senderName,
    isFirst: i === 0 || messages[i - 1].type !== msg.type || messages[i - 1].senderName !== msg.senderName,
    isLast: i === messages.length - 1 || messages[i + 1].type !== msg.type || messages[i + 1].senderName !== msg.senderName,
  }));
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const shouldShowDateSeparator = (current: ConversationMessage, previous: ConversationMessage | null): boolean => {
  if (!previous) return true;
  const currentDate = new Date(current.timestamp).toDateString();
  const previousDate = new Date(previous.timestamp).toDateString();
  return currentDate !== previousDate;
};

export default function Conversation({
  header,
  messages,
  quickReplies = [],
  composerState,
  onComposerChange,
  onComposerSubmit,
  onQuickReply,
  isTyping = false,
  isLoading = false,
  className = '',
}: ConversationProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shouldAutoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleScroll = () => {
    if (!conversationRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = conversationRef.current;
    const thresholdPx = parseInt(CONVERSATION_TOKENS.scrolling.autoScrollThreshold.replace('px', ''), 10) || 100;
    const isNearBottom = (scrollHeight - scrollTop - clientHeight) < thresholdPx;
    setShouldAutoScroll(isNearBottom);
  };

  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (composerState.text.trim() && !composerState.isSending) {
        onComposerSubmit(composerState.text);
      }
    }
  };

  const groupedMessages = groupConsecutiveMessages(messages);

  return (
    <div className={`flex flex-col h-full bg-white ${className}`} style={{ backgroundColor: CONVERSATION_TOKENS.colors.conversationBg }}>
      
      {/* ── HEADER ── */}
      <header
        className="flex items-center gap-3 px-6 py-4 border-b"
        style={{
          borderColor: CONVERSATION_TOKENS.colors.otherBubbleBg,
          boxShadow: CONVERSATION_TOKENS.shadows.header,
        }}
      >
        {header.avatar && (
          <img
            src={header.avatar}
            alt={header.title}
            className="rounded-full flex-shrink-0"
            style={{
              width: CONVERSATION_TOKENS.avatar.sizeLarge,
              height: CONVERSATION_TOKENS.avatar.sizeLarge,
            }}
          />
        )}
        {!header.avatar && (
          <div
            className="rounded-full bg-gradient-to-br from-primary to-[#5967d0] flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{
              width: CONVERSATION_TOKENS.avatar.sizeLarge,
              height: CONVERSATION_TOKENS.avatar.sizeLarge,
            }}
          >
            {header.title.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-extrabold text-deep-teal" style={{ fontSize: '1rem' }}>
            {header.title}
          </h2>
          {header.subtitle && (
            <p className="text-xs font-semibold" style={{ color: CONVERSATION_TOKENS.colors.textSecondary }}>
              {header.subtitle}
            </p>
          )}
          {header.tertiary && (
            <p className="text-[11px]" style={{ color: CONVERSATION_TOKENS.colors.textTertiary }}>
              {header.tertiary}
            </p>
          )}
          {header.quaternary && (
            <p className="text-[10px]" style={{ color: CONVERSATION_TOKENS.colors.textTertiary }}>
              {header.quaternary}
            </p>
          )}
        </div>
        {header.unreadCount && header.unreadCount > 0 && (
          <span className="bg-primary text-white rounded-full px-2 py-1 text-xs font-bold">
            {header.unreadCount}
          </span>
        )}
      </header>

      {/* ── CONVERSATION ── */}
      <div
        ref={conversationRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
        style={{
          scrollBehavior: CONVERSATION_TOKENS.scrolling.smooth ? 'smooth' : 'auto',
        }}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <p className="text-lg font-semibold" style={{ color: CONVERSATION_TOKENS.colors.textSecondary }}>
              No messages yet
            </p>
            <p className="text-sm mt-1" style={{ color: CONVERSATION_TOKENS.colors.textTertiary }}>
              Start the conversation
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {groupedMessages.map((msg, i) => (
            <div key={msg.id}>
              {/* Date separator */}
              {shouldShowDateSeparator(msg, groupedMessages[i - 1] || null) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 my-4"
                >
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: CONVERSATION_TOKENS.colors.otherBubbleBg }}
                  />
                  <span className="text-xs font-semibold px-2" style={{ color: CONVERSATION_TOKENS.colors.textTertiary }}>
                    {new Date(msg.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: CONVERSATION_TOKENS.colors.otherBubbleBg }}
                  />
                </motion.div>
              )}

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type !== 'user' && msg.senderAvatar && !msg.isGrouped && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: CONVERSATION_TOKENS.avatar.sizeSmall,
                      height: CONVERSATION_TOKENS.avatar.sizeSmall,
                    }}
                  />
                )}

                {msg.type !== 'user' && !msg.senderAvatar && !msg.isGrouped && (
                  <div
                    className="rounded-full bg-gray-200 flex-shrink-0"
                    style={{
                      width: CONVERSATION_TOKENS.avatar.sizeSmall,
                      height: CONVERSATION_TOKENS.avatar.sizeSmall,
                    }}
                  />
                )}

                {msg.type !== 'user' && msg.isGrouped && (
                  <div
                    className="flex-shrink-0"
                    style={{ width: CONVERSATION_TOKENS.avatar.sizeSmall }}
                  />
                )}

                <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} gap-1`}>
                  {/* Sender name for non-user messages */}
                  {msg.type !== 'user' && msg.isFirst && (
                    <span className="text-xs font-semibold px-3 py-0" style={{ color: CONVERSATION_TOKENS.colors.textSecondary }}>
                      {msg.senderName}
                    </span>
                  )}

                  {/* Bubble */}
                  <div
                    className="rounded-2xl px-4 py-2.5 max-w-xl break-words shadow-sm hover:shadow-md transition-shadow"
                    style={{
                      borderRadius: CONVERSATION_TOKENS.bubble.radius,
                      padding: CONVERSATION_TOKENS.bubble.padding.standard,
                      backgroundColor: getMessageBubbleColors(msg.type).bg,
                      color: getMessageBubbleColors(msg.type).text,
                      boxShadow: CONVERSATION_TOKENS.shadows.bubble,
                      maxWidth: msg.type === 'user' ? CONVERSATION_TOKENS.bubble.maxWidth : CONVERSATION_TOKENS.bubble.maxWidth,
                    }}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>

                  {/* Timestamp and status */}
                  {msg.isLast && (
                    <div className="flex items-center gap-2 px-3 py-1 text-xs" style={{ color: CONVERSATION_TOKENS.colors.textTertiary }}>
                      <span>{formatTimestamp(msg.timestamp)}</span>
                      {msg.status === 'sent' && <span>✓</span>}
                      {msg.status === 'delivered' && <span>✓✓</span>}
                      {msg.status === 'read' && <span className="font-bold">✓✓</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: CONVERSATION_TOKENS.avatar.sizeSmall,
                height: CONVERSATION_TOKENS.avatar.sizeSmall,
                backgroundColor: '#e2e8f0',
              }}
            />
            <div
              className="rounded-2xl px-4 py-2.5 flex gap-1 items-center"
              style={{
                backgroundColor: CONVERSATION_TOKENS.colors.otherBubbleBg,
                borderRadius: CONVERSATION_TOKENS.bubble.radius,
              }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400"
                  animate={{ y: [-4, 0, -4] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── QUICK REPLIES ── */}
      {quickReplies.length > 0 && !composerState.isSending && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 flex flex-wrap gap-2"
        >
          {quickReplies.map(reply => (
            <motion.button
              key={reply.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onQuickReply(reply.id, reply.label)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: CONVERSATION_TOKENS.quickChip.backgroundColor,
                color: CONVERSATION_TOKENS.quickChip.textColor,
              }}
            >
              <span>{reply.emoji}</span>
              <span>{reply.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* ── COMPOSER ── */}
      <div className="border-t px-6 py-4" style={{ borderColor: CONVERSATION_TOKENS.colors.otherBubbleBg }}>
        <div className="flex gap-3 items-flex-end">
          <textarea
            value={composerState.text}
            onChange={e => onComposerChange(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            disabled={composerState.isDisabled}
            placeholder={composerState.placeholder}
            className="flex-1 rounded-2xl px-4 py-3 text-sm border resize-none outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: composerState.isSending
                ? CONVERSATION_TOKENS.composer.borderColorFocus
                : CONVERSATION_TOKENS.composer.borderColorIdle,
              backgroundColor: CONVERSATION_TOKENS.composer.backgroundColor,
              minHeight: CONVERSATION_TOKENS.composer.minHeight,
              maxHeight: CONVERSATION_TOKENS.composer.maxHeight,
            }}
            rows={1}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (composerState.text.trim() && !composerState.isSending) {
                onComposerSubmit(composerState.text);
              }
            }}
            disabled={!composerState.text.trim() || composerState.isSending}
            className="flex-shrink-0 rounded-full px-4 py-3 bg-primary text-white font-semibold text-sm transition-all duration-150 disabled:opacity-40"
          >
            {composerState.isSending ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                ↻
              </motion.span>
            ) : (
              '↑'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
