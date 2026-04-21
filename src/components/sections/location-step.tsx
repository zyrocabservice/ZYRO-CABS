'use client';

import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Find Rides'}
      {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export default function LocationStep({ action, state, isPending }: { action: (payload: FormData) => void; state: any; isPending: boolean; }) {
  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pickup">Pickup Location</Label>
        <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="pickup" name="pickup" placeholder="e.g., 123 Main St, Anytown" required className="pl-10" />
        </div>
        {state?.errors?.pickup && <p className="text-sm text-destructive">{state.errors.pickup[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="dropoff">Drop-off Location</Label>
        <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="dropoff" name="dropoff" placeholder="e.g., 456 Oak Ave, Othertown" required className="pl-10"/>
        </div>
         {state?.errors?.dropoff && <p className="text-sm text-destructive">{state.errors.dropoff[0]}</p>}
      </div>
      {state?.type === 'error' && !state.errors && (
          <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
          </Alert>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : 'Find Rides'}
        {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}
