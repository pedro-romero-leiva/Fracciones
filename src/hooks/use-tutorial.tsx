
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TutorialContextType {
  isTutorialActive: boolean;
  currentStep: number;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  setStep: (step: number) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTutorial = useCallback(() => {
    setIsTutorialActive(true);
    setCurrentStep(1);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const skipTutorial = useCallback(() => {
    setIsTutorialActive(false);
    setCurrentStep(0);
  }, []);

  const setStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const value = {
    isTutorialActive,
    currentStep,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    setStep
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};
