"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type InstructionStep = {
  title: string;
  content: React.ReactNode;
};

type StepByStepInstructionsProps = {
  steps: InstructionStep[];
};

export function StepByStepInstructions({ steps }: StepByStepInstructionsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setDirection(0);
    setCurrentStep(0);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const step = steps[currentStep];

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Paso a Paso</h3>
            <span className="text-sm font-bold text-muted-foreground">
            Paso {currentStep + 1} de {steps.length}
            </span>
      </div>

      <div className="relative flex-grow overflow-hidden min-h-[160px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute w-full h-full text-sm"
          >
            <h4 className="font-semibold text-foreground mb-2">{step.title}</h4>
            <div className="text-muted-foreground">{step.content}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-4 border-t pt-4">
        {currentStep > 0 ? (
          <Button variant="outline" onClick={handlePrev} className="w-[120px]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
        ) : <div className="w-[120px]"/>}

        {currentStep === steps.length - 1 && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCw className="h-4 w-4 mr-2" /> Volver al Inicio
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button variant="default" onClick={handleNext} className="w-[120px]">
            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : <div className="w-[120px]" />}
      </div>
    </div>
  );
}
