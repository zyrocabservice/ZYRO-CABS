
'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { useCallback } from 'react';


const transformImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://placehold.co/1536x960/007AFF/FFFFFF&text=ZyroCabs';
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
}

const DotButton = (props: { selected: boolean, onClick: () => void }) => {
    const { selected, onClick } = props;
    return (
        <button
            className={cn(
                'h-3 rounded-full transition-all duration-300',
                selected ? 'w-6 bg-primary' : 'w-3 bg-muted-foreground/50'
            )}
            type="button"
            onClick={onClick}
        />
    )
}

interface BannerCarouselProps {
    banners: ImagePlaceholder[];
}

export default function BannerCarousel({ banners: initialBanners }: BannerCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [banners, setBanners] = React.useState<ImagePlaceholder[]>(initialBanners);
  const [loading, setLoading] = React.useState(false);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    if (!initialBanners || initialBanners.length === 0) {
        setBanners([{
            id: 'fallback',
            description: 'ZyroCabs',
            imageUrl: 'https://placehold.co/1536x960/007AFF/FFFFFF&text=ZyroCabs',
            imageHint: 'logo',
            isBanner: true,
            objectFit: 'cover'
        }]);
    } else {
        const now = new Date();
        const activeBanners = initialBanners.filter(b => {
            if (!b.isBanner) return false;
            
            const hasStartDate = b.startDate && !isNaN(new Date(b.startDate).getTime());
            const hasEndDate = b.endDate && !isNaN(new Date(b.endDate).getTime());
            
            if (!hasStartDate && !hasEndDate) return true; // No schedule, always active
            
            const startDate = hasStartDate ? new Date(b.startDate!) : null;
            const endDate = hasEndDate ? new Date(b.endDate!) : null;

            if (startDate && endDate) return now >= startDate && now <= endDate;
            if (startDate) return now >= startDate;
            if (endDate) return now <= endDate;
            return false;
        });

        if (activeBanners.length > 0) {
          setBanners(activeBanners);
        }
    }
  }, [initialBanners]);
  
  const onDotButtonClick = useCallback((index: number) => {
    if (!api) return
    api.scrollTo(index)
  }, [api]);


  React.useEffect(() => {
    if (!api) {
      return
    }

    const onSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex);
      const currentBanner = banners[selectedIndex];
      const delay = currentBanner?.duration ? currentBanner.duration * 1000 : 5000;

      if (plugin.current) {
        // @ts-ignore - options is a valid property
        plugin.current.options.delay = delay;
        // @ts-ignore - reset is a valid method
        plugin.current.reset();
      }
    }

    api.on("select", onSelect);
    onSelect(); // Set initial state

    return () => {
      api.off("select", onSelect)
    }
  }, [api, banners]);
  
  const isSingleBanner = banners.length <= 1;

  if (loading) {
    return <Skeleton className="w-full aspect-[16/10] md:aspect-[21/9]" />;
  }

  return (
    <div>
        <Carousel
            setApi={setApi}
            plugins={isSingleBanner ? [] : [plugin.current]}
            className="w-full"
            onMouseEnter={isSingleBanner ? undefined : plugin.current.stop}
            onMouseLeave={isSingleBanner ? undefined : plugin.current.reset}
            opts={{
                loop: !isSingleBanner,
                align: 'center',
            }}
        >
            <CarouselContent>
            {banners.map((image, index) => (
                <CarouselItem key={image.id}>
                    <Card className="rounded-[25px] overflow-hidden transition-all duration-500 ease-in-out"
                        style={{
                            opacity: index === current ? 1 : 0.6,
                            transform: `scale(${index === current ? 1 : 0.9})`,
                            filter: index === current ? 'none' : 'blur(2px)',
                            backgroundColor: image.bgColor || 'transparent',
                        }}
                    >
                        <CardContent className="p-0">
                            <Link href={image.redirectUrl || '#'} target={image.redirectUrl ? '_blank' : '_self'} rel="noopener noreferrer">
                                <div className="relative w-full h-full aspect-[21/10]">
                                    <Image
                                        src={transformImageUrl(image.imageUrl)}
                                        alt={image.description || 'Banner Image'}
                                        fill
                                        className={cn(image.objectFit === 'contain' ? 'object-contain' : 'object-cover')}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 800px"
                                        data-ai-hint={image.imageHint}
                                        priority={index === 0}
                                    />
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </CarouselItem>
            ))}
            </CarouselContent>
            {!isSingleBanner && (
              <>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </>
            )}
        </Carousel>
        {!isSingleBanner && (
            <div className="flex justify-center gap-2 mt-4">
                {banners.map((_, index) => (
                    <DotButton
                        key={index}
                        selected={index === current}
                        onClick={() => onDotButtonClick(index)}
                    />
                ))}
            </div>
        )}
    </div>
  );
}
