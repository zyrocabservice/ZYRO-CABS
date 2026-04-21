
'use client';

import { useState, useEffect, useRef } from 'react';

export function useOnScreen(ref: React.RefObject<Element>, rootMargin: string = '0px'): boolean {
  const [isIntersecting, setIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observerRef.current) {
        observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        rootMargin,
      }
    );
    
    if (ref.current) {
      observerRef.current.observe(ref.current);
    }

    return () => {
      if(observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref, rootMargin]);

  return isIntersecting;
}
