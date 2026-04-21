
import { Suspense } from 'react';
import type { Car, UserFeedback, ContactDetails, ButtonSettings, ImagePlaceholder } from '@/lib/types';
import { getAllCars, getFeedbacksFromSupabase, getContactDetails, getButtonSettings, getBannersFromSupabase } from '@/lib/actions';
import Image from 'next/image';
import BookingForm from '@/components/home/booking-form';
import CarList from '@/components/home/car-list';
import dynamic from 'next/dynamic';

// Dynamically import components that are not in the initial viewport
const MakeTrip = dynamic(() => import('@/components/home/make-trip'), {
  loading: () => <div className="h-[400px] w-full rounded-2xl bg-muted/50 animate-pulse"></div>,
});
const Features = dynamic(() => import('@/components/home/Features'));
const Feedbacks = dynamic(() => import('@/components/home/feedbacks'));


export default async function Home() {
  // Fetch all necessary data on the server in parallel
  const [
    carResult, 
    feedbacks, 
    contactDetails, 
    buttonSettings, 
    banners
  ] = await Promise.all([
    getAllCars(),
    getFeedbacksFromSupabase(),
    getContactDetails(),
    getButtonSettings(),
    getBannersFromSupabase()
  ]);
  
  const cars: Car[] = carResult.data;

  return (
    <>
      <section 
        className="relative -mt-16 flex flex-col items-center justify-center pt-16 text-center md:text-left md:min-h-screen pb-10 bg-[#f2f2f2] dark:bg-[#141414]"
      >
        <div className="relative z-20 w-full">
          <Suspense fallback={<div className="h-[380px] w-full rounded-2xl bg-primary/20 animate-pulse"></div>}>
            <BookingForm banners={banners} />
          </Suspense>
        </div>
      </section>
      <div className="container mx-auto px-3 py-8 md:py-12 space-y-8">
        <CarList cars={cars} contactDetails={contactDetails} buttonSettings={buttonSettings} />
      </div>
      <section className="py-8 md:py-12 bg-[#f2f2f2] dark:bg-[#141414]">
        <div className="container mx-auto px-3">
            <MakeTrip contactDetails={contactDetails} buttonSettings={buttonSettings} cars={cars} />
        </div>
      </section>
      <div className="container mx-auto px-3 py-8 md:py-12 space-y-8">
        <Features />
      </div>
      <section className="w-full">
          <div className="relative w-full aspect-[16/10] md:aspect-[21/9]">
              <Image
                  src="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/Banners/USER.png"
                  alt="Promotional Banner"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  loading="lazy" // Defer loading of this image as it's lower down the page
              />
          </div>
      </section>
      <div className="container mx-auto px-3 py-8 md:py-12 space-y-8">
        <Feedbacks initialFeedbacks={feedbacks} />
      </div>
    </>
  );
}
