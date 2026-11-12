import React, { useState, useRef, useEffect, memo } from 'react';
import { Edit2, Check, X } from 'lucide-react';

export interface PlayerChipProps {
  id: string;
  name: string;
  index: number;
  onUpdateName: (id: string, newName: string) => void;
  onRemove?: (id: string) => void;
  canRemove?: boolean;
}

/**
 * Sanitizes player names: trims leading/trailing spaces, collapses multiple internal spaces,
 * and limits length to 20 characters.
 */
function sanitizePlayerName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 20);
}

export const PlayerChip: React.FC<PlayerChipProps> = memo(({
  id,
  name,
  index,
  onUpdateName,
  onRemove,
  canRemove = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempName(name);
  }, [name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const sanitized = sanitizePlayerName(tempName);
    if (sanitized && sanitized !== name) {
      onUpdateName(id, sanitized);
    } else {
      setTempName(name);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-elevated border border-accent-primary min-h-[48px] px-2 shadow-lg animate-in zoom-in-95 duration-150">
        <span className="font-code text-xs text-accent-primary font-bold px-1.5 py-0.5 rounded bg-accent-primary/10">
          #{index + 1}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          maxLength={20}
          aria-label={`Editar nombre del jugador ${index + 1}`}
          className="bg-canvas text-text-primary text-sm font-semibold rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-accent-primary"
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur before save
            handleSave();
          }}
          aria-label="Confirmar nombre"
          className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg text-accent-primary hover:bg-accent-primary/15 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      aria-label={`Jugador ${index + 1}: ${name}. Toca para editar.`}
      className="group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-surface border border-elevated/70 hover:border-accent-primary/50 hover:bg-elevated/50 transition-all duration-150 cursor-pointer min-h-[48px] select-none"
    >
      <div className="flex items-center gap-2.5 truncate">
        <span className="font-code text-xs text-text-secondary group-hover:text-accent-primary font-bold px-2 py-0.5 rounded-md bg-elevated shrink-0 transition-colors">
          #{index + 1}
        </span>
        <span className="text-sm font-semibold text-text-primary truncate">
          {name}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-text-secondary/60 group-hover:text-text-primary p-1 rounded transition-colors">
          <Edit2 className="w-3.5 h-3.5" />
        </span>
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            aria-label={`Eliminar a ${name}`}
            className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-text-secondary hover:text-accent-impostor hover:bg-accent-impostor/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});

PlayerChip.displayName = 'PlayerChip';
