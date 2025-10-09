"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RectangleHorizontal, RotateCw, X, MousePointerClick, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type BlockState = {
  animationState?: 'added' | 'removed';
};

export function RectangleTool() {
  const [totalBlocks, setTotalBlocks] = useState(40)
  const [inputValue, setInputValue] = useState(totalBlocks.toString());
  const [blocks, setBlocks] = useState<BlockState[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLayoutMode, setIsLayoutMode] = useState(false)
  const [numColumns, setNumColumns] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string, description: string} | null>(null);

  useEffect(() => {
    const oldTotal = blocks.length;
    if (totalBlocks === oldTotal) return;

    setIsAnimating(true);
    let newBlocks: BlockState[];

    if (totalBlocks > oldTotal) {
      newBlocks = Array.from({ length: totalBlocks }, (_, i) => {
        return blocks[i] || { animationState: 'added' };
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
      setBlocks(currentBlocks => {
        const finalBlocks = currentBlocks.slice(0, totalBlocks);
        return finalBlocks.map(b => ({ ...b, animationState: undefined }));
      });
      setNumColumns(null);
      setFeedback(null);
    }, 500);

    return () => clearTimeout(animationTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalBlocks]);

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
    if (isAnimating || !isLayoutMode) return;
    
    const newNumColumns = index + 1;
    setNumColumns(newNumColumns);

    if (totalBlocks % newNumColumns === 0) {
        const numRows = totalBlocks / newNumColumns;
        setFeedback({
            type: 'success',
            message: `¡Éxito! ${newNumColumns} es un factor de ${totalBlocks}`,
            description: `${newNumColumns} columnas × ${numRows} filas = ${totalBlocks} bloques totales.`
        });
    } else {
        const factors = Array.from({length: totalBlocks}, (_, i) => i + 1).filter(i => totalBlocks % i === 0);
        setFeedback({
            type: 'error',
            message: `${newNumColumns} no es un factor de ${totalBlocks}.`,
            description: `Sobran bloques. Prueba con: ${factors.join(', ')}.`
        });
    }
  };

  const handleFullReset = () => {
    setIsLayoutMode(false);
    setNumColumns(null);
    setFeedback(null);
    setIsAnimating(false);
    setTotalBlocks(40);
    setInputValue("40");
    setBlocks(Array.from({ length: 40 }, () => ({})));
  }

  return (
    <div className="relative w-full h-full flex flex-col gap-8">
      <Card className="w-full bg-card shadow-lg border-2 flex-grow flex flex-col transition-all border-border">
        <CardHeader>
          <div className="flex items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold font-headline">Área Interactiva</CardTitle>
                <CardDescription>Usa los controles para explorar los factores.</CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 flex-grow min-h-0">
          <div className="flex flex-wrap items-center gap-4">
            <div id="total-blocks-input-container" className="flex items-center gap-2">
                <label htmlFor="total-blocks-input" className="font-medium whitespace-nowrap">Bloques Totales:</label>
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
            <div id="layout-mode-button" className="flex items-center gap-2">
                 <Button 
                    variant={isLayoutMode ? "destructive" : "default"}
                    className="w-48"
                    onClick={() => {
                        const newMode = !isLayoutMode;
                        setIsLayoutMode(newMode);
                        if (newMode) {
                            setNumColumns(null);
                        }
                        setFeedback(null);
                    }} 
                    disabled={isAnimating}
                  >
                   {isLayoutMode ? <X className="mr-2" /> : <RectangleHorizontal className="mr-2" />}
                   {isLayoutMode ? "Cancelar" : "Modo Rectángulo"}
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

          <div 
            className="bg-background/50 rounded-lg border-2 border-dashed p-4 transition-colors duration-300 flex-grow min-h-[300px] relative mt-4 flex flex-col"
          >
            {isLayoutMode && !isAnimating && !numColumns && (
                <div className="text-center font-bold text-foreground rounded-xl px-4 py-2 animate-in fade-in flex items-center gap-2 justify-center pointer-events-none whitespace-nowrap bg-card/80 backdrop-blur-sm border-2 absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                    <MousePointerClick className="h-5 w-5" />
                    <span>Haz clic en un bloque para fijar el número de columnas.</span>
                </div>
            )}
            <ScrollArea className="w-full h-full flex-grow">
              <div className="h-full w-full">
                <div
                  id="block-container"
                  className={cn("relative grid gap-2 w-full h-full p-1")}
                  style={{
                    gridTemplateColumns: numColumns ? `repeat(${numColumns}, minmax(40px, 1fr))` : 'repeat(auto-fill, minmax(40px, 1fr))',
                  }}
                >
                  {blocks.map((block, i) => (
                    <div
                      key={i}
                      id={`block-${i + 1}`}
                      data-animation-state={block?.animationState}
                      onClick={() => handleBlockClick(i)}
                      className={cn(
                        "rounded-md transition-all duration-200 flex items-center justify-center font-semibold w-full min-h-10 relative select-none bg-primary text-primary-foreground",
                        "data-[animation-state=added]:animate-in data-[animation-state=added]:fade-in data-[animation-state=added]:zoom-in-90",
                        "data-[animation-state=removed]:animate-out data-[animation-state=removed]:fade-out data-[animation-state=removed]:zoom-out-90",
                        (isLayoutMode && !isAnimating) && "cursor-pointer hover:scale-110 hover:bg-primary/80",
                      )}
                    >
                       <span>{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
            {feedback && (
                <Alert id="feedback-alert" variant={feedback.type === 'error' ? 'destructive' : 'default'} className="mt-4 animate-in fade-in">
                    {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertTitle>{feedback.message}</AlertTitle>
                    <AlertDescription>
                        {feedback.description}
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
