
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveFeedbackToSupabase } from '@/lib/actions';
import { cn } from '@/lib/utils';

export default function FeedbackPage() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (rating === 0) {
            toast({
                title: "Missing Rating",
                description: "Please provide a star rating before submitting.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        if (!data.email) {
            toast({
                title: "Email is required",
                description: "Please enter your email to submit feedback.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
        
        const result = await saveFeedbackToSupabase({
            name: data.name as string,
            email: data.email as string,
            feedback: data.feedback as string,
            rating: rating,
        });
        
        setIsSubmitting(false);

        if (result.success) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                (e.target as HTMLFormElement).reset();
                setRating(0);
            }, 3000);
        } else {
             toast({
                title: "Submission Failed",
                description: result.error || "Could not save your feedback.",
                variant: "destructive",
            });
        }
    };

    if (showSuccess) {
        return (
             <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-primary">Thank You for Your Feedback!</h2>
                <p className="text-muted-foreground mt-2">We appreciate you taking the time to share your thoughts.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <Card className="max-w-2xl mx-auto shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle>Share Your Feedback</CardTitle>
                    <CardDescription>We value your opinion. Let us know how we're doing!</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="Your Name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                            </div>
                        </div>

                        <div className="space-y-2 text-center">
                             <Label>Your Rating</Label>
                             <div className="flex justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={cn(
                                            "h-8 w-8 cursor-pointer transition-colors",
                                            (hoverRating >= star || rating >= star) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                        )}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="feedback">Feedback</Label>
                            <Textarea id="feedback" name="feedback" placeholder="Tell us about your experience..." required className="min-h-[120px]" />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
