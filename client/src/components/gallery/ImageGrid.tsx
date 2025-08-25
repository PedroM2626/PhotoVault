import * as React from 'react';
import { ImageCard } from './ImageCard';

interface Image {
  id: number;
  title: string;
  thumbnail_path: string;
  medium_path: string;
  original_path: string;
  tags?: string;
  views: number;
  is_favorite: boolean;
}

interface ImageGridProps {
  images: Image[];
}

export const ImageGrid = ({ images }: ImageGridProps) => {
  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No images found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image) => (
        <ImageCard key={image.id} image={image} />
      ))}
    </div>
  );
};