import React from 'react';

export type BadgeVariant = 'primary' | 'impostor' | 'chaos' | 'warning' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-code font-bold uppercase tracking-wider rounded-full border select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs md:text-sm px-3 py-1 gap-2',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    primary:
      'bg-accent-primary/15 text-accent-primary border-accent-primary/40 shadow-[0_0_12px_rgba(0,229,160,0.2)]',
    impostor:
      'bg-accent-impostor/15 text-accent-impostor border-accent-impostor/40 shadow-[0_0_12px_rgba(255,59,92,0.2)]',
    chaos:
      'bg-accent-chaos/15 text-accent-chaos border-accent-chaos/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
    warning:
      'bg-accent-warning/15 text-accent-warning border-accent-warning/40 shadow-[0_0_12px_rgba(255,184,0,0.2)]',
    neutral: 'bg-elevated/70 text-text-secondary border-surface',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="inline-flex items-center shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

