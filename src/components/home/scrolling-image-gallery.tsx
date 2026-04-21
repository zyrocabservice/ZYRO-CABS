
'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { ImagePlaceholder } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export default function ScrollingImageGallery() {
  const [images, setImages] = useState<ImagePlaceholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const imageModule = await import('@/lib/placeholder-images.json');
        const galleryImages = imageModule.default.galleryImages || [];
        setImages(galleryImages);
      } catch (error) {
        console.error("Could not load gallery images:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  const transformImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=No+URL';
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
  }

  const ImageCard = ({ image, className }: { image: ImagePlaceholder, className?: string }) => (
    <Card className={cn("overflow-hidden rounded-xl shadow-lg flex-shrink-0", className)}>
        <div className="relative w-full h-full">
            <Image
                src={transformImageUrl(image.imageUrl)}
                alt={image.description || 'Gallery Image'}
                fill
                className={cn(image.objectFit === 'contain' ? 'object-contain' : 'object-cover')}
                sizes="(max-width: 768px) 50vw, 250px"
                data-ai-hint={image.imageHint}
                loading="lazy"
            />
        </div>
    </Card>
  );

  const Column = ({ images, className, animationClass }: { images: ImagePlaceholder[], className?: string, animationClass?: string }) => (
    <div className={cn("flex flex-col gap-4", className)}>
        <div className={cn("flex flex-col gap-4", animationClass)}>
            {images.map((image) => (
                <div key={`${image.id}-1`} className={cn("h-64", image.id === 'gallery-2' && 'h-80', image.id === 'gallery-5' && 'h-80', image.id === 'gallery-8' && 'h-80')}>
                    <ImageCard image={image} className="w-full h-full" />
                </div>
            ))}
        </div>
        <div className={cn("flex flex-col gap-4", animationClass)} aria-hidden="true">
            {images.map((image) => (
                <div key={`${image.id}-2`} className={cn("h-64", image.id === 'gallery-2' && 'h-80', image.id === 'gallery-5' && 'h-80', image.id === 'gallery-8' && 'h-80')}>
                    <ImageCard image={image} className="w-full h-full" />
                </div>
            ))}
        </div>
    </div>
  );

  if (loading) {
    return <Skeleton className="h-full w-full" />
  }

  if (images.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No gallery images found.</div>;
  }

  const column1Images = [images[0], images[1], images[2]];
  const column2Images = [images[3], images[4], images[5]];
  const column3Images = [images[6], images[7], images[8]];

  return (
    <div className="w-full h-full p-4 grid grid-cols-3 gap-4">
        <Column images={column1Images} animationClass="animate-scroll-down" />
        <Column images={column2Images} animationClass="animate-scroll-up" />
        <Column images={column3Images} animationClass="animate-scroll-down" />
    </div>
  );
}
