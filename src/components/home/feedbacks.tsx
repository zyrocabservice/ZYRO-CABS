
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import type { UserFeedback } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TestimonialCard = ({ testimonial }: { testimonial: UserFeedback }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full w-full">
        <CardContent className="p-6 flex flex-col items-center text-center flex-grow">
             <Avatar className="w-16 h-16 mb-4 border-2 border-primary">
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-muted-foreground italic mb-4 flex-grow">"{testimonial.feedback}"</p>
            <div className="flex items-center justify-center gap-1 mb-2">
                {Array(testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
                {Array(5 - testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gray-300" />
                ))}
            </div>
            <p className="font-semibold">{testimonial.name}</p>
        </CardContent>
    </Card>
);


export default function Feedbacks({ initialFeedbacks }: { initialFeedbacks: UserFeedback[] }) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);

  if (!feedbacks || feedbacks.length === 0) {
    return (
       <section className="py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">What Our Customers Say</h2>
            <p className="text-muted-foreground">Real Stories, Real Satisfaction</p>
          </div>
          <p className="text-center text-muted-foreground">No testimonials available at the moment.</p>
       </section>
    )
  }
  
  const enableScrollingAnimation = feedbacks.length >= 3;
  const itemsToRender = enableScrollingAnimation ? [...feedbacks, ...feedbacks] : feedbacks;

  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">What Our Customers Say</h2>
        <p className="text-muted-foreground">Real Stories, Real Satisfaction</p>
      </div>
       <div className={cn("w-full", enableScrollingAnimation && "overflow-hidden mask-image-x")}>
          <div className={cn("flex w-max", enableScrollingAnimation && "animate-scroll-x hover:[animation-play-state:paused]")}>
            {itemsToRender.map((testimonial, index) => (
              <div key={index} className="w-[350px] flex-shrink-0 p-4">
                  <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
       </div>
    </section>
  );
}
