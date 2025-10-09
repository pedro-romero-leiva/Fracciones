
'use client';

import { useState, useCallback, useEffect, type MouseEvent } from 'react';
import { FractionCircle, type CircleState, type SliceState } from '@/components/fraction-circle';
import { AppToolbar } from '@/components/app-toolbar';
import { PlusCircle, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { AmplifyDialog } from '@/components/amplify-dialog';
import { WelcomeScreen } from '@/components/welcome-screen';

export type Mode = 'select' | 'erase' | 'drag' | 'amplify';

type PickedItem = {
  type: 'slice';
  sourceGroupId: string;
  sourceCircleId: string;
  sliceIndex: number;
  divisions: number;
} | {
  type: 'group';
  sourceGroupId: string;
  divisions: number;
  sliceCount: number;
};


interface FollowerPosition {
  x: number;
  y: number;
}

const getSlicePath = (divisions: number, index: number, radius: number, centerX: number, centerY: number): string => {
  if (divisions === 1) {
    return `M ${centerX - radius}, ${centerY} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
  }
  const startAngle = (index / divisions) * 2 * Math.PI - Math.PI / 2;
  const endAngle = ((index + 1) / divisions) * 2 * Math.PI - Math.PI / 2;
  const startX = centerX + radius * Math.cos(startAngle);
  const startY = centerY + radius * Math.sin(startAngle);
  const endX = centerX + radius * Math.cos(endAngle);
  const endY = centerY + radius * Math.sin(endAngle);
  const largeArcFlag = 2 * Math.PI / divisions > Math.PI ? 1 : 0;

  return `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
};


const FollowerCursor = ({ item, position }: { item: PickedItem | null, position: FollowerPosition | null }) => {
  if (!position || !item) return null;

  const size = 50;

  if (item.type === 'slice') {
    const color = `hsl(${((item.sliceIndex * 360) / item.divisions)}, 65%, 60%)`;
    const radius = size / 2.2;
    const center = size / 2;
    
    const pathData = getSlicePath(item.divisions, 0, radius, center, center);
    const rotation = (item.sliceIndex / item.divisions) * 360;

    return (
      <div
        className="pointer-events-none fixed z-50"
        style={{ left: `${position.x}px`, top: `${position.y}px`, transform: 'translate(-50%, -50%)' }}
      >
        <svg 
          width={size} height={size} viewBox={`0 0 ${size} ${size}`} 
          style={{ transform: `rotate(${rotation}deg)` }}
          className="drop-shadow-lg"
        >
          <path d={pathData} fill={color} stroke="white" strokeWidth="1" />
        </svg>
      </div>
    );
  } else { // type === 'group'
    return (
      <div
        className="pointer-events-none fixed z-50 flex items-center justify-center bg-primary text-primary-foreground rounded-full drop-shadow-lg"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size}px`,
          height: `${size}px`,
          transform: 'translate(-50%, -50%)',
          fontSize: '1.25rem',
          fontWeight: 'bold',
        }}
      >
        +{item.sliceCount}
      </div>
    );
  }
};

const GroupFractionDisplay = ({ group }: { group: CircleState[] }) => {
    const totalActiveCount = group.reduce((acc, circle) => {
        if (!circle || !circle.slices) return acc;
        return acc + circle.slices.filter(s => s.active).length;
    }, 0);
    const divisions = group[0]?.divisions || 1;

    if (group.length <= 1 && totalActiveCount < divisions) return null;
    if (totalActiveCount === 0) return null;


    return (
        <div className="absolute top-2 right-2 p-1 bg-card/80 backdrop-blur-sm rounded-md pointer-events-none text-center">
            <div className="flex flex-col items-center font-bold text-foreground text-xl">
                <span>{totalActiveCount}</span>
                <div className="w-full h-px bg-foreground my-0.5"></div>
                <span>{divisions}</span>
            </div>
        </div>
    );
};


export default function Home() {
  const [circleGroups, setCircleGroups] = useState<CircleState[][]>([]);
  const [mode, setMode] = useState<Mode>('select');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const { toast } = useToast();
  
  const [pickedItem, setPickedItem] = useState<PickedItem | null>(null);
  const [followerPosition, setFollowerPosition] = useState<FollowerPosition | null>(null);

  const [amplifyingGroup, setAmplifyingGroup] = useState<CircleState[] | null>(null);
  
  const addCircleGroup = useCallback((divisions = 1, slices: SliceState[] = []) => {
    const newSlices = slices.length > 0 ? slices : Array.from({ length: divisions }, (_, i) => ({ id: `slice-${Date.now()}-${i}`, active: true }));
    const newCircle: CircleState = {
      id: `circle-${Date.now()}-${Math.random()}`,
      divisions,
      slices: newSlices,
    };
    setCircleGroups(prev => [
      ...prev,
      [newCircle]
    ]);
  }, []);
  
  useEffect(() => {
    setHasLoaded(true);
  }, []);

  const handleStart = () => {
    setShowWelcomeScreen(false);
    if(circleGroups.length === 0) {
      addCircleGroup(1);
    }
  };


  useEffect(() => {
    if (!hasLoaded) return;
    
    const needsCleanup = circleGroups.some(g => g.some(c => !c.slices.some(s => s.active)) || g.length === 0);

    if (needsCleanup) {
        const cleanedGroups = circleGroups
            .map(g => g.filter(c => c.slices.some(s => s.active)))
            .filter(g => g.length > 0);
        
        if (JSON.stringify(cleanedGroups) !== JSON.stringify(circleGroups)) {
            setCircleGroups(cleanedGroups);
        }
    }
  }, [circleGroups, hasLoaded]);

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (pickedItem) {
        setFollowerPosition({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pickedItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
      }
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setMode('select');
          break;
        case 'e':
          setMode(prev => (prev === 'erase' ? 'select' : 'erase'));
          break;
        case 'd':
          setMode(prev => (prev === 'drag' ? 'select' : 'drag'));
          break;
        case 'a':
          setMode(prev => (prev === 'amplify' ? 'select' : 'amplify'));
          break;
        case 'n':
          addCircleGroup(1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [addCircleGroup]);


  const removeCircleGroup = useCallback((groupId: string) => {
    setCircleGroups(prev => prev.filter(group => group[0]?.id !== groupId));
  }, []);

  const updateCircle = useCallback((groupId: string, circleId: string, newProps: Partial<CircleState>) => {
    setCircleGroups(prev =>
      prev.map(group => {
        if (group[0]?.id === groupId) {
          return group.map(c => (c.id === circleId ? { ...c, ...newProps } : c));
        }
        return group;
      })
    );
  }, []);

  const handlePickSlice = (sourceGroupId: string, sourceCircleId: string, sliceIndex: number, divisions: number) => {
    if (pickedItem) {
      if (pickedItem.type === 'slice' && pickedItem.sourceCircleId === sourceCircleId && pickedItem.sliceIndex === sliceIndex) {
        setPickedItem(null);
        setFollowerPosition(null);
      } else {
        handlePlace(sourceGroupId);
      }
    } else {
      const group = circleGroups.find(g => g[0]?.id === sourceGroupId);
      const circle = group?.find(c => c.id === sourceCircleId);
      if (circle && circle.slices[sliceIndex].active) {
        setPickedItem({ type: 'slice', sourceGroupId, sourceCircleId, sliceIndex, divisions });
      }
    }
  };
  
  const handlePickGroup = (sourceGroupId: string, e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (pickedItem) {
      if (pickedItem.type === 'group' && pickedItem.sourceGroupId === sourceGroupId) {
        setPickedItem(null);
        setFollowerPosition(null);
      } else {
        handlePlace(sourceGroupId);
      }
    } else {
      const sourceGroup = circleGroups.find(g => g[0]?.id === sourceGroupId);
      if (!sourceGroup) return;

      const totalActiveCount = sourceGroup.reduce((acc, circle) => acc + circle.slices.filter(s => s.active).length, 0);
      if (totalActiveCount > 0) {
        setPickedItem({
          type: 'group',
          sourceGroupId,
          divisions: sourceGroup[0].divisions,
          sliceCount: totalActiveCount,
        });
      }
    }
  };
  
  const handlePlace = (targetGroupId: string) => {
    if (!pickedItem) return;

    const sourceGroup = circleGroups.find(g => g[0]?.id === pickedItem.sourceGroupId);
    const targetGroup = circleGroups.find(g => g[0]?.id === targetGroupId);

    if (!sourceGroup || !targetGroup || pickedItem.sourceGroupId === targetGroupId) {
      setPickedItem(null);
      setFollowerPosition(null);
      return;
    }
    
    const sourceDivisions = pickedItem.divisions;
    const targetDivisions = targetGroup[0].divisions;

    if (targetDivisions % sourceDivisions !== 0) {
      toast({
        variant: "destructive",
        title: "No se puede mover",
        description: "Para sumar fracciones, las partes del destino deben ser un múltiplo de las partes del origen.",
      });
      setPickedItem(null);
      setFollowerPosition(null);
      return;
    }
    
    setCircleGroups(prev => {
      const conversionFactor = targetDivisions / sourceDivisions;
      let newGroups = JSON.parse(JSON.stringify(prev));
      const sourceGroupIndex = newGroups.findIndex((g: CircleState[]) => g[0]?.id === pickedItem.sourceGroupId);
      const targetGroupIndex = newGroups.findIndex((g: CircleState[]) => g[0]?.id === targetGroupId);

      if (sourceGroupIndex === -1 || targetGroupIndex === -1) return prev;

      let slicesToAdd = 0;

      if (pickedItem.type === 'slice') {
        slicesToAdd = 1 * conversionFactor;
        const sourceCircleIndex = newGroups[sourceGroupIndex].findIndex((c: CircleState) => c.id === pickedItem.sourceCircleId);
        if (sourceCircleIndex !== -1) {
          newGroups[sourceGroupIndex][sourceCircleIndex].slices[pickedItem.sliceIndex].active = false;
        }
      } else { // type === 'group'
        slicesToAdd = pickedItem.sliceCount * conversionFactor;
        newGroups[sourceGroupIndex].forEach((circle: CircleState) => {
          circle.slices.forEach(slice => {
            slice.active = false;
          });
        });
      }

      for (let s = 0; s < slicesToAdd; s++) {
        let placed = false;
        for (let i = 0; i < newGroups[targetGroupIndex].length; i++) {
          const circle = newGroups[targetGroupIndex][i];
          const emptySliceIndex = circle.slices.findIndex((slice: SliceState) => !slice.active);
          if (emptySliceIndex !== -1) {
            circle.slices[emptySliceIndex].active = true;
            placed = true;
            break;
          }
        }

        if (!placed) {
          const newCircleSlices = Array.from({ length: targetDivisions }, (_, i) => ({
            id: `slice-mitosis-${Date.now()}-${i}-${s}`,
            active: i === 0,
          }));
          const newCircle: CircleState = {
            id: `circle-mitosis-${Date.now()}-${Math.random()}-${s}`,
            divisions: targetDivisions,
            slices: newCircleSlices,
          };
          newGroups[targetGroupIndex].push(newCircle);
        }
      }
      return newGroups;
    });

    setPickedItem(null);
    setFollowerPosition(null);
  };


  const handleWorkspaceClick = (e: MouseEvent<HTMLDivElement>) => {
    if (pickedItem && (e.target as Element).id === 'workspace') {
      setPickedItem(null);
      setFollowerPosition(null);
    }
  };

  const duplicateGroup = (groupToDuplicate: CircleState[]) => {
    const newGroup = groupToDuplicate.map(circle => {
      const newSlices = circle.slices.map(slice => ({...slice, id: `slice-dup-${Date.now()}-${Math.random()}`}));
      return {...circle, id: `circle-dup-${Date.now()}-${Math.random()}`, slices: newSlices};
    });
    setCircleGroups(prev => [...prev, newGroup]);
  };

  const handleCardClick = (group: CircleState[], e: MouseEvent<HTMLDivElement>) => {
    if (mode === 'amplify') {
      setAmplifyingGroup(group);
    } else if (mode === 'drag' && pickedItem) {
      const handleEl = (e.target as HTMLElement).closest('[data-drag-handle]');
      const circleEl = (e.target as HTMLElement).closest('.fraction-circle-container');
      if (!handleEl && !circleEl) {
        handlePlace(group[0].id)
      }
    }
  };
  
  const handleAmplify = (factor: number) => {
    if (!amplifyingGroup) return;

    const originalDivisions = amplifyingGroup[0].divisions;
    const newDivisions = originalDivisions * factor;

    const originalActiveCount = amplifyingGroup.reduce((acc, c) => acc + c.slices.filter(s => s.active).length, 0);
    const newActiveCount = originalActiveCount * factor;

    const newCircles: CircleState[] = [];
    let remainingActiveSlices = newActiveCount;

    const numNewCircles = Math.ceil(newActiveCount / newDivisions);
    const numToCreate = Math.max(1, numNewCircles); // Always create at least one circle

    for (let i = 0; i < numToCreate; i++) {
        const slicesForThisCircle = Math.min(remainingActiveSlices, newDivisions);
        const newSlices = Array.from({ length: newDivisions }, (_, j) => ({
            id: `slice-amp-${Date.now()}-${i}-${j}`,
            active: j < slicesForThisCircle,
        }));
        newCircles.push({
            id: `circle-amp-${Date.now()}-${i}`,
            divisions: newDivisions,
            slices: newSlices
        });
        remainingActiveSlices -= slicesForThisCircle;
    }

    setCircleGroups(prev => prev.map(g => (g[0].id === amplifyingGroup[0].id ? newCircles : g)));
    setAmplifyingGroup(null);
  };

  if (!hasLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-primary animate-pulse">Cargando Fracciones...</div>
      </div>
    );
  }

  if (showWelcomeScreen) {
    return <WelcomeScreen onStart={handleStart} />;
  }
  
  const gridCols = circleGroups.length > 0 ? Math.ceil(Math.sqrt(circleGroups.length)) : 1;
  const totalActiveCountInGroup = (group: CircleState[]) => group.reduce((acc, c) => acc + c.slices.filter(s => s.active).length, 0);

  return (
      <div className={cn("flex h-screen bg-background text-foreground", 
        mode === 'drag' && 'select-none',
        pickedItem && 'cursor-none'
      )}>
        {pickedItem && <FollowerCursor item={pickedItem} position={followerPosition} />}
        
        <AppToolbar mode={mode} setMode={setMode} onAddCircle={() => addCircleGroup(1)} />

        <main className="flex-1 flex flex-col justify-center">
            <div
                id="workspace"
                className="grid gap-4 md:gap-8 justify-items-center items-center flex-1 p-4 sm:p-6 md:p-10"
                style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                onClick={handleWorkspaceClick}
            >
                {circleGroups.length > 0 ? (
                    circleGroups.map((group, index) => (
                      <Card 
                        key={group[0]?.id || index} 
                        className={cn(
                            'relative w-full h-full flex flex-col justify-center items-center p-4 gap-2 shadow-lg',
                            mode === 'amplify' && 'cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-accent'
                        )}
                        onClick={(e) => handleCardClick(group, e)}
                      >
                        <GroupFractionDisplay group={group} />
                        <div className="flex justify-center items-center flex-wrap gap-4">
                          {group.map(circle => (
                            <FractionCircle
                                key={circle.id}
                                circleState={circle}
                                mode={mode}
                                onUpdate={(circleId, newProps) => updateCircle(group[0].id, circleId, newProps)}
                                onRemove={() => removeCircleGroup(group[0].id)}
                                onDuplicate={() => duplicateGroup(group)}
                                onPickSlice={(sliceIndex, divisions) => handlePickSlice(group[0].id, circle.id, sliceIndex, divisions)}
                                onPlaceSlice={() => handlePlace(group[0].id)}
                                isPicked={pickedItem?.type === 'slice' && pickedItem.sourceCircleId === circle.id}
                                isGrouped={group.length > 1}
                            />
                          ))}
                        </div>
                        {mode === 'drag' && (
                          <div
                            data-drag-handle
                            className="w-full mt-2 p-2 bg-accent/20 hover:bg-accent/40 rounded-md cursor-pointer flex items-center justify-center text-sm font-medium text-accent-foreground/80 hover:text-accent-foreground transition-colors"
                            onClick={(e) => handlePickGroup(group[0].id, e)}
                          >
                            <Hand className="mr-2 h-5 w-5" />
                            <span>Arrastrar las {totalActiveCountInGroup(group)} porciones</span>
                          </div>
                        )}
                      </Card>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground col-span-full">
                        <p className="text-lg mb-4">Tu espacio de trabajo está vacío.</p>
                        <Button onClick={() => addCircleGroup(1)} size="lg">
                            <PlusCircle className="mr-2 h-5 w-5" /> Añade tu primer círculo
                        </Button>
                    </div>
                )}
            </div>
        </main>
        
        <AmplifyDialog
            isOpen={!!amplifyingGroup}
            onClose={() => setAmplifyingGroup(null)}
            onAmplify={handleAmplify}
        />
      </div>
  );
}

    