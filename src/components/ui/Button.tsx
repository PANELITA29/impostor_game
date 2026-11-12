import React from 'react';

export type ButtonVariant = 'primary' | 'danger' | 'chaos' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg' | 'sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles: Mandatory minimum touch target of 48px x 48px
    const baseStyles =
      'inline-flex items-center justify-center font-headline font-bold rounded-xl transition-all duration-150 min-h-[48px] min-w-[48px] px-5 py-3 select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-accent-primary text-canvas hover:brightness-110 active:brightness-95 focus-visible:ring-accent-primary shadow-[0_0_20px_rgba(0,229,160,0.25)]',
      danger:
        'bg-accent-impostor text-text-primary hover:brightness-110 active:brightness-95 focus-visible:ring-accent-impostor shadow-[0_0_20px_rgba(255,59,92,0.25)]',
      chaos:
        'bg-accent-chaos text-text-primary hover:brightness-110 active:brightness-95 focus-visible:ring-accent-chaos shadow-[0_0_20px_rgba(168,85,247,0.25)]',
      secondary:
        'bg-elevated text-text-primary border border-surface hover:bg-surface/80 active:bg-elevated focus-visible:ring-text-secondary',
      ghost:
        'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface/50 active:bg-surface focus-visible:ring-text-secondary',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-sm min-h-[48px] px-4 py-2',
      md: 'text-base min-h-[48px] px-5 py-3',
      lg: 'text-lg min-h-[56px] px-6 py-4',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim()}
        {...props}
      >
        {leftIcon && <span className="mr-2.5 inline-flex items-center shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="ml-2.5 inline-flex items-center shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

