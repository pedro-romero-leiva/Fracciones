
import { Eraser, Hand, MousePointer, Scaling } from 'lucide-react';
import { type Dispatch, type SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Mode } from '@/lib/types';


interface ToolButtonProps {
  id: Mode;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  currentMode: Mode;
  onClick: (mode: Mode) => void;
  ['data-tutorial-id']?: string;
}

const ToolButton = ({ id, label, shortcut, icon, currentMode, onClick, ...props }: ToolButtonProps) => {
  const isActive = currentMode === id;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex flex-col h-auto gap-1 items-center justify-center p-4 rounded-xl text-base font-sans shadow-sm',
            'hover:bg-accent/10',
            isActive && 'border-primary/80 border-2 bg-primary/10 text-primary shadow-md'
          )}
          style={{ padding: '16px 24px', borderRadius: '12px', fontSize: '16px' }}
          onClick={() => onClick(id)}
          data-tutorial-id={props['data-tutorial-id']}
        >
          {icon}
          <span>{label}</span>
          <span className="text-xs text-muted-foreground">({shortcut})</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{label} ({shortcut})</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface ToolbarProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export function Toolbar({ mode, setMode }: ToolbarProps) {

  return (
    <TooltipProvider delayDuration={100}>
      <footer 
        className="flex flex-col items-center justify-center p-4 border-t bg-card/80 backdrop-blur-sm gap-2"
        data-tutorial-id="toolbar"
      >
        <span className="text-sm font-semibold self-start px-4">Herramientas</span>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <ToolButton id="select" label="Seleccionar" shortcut="V" icon={<MousePointer size={24} />} currentMode={mode} onClick={setMode} data-tutorial-id="select-tool" />
          <ToolButton id="erase" label="Borrador" shortcut="E" icon={<Eraser size={24} />} currentMode={mode} onClick={setMode} />
          <ToolButton id="drag" label="Arrastrar" shortcut="D" icon={<Hand size={24} />} currentMode={mode} onClick={setMode} />
          <ToolButton id="amplify" label="Amplificar" shortcut="A" icon={<Scaling size={24} />} currentMode={mode} onClick={setMode} />
        </div>
      </footer>
    </TooltipProvider>
  );
}
