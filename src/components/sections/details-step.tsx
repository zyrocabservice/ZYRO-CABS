
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Car } from '@/lib/types';
import { ArrowRight, Loader2 } from 'lucide-react';

type CarOption = Car & { estimatedFare: number };

interface DetailsStepProps {
  car: CarOption;
  action: (formData: FormData) => void;
  onBack: () => void;
}

function SubmitButton({ car }: { car: CarOption }) {
  const { pending } = useFormStatus();

  const formatRate = (rate: number) => {
    if (rate % 1 === 0) {
      return rate.toString();
    }
    return rate.toFixed(2);
  }

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : `Confirm Booking for Rs ${formatRate(car.estimatedFare)}`}
       {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export default function DetailsStep({ car, action, onBack }: DetailsStepProps) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="John Doe" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile Number</Label>
        <Input id="mobile" name="mobile" placeholder="+1234567890" type="tel" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" placeholder="john.doe@example.com" type="email" required />
      </div>
      <div className="space-y-2">
        <SubmitButton car={car} />
        <Button variant="outline" onClick={onBack} className="w-full">Back</Button>
      </div>
    </form>
  );
}
