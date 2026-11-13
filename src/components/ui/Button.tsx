import React from 'react';
import { audioManager } from '../../audio/audioManager';

export type ButtonVariant = 'primary' | 'danger' | 'chaos' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg' | 'sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isCta?: boolean;
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
      isCta = false,
      onClick,
      ...props
    },
    ref
  ) => {
    // Base styles with Game Juice physics and 48px touch target
    const baseStyles =
      'btn-game-juice relative inline-flex items-center justify-center font-headline font-bold rounded-xl min-h-[48px] min-w-[48px] px-5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none';

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-accent-primary text-canvas focus-visible:ring-accent-primary shadow-[0_0_20px_rgba(0,229,160,0.25)]',
      danger:
        'bg-accent-impostor text-text-primary focus-visible:ring-accent-impostor shadow-[0_0_20px_rgba(255,59,92,0.25)]',
      chaos:
        'bg-accent-chaos text-text-primary focus-visible:ring-accent-chaos shadow-[0_0_20px_rgba(168,85,247,0.25)]',
      secondary:
        'bg-elevated text-text-primary border border-surface focus-visible:ring-text-secondary',
      ghost:
        'bg-transparent text-text-secondary focus-visible:ring-text-secondary',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-sm min-h-[48px] px-4 py-2',
      md: 'text-base min-h-[48px] px-5 py-3',
      lg: 'text-lg min-h-[56px] px-6 py-4',
    };

    const widthStyle = fullWidth ? 'w-full' : '';
    const ctaStyle = isCta ? 'btn-cta-pulse' : '';
    const lastSoundPlayedRef = React.useRef(0);

    const playTapSound = () => {
      const now = Date.now();
      // Guard against double sound between pointerdown and click events
      if (now - lastSoundPlayedRef.current > 120) {
        lastSoundPlayedRef.current = now;
        audioManager.playSfx('tap');
      }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!disabled && e.button === 0) {
        playTapSound();
      }
      props.onPointerDown?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Handles keyboard activation (Enter / Space) or environments where pointerdown was skipped
      if (!disabled) {
        playTapSound();
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${ctaStyle} ${className}`.trim()}
        {...props}
      >
        {leftIcon && <span className="mr-2.5 inline-flex items-center shrink-0 relative z-10">{leftIcon}</span>}
        <span className="relative z-10">{children}</span>
        {rightIcon && <span className="ml-2.5 inline-flex items-center shrink-0 relative z-10">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

