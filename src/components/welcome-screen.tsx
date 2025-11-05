'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Rocket } from 'lucide-react';
import { MotionDiv } from './motion-div';

interface WelcomeScreenProps {
  onStartExploration: () => void;
  onStartTutorial: () => void;
}

export function WelcomeScreen({ onStartExploration, onStartTutorial }: WelcomeScreenProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-4 font-sans">
      <div className="flex flex-col items-center gap-12 text-center">
        <MotionDiv
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            🧮 Aprende Fracciones Jugando
          </h1>
          <p className="text-2xl text-muted-foreground mt-2">
            Visualiza y comprende de forma fácil y divertida
          </p>
        </MotionDiv>
        
        <div className="flex flex-col md:flex-row gap-8">
            <MotionDiv
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="w-full max-w-sm shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                    <Rocket className="text-accent" />
                    Modo Exploración
                  </CardTitle>
                  <CardDescription className="text-md pt-2">
                    Crea fracciones de forma libre. ¡El espacio de trabajo es todo tuyo!
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button size="lg" className="w-full text-lg" onClick={onStartExploration}>
                    Comenzar
                  </Button>
                </CardFooter>
              </Card>
            </MotionDiv>

            <MotionDiv
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="w-full max-w-sm shadow-xl bg-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-3 text-3xl">
                    <BookOpen className="text-muted-foreground/80" />
                    Modo Guiado
                  </CardTitle>
                  <CardDescription className="text-md pt-2">
                    Aprende paso a paso con el tutorial interactivo. ¡Perfecto para empezar!
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-2">
                   <Button size="lg" className="w-full text-lg" onClick={onStartTutorial}>
                    Comenzar Tutorial
                  </Button>
                </CardFooter>
              </Card>
            </MotionDiv>
        </div>
      </div>
    </div>
  );
}
