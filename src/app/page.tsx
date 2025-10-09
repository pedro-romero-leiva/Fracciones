
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Divide, Group, RectangleHorizontal, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Divide className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-headline">
            Método de barras
          </h1>
        </div>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          Un patio de recreo interactivo para visualizar la división y los factores de una forma divertida y atractiva. Elige una herramienta para comenzar.
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          <Link href="/grouping">
            <Card className="text-left hover:border-primary hover:shadow-lg transition-all h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Group className="h-10 w-10 text-primary-foreground bg-primary p-2 rounded-lg" />
                  <div>
                    <CardTitle className="text-2xl">🎯 Modo Agrupar</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>Aprende a dividir visualmente y descubre qué es el resto.</p>
              </CardContent>
              <div className="p-6 pt-0">
                <Button variant="outline" className="w-full">
                  Empezar a Dividir <ArrowRight className="ml-2" />
                </Button>
              </div>
            </Card>
          </Link>

          <Link href="/rectangle">
            <Card className="text-left hover:border-primary hover:shadow-lg transition-all h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <RectangleHorizontal className="h-10 w-10 text-primary-foreground bg-primary p-2 rounded-lg" />
                  <div>
                    <CardTitle className="text-2xl">📐 Modo Rectángulo</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>Encuentra los factores de un número formando rectángulos perfectos.</p>
              </CardContent>
               <div className="p-6 pt-0">
                <Button variant="outline" className="w-full">
                  Descubrir Factores <ArrowRight className="ml-2" />
                </Button>
              </div>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
