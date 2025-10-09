"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { RectangleTool } from '@/components/rectangle-tool';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpenText, PanelLeft, HelpCircle, Book, Sun, Moon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InteractiveTutorial, TutorialStep } from '@/components/interactive-tutorial';
import { GlossarySheet } from '@/components/glossary-sheet';
import { cn } from '@/lib/utils';
import { StepByStepInstructions, InstructionStep } from '@/components/step-by-step-instructions';
import { useTheme } from 'next-themes';

const tutorialSteps: TutorialStep[] = [
  {
    targetId: 'block-container',
    title: '¡Bienvenido al Modo Rectángulo!',
    content: 'Esta herramienta te ayudará a descubrir los factores de un número de forma visual.',
    placement: 'center',
  },
  {
    targetId: 'total-blocks-input-container',
    title: 'Paso 1: Elige un Número',
    content: 'Este es el número total de bloques que quieres factorizar. Para nuestro ejemplo, asegúrate de que sea 40.',
    placement: 'bottom',
  },
  {
    targetId: 'layout-mode-button',
    title: 'Paso 2: Activa el Modo Rectángulo',
    content: 'Haz clic aquí para empezar a organizar los bloques en un rectángulo.',
    placement: 'bottom',
  },
  {
    targetId: 'block-10',
    title: 'Paso 3: Prueba un Factor',
    content: 'Haz clic en un bloque para fijar el número de columnas. Probemos con 10. Si se forma un rectángulo perfecto, ¡has encontrado un factor!',
    placement: 'top',
  },
  {
    targetId: 'feedback-alert',
    title: 'Paso 4: ¡Observa el Resultado!',
    content: 'La herramienta te dirá si el número que elegiste es un factor. ¡Aquí, 10 es un factor de 40 porque 10 x 4 = 40!',
    placement: 'top',
  },
  {
    targetId: 'block-container',
    title: '¡Listo para Explorar!',
    content: 'Ahora puedes probar con tus propios números para encontrar todos sus factores. ¡Experimenta y descubre!',
    placement: 'center',
  },
];


const instructionSteps: InstructionStep[] = [
  {
    title: "Paso 1: Elige cuántos bloques",
    content: (
      <p>
        Usa los controles para seleccionar la cantidad total de bloques que quieres organizar.
      </p>
    ),
  },
  {
    title: "Paso 2: Selecciona un factor",
    content: (
      <p>
        Haz clic en un número de bloque para intentar formar un rectángulo con ese número de columnas.
      </p>
    ),
  },
  {
    title: "Paso 3: Lee el resultado",
    content: (
      <div className="space-y-2">
        <p>✅ Si se forma un rectángulo completo, verás cuántas filas y columnas hay.</p>
        <p>❌ Si no se forma un rectángulo perfecto, se te indicará que ese número no funciona. Puedes probar con otros.</p>
      </div>
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

export default function RectanglePage() {
  const [instructionsVisible, setInstructionsVisible] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      {showTutorial && <InteractiveTutorial steps={tutorialSteps} onClose={() => setShowTutorial(false)} />}
      <GlossarySheet open={showGlossary} onOpenChange={setShowGlossary} mode="rectangle" />

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
                      <CardTitle className="text-2xl">📐 CÓMO USAR EL MODO RECTÁNGULO</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <StepByStepInstructions steps={instructionSteps} />
                 <div>
                  <h3 className="font-semibold text-lg mb-2 mt-6 pt-6 border-t">Glosario Rápido</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li><span className="font-semibold text-foreground">Factor:</span> Un número que puede dividir a otro exactamente, sin dejar resto.</li>
                    <li><span className="font-semibold text-foreground">Rectángulo Perfecto:</span> Una disposición de bloques en filas y columnas donde no faltan ni sobran espacios.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className={cn("transition-all duration-300", instructionsVisible ? "lg:col-span-2" : "lg:col-span-1")}>
            <RectangleTool />
          </div>
        </div>
      </div>
    </div>
  );
}
