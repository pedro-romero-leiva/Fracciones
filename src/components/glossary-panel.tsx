'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { MotionDiv, AnimatePresence } from './motion-div';
import { Separator } from './ui/separator';

const glossaryTerms = [
  {
    emoji: '🔢',
    term: 'Fracción',
    definition: 'Una parte de un todo. Se escribe como: numerador/denominador.',
    example: 'Ejemplo: 3/4 (tres cuartos)',
  },
  {
    emoji: '📊',
    term: 'Numerador',
    definition: 'El número de arriba. Indica cuántas partes tienes.',
    example: 'En 3/4, el numerador es 3.',
  },
  {
    emoji: '📏',
    term: 'Denominador',
    definition: 'El número de abajo. Indica en cuántas partes se divide el todo.',
    example: 'En 3/4, el denominador es 4.',
  },
  {
    emoji: '⚖️',
    term: 'Fracciones equivalentes',
    definition: 'Fracciones diferentes que representan la misma cantidad.',
    example: 'Ejemplo: 1/2 = 2/4 = 4/8',
  },
  {
    emoji: '➕',
    term: 'Suma de fracciones',
    definition: 'Juntar dos o más fracciones.',
    example: 'Ejemplo: 1/4 + 1/4 = 2/4 = 1/2',
  },
  {
    emoji: '🔄',
    term: 'Simplificar',
    definition: 'Reducir una fracción a su forma más simple.',
    example: 'Ejemplo: 4/8 simplificado = 1/2',
  },
];

interface GlossaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlossaryPanel({ isOpen, onClose }: GlossaryPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[8999]"
            onClick={onClose}
          />
          <MotionDiv
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-lg z-[9000] flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">📖 Glosario de fracciones</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {glossaryTerms.map((item, index) => (
                <div key={item.term}>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">{item.emoji}</span>
                      {item.term}
                    </h3>
                    <p className="text-muted-foreground mt-1">{item.definition}</p>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                      <p className="italic">{item.example}</p>
                    </div>
                  </div>
                  {index < glossaryTerms.length - 1 && <Separator className="my-6" />}
                </div>
              ))}
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
}
