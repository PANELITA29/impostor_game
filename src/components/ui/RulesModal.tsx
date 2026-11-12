import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { TRANSLATIONS } from '../../utils/i18n';
import { useGameStore } from '../../store/useGameStore';
import {
  Smartphone,
  MessageCircle,
  EyeOff,
  Vote,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const language = useGameStore((state) => state.preferences.language);
  const t = TRANSLATIONS[language].rules;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.title}
    >
      <div className="space-y-4 py-1 text-sm text-text-secondary leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
        {/* Step 1 */}
        <div className="flex gap-3 p-3 rounded-xl bg-canvas/70 border border-elevated/80">
          <div className="p-2 h-fit rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-text-primary text-sm mb-1">
              {t.step1Title}
            </h4>
            <p className="text-xs text-text-secondary">{t.step1Desc}</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-3 p-3 rounded-xl bg-canvas/70 border border-elevated/80">
          <div className="p-2 h-fit rounded-lg bg-accent-warning/10 text-accent-warning border border-accent-warning/20 shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-text-primary text-sm mb-1">
              {t.step2Title}
            </h4>
            <p className="text-xs text-text-secondary">{t.step2Desc}</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-3 p-3 rounded-xl bg-canvas/70 border border-elevated/80">
          <div className="p-2 h-fit rounded-lg bg-accent-impostor/10 text-accent-impostor border border-accent-impostor/20 shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-text-primary text-sm mb-1">
              {t.step3Title}
            </h4>
            <p className="text-xs text-text-secondary">{t.step3Desc}</p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-3 p-3 rounded-xl bg-canvas/70 border border-elevated/80">
          <div className="p-2 h-fit rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shrink-0">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-text-primary text-sm mb-1">
              {t.step4Title}
            </h4>
            <p className="text-xs text-text-secondary">{t.step4Desc}</p>
          </div>
        </div>

        {/* Chaos Mode Notice */}
        <div className="p-3 rounded-xl bg-accent-chaos/10 border border-accent-chaos/30 flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-accent-chaos shrink-0 mt-0.5" />
          <div>
            <h5 className="font-headline font-bold text-xs text-accent-chaos uppercase tracking-wider mb-0.5">
              {t.chaosTitle}
            </h5>
            <p className="text-xs text-text-secondary">{t.chaosDesc}</p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-2">
          <Button
            variant="primary"
            fullWidth
            onClick={onClose}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {t.gotIt}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
