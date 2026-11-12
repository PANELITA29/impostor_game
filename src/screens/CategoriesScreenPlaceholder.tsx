import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button, Card, Badge } from '../components/ui';
import { ArrowLeft, Layers, Check } from 'lucide-react';

export const CategoriesScreenPlaceholder: React.FC = () => {
  const { setScreen, categories, settings, toggleCategorySelection } = useGameStore();

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScreen('HOME')}
            aria-label="Volver a Inicio"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Atrás
          </Button>
          <h2 className="text-xl font-headline font-bold text-text-primary">
            Mis Categorías
          </h2>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const isSelected = settings.selectedCategoryIds.includes(cat.id);
            return (
              <Card
                key={cat.id}
                variant={isSelected ? 'innocent' : 'default'}
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleCategorySelection(cat.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center text-text-secondary">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-sm text-text-primary">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {cat.words.length} palabras {cat.isCustom && '· Personalizada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cat.isCustom && <Badge variant="chaos" size="sm">Propia</Badge>}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-accent-primary border-accent-primary text-canvas'
                        : 'border-surface bg-elevated'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setScreen('HOME')}
        >
          Guardar y Volver
        </Button>
      </div>
    </div>
  );
};

