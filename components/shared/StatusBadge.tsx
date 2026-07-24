import { type ReactNode } from 'react';

type StatusType = 
  | 'on-track' | 'On Track' 
  | 'worth-watching' | 'Worth Watching'
  | 'needs-attention' | 'Needs Attention'
  | 'success' | 'verified' | 'present' | 'approved' | 'used'
  | 'warning' | 'late' | 'pending' | 'absent'
  | 'error' | 'rejected' | 'expired' | 'excused'
  | 'info' | 'visitor' | 'gate-pass';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
  showDot?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<string, {
  bg: string;
  text: string;
  border: string;
  dot?: string;
  label?: string;
}> = {
  // Academic Status
  'on-track': {
    bg: 'bg-sage/10',
    text: 'text-sage',
    border: 'border-sage/20',
    dot: 'bg-sage',
    label: 'On Track',
  },
  'On Track': {
    bg: 'bg-sage/10',
    text: 'text-sage',
    border: 'border-sage/20',
    dot: 'bg-sage',
    label: 'On Track',
  },
  'worth-watching': {
    bg: 'bg-marigold/10',
    text: 'text-marigold',
    border: 'border-marigold/20',
    dot: 'bg-marigold',
    label: 'Worth Watching',
  },
  'Worth Watching': {
    bg: 'bg-marigold/10',
    text: 'text-marigold',
    border: 'border-marigold/20',
    dot: 'bg-marigold',
    label: 'Worth Watching',
  },
  'needs-attention': {
    bg: 'bg-warm-clay/10',
    text: 'text-warm-clay',
    border: 'border-warm-clay/20',
    dot: 'bg-warm-clay',
    label: 'Needs Attention',
  },
  'Needs Attention': {
    bg: 'bg-warm-clay/10',
    text: 'text-warm-clay',
    border: 'border-warm-clay/20',
    dot: 'bg-warm-clay',
    label: 'Needs Attention',
  },
  
  // Success States
  'success': {
    bg: 'bg-sage/10',
    text: 'text-sage',
    border: 'border-sage/20',
    dot: 'bg-sage',
  },
  'verified': {
    bg: 'bg-sage/10',
    text: 'text-sage',
    border: 'border-sage/20',
    dot: 'bg-sage',
    label: 'Verified',
  },
  'present': {
    bg: 'bg-sage/10',
    text: 'text-sage',
    border: 'border-sage/20',
    dot: 'bg-sage',
    label: 'Present',
  },
  'approved': {
    bg: 'bg-sage/10',
    text: 'text-sage',
    border: 'border-sage/20',
    dot: 'bg-sage',
    label: 'Approved',
  },
  'used': {
    bg: 'bg-sage/10',
    text: 'text-sage',
    border: 'border-sage/20',
    dot: 'bg-sage',
    label: 'Used',
  },
  
  // Warning States
  'warning': {
    bg: 'bg-marigold/10',
    text: 'text-marigold',
    border: 'border-marigold/20',
    dot: 'bg-marigold',
  },
  'late': {
    bg: 'bg-marigold/10',
    text: 'text-marigold',
    border: 'border-marigold/20',
    dot: 'bg-marigold',
    label: 'Late',
  },
  'pending': {
    bg: 'bg-marigold/10',
    text: 'text-marigold',
    border: 'border-marigold/20',
    dot: 'bg-marigold',
    label: 'Pending',
  },
  'absent': {
    bg: 'bg-marigold/10',
    text: 'text-marigold',
    border: 'border-marigold/20',
    dot: 'bg-marigold',
    label: 'Absent',
  },
  
  // Error States
  'error': {
    bg: 'bg-warm-clay/10',
    text: 'text-warm-clay',
    border: 'border-warm-clay/20',
    dot: 'bg-warm-clay',
  },
  'rejected': {
    bg: 'bg-warm-clay/10',
    text: 'text-warm-clay',
    border: 'border-warm-clay/20',
    dot: 'bg-warm-clay',
    label: 'Rejected',
  },
  'expired': {
    bg: 'bg-warm-clay/10',
    text: 'text-warm-clay',
    border: 'border-warm-clay/20',
    dot: 'bg-warm-clay',
    label: 'Expired',
  },
  'excused': {
    bg: 'bg-deep-teal/10',
    text: 'text-deep-teal',
    border: 'border-deep-teal/20',
    dot: 'bg-deep-teal',
    label: 'Excused',
  },
  
  // Info States
  'info': {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    dot: 'bg-primary',
  },
  'visitor': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    label: 'Visitor',
  },
  'gate-pass': {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    label: 'Gate Pass',
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
  lg: 'px-4 py-1.5 text-sm gap-2',
};

const DOT_SIZE = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
};

export default function StatusBadge({ 
  status, 
  size = 'md', 
  children, 
  showDot = false,
  className = '',
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[normalizedStatus] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
  };

  const displayText = children || config.label || status;

  return (
    <span
      className={`inline-flex items-center ${SIZE_CLASSES[size]} ${config.bg} ${config.text} ${config.border} border rounded-full font-bold ${className}`}
      role="status"
      aria-label={`Status: ${displayText}`}
    >
      {showDot && (
        <span 
          className={`${DOT_SIZE[size]} rounded-full ${config.dot} flex-shrink-0`}
          aria-hidden="true"
        />
      )}
      {displayText}
    </span>
  );
}
