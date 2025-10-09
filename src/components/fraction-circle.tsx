
'use client';

import { useMemo, type MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Copy } from 'lucide-react';
import { type Mode } from '@/app/page';
import { cn } from '@/lib/utils';

export interface SliceState {
  id: string;
  active: boolean;
}

export interface CircleState {
  id: string;
  divisions: number;
  slices: SliceState[];
}

interface FractionCircleProps {
  circleState: CircleState;
  mode: Mode;
  onUpdate: (circleId: string, newProps: Partial<CircleState>) => void;
  onRemove: (id:string) => void;
  onDuplicate: () => void;
  onPickSlice: (sliceIndex: number, divisions: number) => void;
  onPlaceSlice: () => void;
  isPicked: boolean;
  isGrouped?: boolean;
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


export function FractionCircle({
  circleState,
  mode,
  onUpdate,
  onRemove,
  onDuplicate,
  onPickSlice,
  onPlaceSlice,
  isPicked,
  isGrouped = false,
}: FractionCircleProps) {
  const { id, divisions, slices = [] } = circleState;
  const size = '100%';
  const viewBoxSize = 250;
  const radius = viewBoxSize / 2.6;
  const center = viewBoxSize / 2;

  const handleSliceClick = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    if (mode === 'select') {
      const newSlices = [...slices];
      newSlices[index] = { ...newSlices[index], active: !newSlices[index].active };
      onUpdate(id, { slices: newSlices });
    } else if (mode === 'drag') {
      onPickSlice(index, divisions);
    }
  };
  
  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (mode === 'erase') {
        onRemove(id);
    } else if (mode === 'drag') {
        onPlaceSlice();
    }
  };

  const handleDivide = (e: MouseEvent) => {
    e.stopPropagation();
    const newDivisions = divisions + 1;
    onUpdate(id, { divisions: newDivisions, slices: Array.from({length: newDivisions}, (_,i) => ({id: `slice-${id}-${i}`, active: true})) });
  };

  const handleSubtract = (e: MouseEvent) => {
    e.stopPropagation();
    if (divisions > 1) {
      const newDivisions = divisions - 1;
      onUpdate(id, { divisions: newDivisions, slices: Array.from({length: newDivisions}, (_,i) => ({id: `slice-${id}-${i}`, active: true})) });
    }
  };

  const handleDuplicate = (e: MouseEvent) => {
    e.stopPropagation();
    onDuplicate();
  };

  const activeCount = useMemo(() => slices.filter(s => s.active).length, [slices]);

  return (
    <div 
        className={cn('relative w-full flex flex-col aspect-square max-w-xs transition-all duration-300 fraction-circle-container',
            !isGrouped && 'shadow-lg hover:shadow-xl bg-card rounded-lg border',
            mode === 'erase' && 'cursor-pointer ring-2 ring-offset-2 ring-destructive',
            mode === 'drag' && 'cursor-pointer',
            isGrouped && 'max-w-[200px]'
        )}
        onClick={handleContainerClick}
    >
      {!isGrouped && activeCount > 0 && divisions !== activeCount && (
          <div className="absolute top-2 right-2 p-1 bg-card/70 rounded-md pointer-events-none">
              <div className="flex flex-col items-center font-bold text-foreground text-lg">
                  <span>{activeCount}</span>
                  <div className="w-full h-px bg-foreground my-0.5"></div>
                  <span>{divisions}</span>
              </div>
          </div>
      )}
      <div className="flex justify-center items-center p-2 flex-1">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          >
            {slices.map((slice, i) => (
              <path
                key={slice.id}
                d={getSlicePath(divisions, i, radius, center, center)}
                fill={slice.active ? `hsl(${((i * 360) / divisions)}, 65%, 60%)` : 'hsl(220 13% 91%)'}
                stroke="hsl(var(--card))"
                strokeWidth="2"
                onClick={(e) => handleSliceClick(e, i)}
                className={cn('transition-all duration-200',
                  mode === 'select' && 'cursor-pointer hover:opacity-80',
                  mode === 'drag' && slice.active && 'cursor-pointer hover:opacity-80',
                  mode === 'drag' && !slice.active && 'cursor-not-allowed',
                  mode === 'amplify' && 'cursor-default',
                  isPicked && 'opacity-50'
                )}
              />
            ))}
          </svg>
      </div>
      {!isGrouped && <div className="flex justify-center gap-2 p-4 pt-0">
        <Button variant="outline" size="icon" onClick={handleSubtract} disabled={divisions <= 1}>
          <Minus className="h-4 w-4" />
          <span className="sr-only">Quitar división</span>
        </Button>
        <Button variant="outline" size="icon" onClick={handleDivide}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Añadir división</span>
        </Button>
        <Button variant="outline" size="icon" onClick={handleDuplicate}>
          <Copy className="h-4 w-4" />
          <span className="sr-only">Duplicar círculo</span>
        </Button>
      </div>}
    </div>
  );
}
