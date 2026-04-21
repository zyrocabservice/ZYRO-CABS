
// This file is no longer the single source of truth for images.
// Banner and gallery images are now fetched from Firestore.
// This file can be removed or repurposed if needed.

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  isBanner?: boolean;
  redirectUrl?: string;
  objectFit?: 'cover' | 'contain';
};

// Default images are now primarily seeded in the database via actions.ts
export const PlaceHolderImages: ImagePlaceholder[] = [];
