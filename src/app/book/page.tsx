
'use client';

import { Suspense } from 'react';
import BookPageContent from '@/components/booking/book-page-content';
import WelcomeAnimation from '@/components/home/welcome-animation';

export default function BookPage() {
    return (
        <Suspense fallback={<WelcomeAnimation />}>
            <BookPageContent />
        </Suspense>
    );
}
