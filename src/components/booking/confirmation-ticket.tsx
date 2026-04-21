
'use client';

import { useSearchParams } from 'next/navigation';
import ConfirmationPageContent from './confirmation-ticket-content';


export default function ConfirmationTicket() {
    const params = useSearchParams();

    return (
        <ConfirmationPageContent params={params} />
    );
}

