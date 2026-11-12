import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'interactive' | 'impostor' | 'innocent' | 'chaos';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 border p-5 md:p-6';

  const variantStyles: Record<CardVariant, string> = {
    default: 'bg-surface border-elevated/40 text-text-primary shadow-lg',
    elevated: 'bg-elevated border-surface text-text-primary shadow-xl',
    interactive:
      'bg-surface border-elevated/60 text-text-primary hover:border-accent-primary/60 hover:bg-elevated/60 cursor-pointer active:scale-[0.99] shadow-lg',
    impostor:
      'bg-surface border-accent-impostor/50 shadow-[0_0_24px_rgba(255,59,92,0.15)] text-text-primary',
    innocent:
      'bg-surface border-accent-primary/50 shadow-[0_0_24px_rgba(0,229,160,0.15)] text-text-primary',
    chaos:
      'bg-surface border-accent-chaos/50 shadow-[0_0_24px_rgba(168,85,247,0.15)] text-text-primary',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

