import React, { useRef, useState, useCallback } from 'react';

export interface DockItemData {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  badge?: string | number | boolean;
  badgeColor?: string;
  disabled?: boolean;
}

export interface DockProps {
  items: DockItemData[];
  magnification?: number;
  distance?: number;
  className?: string;
}

const BASE_ITEM_SIZE = 38; // Base width & height in pixels

export const Dock: React.FC<DockProps> = ({
  items,
  magnification = 1.25,
  distance = 75,
  className = '',
}) => {
  const dockRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [scales, setScales] = useState<Record<string, number>>({});

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dockRef.current) return;
      const mouseX = e.clientX;

      const children = Array.from(dockRef.current.querySelectorAll('[data-dock-item]'));
      const newScales: Record<string, number> = {};

      children.forEach((el, index) => {
        const item = items[index];
        if (!item) return;

        const childRect = el.getBoundingClientRect();
        const itemCenterX = childRect.left + childRect.width / 2;
        const dist = Math.abs(mouseX - itemCenterX);

        if (dist < distance) {
          // Smooth cosine curve for natural magnification falloff
          const factor = Math.cos((dist / distance) * (Math.PI / 2));
          newScales[item.id] = 1 + (magnification - 1) * factor;
        } else {
          newScales[item.id] = 1;
        }
      });

      setScales(newScales);
    },
    [items, distance, magnification]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setScales({});
  }, []);

  const handleItemClick = (item: DockItemData) => {
    // Reset hover and magnification immediately so elements never stay expanded/overlapping on click
    setHoveredId(null);
    setScales({});
    item.onClick();
  };

  return (
    <nav
      ref={dockRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="toolbar"
      aria-label="Barra de Navegación Rápida"
      className={`relative inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 rounded-2xl bg-surface/90 backdrop-blur-xl border border-elevated shadow-lg select-none transition-all duration-200 ${className}`}
    >
      {items.map((item) => {
        const scale = scales[item.id] ?? 1;
        const isHovered = hoveredId === item.id;
        const currentSize = Math.round(BASE_ITEM_SIZE * scale);

        return (
          <div
            key={item.id}
            data-dock-item
            style={{
              width: `${currentSize}px`,
              transition: 'width 0.15s cubic-bezier(0.2, 0, 0, 1)',
            }}
            className="relative flex flex-col items-center justify-center shrink-0"
          >
            {/* Tooltip on Hover */}
            {isHovered && (
              <div
                className="absolute -bottom-8 pointer-events-none z-50 px-2 py-0.5 rounded-md bg-canvas/95 border border-elevated text-[11px] font-headline font-semibold text-text-primary whitespace-nowrap shadow-lg animate-in fade-in zoom-in-95 duration-100"
              >
                {item.label}
              </div>
            )}

            {/* Dock Button Icon */}
            <button
              type="button"
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              onMouseEnter={() => setHoveredId(item.id)}
              aria-label={item.label}
              style={{
                width: `${currentSize}px`,
                height: `${currentSize}px`,
                transition: 'width 0.15s cubic-bezier(0.2, 0, 0, 1), height 0.15s cubic-bezier(0.2, 0, 0, 1), background-color 0.2s ease',
              }}
              className={`relative flex items-center justify-center rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent-primary z-10 ${
                item.isActive
                  ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/50 shadow-[0_0_12px_rgba(var(--color-accent-primary),0.3)]'
                  : 'bg-elevated/50 hover:bg-elevated text-text-secondary hover:text-text-primary border border-elevated/40'
              } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {item.icon}
              </div>

              {/* Notification / Status Badge */}
              {item.badge !== undefined && item.badge !== false && (
                <span
                  style={{
                    backgroundColor: item.badgeColor || 'rgb(var(--color-accent-impostor))',
                  }}
                  className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-bold shadow-[0_0_8px_rgba(255,59,92,0.6)] ${
                    typeof item.badge === 'number' || typeof item.badge === 'string'
                      ? 'min-w-[16px] h-4 px-1 text-[9px]'
                      : 'w-2 h-2'
                  }`}
                >
                  {typeof item.badge === 'number' || typeof item.badge === 'string'
                    ? item.badge
                    : null}
                </span>
              )}
            </button>

            {/* Active Running Indicator Dot */}
            <div className="h-1 flex items-center justify-center mt-0.5">
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_rgb(var(--color-accent-primary))] animate-pulse" />
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
};
