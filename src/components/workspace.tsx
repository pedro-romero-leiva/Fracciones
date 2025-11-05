
'use client';

import { type MouseEvent, useState, useEffect } from 'react';
import { PlusCircle, Hand, Minus, Plus, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import type { Mode, CircleState, SliceState, PickedItem, CircleGroup } from '@/lib/types';
import { FractionCircle } from './fraction-circle';
import { MotionDiv, AnimatePresence } from './motion-div';

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

interface FollowerPosition {
  x: number;
  y: number;
}

const FollowerCursor = ({ item, position }: { item: PickedItem | null, position: FollowerPosition | null }) => {
  if (!position || !item) return null;

  const size = 50;

  if (item.type === 'slice') {
    const radius = size / 2.2;
    const center = size / 2;
    const pathData = getSlicePath(item.divisions, 0, radius, center, center);
    const rotation = (item.sliceIndex / item.divisions) * 360;

    return (
      <div className="pointer-events-none fixed z-50" style={{ left: `${position.x}px`, top: `${position.y}px`, transform: 'translate(-50%, -50%)' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: `rotate(${rotation}deg)` }} className="drop-shadow-lg">
          <path d={pathData} fill="hsl(var(--primary))" stroke="hsl(var(--division-line))" strokeWidth="1" />
        </svg>
      </div>
    );
  } else { // type === 'group'
    return (
      <div className="pointer-events-none fixed z-50 flex items-center justify-center bg-primary text-primary-foreground rounded-full drop-shadow-lg" style={{ left: `${position.x}px`, top: `${position.y}px`, width: `${size}px`, height: `${size}px`, transform: 'translate(-50%, -50%)', fontSize: '1.25rem', fontWeight: 'bold' }}>
        +{item.sliceCount}
      </div>
    );
  }
};

interface WorkspaceProps {
    circleGroups: CircleGroup[];
    setCircleGroups: React.Dispatch<React.SetStateAction<CircleGroup[]>>;
    mode: Mode;
    setMode: React.Dispatch<React.SetStateAction<Mode>>;
    pickedItem: PickedItem | null;
    setPickedItem: React.Dispatch<React.SetStateAction<PickedItem | null>>;
    setAmplifyingGroup: React.Dispatch<React.SetStateAction<CircleGroup | null>>;
    addCircleGroup: () => void;
}

export function Workspace({
    circleGroups,
    setCircleGroups,
    mode,
    setMode,
    pickedItem,
    setPickedItem,
    setAmplifyingGroup,
    addCircleGroup,
}: WorkspaceProps) {
  const { toast } = useToast();
  const [followerPosition, setFollowerPosition] = useState<FollowerPosition | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [justCleaned, setJustCleaned] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (pickedItem) {
        setFollowerPosition({ x: e.clientX, y: e.clientY });

        const dropTargetElement = document.elementFromPoint(e.clientX, e.clientY)?.closest('.fraction-group-card');
        const targetId = dropTargetElement?.getAttribute('data-group-id');
        const sourceGroup = circleGroups.find(g => g.id === pickedItem.sourceGroupId);
        const targetGroup = targetId ? circleGroups.find(g => g.id === targetId) : null;
        
        if (targetId && sourceGroup && targetGroup && targetId !== pickedItem.sourceGroupId) {
            if (targetGroup.circles[0].divisions % sourceGroup.circles[0].divisions === 0) {
                 setDropTargetId(targetId);
            } else {
                setDropTargetId(null);
            }
        } else {
            setDropTargetId(null);
        }
      } else {
        setFollowerPosition(null);
        setDropTargetId(null);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [pickedItem, circleGroups]);

  useEffect(() => {
    let originalCount = 0;
    let needsCleanup = false;
    
    // First, check if cleanup is needed without modifying state
    for (const g of circleGroups) {
        originalCount += g.circles.length;
        if (g.circles.length === 0 || g.circles.some(c => !c.slices.some(s => s.active))) {
            needsCleanup = true;
            break;
        }
    }

    if (needsCleanup) {
        const cleanedGroups = circleGroups
            .map(g => ({ ...g, circles: g.circles.filter(c => c.slices.some(s => s.active)) }))
            .filter(g => g.circles.length > 0);
        
        if (JSON.stringify(cleanedGroups) !== JSON.stringify(circleGroups)) {
            setCircleGroups(cleanedGroups);
            const newCount = cleanedGroups.flatMap(g => g.circles).length;
            if (originalCount > newCount) {
                setJustCleaned(true); 
            }
        }
    }
  }, [circleGroups, setCircleGroups]);

  useEffect(() => {
    if (justCleaned) {
        toast({
            title: "Limpiando círculos vacíos...",
            description: "Se han eliminado los círculos que no tenían porciones seleccionadas.",
        });
        setJustCleaned(false);
    }
  }, [justCleaned, toast]);
  
  const updateGroup = (groupId: string, newProps: Partial<CircleGroup> | ((g: CircleGroup) => CircleGroup)) => {
    setCircleGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          if (typeof newProps === 'function') {
            return newProps(g);
          }
          return { ...g, ...newProps };
        }
        return g;
      })
    );
  };
  
  const removeCircleGroup = (groupId: string) => {
    toast({
        title: "Círculo eliminado",
        variant: "destructive"
    });
    setCircleGroups(prev => prev.filter(group => group.id !== groupId));
  };
  
  const handlePlace = (targetGroupId: string) => {
    if (!pickedItem) return;

    const sourceGroup = circleGroups.find(g => g.id === pickedItem.sourceGroupId);
    const targetGroup = circleGroups.find(g => g.id === targetGroupId);

    if (!sourceGroup || !targetGroup || pickedItem.sourceGroupId === targetGroupId) {
      setPickedItem(null);
      return;
    }
    
    const sourceDivisions = pickedItem.divisions;
    const targetDivisions = targetGroup.circles[0].divisions;

    if (targetDivisions % sourceDivisions !== 0) {
      toast({
        variant: "destructive",
        title: "No se puede mover",
        description: "Para sumar fracciones, las partes del destino deben ser un múltiplo de las partes del origen.",
      });
      setPickedItem(null);
      return;
    }
    
    setCircleGroups(prev => {
      const conversionFactor = targetDivisions / sourceDivisions;
      let newGroups = JSON.parse(JSON.stringify(prev));
      const sourceGroupIndex = newGroups.findIndex((g: CircleGroup) => g.id === pickedItem.sourceGroupId);
      const targetGroupIndex = newGroups.findIndex((g: CircleGroup) => g.id === targetGroupId);

      if (sourceGroupIndex === -1 || targetGroupIndex === -1) return prev;

      let slicesToAdd = 0;
      if (pickedItem.type === 'slice') {
        slicesToAdd = 1 * conversionFactor;
        const sourceCircleIndex = newGroups[sourceGroupIndex].circles.findIndex((c: CircleState) => c.id === pickedItem.sourceCircleId);
        if (sourceCircleIndex !== -1) {
          newGroups[sourceGroupIndex].circles[sourceCircleIndex].slices[pickedItem.sliceIndex].active = false;
        }
      } else { // type === 'group'
        slicesToAdd = pickedItem.sliceCount * conversionFactor;
        newGroups[sourceGroupIndex].circles.forEach((circle: CircleState) => {
          circle.slices.forEach((slice: SliceState) => { slice.active = false; });
        });
      }

      for (let s = 0; s < slicesToAdd; s++) {
        let placed = false;
        for (let i = 0; i < newGroups[targetGroupIndex].circles.length; i++) {
          const circle = newGroups[targetGroupIndex].circles[i];
          const emptySliceIndex = circle.slices.findIndex((slice: SliceState) => !slice.active);
          if (emptySliceIndex !== -1) {
            circle.slices[emptySliceIndex].active = true;
            placed = true;
            break;
          }
        }

        if (!placed) {
          const newCircleSlices = Array.from({ length: targetDivisions }, (_, i) => ({ id: `slice-mitosis-${Date.now()}-${i}-${s}`, active: i === 0 }));
          const newCircle: CircleState = { id: `circle-mitosis-${Date.now()}-${s}`, divisions: targetDivisions, slices: newCircleSlices };
          newGroups[targetGroupIndex].circles.push(newCircle);
        }
      }
      toast({ title: '¡Fracciones sumadas!' });
      return newGroups;
    });
    setPickedItem(null);
  };
  
  const handlePickSlice = (sourceGroupId: string, sourceCircleId: string, sliceIndex: number) => {
    if (pickedItem) {
        handlePlace(sourceGroupId);
    } else {
      const group = circleGroups.find(g => g.id === sourceGroupId);
      const circle = group?.circles.find(c => c.id === sourceCircleId);
      if (circle && circle.slices[sliceIndex].active) {
        toast({ title: 'Arrastrando porción', description: 'Arrastra a otro círculo para sumar o pulsa Esc para cancelar.' });
        setPickedItem({ type: 'slice', sourceGroupId, sourceCircleId, sliceIndex, divisions: circle.divisions });
      }
    }
  };

  const handlePickGroup = (sourceGroupId: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (pickedItem) {
        handlePlace(sourceGroupId);
    } else {
      const sourceGroup = circleGroups.find(g => g.id === sourceGroupId);
      if (!sourceGroup) return;
      const totalActiveCount = sourceGroup.circles.reduce((acc, circle) => acc + circle.slices.filter(s => s.active).length, 0);
      if (totalActiveCount > 0) {
        toast({ title: 'Arrastrando grupo', description: 'Arrastra a otro círculo para sumar o pulsa Esc para cancelar.' });
        setPickedItem({ type: 'group', sourceGroupId, divisions: sourceGroup.circles[0].divisions, sliceCount: totalActiveCount });
      } else {
        toast({ variant: 'destructive', title: 'Nada que arrastrar', description: 'Selecciona algunas porciones primero.' });
      }
    }
  };

  const handleSliceClick = (groupId: string, circleId: string, sliceIndex: number) => {
    const group = circleGroups.find(g => g.id === groupId);
    const circle = group?.circles.find(c => c.id === circleId);
    if (!circle) return;

    if (mode === 'select') {
      const newSlices = [...circle.slices];
      const newActiveState = !newSlices[sliceIndex].active;
      newSlices[sliceIndex] = { ...newSlices[sliceIndex], active: newActiveState };
      const newCircles = group.circles.map(c => c.id === circleId ? { ...c, slices: newSlices } : c);
      updateGroup(groupId, { circles: newCircles });

      const activeCount = newSlices.filter(s => s.active).length;
      if(newActiveState){
        toast({ title: `Porción seleccionada: ${activeCount}/${circle.divisions}` });
      }

    } else if (mode === 'drag') {
      handlePickSlice(groupId, circleId, sliceIndex);
    }
  };

  const handleContainerClick = (groupId: string) => {
    if (mode === 'erase') removeCircleGroup(groupId);
    else if (mode === 'drag') {
        if(pickedItem) handlePlace(groupId);
    }
    else if (mode === 'amplify') {
      const group = circleGroups.find(g => g.id === groupId);
      if (group) setAmplifyingGroup(group);
    }
  };

  const handleDivide = (groupId: string, amount: number) => {
    updateGroup(groupId, g => {
        const currentDivisions = g.circles[0].divisions;
        const newDivisions = Math.max(1, Math.min(12, currentDivisions + amount));
        
        const currentActive = g.circles.reduce((sum, c) => sum + c.slices.filter(s => s.active).length, 0);
        
        const newActive = Math.min(currentActive, newDivisions);

        const newSlices = Array.from({ length: newDivisions }, (_, i) => ({ id: `slice-${g.id}-${Date.now()}-${i}`, active: i < newActive }));
        const newCircle: CircleState = { id: g.circles[0].id, divisions: newDivisions, slices: newSlices };
        
        if (newDivisions !== currentDivisions) {
            return { ...g, circles: [newCircle] };
        }
        return g;
    });
  };

  const handleDuplicate = (groupId: string) => {
    setCircleGroups(prev => {
      const groupIndex = prev.findIndex(g => g.id === groupId);
      if (groupIndex === -1) return prev;

      const originalGroup = prev[groupIndex];
      
      const newGroup: CircleGroup = JSON.parse(JSON.stringify(originalGroup)); 
      newGroup.id = `group-${Date.now()}`;
      newGroup.circles.forEach((c: CircleState) => {
        c.id = `circle-${Date.now()}-${Math.random()}`;
        c.slices.forEach((s: SliceState) => {
          s.id = `slice-${Date.now()}-${Math.random()}`;
        });
      });
      
      const newGroups = [...prev];
      newGroups.splice(groupIndex + 1, 0, newGroup);
      return newGroups;
    });
    toast({ title: 'Círculo duplicado' });
  };

  const workspaceClass = cn(
    "flex-1 flex flex-col p-4 sm:p-6 md:p-8 bg-background relative overflow-y-auto",
    {
      'cursor-pointer': mode === 'select',
      'cursor-grab': mode === 'drag' && !pickedItem,
      'cursor-grabbing': mode === 'drag' && pickedItem,
      'cursor-crosshair': mode === 'amplify',
      'cursor-not-allowed': mode === 'erase',
    }
  );

  return (
    <main 
      className={workspaceClass}
      onClick={() => {
        if (pickedItem) {
          setPickedItem(null);
          toast({ title: 'Arrastre cancelado', variant: 'destructive' });
        }
      }}
    >
      <AnimatePresence>
        {pickedItem && <FollowerCursor item={pickedItem} position={followerPosition} />}
      </AnimatePresence>
      <div id="workspace" className="grid gap-x-8 gap-y-12 justify-items-center items-start flex-1" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))` }}>
        <AnimatePresence>
          {circleGroups.length > 0 ? (
            circleGroups.map((group, groupIndex) => (
              <MotionDiv 
                layout 
                key={group.id} 
                className="w-full flex flex-col items-center justify-center gap-3"
                data-tutorial-id={groupIndex === 0 ? 'first-circle-group' : undefined}
              >
                <Card 
                  data-group-id={group.id}
                  className={cn('w-full flex flex-col justify-center items-center p-4 gap-2 shadow-sm border-transparent fraction-group-card',
                    (mode === 'amplify') && 'cursor-crosshair hover:border-accent',
                    (mode === 'erase') && 'cursor-pointer hover:border-destructive',
                    (mode === 'drag' && pickedItem) && 'cursor-cell',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContainerClick(group.id);
                  }}
                >
                  <div className="flex justify-center items-center flex-wrap gap-4">
                    <AnimatePresence>
                      {group.circles.map((circle) => (
                          <FractionCircle
                              key={circle.id}
                              circleState={circle}
                              mode={mode}
                              onSliceClick={(circleId, sliceIndex) => handleSliceClick(group.id, circleId, sliceIndex)}
                              onContainerClick={() => handleContainerClick(group.id)}
                              isPicked={pickedItem?.type === 'slice' && pickedItem.sourceCircleId === circle.id}
                              isDropTarget={dropTargetId === group.id}
                          />
                        ))
                      }
                    </AnimatePresence>
                  </div>
                  {mode === 'drag' && (
                    <Button
                      variant="outline"
                      className="w-full mt-2 cursor-grab"
                      onClick={(e) => handlePickGroup(group.id, e)}
                    >
                      <Hand className="mr-2 h-5 w-5" />
                      <span>Arrastrar porciones</span>
                    </Button>
                  )}
                </Card>

                <div 
                  className="flex items-center justify-center flex-wrap gap-x-3 gap-y-2 bg-card p-2 rounded-lg shadow-sm border"
                  data-tutorial-id={groupIndex === 0 ? 'divide-controls' : undefined}
                >
                    <div className='flex items-center gap-1'>
                        <span className='font-medium text-sm text-foreground/80 shrink-0'>Dividir:</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDivide(group.id, -1)} disabled={group.circles[0].divisions <= 1}><Minus size={16} /></Button>
                        <span className='font-bold text-lg w-8 text-center'>{group.circles[0].divisions}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDivide(group.id, 1)} disabled={group.circles[0].divisions >= 12}><Plus size={16} /></Button>
                    </div>
                     <div className='flex items-center'>
                        <Button variant="ghost" size="sm" onClick={() => handleDuplicate(group.id)}>
                            <Copy size={16}/> 
                            <span className="ml-2">Duplicar</span>
                        </Button>
                    </div>
                </div>

              </MotionDiv>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground col-span-full">
                <p className="text-lg mb-4">Tu espacio de trabajo está vacío.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex justify-center mt-8">
          <Button onClick={addCircleGroup} size="lg" className="shadow-lg rounded-full" data-tutorial-id="add-circle-button">
              <PlusCircle className="mr-2 h-5 w-5" /> Añadir Círculo
          </Button>
      </div>
    </main>
  );
}
