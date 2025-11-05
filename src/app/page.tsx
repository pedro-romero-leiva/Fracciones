
'use client';

import { useState, useCallback, useEffect } from 'react';
import { WelcomeScreen } from '@/components/welcome-screen';
import { AppHeader } from '@/components/app-header';
import { InstructionsPanel } from '@/components/instructions-panel';
import { Workspace } from '@/components/workspace';
import { Toolbar } from '@/components/toolbar';
import type { Mode, CircleState, PickedItem, CircleGroup } from '@/lib/types';
import { AmplifyDialog } from '@/components/amplify-dialog';
import { Tutorial } from '@/components/tutorial';
import { GlossaryPanel } from '@/components/glossary-panel';
import { useTutorial } from '@/hooks/use-tutorial';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  
  const [circleGroups, setCircleGroups] = useState<CircleGroup[]>([]);
  const [mode, setMode] = useState<Mode>('select');
  const [pickedItem, setPickedItem] = useState<PickedItem | null>(null);
  
  const [amplifyingGroup, setAmplifyingGroup] = useState<CircleGroup | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const { startTutorial } = useTutorial();
  const { toast } = useToast();

  useEffect(() => {
    setHasLoaded(true);
  }, []);
  
  const handleStartExploration = () => {
    setShowWelcomeScreen(false);
    setShowInstructions(true);
    if (circleGroups.length === 0) {
      addCircleGroup();
    }
  };

  const handleStartTutorial = () => {
    setShowWelcomeScreen(false);
    if (circleGroups.length === 0) {
      addCircleGroup();
    }
    setTimeout(() => {
        startTutorial();
    }, 100);
  };

  const addCircleGroup = useCallback(() => {
    const newCircle: CircleState = {
      id: `circle-${Date.now()}-${Math.random()}`,
      divisions: 1,
      slices: [{ id: `slice-${Date.now()}-0`, active: true }],
    };
    const newGroup: CircleGroup = {
      id: `group-${Date.now()}`,
      circles: [newCircle],
    };
    setCircleGroups(prev => [...prev, newGroup]);
  }, []);

  const handleSetMode = (newMode: Mode) => {
    let finalMode: Mode = newMode;
    if (mode === newMode) {
      finalMode = 'select'; // Toggle off to select mode
    }
    
    setMode(finalMode);

    if(finalMode !== 'select') {
      toast({
        title: `Herramienta activada: ${finalMode.charAt(0).toUpperCase() + finalMode.slice(1)}`,
        description: `Pulsa la tecla '${newMode.charAt(0).toUpperCase()}' otra vez para desactivar.`,
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      
      const key = e.key.toLowerCase();
      let newMode: Mode | null = null;
      
      switch(key) {
        case 'v': newMode = 'select'; break;
        case 'e': newMode = 'erase'; break;
        case 'd': newMode = 'drag'; break;
        case 'a': newMode = 'amplify'; break;
        case 'escape': 
          if(pickedItem) {
            setPickedItem(null);
            toast({ title: 'Arrastre cancelado' });
          } else {
            setMode('select');
          }
          break;
      }

      if (newMode) {
        if(newMode === 'select'){
            setMode('select')
        } else {
            handleSetMode(newMode);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, pickedItem, toast]);


  if (!hasLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-primary animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (showWelcomeScreen) {
    return <WelcomeScreen onStartExploration={handleStartExploration} onStartTutorial={handleStartTutorial} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <Tutorial />
      <GlossaryPanel isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
      <AppHeader 
        onToggleInstructions={() => setShowInstructions(prev => !prev)} 
        onToggleGlossary={() => setShowGlossary(prev => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <InstructionsPanel isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
        <Workspace 
          circleGroups={circleGroups}
          setCircleGroups={setCircleGroups}
          mode={mode}
          setMode={setMode}
          pickedItem={pickedItem}
          setPickedItem={setPickedItem}
          setAmplifyingGroup={setAmplifyingGroup}
          addCircleGroup={addCircleGroup}
        />
      </div>
      <Toolbar 
        mode={mode} 
        setMode={handleSetMode} 
      />
      {amplifyingGroup && (
        <AmplifyDialog
          isOpen={!!amplifyingGroup}
          onClose={() => setAmplifyingGroup(null)}
          amplifyingGroup={amplifyingGroup}
          setCircleGroups={setCircleGroups}
        />
      )}
    </div>
  );
}
