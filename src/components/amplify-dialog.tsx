'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import type { CircleState, CircleGroup } from '@/lib/types';

const AmplifySchema = z.object({
  factor: z.coerce
    .number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .positive('Debe ser un número positivo')
    .gt(1, 'El factor debe ser mayor que 1'),
});

type AmplifyFormValues = z.infer<typeof AmplifySchema>;

interface AmplifyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amplifyingGroup: CircleGroup | null;
  setCircleGroups: React.Dispatch<React.SetStateAction<CircleGroup[]>>;
}

export function AmplifyDialog({ isOpen, onClose, amplifyingGroup, setCircleGroups }: AmplifyDialogProps) {
  const form = useForm<AmplifyFormValues>({
    resolver: zodResolver(AmplifySchema),
    defaultValues: {
      factor: 2,
    },
  });

  const handleAmplify: SubmitHandler<AmplifyFormValues> = (data) => {
    if (!amplifyingGroup) return;

    const factor = data.factor;
    const originalDivisions = amplifyingGroup.circles[0].divisions;
    const newDivisions = originalDivisions * factor;

    const originalActiveCount = amplifyingGroup.circles.reduce((acc, c) => acc + c.slices.filter(s => s.active).length, 0);
    const newActiveCount = originalActiveCount * factor;

    const newCircles: CircleState[] = [];
    let remainingActiveSlices = newActiveCount;

    const numNewCircles = Math.ceil(newActiveCount / newDivisions);
    const numToCreate = Math.max(1, numNewCircles); 

    for (let i = 0; i < numToCreate; i++) {
        const slicesForThisCircle = Math.min(remainingActiveSlices, newDivisions);
        const newSlices = Array.from({ length: newDivisions }, (_, j) => ({
            id: `slice-amp-${Date.now()}-${i}-${j}`,
            active: j < slicesForThisCircle,
        }));
        newCircles.push({
            id: `circle-amp-${Date.now()}-${i}`,
            divisions: newDivisions,
            slices: newSlices
        });
        remainingActiveSlices -= slicesForThisCircle;
    }
    
    const newGroup: CircleGroup = {
      id: amplifyingGroup.id,
      circles: newCircles,
    }

    setCircleGroups(prev => prev.map(g => (g.id === amplifyingGroup.id ? newGroup : g)));
    onClose();
    form.reset();
  };


  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAmplify)}>
            <DialogHeader>
              <DialogTitle>Amplificar Fracción</DialogTitle>
              <DialogDescription>
                Introduce el número por el cual quieres multiplicar el numerador y el denominador para crear una fracción equivalente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="factor"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="factor" className="text-right">
                      Factor
                    </Label>
                    <div className="col-span-3">
                      <FormControl>
                        <Input id="factor" type="number" {...field} />
                      </FormControl>
                      <FormMessage className="mt-2" />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Amplificar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
