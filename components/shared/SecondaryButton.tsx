interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-xs px-4 py-2 rounded-xl',
  lg: 'text-sm px-5 py-2.5 rounded-xl',
};

export function SecondaryButton({ children, className = '', size = 'md', ...props }: SecondaryButtonProps) {
  return (
    <button
      className={`pressable inline-flex items-center justify-center gap-1.5 font-display font-bold border border-deep-teal/15 text-deep-teal bg-transparent hover:bg-deep-teal/5 focus-visible:ring-2 focus-visible:ring-deep-teal/40 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
