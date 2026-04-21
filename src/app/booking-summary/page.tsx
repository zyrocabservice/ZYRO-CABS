
import BookingSummaryContent from '@/components/booking/booking-summary-content';
import { Suspense } from 'react';

export default function BookingSummaryPage() {
    return (
      <Suspense fallback={<div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">Loading booking details...</div>}>
          <BookingSummaryContent />
      </Suspense>
    );
}
