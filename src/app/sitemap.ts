
import { MetadataRoute } from 'next';
import { getBannersFromFirestore, getAllCars } from '@/lib/actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zyrocabs.com';

  // Define pages with their priorities
  const staticPages = [
    { href: '/', priority: 1.0 },
    { href: '/book', priority: 0.9 },
    { href: '/services', priority: 0.8 },
    { href: '/about', priority: 0.8 },
    { href: '/contact', priority: 0.8 },
    { href: '/services/city-rides', priority: 0.7 },
    { href: '/my-bookings', priority: 0.6 },
    { href: '/feedback', priority: 0.6 },
    { href: '/report', priority: 0.5 },
    { href: '/terms', priority: 0.3 },
    { href: '/privacy', priority: 0.3 },
    { href: '/login', priority: 0.2 },
    { href: '/signup', priority: 0.2 },
  ];

  // Create the sitemap entries from the static pages definition
  const pages: MetadataRoute.Sitemap = staticPages.map(page => ({
    url: `${baseUrl}${page.href}`,
    lastModified: new Date(),
    priority: page.priority,
  }));

  // Fetch dynamic image data to include in the sitemap
  const carResult = await getAllCars();
  const bannerResult = await getBannersFromFirestore();

  // Find the homepage entry to add images to it
  const homepageEntry = pages.find(p => p.url === baseUrl + '/');
  if (homepageEntry) {
      homepageEntry.images = [
        ...carResult.data.map(car => ({ loc: new URL(car.imageUrl, baseUrl).href })),
        ...bannerResult.map(banner => ({ loc: new URL(banner.imageUrl, baseUrl).href })),
      ];
  }

  return pages;
}
