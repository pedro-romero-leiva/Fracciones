'use client';

import { useState, useEffect } from 'react';
import { useTutorial } from '@/hooks/use-tutorial';
import { Button } from './ui/button';
import { MotionDiv, AnimatePresence } from './motion-div';
import { Progress } from './ui/progress';

const tutorialSteps = [
  // Step 0 is inactive
  {}, 
  // Step 1
  {
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4">¡Bienvenido al tutorial!</h2>
        <p className="mb-2">Aprenderás a crear y manipular fracciones usando círculos visuales.</p>
        <p>Imagina que tienes una pizza 🍕 y quieres compartirla en partes iguales. Este tutorial te muestra cómo hacerlo.</p>
      </>
    ),
    spotlightSelector: null,
    position: 'center',
  },
  // Step 2
  {
    content: (
      <>
        <p>Este es tu círculo de fracción.</p>
        <p>Ahora mismo representa 1 entero. Es como una pizza completa 🍕</p>
        <p className="mt-2">Vamos a dividirla en porciones.</p>
      </>
    ),
    spotlightSelector: '[data-tutorial-id="first-circle-group"]',
    position: 'bottom',
  },
  // Step 3
  {
    content: (
      <>
        <p className="font-bold my-2">¡Pruébalo ahora!</p>
        <p>Usa estos botones para dividir el círculo en porciones.</p>
        <p>Presiona [+] para dividir en más porciones.</p>
        <p className="mt-2 text-sm text-muted-foreground">Cada porción será una parte más pequeña de la pizza.</p>
      </>
    ),
    spotlightSelector: '[data-tutorial-id="divide-controls"]',
    position: 'bottom',
  },
  // Step 4
  {
    content: (
       <>
        <p className="text-2xl font-bold mb-4 text-primary">¡Ahora tú! 👆</p>
        <div className="space-y-4 text-left">
          <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
            <p className="mb-1 text-base"><strong>Paso 1:</strong> Haz clic en el botón <span className="font-bold">✓ Seleccionar</span></p>
            <p className="text-sm text-primary/80">👇 Mira abajo, en la barra de herramientas resaltada.</p>
          </div>
          <div className="bg-green-500/10 p-4 rounded-lg border-l-4 border-green-500">
            <p className="mb-1 text-base"><strong>Paso 2:</strong> Luego haz clic en algunas porciones del círculo.</p>
            <p className="text-sm text-green-600/80">✨ ¡Las porciones se colorearán de azul!</p>
          </div>
        </div>
      </>
    ),
    spotlightSelector: ['[data-tutorial-id="toolbar"]', '[data-tutorial-id="first-circle-group"]'],
    position: 'center',
  },
  // Step 5
  {
    content: (
      <div className="text-left w-full">
        <p className="text-2xl font-bold mb-4 text-primary text-center">🛠️ Conoce las herramientas</p>
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-destructive">
            <p className="font-bold">🗑️ Borrador</p>
            <p className="text-sm text-muted-foreground">Elimina un grupo de círculos completo con un solo clic.</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-blue-500">
            <p className="font-bold">↔️ Arrastrar</p>
            <p className="text-sm text-muted-foreground">Mueve porciones de un círculo a otro para sumar fracciones.</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-accent">
            <p className="font-bold">× Amplificar</p>
            <p className="text-sm text-muted-foreground">Crea fracciones equivalentes multiplicando. (Ej: 1/2 = 2/4)</p>
          </div>
        </div>
      </div>
    ),
    spotlightSelector: '[data-tutorial-id="toolbar"]',
    position: 'top',
  },
   // Step 6
  {
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4">¡A practicar!</h2>
        <p>Ahora intenta tú:</p>
        <ol className="list-decimal list-inside my-2 space-y-1">
          <li>Añade un nuevo círculo.</li>
          <li>Divídelo en 4 partes.</li>
          <li>Selecciona 2 porciones.</li>
        </ol>
        <p>¡Acabas de crear 2/4! Presiona <span className="font-bold">[X]</span> para cerrar el tutorial y explorar.</p>
      </>
    ),
    spotlightSelector: '[data-tutorial-id="add-circle-button"]',
    position: 'top',
  },
];

const Spotlight = ({ selectors }: { selectors: (string | null)[] }) => {
  const [rects, setRects] = useState<(DOMRect | null)[]>([]);

  useEffect(() => {
    const elements = selectors.map(selector => selector ? document.querySelector(selector) : null);
    
    const updateRects = () => {
        const newRects = elements.map(element => element ? element.getBoundingClientRect() : null);
        if (JSON.stringify(newRects) !== JSON.stringify(rects)) {
            setRects(newRects);
        }
    };

    updateRects();
    
    const interval = setInterval(updateRects, 100);
    window.addEventListener('resize', updateRects);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', updateRects);
    };
  }, [selectors, rects]);

  return (
    <>
      {rects.map((rect, index) => 
        rect && (
          <div
            key={index}
            className="spotlight-frame fixed"
            style={{
              left: rect.left - 8,
              top: rect.top - 8,
              width: rect.width + 16,
              height: rect.height + 16,
              borderColor: selectors[index]?.includes('toolbar') ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
              borderRadius: selectors[index]?.includes('circle') || selectors[index]?.includes('button') ? '9999px' : '16px',
            }}
          />
        )
      )}
    </>
  );
};


export function Tutorial() {
  const { isTutorialActive, currentStep, nextStep, prevStep, skipTutorial, setStep } = useTutorial();
  const [targetRects, setTargetRects] = useState<(DOMRect|null)[]>([]);

  const stepConfig = isTutorialActive ? tutorialSteps[currentStep] : null;
  
  useEffect(() => {
    if (!isTutorialActive || !stepConfig || !stepConfig.spotlightSelector) {
        return;
    }

    const selectors = Array.isArray(stepConfig.spotlightSelector) ? stepConfig.spotlightSelector : [stepConfig.spotlightSelector];
    const elements = selectors.map(s => s ? document.querySelector(s) : null).filter(Boolean) as HTMLElement[];

    elements.forEach(el => {
        el.style.position = 'relative';
        el.style.zIndex = '10002';
        el.style.pointerEvents = 'auto';
    });

    const updateTargetRects = () => {
        const newRects = elements.map(el => el.getBoundingClientRect());
        if (JSON.stringify(newRects) !== JSON.stringify(targetRects)) {
            setTargetRects(newRects);
        }
    };
    
    updateTargetRects();
    const interval = setInterval(updateTargetRects, 100);
    
    return () => {
        clearInterval(interval);
        elements.forEach(el => {
            el.style.zIndex = '';
            el.style.position = '';
            el.style.pointerEvents = '';
        });
    };
  }, [isTutorialActive, currentStep, stepConfig, targetRects]);

  if (!isTutorialActive || !stepConfig) {
      return null;
  }

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      nextStep();
    } else {
      skipTutorial();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      prevStep();
    }
  };
  
  const handleRestart = () => {
    setStep(1);
  };
  
  const totalSteps = tutorialSteps.length - 1;
  const progress = (currentStep / totalSteps) * 100;
  
  let boxPositionClass = 'justify-center items-end pb-8';
  if (stepConfig.position === 'top') {
    boxPositionClass = 'justify-center items-start pt-8';
  } else if (stepConfig.position === 'center') {
    boxPositionClass = 'justify-center items-center';
  } else if (targetRects.length > 0 && targetRects[0]) {
      const windowHeight = window.innerHeight;
      if (targetRects[0].bottom > windowHeight * 0.6) {
          boxPositionClass = 'justify-center items-start pt-8';
      }
  }

  const selectors = (Array.isArray(stepConfig.spotlightSelector) ? stepConfig.spotlightSelector : [stepConfig.spotlightSelector]).filter((s): s is string | null => s !== undefined);

  return (
    <AnimatePresence>
      <div
          id="tutorial-overlay"
          className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex p-4"
        >
        <Spotlight selectors={selectors} />
        <div className={`w-full h-full flex ${boxPositionClass}`}>
          <MotionDiv
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="tutorial-box z-[10002] bg-card text-card-foreground p-6 rounded-2xl shadow-2xl max-w-md w-full text-center"
          >
            <div className="mb-4">
                <div className='flex justify-between items-center mb-4'>
                    <p className='text-sm font-bold text-muted-foreground'>Paso {currentStep} de {totalSteps}</p>
                    <Button variant="ghost" size="icon" onClick={skipTutorial} className='h-6 w-6'>
                        <span className="text-2xl font-light">&times;</span>
                    </Button>
                </div>
                <Progress value={progress} className='mb-6 h-2' />
                <div className="text-lg leading-relaxed">{stepConfig.content}</div>
            </div>

            <div className="flex gap-4 justify-center mt-6">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrev}>← Anterior</Button>
              )}
              {currentStep === 1 && (
                 <Button variant="outline" onClick={skipTutorial}>Saltar tutorial</Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button onClick={handleNext}>
                  {currentStep === 1 ? 'Comenzar tutorial →' : 'Siguiente →'}
                </Button>
              ) : (
                <Button onClick={skipTutorial}>Finalizar tutorial</Button>
              )}

              {currentStep === totalSteps && (
                  <Button variant="secondary" onClick={handleRestart}>↻ Reiniciar</Button>              )}
            </div>
          </MotionDiv>
        </div>
        </div>
    </AnimatePresence>
  );
}
