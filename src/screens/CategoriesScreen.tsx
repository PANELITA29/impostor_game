import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button, Card, Badge, Modal } from '../components/ui';
import { CategoryIconBadge } from '../components/gameplay/CategoryVisual';
import type { Category } from '../types/game';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  FolderPlus,
  Sparkles,
} from 'lucide-react';

const sanitizeText = (text: string, maxLen: number = 32): string => {
  return text.trim().replace(/\s+/g, ' ').slice(0, maxLen);
};

export const CategoriesScreen: React.FC = () => {
  const { categories, addCategory, updateCategory, removeCategory, setScreen } =
    useGameStore();

  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('🏷️');
  const [formWords, setFormWords] = useState<string[]>([]);
  const [wordInput, setWordInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const customCategories = categories.filter((c) => c.isCustom);
  const defaultCategories = categories.filter((c) => !c.isCustom);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormIcon('🏷️');
    setFormWords([]);
    setWordInput('');
    setFormError(null);
    setIsEditingModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormIcon(category.icon || '🏷️');
    setFormWords([...category.words]);
    setWordInput('');
    setFormError(null);
    setIsEditingModalOpen(true);
  };

  const handleAddWord = () => {
    const sanitized = sanitizeText(wordInput, 32);
    if (!sanitized) return;

    // Check duplicate case-insensitively
    const exists = formWords.some(
      (w) => w.toLowerCase() === sanitized.toLowerCase()
    );
    if (exists) {
      setFormError(`"${sanitized}" ya existe en esta categoría.`);
      return;
    }

    setFormWords([...formWords, sanitized]);
    setWordInput('');
    setFormError(null);
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setFormWords(formWords.filter((w) => w !== wordToRemove));
    setFormError(null);
  };

  const handleKeyDownWordInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddWord();
    }
  };

  const handleSaveCategory = () => {
    const sanitizedName = sanitizeText(formName, 32);
    if (!sanitizedName) {
      setFormError('El nombre de la categoría es obligatorio.');
      return;
    }

    if (formWords.length < 3) {
      setFormError('Debes agregar al menos 3 palabras para guardar la categoría.');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: sanitizedName,
        words: formWords,
        icon: formIcon,
      });
    } else {
      addCategory({
        name: sanitizedName,
        words: formWords,
        isCustom: true,
        icon: formIcon,
      });
    }

    setIsEditingModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      removeCategory(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between pb-8">
      {/* Top Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-elevated/40">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScreen('LOBBY')}
              aria-label="Volver al Lobby"
              leftIcon={<ArrowLeft className="w-5 h-5" />}
            >
              Lobby
            </Button>
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-text-primary">
              Mis Categorías
            </h1>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Categoría
          </Button>
        </div>

        {/* Section: Custom Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-headline font-bold text-text-primary flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-accent-chaos" />
              Categorías Propias ({customCategories.length})
            </h2>
          </div>

          {customCategories.length === 0 ? (
            <Card variant="default" className="text-center py-8 space-y-3">
              <Sparkles className="w-8 h-8 text-text-secondary mx-auto opacity-40" />
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                No tienes categorías personalizadas aún. ¡Crea una con lugares o palabras de tu grupo de amigos!
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenCreate}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Crear Mi Primera Categoría
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customCategories.map((cat) => (
                <Card
                  key={cat.id}
                  variant="default"
                  className="flex flex-col justify-between p-4 space-y-3 border-elevated/80 hover:border-accent-chaos/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIconBadge category={cat} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline font-bold text-base text-text-primary truncate">
                            {cat.name}
                          </h3>
                          <Badge variant="chaos" size="sm">
                            Propia
                          </Badge>
                        </div>
                        <span className="text-xs text-text-secondary block">
                          {cat.words.length} palabras registradas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        aria-label={`Editar categoría ${cat.name}`}
                        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(cat.id)}
                        aria-label={`Eliminar categoría ${cat.name}`}
                        className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg text-text-secondary hover:text-accent-impostor hover:bg-accent-impostor/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Word previews preview tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.words.slice(0, 5).map((w) => (
                      <span
                        key={w}
                        className="text-xs font-code px-2 py-0.5 rounded-md bg-elevated text-text-secondary"
                      >
                        {w}
                      </span>
                    ))}
                    {cat.words.length > 5 && (
                      <span className="text-xs font-code px-1.5 py-0.5 rounded-md text-text-secondary/60">
                        +{cat.words.length - 5} más
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section: Default Included Categories */}
        <div className="space-y-3 pt-4">
          <h2 className="text-base font-headline font-bold text-text-primary flex items-center gap-2">
            <span>Categorías Base del Juego ({defaultCategories.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {defaultCategories.map((cat) => (
              <Card key={cat.id} variant="default" className="p-3.5 flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
                <CategoryIconBadge category={cat} size="md" />
                <div className="min-w-0">
                  <span className="font-headline font-bold text-sm text-text-primary block truncate">
                    {cat.name}
                  </span>
                  <span className="text-xs text-text-secondary block">
                    {cat.words.length} palabras
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Back button at footer */}
      <div className="pt-6">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setScreen('LOBBY')}
        >
          Volver a Configurar Partida
        </Button>
      </div>

      {/* Create / Edit Modal Form */}
      <Modal
        isOpen={isEditingModalOpen}
        onClose={() => setIsEditingModalOpen(false)}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        description="Agrega un título y al menos 3 palabras para que el juego pueda seleccionarlas."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="ghost"
              onClick={() => setIsEditingModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveCategory}
            >
              Guardar Categoría
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-impostor/15 border border-accent-impostor/40 text-accent-impostor text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Nombre de Categoría */}
          <div className="space-y-1.5">
            <label
              htmlFor="category-name-input"
              className="text-xs font-headline font-bold text-text-primary uppercase tracking-wider"
            >
              Nombre de Categoría *
            </label>
            <input
              id="category-name-input"
              type="text"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                setFormError(null);
              }}
              placeholder="Ej. Series Animadas, Amigos del Barrio..."
              maxLength={30}
              className="w-full min-h-[48px] px-3.5 rounded-xl bg-canvas border border-elevated text-text-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          {/* Selector de Ícono / Emoji */}
          <div className="space-y-1.5">
            <label className="text-xs font-headline font-bold text-text-primary uppercase tracking-wider flex items-center justify-between">
              <span>Ícono / Emoji</span>
              <span className="text-base leading-none">{formIcon}</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-canvas border border-elevated">
              {['🏷️', '🎭', '🔥', '🚀', '🧠', '🍻', '🍔', '👻', '👾', '🎉', '💡', '👑', '🍿', '🚗', '🎸', '🏖️'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormIcon(emoji)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    formIcon === emoji
                      ? 'bg-accent-chaos/25 border-2 border-accent-chaos scale-110 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                      : 'bg-elevated/40 border border-transparent hover:bg-elevated hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de Entrada de Palabras */}
          <div className="space-y-1.5">
            <label
              htmlFor="word-chip-input"
              className="text-xs font-headline font-bold text-text-primary uppercase tracking-wider flex items-center justify-between"
            >
              <span>Palabras Clave ({formWords.length}) *</span>
              <span className="text-[11px] font-normal text-text-secondary lowercase">
                mínimo 3 requeridas
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                id="word-chip-input"
                type="text"
                value={wordInput}
                onChange={(e) => {
                  setWordInput(e.target.value);
                  setFormError(null);
                }}
                onKeyDown={handleKeyDownWordInput}
                placeholder="Escribe una palabra..."
                maxLength={25}
                className="flex-1 min-h-[48px] px-3.5 rounded-xl bg-canvas border border-elevated text-text-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddWord}
                disabled={!wordInput.trim()}
                leftIcon={<Plus className="w-4 h-4" />}
                className="min-h-[48px]"
              >
                Agregar
              </Button>
            </div>
          </div>

          {/* Words Chips Container */}
          <div className="p-3 rounded-xl bg-canvas border border-elevated/70 min-h-[110px] max-h-[180px] overflow-y-auto">
            {formWords.length === 0 ? (
              <span className="text-xs text-text-secondary italic block text-center py-6">
                No hay palabras todavía. Añade al menos 3 palabras.
              </span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated border border-surface text-text-primary text-xs font-code font-bold"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(word)}
                      aria-label={`Eliminar palabra ${word}`}
                      className="text-text-secondary hover:text-accent-impostor transition-colors p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="¿Eliminar categoría?"
        description="Esta acción eliminará la categoría personalizada y sus palabras permanentemente."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Sí, Eliminar
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary">
          No podrás recuperar estas palabras una vez eliminadas. Las partidas futuras ya no incluirán esta categoría.
        </p>
      </Modal>
    </div>
  );
};

