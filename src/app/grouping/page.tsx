"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { GroupingTool } from '@/components/grouping-tool';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpenText, PanelLeft, HelpCircle, Book, Moon, Sun } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InteractiveTutorial, TutorialStep } from '@/components/interactive-tutorial';
import { GlossarySheet } from '@/components/glossary-sheet';
import { cn } from '@/lib/utils';
import { StepByStepInstructions, InstructionStep } from '@/components/step-by-step-instructions';
import { useTheme } from 'next-themes';


const tutorialSteps: TutorialStep[] = [
  {
    targetId: 'block-container',
    title: '¡Bienvenido al Modo Agrupar!',
    content: 'Esta herramienta te ayudará a entender la división de una forma visual. Vamos a dividir 40 entre 6.',
    placement: 'center',
  },
  {
    targetId: 'total-blocks-input-container',
    title: 'Paso 1: Elige el Dividendo',
    content: 'Este es el número total de bloques que quieres dividir. Para nuestro ejemplo, asegúrate de que sea 40.',
    placement: 'bottom',
  },
  {
    targetId: 'grouping-mode-button',
    title: 'Paso 2: Activa el Modo Agrupar',
    content: 'Haz clic aquí para empezar a agrupar los bloques. Esto te permitirá seleccionar el divisor.',
    placement: 'bottom',
  },
  {
    targetId: 'block-6',
    title: 'Paso 3: Selecciona el Divisor',
    content: 'Ahora, haz clic en el bloque número 6. Esto le dice a la herramienta que quieres hacer grupos de 6.',
    placement: 'top',
  },
    {
    targetId: 'result-card',
    title: 'Paso 4: ¡Observa el Resultado!',
    content: 'Los grupos de colores son el cociente (cuántos grupos completos pudiste hacer) y los bloques grises son el resto (lo que sobró).',
    placement: 'top',
  },
  {
    targetId: 'block-container',
    title: '¡Listo para Explorar!',
    content: 'Ahora puedes probar con tus propios números. ¡Experimenta y diviértete aprendiendo!',
    placement: 'center',
  },
];

const instructionSteps: InstructionStep[] = [
  {
    title: "Paso 1: Elige la cantidad de bloques",
    content: (
      <p>
        Usa los controles para escribir un número en la caja. Esto determina cuántos bloques tendrás para trabajar.
      </p>
    ),
  },
  {
    title: "Paso 2: Activa el botón AGRUPAR",
    content: (
      <p>
        Haz clic en el botón "AGRUPAR". Se pondrá de color para indicar que está activado y listo para dividir.
      </p>
    ),
  },
  {
    title: "Paso 3: Selecciona el divisor",
    content: (
      <p>
        Haz clic en uno de los números de los bloques para dividirlos en grupos de ese tamaño.
      </p>
    ),
  },
  {
    title: "Paso 4: Observa el resultado",
    content: (
      <ul className="space-y-2 list-none text-left">
        <li>🎨 Cada color representa un grupo completo.</li>
        <li>📦 Los bloques sin color son el resto (lo que no se pudo agrupar).</li>
      </ul>
    ),
  },
];


function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}

export default function GroupingPage() {
  const [instructionsVisible, setInstructionsVisible] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      {showTutorial && <InteractiveTutorial steps={tutorialSteps} onClose={() => setShowTutorial(false)} />}
      <GlossarySheet open={showGlossary} onOpenChange={setShowGlossary} mode="grouping" />
      
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Menú
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setInstructionsVisible(!instructionsVisible)}>
                <PanelLeft className="mr-2" />
                {instructionsVisible ? 'Ocultar Instrucciones' : 'Mostrar Instrucciones'}
            </Button>
            <Button variant="outline" onClick={() => setShowTutorial(true)}>
                <HelpCircle className="mr-2" /> Tutorial
            </Button>
             <Button variant="outline" onClick={() => setShowGlossary(true)}>
                <Book className="mr-2" /> Glosario
            </Button>
             <ThemeToggle />
          </div>
        </div>

        <div className={cn("grid gap-8 transition-all duration-300", instructionsVisible ? "lg:grid-cols-3" : "lg:grid-cols-1")}>
          {instructionsVisible && (
             <Card className="lg:col-span-1 h-fit sticky top-8 bg-card/50 animate-in fade-in">
              <CardHeader>
                  <div className="flex items-center gap-3">
                      <BookOpenText className="h-8 w-8 text-primary-foreground bg-primary p-1.5 rounded-md"/>
                      <CardTitle className="text-2xl">🎯 CÓMO USAR EL MODO AGRUPAR</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <StepByStepInstructions steps={instructionSteps} />
                <div>
                  <h3 className="font-semibold text-lg mb-2 mt-6 pt-6 border-t">Glosario Rápido</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li><span className="font-semibold text-foreground">Dividendo:</span> La cantidad total que quieres dividir.</li>
                    <li><span className="font-semibold text-foreground">Divisor:</span> En cuántas partes iguales quieres dividir.</li>
                    <li><span className="font-semibold text-foreground">Cociente:</span> El resultado de la división.</li>
                    <li><span className="font-semibold text-destructive">Resto:</span> Lo que sobra después de dividir.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className={cn("transition-all duration-300", instructionsVisible ? "lg:col-span-2" : "lg:col-span-1")}>
            <GroupingTool />
          </div>
        </div>
      </div>
    </div>
  );
}
