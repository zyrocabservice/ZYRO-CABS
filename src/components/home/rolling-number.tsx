
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useOnScreen } from '@/hooks/use-on-screen';

interface RollingNumberProps {
  targetNumber: number;
  className?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const DECIMAL_POINT = '.';

const NumberColumn = ({ digit }: { digit: string | number }) => {
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const columnRef = useRef<HTMLDivElement>(null);
    const isOnScreen = useOnScreen(columnRef);

    useEffect(() => {
        if (isOnScreen) {
            const timer = setTimeout(() => setShouldAnimate(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isOnScreen]);

    if (digit === DECIMAL_POINT) {
        return <div className="mt-[-0.1em]">.</div>;
    }

    const finalDigit = Number(digit);

    return (
        <div 
            ref={columnRef}
            className="h-[1em] overflow-hidden"
        >
            <div
                className={cn(
                    'flex flex-col transition-transform duration-[2s] ease-[cubic-bezier(.17,.84,.44,1)]',
                    shouldAnimate ? 'animate-roll-number' : 'translate-y-0'
                )}
                style={{ '--final-digit': finalDigit } as React.CSSProperties}
            >
                {DIGITS.map((d) => (
                    <div key={d} className="h-[1em] leading-none">{d}</div>
                ))}
            </div>
        </div>
    );
};

const RollingNumber: React.FC<RollingNumberProps> = ({ targetNumber, className }) => {
  const numberString = targetNumber.toString();
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
        {numberString.split('').map((digit, index) => (
            <NumberColumn key={index} digit={digit} />
        ))}
    </div>
  );
};

export default RollingNumber;
