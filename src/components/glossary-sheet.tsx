import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type GlossarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'grouping' | 'rectangle';
};

const groupingContent = {
  title: 'Glosario de División',
  description: 'Conceptos clave para entender la división.',
  terms: [
    {
      emoji: '📊',
      name: 'Dividendo',
      definition: 'La cantidad total que vas a dividir. Ejemplo: 40 naranjas.',
    },
    {
      emoji: '➗',
      name: 'Divisor',
      definition: 'En cuántas partes iguales divides. Ejemplo: 6 personas.',
    },
    {
      emoji: '✅',
      name: 'Cociente',
      definition: 'Cuánto le toca a cada parte. Ejemplo: 6 naranjas por persona.',
    },
    {
      emoji: '📦',
      name: 'Resto',
      definition: 'Lo que sobra después de repartir. Ejemplo: 4 naranjas.',
    },
  ],
};

const rectangleContent = {
  title: 'Glosario de Factores',
  description: 'Conceptos clave para entender la factorización.',
  terms: [
    {
      emoji: '✖️',
      name: 'Factor',
      definition: 'Números que multiplicados dan otro número. Ejemplo: 5 y 8 son factores de 40 porque 5 × 8 = 40.',
    },
     {
      emoji: '🧱',
      name: 'Rectángulo Perfecto',
      definition: 'Una disposición de bloques en filas y columnas donde no faltan ni sobran espacios, demostrando que un número es factor de otro.',
    },
  ],
};

export function GlossarySheet({ open, onOpenChange, mode }: GlossarySheetProps) {
  const content = mode === 'grouping' ? groupingContent : rectangleContent;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-2xl">{content.title}</SheetTitle>
          <SheetDescription>
            {content.description}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-8">
          {content.terms.map((term, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="text-2xl">{term.emoji}</div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{term.name}</h3>
                <p className="text-muted-foreground">{term.definition}</p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
