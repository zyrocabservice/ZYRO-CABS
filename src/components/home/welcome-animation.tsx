
'use client';

import LottieAnimation from './lottie-animation';

export default function WelcomeAnimation() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="w-96 h-96">
        <LottieAnimation animationUrl="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/refs/heads/main/Man%20waiting%20car.json" />
      </div>
      <h1 className="text-2xl font-bold text-foreground -mt-16">Getting Directions for You</h1>
    </div>
  );
}
