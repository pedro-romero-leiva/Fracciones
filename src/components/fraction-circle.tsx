
'use client';

import { useMemo, type MouseEvent } from 'react';
import { useTheme } from 'next-themes';
import { type Mode, type CircleState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MotionDiv } from './motion-div';

interface FractionCircleProps {
  circleState: CircleState;
  mode: Mode;
  onSliceClick: (circleId: string, sliceIndex: number) => void;
  onContainerClick: (circleId: string) => void;
  isPicked: boolean;
  isDropTarget: boolean;
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

const lightSliceColors = [
    'hsl(175, 70%, 45%)', // Teal
    'hsl(220, 80%, 60%)', // Indigo
    'hsl(340, 85%, 60%)', // Rose
    'hsl(40, 90%, 55%)',  // Amber
    'hsl(200, 85%, 55%)', // Light Blue
    'hsl(310, 70%, 55%)', // Pink
    'hsl(140, 60%, 45%)', // Green
    'hsl(260, 75%, 65%)', // Purple
];

const darkSliceColors = [
    'hsl(175, 65%, 40%)',
    'hsl(220, 70%, 55%)',
    'hsl(340, 75%, 55%)',
    'hsl(40, 80%, 50%)',
    'hsl(200, 75%, 50%)',
    'hsl(310, 60%, 50%)',
    'hsl(140, 55%, 40%)',
    'hsl(260, 65%, 60%)',
];


export function FractionCircle({
  circleState,
  mode,
  onSliceClick,
  onContainerClick,
  isPicked,
  isDropTarget,
}: FractionCircleProps) {
  const { theme } = useTheme();
  const { id, divisions, slices = [] } = circleState;
  const size = '100%';
  const viewBoxSize = 250;
  const radius = viewBoxSize / 2.6;
  const center = viewBoxSize / 2;

  const sliceColors = useMemo(() => (theme === 'dark' ? darkSliceColors : lightSliceColors), [theme]);

  const handleSliceClickEvent = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    onSliceClick(id, index);
  };
  
  const handleContainerClickEvent = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onContainerClick(id);
  };

  const activeCount = useMemo(() => slices.filter(s => s.active).length, [slices]);

  return (
    <MotionDiv 
        className={cn(
          'relative w-full flex flex-col items-center aspect-square max-w-[170px] fraction-circle-container',
          isDropTarget && 'outline-4 outline-dashed outline-green-500 outline-offset-8 animate-pulse'
        )}
        onClick={handleContainerClickEvent}
        layout
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex justify-center items-center p-2 flex-1 relative group">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="drop-shadow-sm transition-transform group-hover:scale-105"
          >
            <circle cx={center} cy={center} r={radius} fill="transparent" stroke="hsl(var(--circle-border))" strokeWidth="3" />
            {slices.map((slice, i) => (
              <path
                key={slice.id}
                d={getSlicePath(divisions, i, radius, center, center)}
                fill={slice.active ? sliceColors[i % sliceColors.length] : 'hsl(var(--muted))'}
                stroke="hsl(var(--division-line))"
                strokeWidth={divisions > 1 ? 2 : 0}
                onClick={(e) => handleSliceClickEvent(e, i)}
                className={cn(
                  mode === 'select' && 'cursor-pointer hover:opacity-80',
                  mode === 'drag' && slice.active && 'cursor-grab hover:opacity-80',
                  mode === 'drag' && !slice.active && 'cursor-not-allowed',
                  (mode === 'amplify' || mode === 'divide' || mode === 'duplicate') && 'cursor-default',
                  isPicked && 'opacity-30'
                )}
              />
            ))}
          </svg>
      </div>
       {activeCount > 0 && divisions > 0 && (
         <div className="text-center font-bold text-lg text-foreground/80">
          <span>{activeCount}</span>
          <span className="mx-1">/</span>
          <span>{divisions}</span>
        </div>
      )}
    </MotionDiv>
  );
}
