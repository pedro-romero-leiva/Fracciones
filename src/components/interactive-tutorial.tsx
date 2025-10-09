"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TutorialStep = {
  targetId: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
};

type InteractiveTutorialProps = {
  steps: TutorialStep[];
  onClose: () => void;
};

export function InteractiveTutorial({ steps, onClose }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement | null>(null);

  const step = steps[currentStep];

  useEffect(() => {
    const updatePosition = () => {
      // Clean up previous clone
      if (cloneRef.current) {
        cloneRef.current.remove();
        cloneRef.current = null;
      }

      if (step.placement === 'center') {
        setSpotlightStyle({ display: 'none' });
        setPopoverStyle({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        });
        return;
      }
      
      const targetElement = document.getElementById(step.targetId);
      if (!targetElement) {
        setSpotlightStyle({ display: 'none' });
        return;
      }
      
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

      // Use a timeout to wait for scroll to finish
      setTimeout(() => {
        const rect = targetElement.getBoundingClientRect();

        // Create and style the clone
        const clone = targetElement.cloneNode(true) as HTMLDivElement;
        clone.style.position = 'fixed';
        clone.style.top = `${rect.top}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.zIndex = '10001';
        clone.style.pointerEvents = 'none';
        clone.style.margin = '0';
        clone.style.filter = 'none';
        clone.style.backdropFilter = 'none';
        clone.classList.add('tutorial-spotlight-clone'); // for specific styling if needed

        // Add glow/border
        clone.style.boxShadow = '0 0 20px 5px rgba(59, 130, 246, 0.7)';
        clone.style.border = '3px solid #3b82f6';
        clone.style.borderRadius = '8px'; // or copy from original
        clone.style.transition = 'all 0.3s ease-in-out';
        
        document.body.appendChild(clone);
        cloneRef.current = clone;

        // Position popover
        if (popoverRef.current) {
          const popoverRect = popoverRef.current.getBoundingClientRect();
          let top = 0, left = 0;
          const offset = 16;

          switch (step.placement) {
            case 'top':
              top = rect.top - popoverRect.height - offset;
              left = rect.left + rect.width / 2 - popoverRect.width / 2;
              break;
            case 'bottom':
              top = rect.bottom + offset;
              left = rect.left + rect.width / 2 - popoverRect.width / 2;
              break;
            case 'left':
              top = rect.top + rect.height / 2 - popoverRect.height / 2;
              left = rect.left - popoverRect.width - offset;
              break;
            case 'right':
              top = rect.top + rect.height / 2 - popoverRect.height / 2;
              left = rect.right + offset;
              break;
          }

          // Boundary checks
          left = Math.max(offset, Math.min(left, window.innerWidth - popoverRect.width - offset));
          top = Math.max(offset, Math.min(top, window.innerHeight - popoverRect.height - offset));

          setPopoverStyle({ top: `${top}px`, left: `${left}px`, transform: 'none' });
        }
      }, 300); // 300ms delay to allow for scrolling
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      if (cloneRef.current) {
        cloneRef.current.remove();
      }
    };
  }, [step]);


  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in">
        <div id="tutorial-overlay" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000]"></div>
      
      <div
        ref={popoverRef}
        style={{ ...popoverStyle, position: 'fixed', zIndex: 10002 }}
        className="w-80 max-w-sm p-6 bg-card text-card-foreground rounded-lg shadow-2xl animate-in fade-in zoom-in-95 transition-all duration-300"
      >
        <h3 className="font-bold text-lg mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{step.content}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Anterior
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
              {currentStep < steps.length - 1 && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
