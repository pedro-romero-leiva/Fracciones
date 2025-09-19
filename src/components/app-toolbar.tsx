
import { Eraser, Hand, Plus, MousePointer, Scaling } from 'lucide-react';
import { type Dispatch, type SetStateAction } from 'react';
import { type Mode } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface AppToolbarProps {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  onAddCircle: () => void;
}

const TooltipWithExtraTip = ({ tip, children }: { tip: string, children: React.ReactNode }) => {
    return (
        <TooltipProvider delayDuration={3000}>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side="right">
                    <p className="text-sm text-muted-foreground">{tip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export function AppToolbar({ mode, setMode, onAddCircle }: AppToolbarProps) {
  const toggleMode = (newMode: Mode) => {
    setMode(currentMode => (currentMode === newMode ? 'select' : newMode));
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="flex flex-col items-center gap-y-4 p-2 bg-gradient-to-b from-primary to-accent border-r h-screen shadow-md">
        <div className="p-2">
            <svg width="28" height="28" viewBox="0 0 100 100">
                <path d="M50,5A45,45 0 0,1 95,50" fill="none" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.5" strokeWidth="10"/>
                <path d="M5,50A45,45 0 0,1 50,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="10"/>
                <line x1="10" y1="50" x2="90" y2="50" stroke="hsl(var(--primary-foreground))" strokeWidth="8"/>
            </svg>
        </div>
        <Separator />
        <div className="flex flex-col gap-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === 'select' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setMode('select')}
                  aria-label="Modo Seleccionar"
                >
                  <MousePointer className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <TooltipWithExtraTip tip="Activa o desactiva porciones de los círculos.">
                    <p>Modo Seleccionar (V)</p>
                </TooltipWithExtraTip>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === 'erase' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => toggleMode('erase')}
                  aria-label="Modo Borrador"
                >
                  <Eraser className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <TooltipWithExtraTip tip="Elimina un grupo de fracciones completo con un solo clic.">
                    <p>Modo Borrador (E)</p>
                </TooltipWithExtraTip>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === 'drag' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => toggleMode('drag')}
                  aria-label="Modo Arrastrar"
                >
                  <Hand className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                 <TooltipWithExtraTip tip="Arrastra porciones individuales o grupos enteros para sumarlos a otras fracciones.">
                    <p>Modo Arrastrar (D)</p>
                </TooltipWithExtraTip>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === 'amplify' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => toggleMode('amplify')}
                  aria-label="Modo Amplificar"
                >
                  <Scaling className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                 <TooltipWithExtraTip tip="Crea una fracción equivalente multiplicando el numerador y el denominador.">
                    <p>Modo Amplificar (A)</p>
                </TooltipWithExtraTip>
              </TooltipContent>
            </Tooltip>
        </div>
        <Separator />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddCircle}
              aria-label="Añadir Nuevo Círculo"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <TooltipWithExtraTip tip="Agrega un nuevo círculo de fracción al espacio de trabajo.">
                <p>Añadir Nuevo Círculo (N)</p>
            </TooltipWithExtraTip>
          </TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  );
}
