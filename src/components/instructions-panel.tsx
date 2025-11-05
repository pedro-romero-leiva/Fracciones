import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { MotionDiv, AnimatePresence } from './motion-div';

const instructions = [
  {
    title: "Tu primer círculo de fracción",
    content: "Mira el círculo en el área de trabajo. Es como una pizza completa 🍕. Cada círculo representa un entero (1).",
  },
  {
    title: "Divide en porciones",
    content: "Usa los botones [+] y [-] en 'Dividir' para cortar el círculo en partes. [+] te da más porciones (partes más pequeñas) y [-] te da menos porciones (partes más grandes).",
  },
  {
    title: "Colorea porciones",
    content: "1. Haz clic en [✓ Seleccionar]\n2. Haz clic en las porciones del círculo\n3. Las porciones se colorean\n\nPorción coloreada = porción que estás usando.",
  },
  {
    title: "Más cosas que puedes hacer",
    content: "🗑️ Borrador: elimina un círculo completo.\n\n↔️ Arrastrar: mueve porciones a otro círculo para sumar fracciones.\n\n× Amplificar: crea fracciones equivalentes.\n\n¡Ahora explora y diviértete! 🎉",
  }
];


interface InstructionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionsPanel({ isOpen, onClose }: InstructionsPanelProps) {
  const [step, setStep] = useState(0);

  const goToNextStep = () => setStep(prev => Math.min(prev + 1, instructions.length - 1));
  const goToPrevStep = () => setStep(prev => Math.max(prev - 1, 0));
  const reset = () => setStep(0);

  return (
    <AnimatePresence>
    {isOpen && (
      <MotionDiv
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-sm p-4 bg-card border-r shadow-lg flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Paso {step + 1}/{instructions.length}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
        </div>
        
        <div className="flex-1">
            <h3 className="font-bold text-foreground text-xl mb-2">📍 {instructions[step].title}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{instructions[step].content}</p>
        </div>

        <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="sm" onClick={goToPrevStep} disabled={step === 0}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Anterior
            </Button>
            {step === instructions.length - 1 ? (
                <Button size="sm" onClick={reset}>
                   <div className='flex gap-2 items-center'>
                    <RefreshCw className="h-4 w-4" />
                    <span>Volver al inicio</span>
                   </div>
                </Button>
            ) : (
                <Button size="sm" onClick={goToNextStep}>
                    Siguiente <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            )}
        </div>
      </MotionDiv>
    )}
    </AnimatePresence>
  );
}
