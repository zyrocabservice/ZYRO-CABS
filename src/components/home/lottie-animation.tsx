
'use client';

import { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import { useOnScreen } from '@/hooks/use-on-screen';

interface LottieAnimationProps {
  animationUrl: string;
  loop?: boolean;
}

export default function LottieAnimation({ animationUrl, loop = true }: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState(null);
  const ref = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(ref);

  useEffect(() => {
    if (isOnScreen && !animationData) {
      fetch(animationUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Trust that the response is JSON, even if the content-type is wrong.
            return response.json();
        })
        .then((data) => setAnimationData(data))
        .catch((error) => console.error('Error fetching or parsing Lottie animation:', error));
    }
  }, [animationUrl, isOnScreen, animationData]);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop={loop}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%' }} /> // Placeholder
      )}
    </div>
  );
}
