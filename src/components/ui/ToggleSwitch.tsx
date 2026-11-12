import React from 'react';

export interface ToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  activeColor?: 'primary' | 'impostor' | 'chaos';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  activeColor = 'primary',
}) => {
  const switchId = id || (label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const activeColorClasses = {
    primary: 'bg-accent-primary focus-visible:ring-accent-primary',
    impostor: 'bg-accent-impostor focus-visible:ring-accent-impostor',
    chaos: 'bg-accent-chaos focus-visible:ring-accent-chaos',
  };

  return (
    <label
      htmlFor={switchId}
      className={`group flex items-center justify-between gap-4 p-2 select-none cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      }`}
    >
      {(label || description) && (
        <div className="flex flex-col flex-1">
          {label && (
            <span className="text-base font-semibold text-text-primary group-hover:text-text-primary/90 transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-text-secondary">
              {description}
            </span>
          )}
        </div>
      )}

      {/* Touch-target wrapper: strictly min 48px x 48px */}
      <div className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] shrink-0">
        <button
          type="button"
          id={switchId}
          role="switch"
          aria-checked={checked}
          aria-label={label || 'Interruptor'}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
            checked ? activeColorClasses[activeColor] : 'bg-elevated'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-text-primary shadow-lg ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5 bg-canvas' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </label>
  );
};

