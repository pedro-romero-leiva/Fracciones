"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Group, RotateCw, X, MousePointerClick } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

type BlockState = {
  color: string;
  isRemainder: boolean;
  animationState?: 'added' | 'removed';
};

export function GroupingTool() {
  const [totalBlocks, setTotalBlocks] = useState(40)
  const [inputValue, setInputValue] = useState(totalBlocks.toString());
  const [activeGroupSize, setActiveGroupSize] = useState<number | null>(null)
  const [blocks, setBlocks] = useState<BlockState[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [hoveredGroup, setHoveredGroup] = useState<number | null>(null)
  const [isGroupingMode, setIsGroupingMode] = useState(false)
  
  const quotient = activeGroupSize ? Math.floor(totalBlocks / activeGroupSize) : 0;
  const remainder = activeGroupSize ? totalBlocks % activeGroupSize : 0;

  useEffect(() => {
    const oldTotal = blocks.length;
    if (totalBlocks === oldTotal) {
        if (blocks.every(b => b.color === 'hsl(var(--muted))' && !b.isRemainder)) {
            return;
        }
    }
    
    setIsAnimating(true);
    let newBlocks: BlockState[];

    if (totalBlocks > oldTotal) {
      newBlocks = Array.from({ length: totalBlocks }, (_, i) => {
        return blocks[i] || {
          color: 'hsl(var(--muted))',
          isRemainder: false,
          animationState: 'added',
        };
      });
    } else {
      setBlocks(prevBlocks => {
        return prevBlocks.map((block, i) => i >= totalBlocks ? { ...block, animationState: 'removed' } : block);
      });
      newBlocks = blocks.slice(0, totalBlocks);
    }
    
    setBlocks(newBlocks);

    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
      const finalBlocks = Array.from({ length: totalBlocks }, (_, i) => ({
        ...(newBlocks[i] || {}),
        animationState: undefined,
        color: 'hsl(var(--muted))',
        isRemainder: false,
      }));
      setBlocks(finalBlocks);
      if (isGroupingMode) {
        setActiveGroupSize(null);
      }
    }, 500);

    return () => clearTimeout(animationTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalBlocks]);


  const blockColors = useMemo(() => [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ec4899', // pink-500
    '#8b5cf6', // violet-500
    '#6366f1', // indigo-500
    '#14b8a6', // teal-500
    '#ef4444', // red-500
  ], []);

  useEffect(() => {
    setInputValue(totalBlocks.toString());
  }, [totalBlocks]);

  const handleTotalBlocksChange = () => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value >= 1 && value <= 200 && value !== totalBlocks) {
      setTotalBlocks(value);
    } else {
      setInputValue(totalBlocks.toString());
    }
  };
  
  const handleBlockClick = (index: number) => {
    if (isAnimating || !isGroupingMode) return;
    
    const newGroupSize = index + 1;
    if (newGroupSize < 1) return;
    
    setHoveredGroup(null);
    animateGroups(newGroupSize);
  };
  
  const animateGroups = (currentGroupSize: number) => {
    setActiveGroupSize(currentGroupSize);
    setIsAnimating(true);
    let delay = 0;
    
    const maxAnimationTime = 1000;
    const animationSpeed = Math.max(20, maxAnimationTime / totalBlocks);

    const numGroups = Math.floor(totalBlocks / currentGroupSize);

    for (let i = 0; i < totalBlocks; i++) {
        setTimeout(() => {
            setBlocks(prevBlocks => {
                if (prevBlocks.length !== totalBlocks) return prevBlocks;
                const newBlocks = [...prevBlocks];

                const groupIndex = Math.floor(i / currentGroupSize);
                
                if (groupIndex < numGroups) {
                    newBlocks[i] = { ...newBlocks[i], color: blockColors[groupIndex % blockColors.length], isRemainder: false };
                } else {
                    newBlocks[i] = { ...newBlocks[i], color: 'hsl(var(--muted))', isRemainder: true };
                }
                return newBlocks;
            });

            if (i === totalBlocks - 1) {
                setTimeout(() => setIsAnimating(false), 200);
            }
        }, delay);
        delay += animationSpeed;
    }
  }

  const handleFullReset = () => {
    setIsGroupingMode(false);
    setActiveGroupSize(null);
    setIsAnimating(false);
    setHoveredGroup(null);
    setTotalBlocks(40);
    setInputValue('40');
    setBlocks(Array.from({ length: 40 }, () => ({ color: 'hsl(var(--muted))', isRemainder: false })));
  };

  const resetBlockColors = () => {
     setActiveGroupSize(null);
     setBlocks(Array.from({ length: totalBlocks }, () => ({ color: 'hsl(var(--muted))', isRemainder: false })));
  }

  return (
    <div className="relative w-full h-full flex flex-col gap-8">
      <Card className="w-full bg-card shadow-lg border flex-grow flex flex-col transition-all border-border">
        <CardHeader>
          <div className="flex items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold font-headline">Área Interactiva</CardTitle>
                <CardDescription>Usa los controles para explorar la división.</CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 flex-grow min-h-0">
          <div className="flex flex-wrap items-center gap-4">
            <div id="total-blocks-input-container" className="flex items-center gap-2">
                <label htmlFor="total-blocks-input" className="font-medium whitespace-nowrap">Bloques Totales (Dividendo):</label>
                <Input
                    id="total-blocks-input"
                    type="number"
                    min={1}
                    max={200}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleTotalBlocksChange}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    disabled={isAnimating}
                    className="w-28"
                />
            </div>
            <div id="grouping-mode-button" className="flex items-center gap-2">
                <Button 
                    variant={isGroupingMode ? "destructive" : "default"}
                    className="w-40"
                    onClick={() => {
                        const newMode = !isGroupingMode;
                        setIsGroupingMode(newMode);
                        if (newMode) {
                            resetBlockColors();
                        }
                    }} 
                    disabled={isAnimating}
                >
                    {isGroupingMode ? <X className="mr-2"/> : <Group className="mr-2" />}
                    {isGroupingMode ? "Cancelar" : "AGRUPAR"}
                </Button>
            </div>
             <TooltipProvider>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleFullReset} variant="outline" disabled={isAnimating}>
                        <RotateCw />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Reiniciar</p>
                </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>

          <div className="bg-background/50 rounded-lg border-2 border-dashed p-4 transition-colors duration-300 flex-grow min-h-[300px] relative mt-4 flex flex-col">
            {isGroupingMode && !isAnimating && !activeGroupSize && (
                <div className="text-center font-bold text-foreground rounded-xl px-4 py-2 animate-in fade-in flex items-center gap-2 justify-center pointer-events-none whitespace-nowrap bg-card/80 backdrop-blur-sm border absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                    <MousePointerClick className="h-5 w-5" />
                    <span>Haz clic en un bloque para fijar el tamaño del grupo (Divisor).</span>
                </div>
            )}
            <ScrollArea className="w-full h-full flex-grow">
                <div
                    id="block-container"
                    className="relative grid gap-2 w-full h-full p-1"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))' }}
                    onMouseLeave={() => (isGroupingMode && !isAnimating) && setHoveredGroup(null)}
                >
                    {blocks.map((block, i) => (
                    <div
                        key={i}
                        id={`block-${i + 1}`}
                        data-animation-state={block.animationState}
                        onClick={() => handleBlockClick(i)}
                        onMouseEnter={() => (isGroupingMode && !isAnimating) && setHoveredGroup(i)}
                        className={cn(
                            "rounded-md transition-all duration-200 flex items-center justify-center font-semibold w-full min-h-10 relative select-none",
                            "data-[animation-state=added]:animate-in data-[animation-state=added]:fade-in data-[animation-state=added]:zoom-in-90",
                            "data-[animation-state=removed]:animate-out data-[animation-state=removed]:fade-out data-[animation-state=removed]:zoom-out-90",
                             block.color === 'hsl(var(--muted))' ? 'bg-muted text-muted-foreground' : 'text-primary-foreground',
                             block.isRemainder && 'bg-muted text-muted-foreground',
                            (isGroupingMode && !isAnimating) && "cursor-pointer hover:scale-110",
                             (isGroupingMode && hoveredGroup !== null && i <= hoveredGroup) && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        )}
                        style={{ backgroundColor: block.color === 'hsl(var(--muted))' || block.isRemainder ? undefined : block.color }}
                    >
                        <span className="font-bold">{i + 1}</span>
                        {(isGroupingMode && hoveredGroup === i && !isAnimating) && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-md bg-primary text-primary-foreground font-bold text-sm z-50 border-2 border-primary-foreground/50">
                            Divisor: {hoveredGroup + 1}
                            </div>
                        )}
                    </div>
                    ))}
                </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          {activeGroupSize && (
            <Card id="result-card" className="mt-4 animate-in fade-in">
                <CardHeader>
                    <CardTitle>Resultado: {totalBlocks} ÷ {activeGroupSize}</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-8 text-lg">
                    <div>
                        <p className="text-sm text-muted-foreground">COCIENTE</p>
                        <p className="font-bold text-2xl text-primary">{quotient}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">RESTO</p>
                        <p className="font-bold text-2xl text-destructive">{remainder}</p>
                    </div>
                </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
