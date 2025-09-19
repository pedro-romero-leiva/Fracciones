
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eraser, Hand, MousePointer, Plus, Scaling } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const ToolInfo = ({ icon, name, description, shortcut }: { icon: React.ReactNode, name: string, description: string, shortcut: string }) => (
    <div className="flex items-start gap-4">
        <div className="text-accent p-2 bg-accent/10 rounded-md">{icon}</div>
        <div>
            <h3 className="font-bold text-foreground">{name} <span className="text-xs font-mono p-1 bg-muted rounded-md">{shortcut}</span></h3>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    </div>
)

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <svg width="48" height="48" viewBox="0 0 100 100">
                    <path d="M50,5A45,45 0 0,1 95,50" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.5" strokeWidth="10"/>
                    <path d="M5,50A45,45 0 0,1 50,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="10"/>
                    <line x1="10" y1="50" x2="90" y2="50" stroke="hsl(var(--primary-foreground))" strokeWidth="8"/>
                </svg>
            </div>
          <CardTitle className="text-4xl font-bold">Bienvenido a Fracciones</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Una herramienta interactiva para visualizar y aprender sobre fracciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <ToolInfo 
                icon={<MousePointer />} 
                name="Seleccionar"
                description="Activa o desactiva porciones de los círculos."
                shortcut="V"
            />
             <ToolInfo 
                icon={<Eraser />} 
                name="Borrador"
                description="Elimina un grupo de fracciones completo con un solo clic."
                shortcut="E"
            />
            <ToolInfo 
                icon={<Hand />} 
                name="Arrastrar"
                description="Arrastra porciones o grupos para sumarlos a otras fracciones."
                shortcut="D"
            />
            <ToolInfo 
                icon={<Scaling />} 
                name="Amplificar"
                description="Crea una fracción equivalente multiplicando el numerador y denominador."
                shortcut="A"
            />
            <ToolInfo 
                icon={<Plus />} 
                name="Añadir Círculo"
                description="Agrega un nuevo círculo de fracción al espacio de trabajo."
                shortcut="N"
            />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg" onClick={onStart} className="text-lg">
            Comenzar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
